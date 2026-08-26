// src/components/admin/AdsManagementSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdRequestModal from "./AdRequestModal";
import AdsSettingsModal from "./AdsSettingsModal";
import adminRestaurantAdAxios from "../../api/adminRestaurantAdAxios";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../assets/css/admin/admin.css";
import "../../assets/css/admin/AdsManagementSection.css";

/* ---------- helpers ---------- */
const now = Date.now();
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
  { key: "week", label: "هفته اخیر", test: (ts) => ts >= now - 7 * DAY },
  { key: "month", label: "ماه اخیر", test: (ts) => ts >= now - 30 * DAY },
  { key: "year", label: "سال اخیر", test: (ts) => ts >= now - 365 * DAY },
  { key: "all", label: "همه", test: () => true },
];

// ✅ maps backend billing unit to Persian label,
// with the new rule: banner "PerDay" => "بازدید"
function getReservedUnitLabel({ billing, adType }) {
  const isBanner = adType === "banner";

  // ✅ NEW behavior
  if (billing === "PerDay") return isBanner ? "بازدید" : "روز";
  if (billing === "PerView") return "بازدید"; // future-proof
  if (billing === "PerClick") return "کلیک";
  return "";

  // OLD behavior
  /*
  return billing === "PerDay" ? "روز" : billing === "PerClick" ? "کلیک" : "";
  */
}

export default function AdsManagementSection() {
  useDocumentTitle("درخواست‌های تبلیغات");

  const [requests, setRequests] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [rangeKey, setRangeKey] = useState("today");
  const [showSettings, setShowSettings] = useState(false);
  const { notify } = useGlobalUI();
  /* ---------- Load Pending Ads ---------- */
  async function loadPending() {
    try {
      const res = await adminRestaurantAdAxios.get("/pending");
      const data = res.data;

      const mapped = data.map((ad) => {
        const adType = ad.placement === "MainSlider" ? "slider" : "banner";

        return {
          id: ad.id,
          code: `AD-${ad.id}`,
          status: "pending",
          decision: null,

          restaurantName: ad.restaurantName,
          adType,
          reservedAmount: ad.purchasedUnits,
          reservedUnit: getReservedUnitLabel({ billing: ad.billing, adType }),
          paidAmount: ad.cost,
          imageUrl: ad.imageUrl,
          adText: ad.commercialText,
          targetUrl: ad.targetUrl,
          requestedAt: ad.createdAtShamsi,
          ts: new Date(ad.createdAt).getTime(),
        };
      });

      setRequests((prevHistory) => {
        const history = prevHistory.filter((x) => x.status === "history");
        return [...mapped, ...history];
      });
    } catch (err) {
      console.error("Error loading pending ads:", err);
      notify({
        type: "error",
        message: "دریافت درخواست‌های تبلیغات با خطا مواجه شد",
      });
    }
  }

  useEffect(() => {
    loadPending();
    loadHistory();
  }, []);

  /* ---------- Load Ads History ---------- */
  async function loadHistory() {
    try {
      const res = await adminRestaurantAdAxios.get("/history");
      const data = res.data;

      console.log("RAW HISTORY FROM BACKEND:", data);

      const mapped = data.map((ad) => {
        const adType = ad.placement === "MainSlider" ? "slider" : "banner";

        return {
          id: ad.id,
          code: `AD-${ad.id}`,
          status: "history",

          decision:
            ad.status === "Approved"
              ? "approved"
              : ad.status === "Rejected"
                ? "rejected"
                : null,
          decisionReason: ad.adminNotes || null,
          restaurantName: ad.restaurantName,
          adType,
          reservedAmount: ad.purchasedUnits,
          reservedUnit: getReservedUnitLabel({ billing: ad.billing, adType }),
          paidAmount: ad.cost,
          imageUrl: ad.imageUrl,
          adText: ad.commercialText,
          targetUrl: ad.targetUrl,
          requestedAt: ad.createdAtShamsi,
          ts: new Date(ad.createdAt).getTime(),
        };
      });

      setRequests((prevPending) => {
        const pending = prevPending.filter((x) => x.status === "pending");
        return [...pending, ...mapped];
      });
    } catch (err) {
      console.error("Error loading history ads:", err);
      notify({
        type: "error",
        message: "دریافت تاریخچه‌ی تبلیغات با خطا مواجه شد",
      });
    }
  }

  /* ---------- Filtering Logic (same as before) ---------- */
  const activeRange = useMemo(
    () => ranges.find((r) => r.key === rangeKey) || ranges[0],
    [rangeKey],
  );

  const { list, counts } = useMemo(() => {
    const pendingAll = requests.filter((r) => r.status === "pending");
    const historyFiltered = requests.filter(
      (r) => r.status === "history" && activeRange.test(r.ts),
    );

    return {
      list: showHistory ? historyFiltered : pendingAll,
      counts: { pending: pendingAll.length, history: historyFiltered.length },
    };
  }, [requests, activeRange, showHistory]);

  /* ---------- Approve ---------- */
  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      await adminRestaurantAdAxios.post(`/${requestId}/approve`);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: "history", decision: "approved", ts: Date.now() }
            : r,
        ),
      );

      setSelected(null);
      notify({ type: "success", message: "تبلیغ با موفقیت تایید شد." });
    } catch (err) {
      console.error("Approve error:", err);
      notify({ type: "error", message: "تایید تبلیغ با خطا مواجه شد." });
    } finally {
      setProcessingId(null);
    }
  };

  /* ---------- Reject ---------- */
  const handleReject = async (requestId, reason) => {
    setProcessingId(requestId);
    try {
      await adminRestaurantAdAxios.post(`/${requestId}/reject`, {
        id: requestId,
        adminNote: reason,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "history",
                decision: "rejected",
                decisionReason: reason,
                ts: Date.now(),
              }
            : r,
        ),
      );

      setSelected(null);
      notify({ type: "success", message: "تبلیغ رد شد." });
    } catch (err) {
      console.error("Reject error:", err);
      notify({ type: "error", message: "رد کردن تبلیغ با خطا مواجه شد." });
    } finally {
      setProcessingId(null);
    }
  };

  /* ---------- Status Pill Text ---------- */
  const getStatusPillText = (req) => {
    if (req.status === "pending") return "در انتظار بررسی";
    if (req.decision === "approved") return "تایید شده";
    if (req.decision === "rejected") return "رد شده";
    return "در تاریخچه";
  };

  /* ---------- UI ---------- */
  return (
    <div className="panel ads-mgmt">
      <div className="view-header ads-mgmt__header">
        <h3>درخواست‌های تبلیغات</h3>

        <div className="ads-mgmt__controls">
          {/* time filters */}
          <div
            className="ads-mgmt__filters"
            style={{ visibility: showHistory ? "visible" : "hidden" }}
          >
            {ranges.map((r) => (
              <button
                key={r.key}
                className={`ads-mgmt__chip ${rangeKey === r.key ? "ads-mgmt__chip--active" : ""}`}
                onClick={() => setRangeKey(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* tabs */}
          <div className="ads-mgmt__tabs">
            <button
              className={`btn ${!showHistory ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setShowHistory(false)}
            >
              درخواست‌های فعال ({counts.pending})
            </button>
            <button
              className={`btn ${showHistory ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setShowHistory(true)}
            >
              تاریخچه ({counts.history})
            </button>
          </div>
        </div>

        {/* settings — separate top-level child, pushed to the far edge */}
        <button
          type="button"
          className="btn btn-secondary ads-mgmt__settings-btn"
          onClick={() => setShowSettings(true)}
        >
          <i className="fas fa-cog" />
          <span>تنظیمات تبلیغات</span>
        </button>
      </div>

      {/* list */}
      <div className="ads-mgmt__list">
        {list.length === 0 && (
          <div className="ads-mgmt__empty">موردی یافت نشد.</div>
        )}

        {list.map((req) => {
          const adTypeLabel =
            req.adType === "slider" ? "اسلایدر صفحه اصلی" : "بنر تمام صفحه";

          const reservedLabel = `${req.reservedAmount.toLocaleString(
            "fa-IR",
          )} ${req.reservedUnit}`;

          return (
            <button
              key={req.id}
              className={`ads-mgmt__item ${
                req.status === "pending"
                  ? "ads-mgmt__item--pending"
                  : "ads-mgmt__item--archived"
              }`}
              onClick={() => setSelected(req)}
            >
              <div className="ads-mgmt__item-info">
                <div className="ads-mgmt__item-title">
                  <span className="ads-mgmt__item-code">
                    درخواست #{req.code}
                  </span>
                  <span className="ads-mgmt__item-customer">
                    {" "}
                    — {req.restaurantName}
                  </span>
                </div>

                <div className="ads-mgmt__item-meta">
                  <span>{adTypeLabel}</span>
                  <span className="ads-mgmt__dot">·</span>
                  <span>{reservedLabel}</span>
                  <span className="ads-mgmt__dot">·</span>
                  <span>{req.requestedAt}</span>
                </div>
              </div>

              <div className="ads-mgmt__item-side">
                <div className="ads-mgmt__price">
                  {req.paidAmount.toLocaleString("fa-IR")}{" "}
                  <span className="ads-mgmt__currency">تومان</span>
                </div>
                <span
                  className={`ads-mgmt__status ${
                    req.status === "pending"
                      ? "ads-mgmt__status--pending"
                      : "ads-mgmt__status--archived"
                  }`}
                >
                  {getStatusPillText(req)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* modal */}
      <AdRequestModal
        open={Boolean(selected)}
        request={selected}
        onClose={() => setSelected(null)}
        onApprove={selected?.status === "pending" ? handleApprove : undefined}
        onReject={selected?.status === "pending" ? handleReject : undefined}
        submitting={processingId === selected?.id}
      />

      {showSettings && (
        <AdsSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
