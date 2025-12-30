// src/components/admin/AdsRequestsSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdRequestModal from "./AdRequestModal";
import adminRestaurantAdAxios from "../../api/adminRestaurantAdAxios";

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

export default function AdsRequestsSection() {
  const [requests, setRequests] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rangeKey, setRangeKey] = useState("today");

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

          // ✅ NEW: banner PerDay => بازدید
          reservedUnit: getReservedUnitLabel({ billing: ad.billing, adType }),

          // ❌ OLD (kept): always day for PerDay
          /*
          reservedUnit:
            ad.billing === "PerDay"
              ? "روز"
              : ad.billing === "PerClick"
              ? "کلیک"
              : "",
          */

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

          // ✅ NEW: banner PerDay => بازدید
          reservedUnit: getReservedUnitLabel({ billing: ad.billing, adType }),

          // ❌ OLD (kept): PerDay => روز, else کلیک
          /*
          reservedUnit: ad.billing === "PerDay" ? "روز" : "کلیک",
          */

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
    }
  }

  /* ---------- Filtering Logic (same as before) ---------- */
  const activeRange = useMemo(
    () => ranges.find((r) => r.key === rangeKey) || ranges[0],
    [rangeKey]
  );

  const { list, counts } = useMemo(() => {
    const pendingAll = requests.filter((r) => r.status === "pending");
    const historyFiltered = requests.filter(
      (r) => r.status === "history" && activeRange.test(r.ts)
    );

    return {
      list: showHistory ? historyFiltered : pendingAll,
      counts: { pending: pendingAll.length, history: historyFiltered.length },
    };
  }, [requests, activeRange, showHistory]);

  /* ---------- Approve ---------- */
  const handleApprove = async (requestId) => {
    try {
      await adminRestaurantAdAxios.post(`/${requestId}/approve`);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "history",
                decision: "approved",
                ts: Date.now(),
              }
            : r
        )
      );

      setSelected(null);
    } catch (err) {
      console.error("Approve error:", err);
      alert("خطا در تایید تبلیغ.");
    }
  };

  /* ---------- Reject ---------- */
  const handleReject = async (requestId, reason) => {
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
            : r
        )
      );

      setSelected(null);
    } catch (err) {
      console.error("Reject error:", err);
      alert("خطا در رد کردن تبلیغ.");
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
    <div className="panel orders-panel">
      <div className="view-header orders-header">
        <h3>درخواست‌های تبلیغات</h3>

        <div className="orders-controls">
          {/* time filters */}
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

          {/* tabs */}
          <div className="orders-tabs">
            <button
              className={`btn ${
                !showHistory ? "btn-primary" : "btn-secondary"
              }`}
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
      </div>

      {/* list */}
      <div className="orders-list orders-list--vertical">
        {list.length === 0 && <div className="empty-hint">موردی یافت نشد.</div>}

        {list.map((req) => {
          const adTypeLabel =
            req.adType === "slider" ? "اسلایدر صفحه اصلی" : "بنر تمام صفحه";

          const reservedLabel = `${req.reservedAmount.toLocaleString(
            "fa-IR"
          )} ${req.reservedUnit}`;

          return (
            <button
              key={req.id}
              className={`order-bar ${
                req.status === "pending" ? "status-pending" : "status-archived"
              }`}
              onClick={() => setSelected(req)}
            >
              <div className="order-bar__info">
                <div className="order-bar__title">
                  <span className="order-code">درخواست #{req.code}</span>
                  <span className="order-customer">
                    {" "}
                    — {req.restaurantName}
                  </span>
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
                    req.status === "pending"
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

      {/* modal */}
      <AdRequestModal
        open={Boolean(selected)}
        request={selected}
        onClose={() => setSelected(null)}
        onApprove={selected?.status === "pending" ? handleApprove : undefined}
        onReject={selected?.status === "pending" ? handleReject : undefined}
      />
    </div>
  );
}
