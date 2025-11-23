// src/components/admin/AdsRequestsSection.jsx
import React, { useMemo, useState } from "react";
import AdRequestModal from "./AdRequestModal";

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

/* ---------- mock data for ad requests ---------- */
const INITIAL_AD_REQUESTS = [
  {
    id: "a0",
    code: "AD-2452",
    status: "pending", // pending | history
    decision: null, // approved | rejected | null
    restaurantName: "رستوران بهار",
    adType: "slider", // slider | banner
    reservedAmount: 7,
    reservedUnit: "روز",
    paidAmount: 1050000,
    imageUrl: "https://via.placeholder.com/600x300",
    adText: "تخفیف ویژه منوی ناهار این هفته!",
    targetUrl: "https://example.com/restaurant/bahar",
    requestedAt: "امروز، 12:40",
    ts: now - 2 * 60 * 60 * 1000,
  },
  {
    id: "a1",
    code: "AD-2451",
    status: "pending",
    decision: null,
    restaurantName: "کافه آفتاب",
    adType: "banner",
    reservedAmount: 10000,
    reservedUnit: "کلیک",
    paidAmount: 1200000,
    imageUrl: "https://via.placeholder.com/600x300",
    adText: "قهوه دمی با ۲۰٪ تخفیف بعد از ساعت ۸ شب",
    targetUrl: "https://example.com/cafe/aftab",
    requestedAt: "امروز، 11:20",
    ts: now - 3 * 60 * 60 * 1000,
  },
  {
    id: "h1",
    code: "AD-2440",
    status: "history",
    decision: "approved",
    restaurantName: "رستوران کلاسیک",
    adType: "slider",
    reservedAmount: 14,
    reservedUnit: "روز",
    paidAmount: 2100000,
    imageUrl: "https://via.placeholder.com/600x300",
    adText: "رزرو میز خانوادگی همراه با دسر رایگان",
    targetUrl: "https://example.com/restaurant/classic",
    requestedAt: "هفتهٔ قبل",
    ts: now - 6 * DAY,
  },
  {
    id: "h2",
    code: "AD-2430",
    status: "history",
    decision: "rejected",
    decisionReason: "بنر با قوانین گرافیکی منرو هم‌خوانی نداشت.",
    restaurantName: "کافه شبانه",
    adType: "banner",
    reservedAmount: 5000,
    reservedUnit: "کلیک",
    paidAmount: 600000,
    imageUrl: "https://via.placeholder.com/600x300",
    adText: "تبلیغ با محتوای نامناسب",
    targetUrl: "https://example.com/cafe/night",
    requestedAt: "ماه قبل",
    ts: now - 20 * DAY,
  },
];

export default function AdsRequestsSection() {
  const [requests, setRequests] = useState(INITIAL_AD_REQUESTS);
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rangeKey, setRangeKey] = useState("today");

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

  const handleApprove = (requestId) => {
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
  };

  const handleReject = (requestId, reason) => {
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
  };

  const getStatusPillText = (req) => {
    if (req.status === "pending") return "در انتظار بررسی";
    if (req.decision === "approved") return "تایید شده";
    if (req.decision === "rejected") return "رد شده";
    return "در تاریخچه";
  };

  return (
    <div className="panel orders-panel">
      <div className="view-header orders-header">
        <h3>درخواست‌های تبلیغات</h3>

        <div className="orders-controls">
          {/* time filters (for history) */}
          <div
            className="orders-filters"
            style={{ visibility: showHistory ? "visible" : "hidden" }}
          >
            {ranges.map((r) => (
              <button
                key={r.key}
                className={`chip ${rangeKey === r.key ? "chip--active" : ""}`}
                onClick={() => setRangeKey(r.key)}
                title={r.label}
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
            req.adType === "slider"
              ? "اسلایدر صفحه اصلی"
              : req.adType === "banner"
              ? "بنر تمام صفحه"
              : "نوع نامشخص";

          const reservedLabel = `${req.reservedAmount.toLocaleString(
            "fa-IR"
          )} ${req.reservedUnit || ""}`;

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
