// src/components/admin/orders/OrderModal.jsx
import React, { useEffect, useState } from "react";
import adminOrderAxios from "../../api/adminOrderAxios";

export default function OrderModal({ open, order, onClose, onApprove }) {
  const [details, setDetails] = useState(null); // AdminOrderDetailsDto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ برای تست فرانت (تا وقتی بک‌اند آماده نیست):
  // وضعیت "نمایشی" داخل مودال
  const [uiStatus, setUiStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      if (!open || !order?.id) return;

      try {
        setLoading(true);
        setError("");
        setDetails(null);
        setUiStatus(null); // هر بار باز میشه، از وضعیت واقعی شروع کن

        const res = await adminOrderAxios.get(`/${order.id}`);
        if (!cancelled) setDetails(res.data);
      } catch (e) {
        if (!cancelled) setError("خطا در دریافت جزئیات سفارش");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [open, order?.id]);

  if (!open || !order) return null;

  const dto = details || order;

  // ✅ status واقعی (از dto) + override تستی (uiStatus)
  const status = uiStatus ?? dto.status;

  const isHistory = status === "Cancelled" || status === "Completed";

  // ✅ Label وضعیت (طبق enum واقعی)
  const statusLabel =
    status === "Pending"
      ? "در انتظار تأیید"
      : status === "Confirmed"
      ? "در انتظار تحویل"
      : status === "Delivered"
      ? "تحویل شده"
      : status === "Paid"
      ? "پرداخت شده"
      : "در تاریخچه";

  // ✅ متن دکمه اصلی طبق خواسته شما
  const primaryActionLabel =
    status === "Pending"
      ? "تأیید"
      : status === "Confirmed"
      ? "تحویل شد"
      : status === "Delivered"
      ? "پرداخت شد"
      : status === "Paid"
      ? "پایان سفارش"
      : null;

  // ✅ میز/بیرون‌بر
  const tableLabel =
    dto.tableNumber === null ? "بیرون‌بر" : `میز ${dto.tableNumber}`;

  const customerLabel =
    dto.tableNumber === null ? "حضوری" : `میز شماره ${dto.tableNumber}`;

  // ✅ زمان
  const created = dto.createdAt ? new Date(dto.createdAt) : null;
  const timeLabel = created
    ? `${created.toLocaleDateString("fa-IR", {
        month: "short",
        day: "numeric",
      })} ${created.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "—";

  const items = details?.items || [];
  const totalPrice = dto.totalPrice ?? 0;

  // ✅ منطق مرحله بعد (فعلاً فقط فرانت برای تست)
  function getNextStatus(current) {
    if (current === "Pending") return "Confirmed";
    if (current === "Confirmed") return "Delivered";
    if (current === "Delivered") return "Paid";
    if (current === "Paid") return "Completed";
    return current;
  }

  // advance order status
  const handleAdvanceClick = async () => {
    if (loading || error || !details) return;

    try {
      setLoading(true);

      const res = await adminOrderAxios.put(`/${dto.id}/advance`);

      const newStatus = res.data.status;

      // لیست والد آپدیت بشه
      onApprove?.(dto.id, newStatus);

      // مودال بسته شه
      onClose?.();
    } catch (e) {
      setError("خطا در تغییر وضعیت سفارش");
    } finally {
      setLoading(false);
    }
  };

  // cancel order status
  const handleCancelClick = async () => {
    if (loading || error || !details) return;

    try {
      setLoading(true);

      const res = await adminOrderAxios.put(`/${dto.id}/cancel`);

      const newStatus = res.data.status;

      onApprove?.(dto.id, newStatus);
      onClose?.();
    } catch (e) {
      setError("خطا در لغو سفارش");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="order-modal"
      className="modal-overlay"
      style={{ display: "flex" }}
      onClick={(e) => e.target.id === "order-modal" && onClose?.()}
    >
      <div className="modal-content" style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <h3>
            سفارش #{dto.restaurantOrderNumber} — {tableLabel}
          </h3>
          <button className="btn btn-icon" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="modal-body">
          <div
            className="order-meta"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <strong>وضعیت:</strong> {statusLabel}
            </div>

            <div>
              <strong>زمان:</strong> {timeLabel}
            </div>

            <div>
              <strong>مشتری:</strong> {customerLabel}
            </div>
          </div>

          {loading && (
            <div className="empty-hint" style={{ marginBottom: 10 }}>
              در حال دریافت جزئیات...
            </div>
          )}
          {!loading && error && (
            <div className="empty-hint" style={{ marginBottom: 10 }}>
              {error}
            </div>
          )}

          <div className="order-items">
            {!loading && !error && details && items.length === 0 && (
              <div className="empty-hint">آیتمی برای نمایش وجود ندارد.</div>
            )}

            {items.map((it) => (
              <div
                key={it.id}
                className="order-item-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "64px 1fr auto",
                  gap: 12,
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <img
                  src={it.image || "https://via.placeholder.com/96"}
                  alt={it.name}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                    background: "rgba(255,255,255,.06)",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>{it.name}</div>
                  <div style={{ opacity: 0.75, fontSize: 13 }}>
                    {it.addons?.length
                      ? `مخلفات: ${it.addons.map((a) => a.name).join("، ")}`
                      : "—"}
                  </div>
                </div>
                <div style={{ textAlign: "end" }}>
                  <div>×{it.qty}</div>
                  <div style={{ opacity: 0.8 }}>
                    {Number(it.price).toLocaleString("fa-IR")} تومان
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="order-total"
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ opacity: 0.8 }}>مبلغ کل</div>
            <div style={{ fontWeight: 900 }}>
              {Number(totalPrice).toLocaleString("fa-IR")} تومان
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ display: "flex", gap: 8 }}>
          {/* ✅ دکمه اصلی مرحله‌ای */}
          {!isHistory && primaryActionLabel && (
            <button
              className="btn btn-primary"
              onClick={handleAdvanceClick}
              disabled={loading || !!error || !details}
            >
              {primaryActionLabel}
            </button>
          )}

          {/* ✅ دکمه لغو سفارش (قرمز) */}
          {!isHistory && (
            <button
              className="btn"
              onClick={handleCancelClick}
              disabled={loading || !!error || !details}
              style={{
                background: "#d32f2f",
                borderColor: "#d32f2f",
                color: "white",
              }}
            >
              لغو سفارش
            </button>
          )}

          <button className="btn btn-secondary" onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
