// src/components/admin/OrdersSection.jsx
import { useMemo, useState, useEffect, useRef } from "react";
import OrderModal from "./OrderModal";
import adminOrderAxios from "../../api/adminOrderAxios";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { toPersianDigits } from "../../utils/persianNumbers";

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
  { key: "all", label: "همه", test: () => true },
];

function getStatusMeta(status, paymentMethod) {
  const isPayAtCounter = paymentMethod === "PayAtCounterBeforeServing";
  if (status === "Pending")
    return { pill: "در انتظار تأیید", cls: "status-pending" };
  if (status === "Cancelled")
    return { pill: "لغو شده", cls: "status-archived" };
  if (status === "Completed")
    return { pill: "تکمیل شده", cls: "status-archived" };
  if (isPayAtCounter) {
    if (status === "Confirmed")
      return { pill: "در انتظار پرداخت", cls: "status-payment" };
    if (status === "Paid")
      return { pill: "در انتظار تحویل", cls: "status-delivery" };
    if (status === "Delivered")
      return { pill: "آماده اتمام سفارش", cls: "status-archived" };
  } else {
    if (status === "Confirmed")
      return { pill: "در انتظار تحویل", cls: "status-delivery" };
    if (status === "Delivered")
      return { pill: "در انتظار پرداخت", cls: "status-payment" };
    if (status === "Paid")
      return { pill: "پایان سفارش", cls: "status-archived" };
  }
  return { pill: "—", cls: "status-archived" };
}

function isHistoryStatus(status) {
  return status === "Cancelled" || status === "Completed";
}

export default function OrdersSection() {
  useDocumentTitle("مدیریت سفارش‌ها");
  const { notify } = useGlobalUI();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rangeKey, setRangeKey] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef(null);

  const restaurantPaymentMethod = orders.find(Boolean)?.paymentMethod;

  const activeRange = useMemo(
    () => ranges.find((r) => r.key === rangeKey) || ranges[0],
    [rangeKey],
  );

  const activeStatusOptions = useMemo(() => {
    const seq =
      restaurantPaymentMethod === "PayAtCounterBeforeServing"
        ? ["Pending", "Confirmed", "Paid", "Delivered"]
        : ["Pending", "Confirmed", "Delivered", "Paid"];
    return seq.map((s) => ({
      key: s,
      label: getStatusMeta(s, restaurantPaymentMethod).pill,
    }));
  }, [restaurantPaymentMethod]);

  const { list, counts } = useMemo(() => {
    const pendingAll = orders.filter((o) => !isHistoryStatus(o.status));
    const statusScoped =
      statusFilter === "all"
        ? pendingAll
        : pendingAll.filter((o) => o.status === statusFilter);
    const historyFiltered = orders.filter(
      (o) => isHistoryStatus(o.status) && activeRange.test(o.createdAt),
    );

    const scoped = showHistory ? historyFiltered : statusScoped;
    const sorted = [...scoped].sort((a, b) => {
      const av = a.invoiceNumber || "";
      const bv = b.invoiceNumber || "";
      return sortDesc ? bv.localeCompare(av) : av.localeCompare(bv);
    });

    return {
      list: sorted,
      counts: { pending: pendingAll.length, history: historyFiltered.length },
    };
  }, [orders, activeRange, showHistory, statusFilter, sortDesc]);

  // Order-count stats (not a money total — that lives in the Financial tab)
  const orderCounts = useMemo(() => {
    const today = orders.filter((o) => ranges[0].test(o.createdAt)).length;
    const month = orders.filter((o) => ranges[2].test(o.createdAt)).length;
    const year = orders.filter((o) => ranges[3].test(o.createdAt)).length;
    return { today, month, year };
  }, [orders]);

  // Debounced server-side invoice search — never filters the full local
  // orders array, so this stays fast and light regardless of how many
  // orders the restaurant has accumulated.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const q = searchInput.trim();

    if (q.length < 2) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await adminOrderAxios.get("/search", {
          params: { query: q },
        });
        setSearchResults(res.data || []);
      } catch (e) {
        console.error("خطا در جستجوی سفارش:", e);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const showDropdown = searchFocused && searchInput.trim().length >= 2;

  const handleAdvance = (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
    );
    setSelected((prev) =>
      prev && prev.id === orderId ? { ...prev, status: nextStatus } : prev,
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
        if (!cancelled) setOrders([...activeRes.data, ...historyRes.data]);
      } catch (e) {
        if (!cancelled) {
          console.error("خطا در دریافت سفارش‌ها:", e);
          setError("خطا در دریافت سفارش‌ها");
          notify({ type: "error", message: "خطا در دریافت سفارش‌ها" });
        }
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
      <div className="orders-header">
        <h3>سفارش‌ها</h3>

        <div className="orders-stats-strip">
          <span>
            <strong>{toPersianDigits(orderCounts.today)}</strong> امروز
          </span>
          <span>
            <strong>{toPersianDigits(orderCounts.month)}</strong> این ماه
          </span>
          <span>
            <strong>{toPersianDigits(orderCounts.year)}</strong> امسال
          </span>
        </div>
      </div>

      <div className="orders-controls">
        <div className="admin-search-wrap">
          <i className="fas fa-search admin-search-icon-inline" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="جستجوی شماره فاکتور..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          />
          {showDropdown && (
            <div className="admin-search-dropdown">
              {searchLoading ? (
                <div className="admin-search-dropdown__empty">
                  در حال جستجو...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="admin-search-dropdown__empty">
                  نتیجه‌ای یافت نشد
                </div>
              ) : (
                searchResults.map((o) => {
                  const meta = getStatusMeta(o.status, o.paymentMethod);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      className="admin-search-dropdown__item"
                      onMouseDown={() => {
                        setSelected(o);
                        setSearchInput("");
                      }}
                    >
                      <span className="admin-search-dropdown__invoice">
                        فاکتور {toPersianDigits(o.invoiceNumber || "—")}
                      </span>
                      <span className={`status-pill ${meta.cls}`}>
                        {meta.pill}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="orders-chip-row">
          <button
            type="button"
            className="chip chip--icon"
            onClick={() => setSortDesc((v) => !v)}
            title="مرتب‌سازی بر حسب تاریخ"
          >
            <i className={`fas fa-sort-amount-${sortDesc ? "down" : "up"}`} />
          </button>

          {showHistory ? (
            ranges.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`chip ${rangeKey === r.key ? "chip--active" : ""}`}
                onClick={() => setRangeKey(r.key)}
              >
                {r.label}
              </button>
            ))
          ) : (
            <>
              <button
                type="button"
                className={`chip ${statusFilter === "all" ? "chip--active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                همه
              </button>
              {activeStatusOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`chip ${statusFilter === opt.key ? "chip--active" : ""}`}
                  onClick={() => setStatusFilter(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="orders-tabs">
          <button
            className={`btn ${!showHistory ? "btn-primary" : "btn-secondary"}`}
            onClick={() => {
              setShowHistory(false);
              setStatusFilter("all");
            }}
          >
            فعال ({toPersianDigits(counts.pending)})
          </button>
          <button
            className={`btn ${showHistory ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setShowHistory(true)}
          >
            تاریخچه ({toPersianDigits(counts.history)})
          </button>
        </div>
      </div>

      <div className="orders-list orders-list--vertical">
        {loading && <div className="empty-hint">در حال دریافت...</div>}
        {!loading && error && <div className="empty-hint">{error}</div>}
        {!loading && !error && list.length === 0 && (
          <div className="empty-hint">موردی یافت نشد.</div>
        )}

        {list.map((o) => {
          const meta = getStatusMeta(o.status, o.paymentMethod);
          const created = new Date(o.createdAt);
          const tableLabel = o.tableLabel == null ? "بیرون‌بر" : o.tableLabel;

          return (
            <button
              key={o.id}
              className={`order-bar ${meta.cls}`}
              onClick={() => setSelected(o)}
            >
              <div className="order-bar__info">
                <div className="order-bar__title">
                  <span className="order-code">
                    فاکتور {toPersianDigits(o.invoiceNumber || "—")}
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
                  {Number(o.totalPrice).toLocaleString("fa-IR")}{" "}
                  <span className="currency">تومان</span>
                </div>
                <span className={`status-pill ${meta.cls}`}>{meta.pill}</span>
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
