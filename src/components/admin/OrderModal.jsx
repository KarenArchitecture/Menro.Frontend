// src/components/admin/orders/OrderModal.jsx
import React, { useEffect, useState } from "react";
import adminOrderAxios from "../../api/adminOrderAxios";

export default function OrderModal({ open, order, onClose, onApprove }) {
  const [details, setDetails] = useState(null); // AdminOrderDetailsDto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // همیشه hookها بالا اجرا میشن (هیچ hook بعد از return نداریم)
  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      if (!open || !order?.id) return;

      try {
        setLoading(true);
        setError("");
        setDetails(null);

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

  // بعد از اجرای hookها می‌تونیم return کنیم
  if (!open || !order) return null;

  // اگر details اومد از اون استفاده می‌کنیم وگرنه از order لیست
  const dto = details || order;

  // status: enum بک‌اند
  const status = dto.status;

  const isHistory =
    status === "Cancelled" || status === "Delivered" || status === "Completed";

  const statusLabel =
    status === "Pending"
      ? "در انتظار تأیید"
      : status === "Confirmed"
      ? "در انتظار تحویل"
      : status === "Paid"
      ? "در انتظار پرداخت"
      : "در تاریخچه";

  const primaryActionLabel =
    status === "Pending"
      ? "تأیید"
      : status === "Confirmed"
      ? "تأیید تحویل"
      : status === "Paid"
      ? "تأیید پرداخت"
      : null;

  // میز/بیرون‌بر
  const tableLabel =
    dto.tableNumber === null ? "بیرون‌بر" : `میز ${dto.tableNumber}`;

  const customerLabel =
    dto.tableNumber === null ? "بیرون‌بر" : `میز شماره ${dto.tableNumber}`;

  // زمان
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

  // آیتم‌ها فقط تو details هست؛ اگر هنوز نیومده خالی
  const items = details?.items || [];
  const totalPrice = dto.totalPrice ?? 0;

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
          {!isHistory && onApprove && primaryActionLabel && (
            <button
              className="btn btn-primary"
              onClick={() => onApprove?.(dto.id)}
              disabled={loading || !!error || !details} // تا جزئیات نیومده اکشن نزن
            >
              {primaryActionLabel}
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
