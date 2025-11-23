// src/components/admin/AdRequestModal.jsx
import React, { useState } from "react";

export default function AdRequestModal({
  open,
  request,
  onClose,
  onApprove,
  onReject,
}) {
  if (!open || !request) return null;

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const adTypeLabel =
    request.adType === "slider"
      ? "اسلایدر صفحه اصلی"
      : request.adType === "banner"
      ? "بنر تمام صفحه"
      : request.adType || "نامشخص";

  const reservedLabel = `${
    request.reservedAmount?.toLocaleString("fa-IR") || 0
  } ${request.reservedUnit || ""}`;

  const handleRejectClick = () => {
    // اولین بار: فقط فیلد رو باز کن
    if (!showRejectInput) {
      setShowRejectInput(true);
      setRejectError("");
      return;
    }

    // دفعه دوم: حتما باید توضیح داشته باشیم
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError("ثبت توضیح برای رد تبلیغ الزامی است.");
      return;
    }

    setRejectError("");
    onReject?.(request.id, trimmed);
  };

  const handleApproveOrBack = () => {
    // اگر در حالت رد هستیم، این دکمه نقش "برگشت" دارد
    if (showRejectInput) {
      setShowRejectInput(false);
      setRejectReason("");
      setRejectError("");
      return;
    }

    // حالت عادی: تایید درخواست
    onApprove?.(request.id);
  };

  return (
    <div
      id="ad-request-modal"
      className="modal-overlay"
      style={{ display: "flex" }}
      onClick={(e) => e.target.id === "ad-request-modal" && onClose?.()}
    >
      <div className="modal-content" style={{ maxWidth: 820 }}>
        <div className="modal-header">
          <h3>
            درخواست تبلیغ #{request.code} — {request.restaurantName}
          </h3>
          <button className="btn btn-icon" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="modal-body">
          {/* meta */}
          <div
            className="ad-meta"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <strong>نام رستوران متقاضی:</strong>{" "}
              {request.restaurantName || "نامشخص"}
            </div>
            <div>
              <strong>نوع تبلیغات:</strong> {adTypeLabel}
            </div>
            <div>
              <strong>مقدار رزرو شده:</strong> {reservedLabel}
            </div>
            <div>
              <strong>هزینه پرداخت شده:</strong>{" "}
              {request.paidAmount?.toLocaleString("fa-IR")} تومان
            </div>
            <div>
              <strong>تاریخ تقاضا:</strong> {request.requestedAt}
            </div>
            <div>
              <strong>لینک تبلیغ:</strong>{" "}
              {request.targetUrl ? (
                <a
                  href={request.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#60a5fa" }}
                >
                  {request.targetUrl}
                </a>
              ) : (
                "—"
              )}
            </div>
          </div>

          {/* ad image */}
          <div
            className="ad-image-wrapper"
            style={{
              marginBottom: 16,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {request.imageUrl ? (
              <img
                src={request.imageUrl}
                alt="تبلیغ"
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: 260,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  opacity: 0.7,
                  fontSize: 14,
                }}
              >
                عکس تبلیغ ثبت نشده است.
              </div>
            )}
          </div>

          {/* ad text */}
          <div className="ad-text-block" style={{ marginBottom: 8 }}>
            <strong>متن تبلیغ:</strong>
            <div
              style={{
                marginTop: 6,
                padding: 10,
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              {request.adText || "متنی برای این تبلیغ ثبت نشده است."}
            </div>
          </div>

          {/* existing reject reason (for history) */}
          {request.decision === "rejected" && request.decisionReason && (
            <div
              className="ad-reject-reason-view"
              style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}
            >
              <strong>دلیل رد شدن:</strong> {request.decisionReason}
            </div>
          )}
        </div>

        {/* footer */}
        <div
          className="modal-footer"
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {showRejectInput && (
            <div className="reject-reason-row" style={{ width: "100%" }}>
              <input
                type="text"
                placeholder="دلیل رد کردن این تبلیغ را بنویسید..."
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError && e.target.value.trim()) {
                    setRejectError("");
                  }
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(248,113,113,0.6)",
                  background: "rgba(0,0,0,0.45)",
                  color: "#fff",
                  fontSize: 14,
                }}
              />
              {rejectError && (
                <div className="ad-reject-error">{rejectError}</div>
              )}
            </div>
          )}

          <div
            className="modal-footer-buttons"
            style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}
          >
            {onApprove && (
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleApproveOrBack}
              >
                {showRejectInput ? "برگشت" : "تایید"}
              </button>
            )}

            {onReject && (
              <button
                className="btn btn-danger"
                type="button"
                onClick={handleRejectClick}
              >
                {showRejectInput ? "ثبت رد" : "رد"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
