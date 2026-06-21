import React, { useEffect, useState } from "react";
import adminOrderAxios from "../../api/adminOrderAxios";
import { getOrderStatusLabel } from "../../utils/orderStatus";

export default function OrderModal({ open, order, onClose, onApprove }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  if (!open || !order) return null;

  const dto = details || order;
  const status = dto.status;

  const isHistory =
    status === "Cancelled" || status === "Completed";

  const statusLabel = getOrderStatusLabel(status);

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

  const tableLabel =
    dto.tableNumber === null
      ? "بیرون‌بر"
      : `میز ${dto.tableNumber}`;

  const created = dto.createdAt
    ? new Date(dto.createdAt)
    : null;

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

  const handleAdvanceClick = async () => {
    if (loading || error || !details) return;

    try {
      setLoading(true);

      const res = await adminOrderAxios.put(`/${dto.id}/advance`);
      const newStatus = res.data.status;

      onApprove?.(dto.id, newStatus);
      onClose?.();
    } catch (e) {
      setError("خطا در تغییر وضعیت سفارش");
    } finally {
      setLoading(false);
    }
  };

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
      onClick={(e) =>
        e.target.id === "order-modal" && onClose?.()
      }
    >
      <div className="modal-content" style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <h3>
            سفارش #{dto.restaurantOrderNumber} — {tableLabel}
          </h3>

          <button className="btn btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: 12 }}>
            <strong>وضعیت:</strong> {statusLabel}
          </div>

          {loading && (
            <div className="empty-hint">
              در حال دریافت جزئیات...
            </div>
          )}

          {error && (
            <div className="empty-hint">{error}</div>
          )}

          <div className="order-items">
            {items.map((it) => (
              <div
                key={it.id}
                className="order-item-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "64px 1fr auto",
                  gap: 12,
                  padding: "8px 0",
                }}
              >
                <img
                  src={
                    it.imageUrl ||
                    "https://via.placeholder.com/96"
                  }
                  alt={it.name}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />

                <div>
                  <div>{it.name}</div>
                </div>

                <div>
                  ×{it.qty}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>مبلغ کل:</strong>{" "}
            {Number(totalPrice).toLocaleString("fa-IR")} تومان
          </div>
        </div>

        <div className="modal-footer">
          {!isHistory && primaryActionLabel && (
            <button
              className="btn btn-primary"
              onClick={handleAdvanceClick}
              disabled={loading || !!error || !details}
            >
              {primaryActionLabel}
            </button>
          )}

          {!isHistory && (
            <button
              className="btn"
              onClick={handleCancelClick}
            >
              لغو سفارش
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}