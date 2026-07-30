// src/components/admin/RestaurantAdsSection.jsx
//
// تب «تبلیغات من» برای پنل مدیر رستوران.
// این کامپوننت مشابه AdsRequestsSection.jsx (سمت ادمین کل) است اما:
//   ۱. فقط تبلیغات همان رستورانِ لاگین‌شده را نشان می‌دهد (خواندنی، بدون تایید/رد)
//   ۲. یک بخش «تبلیغات فعال» با نوار ظرفیت باقیمانده + دکمه رفرش کوچک دارد
//   ۳. یک دکمه «رزرو تبلیغ جدید» دارد که کاربر را به تب رزرو تبلیغات می‌برد
//
// ⚠️ فرض‌های API (لطفاً مطابق بک‌اند خودتان تنظیم کنید):
//   - یک axios instance اختصاصی برای این پنل به نام `restaurantAdAxios` که baseURL آن
//     روی مسیر تبلیغات همین رستوران (بر اساس JWT کاربر لاگین‌شده) تنظیم شده،
//     مشابه الگوی `adminRestaurantAdAxios` در فایل ادمین.
//   - GET /pending  -> لیست درخواست‌های در انتظار بررسی
//   - GET /history  -> لیست تبلیغاتی که تایید یا رد نهایی شده‌اند (تمام‌شده)
//   - GET /active   -> لیست تبلیغاتِ تاییدشده و در حال پخش، همراه با ConsumedUnits
//   هر آیتم برگشتی از /active علاوه بر فیلدهای معمول (id, placement, billing,
//   purchasedUnits, cost, imageUrl, commercialText, targetUrl) این‌ها را هم دارد:
//     consumedUnits, startDateShamsi, endDateShamsi, endDate (ISO, برای محاسبه‌ی روز باقیمانده)
//   اگر نام فیلدها یا مسیرها در بک‌اند شما فرق دارد، فقط بخش‌های map‌شده را اصلاح کنید.

import React, { useEffect, useMemo, useState, useCallback } from "react";
import restaurantAdAxios from "../../api/restaurantAdAxios";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../assets/css/admin/RestaurantAdsSection.css";

/* ---------- helpers ---------- */
const DAY = 24 * 60 * 60 * 1000;

const ranges = [
  {
    key: "today",
    label: "امروز",
    test: (ts) => {
      const d = new Date(ts);
      const t = new Date();
      return (
        d.getFullYear() === t.getFullYear() &&
        d.getMonth() === t.getMonth() &&
        d.getDate() === t.getDate()
      );
    },
  },
  { key: "week", label: "هفته اخیر", test: (ts) => ts >= Date.now() - 7 * DAY },
  {
    key: "month",
    label: "ماه اخیر",
    test: (ts) => ts >= Date.now() - 30 * DAY,
  },
  {
    key: "year",
    label: "سال اخیر",
    test: (ts) => ts >= Date.now() - 365 * DAY,
  },
  { key: "all", label: "همه", test: () => true },
];

// نگاشت واحد ظرفیت خریداری‌شده به لیبل فارسی (هم‌راستا با منطق سمت ادمین)
function getUnitLabel({ billing, adType }) {
  const isBanner = adType === "banner";
  if (billing === "PerDay") return isBanner ? "بازدید" : "روز";
  if (billing === "PerView") return "بازدید";
  if (billing === "PerClick") return "کلیک";
  return "";
}

function mapAd(ad) {
  const adType = ad.placement === "MainSlider" ? "slider" : "banner";
  return {
    id: ad.id,
    code: `AD-${ad.id}`,
    decision:
      ad.status === "Approved"
        ? "approved"
        : ad.status === "Rejected"
          ? "rejected"
          : null,
    decisionReason: ad.adminNotes || null,
    adType,
    unit: getUnitLabel({ billing: ad.billing, adType }),
    purchasedAmount: ad.purchasedUnits ?? 0,
    consumedAmount: ad.consumedUnits ?? 0,
    paidAmount: ad.cost ?? 0,
    imageUrl: ad.imageUrl,
    adText: ad.commercialText,
    targetUrl: ad.targetUrl,
    requestedAt: ad.createdAtShamsi,
    startAt: ad.startDateShamsi,
    endAt: ad.endDateShamsi,
    endDateRaw: ad.endDate,
    ts: ad.createdAt ? new Date(ad.createdAt).getTime() : Date.now(),
  };
}

// تلاش برای هدایت کاربر به تب «رزرو تبلیغات».
// اگر prop مخصوص (onNavigateToBooking) از بیرون داده نشود، یک رویداد سراسری
// پخش می‌کنیم تا کامپوننت والد/روتر برنامه بتواند آن را گوش بدهد، به‌علاوه‌ی
// یک fallback ساده روی هش صفحه.
function goToBookingTab(onNavigateToBooking) {
  if (typeof onNavigateToBooking === "function") {
    onNavigateToBooking();
    return;
  }
  window.dispatchEvent(
    new CustomEvent("menro:navigate-view", { detail: { view: "ads-view" } }),
  );
  const sidebarLink = document.querySelector(
    '[data-view="ads-view"], a[href="#ads-view"]',
  );
  if (sidebarLink) {
    sidebarLink.click();
  } else {
    window.location.hash = "ads-view";
  }
}

/* ---------- small presentational bits ---------- */

function CapacityBar({ percent }) {
  const level = percent >= 70 ? "low" : percent >= 35 ? "mid" : "high";
  return (
    <div className="rad-capacity-track">
      <div
        className={`rad-capacity-fill rad-capacity-fill--${level}`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

function ActiveAdCard({ ad }) {
  const remaining = Math.max(0, ad.purchasedAmount - ad.consumedAmount);
  const percentUsed =
    ad.purchasedAmount > 0
      ? Math.round((ad.consumedAmount / ad.purchasedAmount) * 100)
      : 0;

  const daysLeft = ad.endDateRaw
    ? Math.max(
        0,
        Math.ceil((new Date(ad.endDateRaw).getTime() - Date.now()) / DAY),
      )
    : null;

  return (
    <div className="rad-active-card">
      <div className="rad-active-card__top">
        <span className={`rad-type-badge rad-type-badge--${ad.adType}`}>
          <i
            className={
              ad.adType === "slider"
                ? "fa-solid fa-images"
                : "fa-solid fa-rectangle-ad"
            }
          />
          {ad.adType === "slider" ? "اسلایدر صفحه اصلی" : "بنر تمام صفحه"}
        </span>
        <span className="rad-active-card__code">{ad.code}</span>
      </div>

      {ad.adText && <p className="rad-active-card__text">{ad.adText}</p>}

      <div className="rad-capacity-row">
        <span className="rad-capacity-label">
          {remaining.toLocaleString("fa-IR")} از{" "}
          {ad.purchasedAmount.toLocaleString("fa-IR")} {ad.unit} باقیمانده
        </span>
        <span className="rad-capacity-percent">
          {percentUsed.toLocaleString("fa-IR")}٪ مصرف‌شده
        </span>
      </div>
      <CapacityBar percent={percentUsed} />

      <div className="rad-active-card__meta">
        {ad.startAt && ad.endAt && (
          <span>
            <i className="fa-regular fa-calendar" /> {ad.startAt} تا {ad.endAt}
          </span>
        )}
        {daysLeft !== null && (
          <span>
            <i className="fa-regular fa-clock" />{" "}
            {daysLeft.toLocaleString("fa-IR")} روز باقیمانده
          </span>
        )}
      </div>
    </div>
  );
}

function AdDetailModal({ ad, onClose }) {
  if (!ad) return null;

  const statusText =
    ad.decision === "approved"
      ? "تایید شده"
      : ad.decision === "rejected"
        ? "رد شده"
        : "در انتظار بررسی";

  const statusClass =
    ad.decision === "approved"
      ? "status-approved"
      : ad.decision === "rejected"
        ? "status-rejected"
        : "status-pending";

  return (
    <div className="rad-modal-overlay" onClick={onClose}>
      <div className="modal rad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>جزئیات درخواست {ad.code}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="بستن">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="rad-modal-body">
          <span className={`status-pill ${statusClass}`}>{statusText}</span>

          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt="تصویر تبلیغ"
              className="rad-modal-image"
            />
          )}

          {ad.adText && <p className="rad-modal-text">{ad.adText}</p>}

          <div className="rad-modal-grid">
            <div>
              <span className="rad-modal-grid-label">نوع تبلیغ</span>
              <span>
                {ad.adType === "slider" ? "اسلایدر صفحه اصلی" : "بنر تمام صفحه"}
              </span>
            </div>
            <div>
              <span className="rad-modal-grid-label">ظرفیت خریداری‌شده</span>
              <span>
                {ad.purchasedAmount.toLocaleString("fa-IR")} {ad.unit}
              </span>
            </div>
            <div>
              <span className="rad-modal-grid-label">مبلغ پرداختی</span>
              <span>{ad.paidAmount.toLocaleString("fa-IR")} تومان</span>
            </div>
            <div>
              <span className="rad-modal-grid-label">تاریخ ثبت</span>
              <span>{ad.requestedAt}</span>
            </div>
            {ad.targetUrl && (
              <div className="rad-modal-grid-full">
                <span className="rad-modal-grid-label">لینک مقصد</span>
                <span className="rad-modal-link">{ad.targetUrl}</span>
              </div>
            )}
          </div>

          {ad.decision === "rejected" && ad.decisionReason && (
            <div className="rad-reject-reason">
              <i className="fa-solid fa-circle-info" /> دلیل رد:{" "}
              {ad.decisionReason}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function RestaurantAdsSection({ onNavigateToBooking }) {
  useDocumentTitle("تبلیغات من");

  const { notify } = useGlobalUI();

  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [active, setActive] = useState([]);

  const [loadingActive, setLoadingActive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rangeKey, setRangeKey] = useState("today");
  const [selected, setSelected] = useState(null);

  const loadPending = useCallback(async () => {
    try {
      const res = await restaurantAdAxios.get("/pending");
      setPending(res.data.map(mapAd));
    } catch (err) {
      console.error("Error loading pending ads:", err);
      notify({
        type: "error",
        message: "دریافت وضعیت درخواست‌های تبلیغات با خطا مواجه شد",
      });
    }
  }, [notify]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await restaurantAdAxios.get("/history");
      setHistory(res.data.map(mapAd));
    } catch (err) {
      console.error("Error loading ads history:", err);
      notify({
        type: "error",
        message: "دریافت تاریخچه‌ی تبلیغات با خطا مواجه شد",
      });
    }
  }, [notify]);

  const loadActive = useCallback(async () => {
    setLoadingActive(true);
    try {
      const res = await restaurantAdAxios.get("/active");
      setActive(res.data.map(mapAd));
    } catch (err) {
      console.error("Error loading active ads:", err);
      notify({
        type: "error",
        message: "دریافت تبلیغات فعال با خطا مواجه شد",
      });
    } finally {
      setLoadingActive(false);
    }
  }, [notify]);

  useEffect(() => {
    loadPending();
    loadHistory();
    loadActive();
  }, [loadPending, loadHistory, loadActive]);

  const activeRange = useMemo(
    () => ranges.find((r) => r.key === rangeKey) || ranges[0],
    [rangeKey],
  );

  const historyFiltered = useMemo(
    () => history.filter((r) => activeRange.test(r.ts)),
    [history, activeRange],
  );

  const list = showHistory ? historyFiltered : pending;

  const getStatusPillText = (req) => {
    if (req.decision === null) return "در انتظار بررسی";
    return req.decision === "approved" ? "تایید شده" : "رد شده";
  };

  return (
    <div className="panel rad-panel">
      <div className="view-header rad-header">
        <div>
          <h3>تبلیغات من</h3>
          <p className="panel-subtitle rad-subtitle">
            وضعیت درخواست‌ها، تبلیغات فعال و تاریخچه‌ی رستوران شما
          </p>
        </div>
        <button
          className="btn btn-primary rad-reserve-btn"
          onClick={() => goToBookingTab(onNavigateToBooking)}
        >
          <i className="fa-solid fa-plus" /> رزرو تبلیغ جدید
        </button>
      </div>

      {/* ---------- تبلیغات فعال ---------- */}
      <div className="rad-section">
        <div className="rad-section-header">
          <h4>
            <i className="fa-solid fa-bullhorn" /> تبلیغات فعال (
            {active.length.toLocaleString("fa-IR")})
          </h4>
          <button
            className={`btn-icon rad-refresh-btn ${loadingActive ? "rad-spinning" : ""}`}
            onClick={loadActive}
            title="بروزرسانی تبلیغات فعال"
            aria-label="بروزرسانی تبلیغات فعال"
            disabled={loadingActive}
          >
            <i className="fa-solid fa-arrows-rotate" />
          </button>
        </div>

        {active.length === 0 ? (
          <div className="empty-hint">در حال حاضر تبلیغ فعالی ندارید.</div>
        ) : (
          <div className="rad-active-grid">
            {active.map((ad) => (
              <ActiveAdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </div>

      {/* ---------- درخواست‌ها / تاریخچه ---------- */}
      <div className="rad-section">
        <div className="orders-header rad-tabs-header">
          <div
            className="orders-filters"
            style={{ visibility: showHistory ? "visible" : "hidden" }}
          >
            {ranges.map((r) => (
              <button
                key={r.key}
                className={`chip ${rangeKey === r.key ? "chip--active" : ""}`}
                onClick={() => setRangeKey(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="orders-tabs">
            <button
              className={`btn ${!showHistory ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setShowHistory(false)}
            >
              درخواست‌های در انتظار ({pending.length.toLocaleString("fa-IR")})
            </button>
            <button
              className={`btn ${showHistory ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setShowHistory(true)}
            >
              تاریخچه ({historyFiltered.length.toLocaleString("fa-IR")})
            </button>
          </div>
        </div>

        <div className="orders-list orders-list--vertical">
          {list.length === 0 && (
            <div className="empty-hint">موردی یافت نشد.</div>
          )}

          {list.map((req) => {
            const adTypeLabel =
              req.adType === "slider" ? "اسلایدر صفحه اصلی" : "بنر تمام صفحه";
            const reservedLabel = `${req.purchasedAmount.toLocaleString("fa-IR")} ${req.unit}`;

            return (
              <button
                key={req.id}
                className={`order-bar ${
                  req.decision === null ? "status-pending" : "status-archived"
                }`}
                onClick={() => setSelected(req)}
              >
                <div className="order-bar__info">
                  <div className="order-bar__title">
                    <span className="order-code">درخواست #{req.code}</span>
                  </div>
                  <div className="order-bar__meta">
                    <span>{adTypeLabel}</span>
                    <span className="dot-sep">·</span>
                    <span>{reservedLabel}</span>
                    <span className="dot-sep">·</span>
                    <span>{req.requestedAt}</span>
                  </div>
                </div>

                <div className="order-bar__side">
                  <div className="order-price">
                    {req.paidAmount.toLocaleString("fa-IR")}{" "}
                    <span className="currency">تومان</span>
                  </div>
                  <span
                    className={`status-pill ${
                      req.decision === null
                        ? "status-pending"
                        : "status-archived"
                    }`}
                  >
                    {getStatusPillText(req)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <AdDetailModal ad={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
