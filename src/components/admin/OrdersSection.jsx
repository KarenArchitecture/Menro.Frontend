// src/components/admin/orders/OrdersSection.jsx
import React, { useMemo, useState } from "react";
import OrderModal from "./OrderModal";

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

/* ---------- mock data with timestamps (ts) ---------- */
const INITIAL_ORDERS = [
  // pending
  {
    id: "o0",
    code: "2452",
    status: "pending",
    table: 5,
    time: "امروز، 12:40",
    ts: now - 2 * 60 * 60 * 1000,
    customer: "میز شماره ۵",
    items: [],
    total: 250000,
  },
  {
    id: "o1",
    code: "2451",
    status: "pending",
    table: 7,
    time: "امروز، 12:35",
    ts: now - 3 * 60 * 60 * 1000,
    customer: "میز شماره ۷",
    items: [
      {
        id: "i1",
        name: "کباب برگ",
        qty: 2,
        price: 320000,
        image: "https://via.placeholder.com/96",
        addons: [{ name: "نوشابه" }, { name: "سالاد شیرازی" }],
      },
      {
        id: "i2",
        name: "دوغ لیوانی",
        qty: 2,
        price: 30000,
        image: "https://via.placeholder.com/96",
      },
    ],
    total: 700000,
  },
  // history
  {
    id: "h1",
    code: "2449",
    status: "history",
    table: 1,
    time: "دیروز، 21:15",
    ts: now - 1 * DAY,
    customer: "میز شماره ۱",
    items: [
      {
        id: "i4",
        name: "جوجه کباب",
        qty: 2,
        price: 160000,
        image: "https://via.placeholder.com/96",
      },
    ],
    total: 320000,
  },
  {
    id: "h2",
    code: "2440",
    status: "history",
    table: 3,
    time: "هفتهٔ قبل",
    ts: now - 6 * DAY,
    customer: "میز شماره ۳",
    items: [],
    total: 150000,
  },
  {
    id: "h3",
    code: "2420",
    status: "history",
    table: 2,
    time: "ماه قبل",
    ts: now - 20 * DAY,
    customer: "میز شماره ۲",
    items: [],
    total: 210000,
  },
  {
    id: "h4",
    code: "2350",
    status: "history",
    table: 8,
    time: "سال قبل",
    ts: now - 200 * DAY,
    customer: "میز شماره ۸",
    items: [],
    total: 190000,
  },
];

export default function OrdersSection() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rangeKey, setRangeKey] = useState("today"); // today|week|month|year|all

  const activeRange = useMemo(
    () => ranges.find((r) => r.key === rangeKey) || ranges[0],
    [rangeKey]
  );

  // Apply time filter ONLY to history
  const { list, counts } = useMemo(() => {
    const pendingAll = orders.filter((o) => o.status === "pending");
    const historyFiltered = orders.filter(
      (o) => o.status === "history" && activeRange.test(o.ts)
    );

    return {
      list: showHistory ? historyFiltered : pendingAll,
      counts: { pending: pendingAll.length, history: historyFiltered.length },
    };
  }, [orders, activeRange, showHistory]);

  const handleApprove = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "history", ts: Date.now() } : o
      )
    );
    setSelected(null);
  };

  return (
    <div className="panel orders-panel">
      <div className="view-header orders-header">
        <h3>سفارش‌ها</h3>

        {/* controls wrapper keeps layout stable */}
        <div className="orders-controls">
          {/* filters: keep space with visibility toggle */}
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

          {/* tabs: always aligned to the right */}
          <div className="orders-tabs">
            <button
              className={`btn ${
                !showHistory ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setShowHistory(false)}
            >
              سفارش‌های در انتظار ({counts.pending})
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

      {/* List (vertical bars) */}
      <div className="orders-list orders-list--vertical">
        {list.length === 0 && <div className="empty-hint">موردی یافت نشد.</div>}

        {list.map((o) => (
          <button
            key={o.id}
            className={`order-bar ${
              o.status === "pending" ? "status-pending" : "status-archived"
            }`}
            onClick={() => setSelected(o)}
          >
            <div className="order-bar__info">
              <div className="order-bar__title">
                <span className="order-code">سفارش #{o.code}</span>
                <span className="order-customer"> — {o.customer}</span>
              </div>
              <div className="order-bar__meta">
                <span>میز {o.table ?? "—"}</span>
                <span className="dot-sep">·</span>
                <span>{o.time}</span>
              </div>
            </div>

            <div className="order-bar__side">
              <div className="order-price">
                {o.total.toLocaleString()}{" "}
                <span className="currency">تومان</span>
              </div>
              <span
                className={`status-pill ${
                  o.status === "pending" ? "status-pending" : "status-archived"
                }`}
              >
                {o.status === "pending" ? "در انتظار تأیید" : "در تاریخچه"}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      <OrderModal
        open={Boolean(selected)}
        order={selected}
        onClose={() => setSelected(null)}
        onApprove={selected?.status === "pending" ? handleApprove : undefined}
      />
    </div>
  );
}
