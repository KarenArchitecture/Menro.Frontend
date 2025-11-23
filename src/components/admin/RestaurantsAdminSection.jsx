// src/components/admin/RestaurantsAdminSection.jsx
import React, { useMemo, useState } from "react";
import RestaurantReviewModal from "./RestaurantReviewModal";

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

/* ---------- mock data for restaurants waiting for approval ---------- */
const INITIAL_RESTAURANTS = [
  {
    id: "r0",
    code: "RS-1001",
    status: "pending", // pending | history
    decision: null, // approved | rejected | null
    decisionReason: "",
    name: "رستوران بهار",
    description: "رستوران سنتی با انواع کباب و خورش‌های ایرانی.",
    address: "تهران، خیابان ولیعصر، کوچه بهار",
    type: "ایرانی / کبابی",
    workingHours: "هر روز ۱۲ تا ۲۳",
    ownerNationalId: "0012345678",
    ownerBankAccount: "IR520170000000000123456789",
    requestedAt: "امروز، 12:40",
    ts: now - 2 * 60 * 60 * 1000,
  },
  {
    id: "r1",
    code: "RS-1002",
    status: "pending",
    decision: null,
    decisionReason: "",
    name: "کافه آفتاب",
    description: "کافه دنج با انواع قهوه دمی و دسر خانگی.",
    address: "مشهد، احمدآباد، نبش کوچه ۷",
    type: "کافه / کافی‌شاپ",
    workingHours: "هر روز ۹ تا ۲۲",
    ownerNationalId: "0087654321",
    ownerBankAccount: "IR720170000000000987654321",
    requestedAt: "امروز، 11:20",
    ts: now - 3 * 60 * 60 * 1000,
  },
  {
    id: "r2",
    code: "RS-0950",
    status: "history",
    decision: "approved",
    decisionReason: "",
    name: "رستوران کلاسیک",
    description: "منوی کامل غذای ایرانی و فرنگی برای مهمانی‌ها.",
    address: "اصفهان، چهار راه آمادگاه",
    type: "ایرانی / فرنگی",
    workingHours: "هر روز ۱۳ تا ۲۳",
    ownerNationalId: "0045678901",
    ownerBankAccount: "IR460170000000000456789012",
    requestedAt: "هفتهٔ قبل",
    ts: now - 6 * DAY,
  },
  {
    id: "r3",
    code: "RS-0901",
    status: "history",
    decision: "rejected",
    decisionReason: "آدرس و شماره حساب با مدارک ارسال‌شده هم‌خوانی نداشت.",
    name: "کافه شبانه",
    description: "کافه شبانه با موسیقی زنده.",
    address: "شیراز، ستارخان",
    type: "کافه",
    workingHours: "هر شب ۱۹ تا ۲ بامداد",
    ownerNationalId: "0022334455",
    ownerBankAccount: "IR830170000000000222333444",
    requestedAt: "ماه قبل",
    ts: now - 20 * DAY,
  },
];

export default function RestaurantsAdminSection() {
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rangeKey, setRangeKey] = useState("today");

  const activeRange = useMemo(
    () => ranges.find((r) => r.key === rangeKey) || ranges[0],
    [rangeKey]
  );

  const { list, counts } = useMemo(() => {
    const pendingAll = restaurants.filter((r) => r.status === "pending");
    const historyFiltered = restaurants.filter(
      (r) => r.status === "history" && activeRange.test(r.ts)
    );

    return {
      list: showHistory ? historyFiltered : pendingAll,
      counts: { pending: pendingAll.length, history: historyFiltered.length },
    };
  }, [restaurants, activeRange, showHistory]);

  const handleApprove = (restaurantId) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restaurantId
          ? {
              ...r,
              status: "history",
              decision: "approved",
              decisionReason: "",
              ts: Date.now(),
            }
          : r
      )
    );
    setSelected(null);
  };

  const handleReject = (restaurantId, reason) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restaurantId
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

  const getStatusPillText = (r) => {
    if (r.status === "pending") return "در انتظار بررسی";
    if (r.decision === "approved") return "تایید شده";
    if (r.decision === "rejected") return "رد شده";
    return "در تاریخچه";
  };

  return (
    <div className="panel orders-panel">
      <div className="view-header orders-header">
        <h3>مدیریت رستوران‌ها</h3>

        <div className="orders-controls">
          {/* time filters for history */}
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

          {/* tabs: pending vs history */}
          <div className="orders-tabs">
            <button
              className={`btn ${
                !showHistory ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setShowHistory(false)}
            >
              رستوران‌های در انتظار تأیید ({counts.pending})
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

      {/* list (copy of orders layout) */}
      <div className="orders-list orders-list--vertical">
        {list.length === 0 && <div className="empty-hint">موردی یافت نشد.</div>}

        {list.map((r) => (
          <button
            key={r.id}
            className={`order-bar ${
              r.status === "pending" ? "status-pending" : "status-archived"
            }`}
            onClick={() => setSelected(r)}
          >
            <div className="order-bar__info">
              <div className="order-bar__title">
                <span className="order-code">{r.name}</span>
                <span className="order-customer">
                  {" "}
                  — {r.type || "نوع نامشخص"}
                </span>
              </div>
              <div className="order-bar__meta">
                <span>{r.address || "آدرس ثبت نشده"}</span>
                <span className="dot-sep">·</span>
                <span>{r.requestedAt}</span>
              </div>
            </div>

            <div className="order-bar__side">
              <span
                className={`status-pill ${
                  r.status === "pending" ? "status-pending" : "status-archived"
                }`}
              >
                {getStatusPillText(r)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* modal */}
      <RestaurantReviewModal
        open={Boolean(selected)}
        restaurant={selected}
        onClose={() => setSelected(null)}
        onApprove={selected?.status === "pending" ? handleApprove : undefined}
        onReject={selected?.status === "pending" ? handleReject : undefined}
      />
    </div>
  );
}
