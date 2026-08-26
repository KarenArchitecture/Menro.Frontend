// src/components/admin/OrderModal.jsx
import React, { useEffect, useState } from "react";
import adminOrderAxios from "../../api/adminOrderAxios";
import { useGlobalUI } from "../common/GlobalUI";
import { toPersianDigits } from "../../utils/persianNumbers";

function getSequence(paymentMethod) {
  return paymentMethod === "PayAtCounterBeforeServing"
    ? ["Pending", "Confirmed", "Paid", "Delivered", "Completed"]
    : ["Pending", "Confirmed", "Delivered", "Paid", "Completed"];
}

function getStatusLabel(status, paymentMethod) {
  const isPayAtCounter = paymentMethod === "PayAtCounterBeforeServing";
  switch (status) {
    case "Pending":
      return "در انتظار تأیید";
    case "Confirmed":
      return isPayAtCounter ? "در انتظار پرداخت" : "در انتظار تحویل";
    case "Delivered":
      return isPayAtCounter ? "تحویل شده" : "در انتظار پرداخت";
    case "Paid":
      return isPayAtCounter ? "در انتظار تحویل" : "پرداخت شده";
    case "Completed":
      return "تکمیل شده";
    case "Cancelled":
      return "لغو شده";
    default:
      return "—";
  }
}

function getPrimaryActionLabel(status, paymentMethod) {
  const seq = getSequence(paymentMethod);
  const idx = seq.indexOf(status);
  if (idx === -1 || idx >= seq.length - 1) return null;

  switch (seq[idx + 1]) {
    case "Confirmed":
      return "تأیید";
    case "Paid":
      return "پرداخت شد";
    case "Delivered":
      return "تحویل شد";
    case "Completed":
      return "پایان سفارش";
    default:
      return null;
  }
}

export default function OrderModal({ open, order, onClose, onApprove }) {
  const { notify, confirmModal } = useGlobalUI();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showInvoiceView, setShowInvoiceView] = useState(false);

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
        if (!cancelled) {
          console.error("خطا در دریافت جزئیات سفارش:", e);
          setError("خطا در دریافت جزئیات سفارش");
          notify({ type: "error", message: "خطا در دریافت جزئیات سفارش" });
        }
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
  const paymentMethod = dto.paymentMethod;

  const isHistory = status === "Cancelled" || status === "Completed";
  const statusLabel = getStatusLabel(status, paymentMethod);
  const primaryActionLabel = !isHistory
    ? getPrimaryActionLabel(status, paymentMethod)
    : null;

  const tableLabel = dto.tableLabel == null ? "بیرون‌بر" : dto.tableLabel;
  const customerLabel = dto.tableLabel == null ? "حضوری" : dto.tableLabel;

  const created = dto.createdAt ? new Date(dto.createdAt) : null;
  const timeLabel = created
    ? `${created.toLocaleDateString("fa-IR", { month: "short", day: "numeric" })} ${created.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`
    : "—";

  const items = details?.items || [];
  const totalPrice = dto.totalPrice ?? 0;

  const handleAdvanceClick = async () => {
    if (loading || submitting || error || !details) return;

    try {
      setSubmitting(true);
      const res = await adminOrderAxios.put(`/${dto.id}/advance`);
      const newStatus = res.data.status;

      notify({ type: "success", message: "وضعیت سفارش با موفقیت تغییر کرد" });
      onApprove?.(dto.id, newStatus);
      onClose?.();
    } catch (e) {
      setError("خطا در تغییر وضعیت سفارش");
      notify({ type: "error", message: "خطا در تغییر وضعیت سفارش" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = async () => {
    if (loading || submitting || error || !details) return;

    const confirmed = await confirmModal({
      title: "لغو سفارش",
      message: `سفارش فاکتور ${toPersianDigits(dto.invoiceNumber || "—")} لغو خواهد شد. این عملیات قابل بازگشت نیست. ادامه می‌دهید؟`,
      confirmText: "بله، لغو شود",
      cancelText: "انصراف",
      danger: true,
    });
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const res = await adminOrderAxios.put(`/${dto.id}/cancel`);
      const newStatus = res.data.status;

      notify({ type: "success", message: "سفارش با موفقیت لغو شد" });
      onApprove?.(dto.id, newStatus);
      onClose?.();
    } catch (e) {
      setError("خطا در لغو سفارش");
      notify({ type: "error", message: "خطا در لغو سفارش" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="order-modal"
      className="modal-overlay"
      style={{ display: "flex" }}
      onClick={(e) =>
        e.target.id === "order-modal" && !submitting && onClose?.()
      }
    >
      <div className="modal-content" style={{ maxWidth: 800 }}>
        <div className="modal-header order-modal-header">
          <div className="order-modal-header__title">
            <h3>{tableLabel}</h3>
            <span className="order-modal-header__invoice">
              فاکتور {toPersianDigits(dto.invoiceNumber || "—")}
            </span>
          </div>

          <div className="order-modal-header__actions">
            <div className="order-modal-view-toggle">
              <button
                type="button"
                className={`order-modal-view-toggle__btn ${!showInvoiceView ? "is-active" : ""}`}
                onClick={() => setShowInvoiceView(false)}
              >
                جزئیات
              </button>
              <button
                type="button"
                className={`order-modal-view-toggle__btn ${showInvoiceView ? "is-active" : ""}`}
                onClick={() => setShowInvoiceView(true)}
              >
                نمای فاکتور
              </button>
            </div>

            <button
              className="btn btn-icon"
              onClick={onClose}
              aria-label="بستن"
              disabled={submitting}
            >
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {showInvoiceView ? (
            <div className="order-items">
              {items.map((it) => (
                <div key={it.id} style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 700,
                    }}
                  >
                    <span>{it.name}</span>
                    <span>
                      ×{it.qty} —{" "}
                      {Number(it.price * it.qty).toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  {it.addons?.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        opacity: 0.75,
                        fontSize: 13,
                        paddingRight: 16,
                      }}
                    >
                      <span>{a.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <>
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
                      src={it.imageUrl || "https://via.placeholder.com/96"}
                      alt={it.name}
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/96";
                      }}
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
                          : "بدون مخلفات"}
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
            </>
          )}
        </div>

        <div className="modal-footer" style={{ display: "flex", gap: 8 }}>
          {!isHistory && primaryActionLabel && (
            <button
              className="btn btn-primary"
              onClick={handleAdvanceClick}
              disabled={loading || submitting || !!error || !details}
            >
              {submitting ? (
                <>
                  <span className="submit-spinner" aria-hidden="true" />
                  در حال ثبت...
                </>
              ) : (
                primaryActionLabel
              )}
            </button>
          )}

          {!isHistory && (
            <button
              className="btn"
              onClick={handleCancelClick}
              disabled={loading || submitting || !!error || !details}
              style={{
                background: "#d32f2f",
                borderColor: "#d32f2f",
                color: "white",
              }}
            >
              {submitting ? (
                <>
                  <span className="submit-spinner" aria-hidden="true" />
                  در حال لغو...
                </>
              ) : (
                "لغو سفارش"
              )}
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
