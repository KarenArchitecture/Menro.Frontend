// src/components/admin/orders/OrderModal.jsx
import React from "react";

export default function OrderModal({ open, order, onClose, onApprove }) {
  if (!open || !order) return null;

  // ✅ New stages
  const status = order.status;
  const isHistory = status === "history";

  const statusLabel =
    status === "pending_confirm"
      ? "در انتظار تأیید"
      : status === "pending_delivery"
      ? "در انتظار تحویل"
      : status === "pending_payment"
      ? "در انتظار پرداخت"
      : "در تاریخچه";

  const primaryActionLabel =
    status === "pending_confirm"
      ? "تأیید"
      : status === "pending_delivery"
      ? "تأیید تحویل"
      : status === "pending_payment"
      ? "تأیید پرداخت"
      : null;

  // ❌ Old (kept): only pending/history
  /*
  const isPending = order.status === "pending";
  */

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
            سفارش #{order.code} — میز {order.table ?? "—"}
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
              {/* ❌ Old (kept) */}
              {/*
              <strong>وضعیت:</strong>{" "}
              {isPending ? "در انتظار تأیید" : "در تاریخچه"}
              */}
            </div>

            <div>
              <strong>زمان:</strong> {order.time}
            </div>

            <div>
              <strong>مشتری:</strong> {order.customer || "حضوری"}
            </div>
          </div>

          <div className="order-items">
            {order.items.map((it) => (
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
                  src={it.image}
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
                    {it.price.toLocaleString()} تومان
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
              {order.total.toLocaleString()} تومان
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ display: "flex", gap: 8 }}>
          {/* ✅ show action button for any active stage */}
          {!isHistory && onApprove && primaryActionLabel && (
            <button
              className="btn btn-primary"
              onClick={() => onApprove?.(order.id)}
            >
              {primaryActionLabel}
            </button>
          )}

          {/* ❌ Old (kept): only pending showed approve */}
          {/*
          {isPending && (
            <button
              className="btn btn-primary"
              onClick={() => onApprove?.(order.id)}
            >
              تأیید
            </button>
          )}
          */}

          <button className="btn btn-secondary" onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
