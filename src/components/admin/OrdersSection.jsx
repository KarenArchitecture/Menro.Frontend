import { useMemo, useState, useEffect } from "react";
import OrderModal from "./OrderModal";
import adminOrderAxios from "../../api/adminOrderAxios";
import { getStatusMeta, isHistoryStatus } from "../../utils/orderStatus";

/* ---------- helpers ---------- */

const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;

const ranges = [
  {
    key: "today",
    label: "امروز",
    test: (createdAt) => {
      const d = new Date(createdAt);
      const t = new Date();
      return (
        d.getFullYear() === t.getFullYear() &&
        d.getMonth() === t.getMonth() &&
        d.getDate() === t.getDate()
      );
    },
  },
  {
    key: "week",
    label: "هفته اخیر",
    test: (createdAt) => new Date(createdAt).getTime() >= now - 7 * DAY,
  },
  {
    key: "month",
    label: "ماه اخیر",
    test: (createdAt) => new Date(createdAt).getTime() >= now - 30 * DAY,
  },
  {
    key: "year",
    label: "سال اخیر",
    test: (createdAt) => new Date(createdAt).getTime() >= now - 365 * DAY,
  },
  {
    key: "all",
    label: "همه",
    test: () => true,
  },
];

export default function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rangeKey, setRangeKey] = useState("today");

  const activeRange = useMemo(
    () => ranges.find((r) => r.key === rangeKey) || ranges[0],
    [rangeKey]
  );

  const { list, counts } = useMemo(() => {
    const pendingAll = orders.filter((o) => !isHistoryStatus(o.status));

    const historyFiltered = orders.filter(
      (o) => isHistoryStatus(o.status) && activeRange.test(o.createdAt)
    );

    return {
      list: showHistory ? historyFiltered : pendingAll,
      counts: {
        pending: pendingAll.length,
        history: historyFiltered.length,
      },
    };
  }, [orders, activeRange, showHistory]);

  const handleAdvance = (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    setSelected((prev) =>
      prev && prev.id === orderId ? { ...prev, status: nextStatus } : prev
    );

    setSelected(null);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const [activeRes, historyRes] = await Promise.all([
          adminOrderAxios.get("/active"),
          adminOrderAxios.get("/history"),
        ]);

        if (!cancelled) {
          setOrders([...activeRes.data, ...historyRes.data]);
        }
      } catch (e) {
        if (!cancelled) setError("خطا در دریافت سفارش‌ها");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="panel orders-panel">
      <div className="view-header orders-header">
        <h3>سفارش‌ها</h3>

        <div className="orders-controls">
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
              className={`btn ${
                !showHistory ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setShowHistory(false)}
            >
              سفارش‌های فعال ({counts.pending})
            </button>

            <button
              className={`btn ${
                showHistory ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setShowHistory(true)}
            >
              تاریخچه ({counts.history})
            </button>
          </div>
        </div>
      </div>

      <div className="orders-list orders-list--vertical">
        {loading && <div className="empty-hint">در حال دریافت...</div>}
        {!loading && error && <div className="empty-hint">{error}</div>}
        {!loading && !error && list.length === 0 && (
          <div className="empty-hint">موردی یافت نشد.</div>
        )}

        {list.map((o) => {
          const meta = getStatusMeta(o.status);
          const created = new Date(o.createdAt);

          const tableLabel =
            o.tableNumber === null
              ? "بیرون‌بر"
              : `میز شماره ${o.tableNumber}`;

          return (
            <button
              key={o.id}
              className={`order-bar ${meta.cls}`}
              onClick={() => setSelected(o)}
            >
              <div className="order-bar__info">
                <div className="order-bar__title">
                  <span className="order-code">
                    سفارش #{o.restaurantOrderNumber}
                  </span>
                  <span className="order-customer"> — {tableLabel}</span>
                </div>

                <div className="order-bar__meta">
                  <span>{tableLabel}</span>
                  <span className="dot-sep">·</span>
                  <span>
                    {created.toLocaleDateString("fa-IR", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    {created.toLocaleTimeString("fa-IR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="order-bar__side">
                <div className="order-price">
                  {Number(o.totalPrice).toLocaleString("fa-IR")} تومان
                </div>

                <span className={`status-pill ${meta.cls}`}>
                  {meta.pill}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <OrderModal
        open={Boolean(selected)}
        order={selected}
        onClose={() => setSelected(null)}
        onApprove={
          selected && !isHistoryStatus(selected.status)
            ? handleAdvance
            : undefined
        }
      />
    </div>
  );
}