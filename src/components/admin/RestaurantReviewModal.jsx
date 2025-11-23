// src/components/admin/RestaurantReviewModal.jsx
import React, { useState } from "react";

export default function RestaurantReviewModal({
  open,
  restaurant,
  onClose,
  onApprove,
  onReject,
}) {
  if (!open || !restaurant) return null;

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const handleRejectClick = () => {
    // first click → open field
    if (!showRejectInput) {
      setShowRejectInput(true);
      setRejectError("");
      return;
    }

    // second click → need mandatory comment
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError("ثبت توضیح برای رد رستوران الزامی است.");
      return;
    }

    setRejectError("");
    onReject?.(restaurant.id, trimmed);
  };

  const handleApproveOrBack = () => {
    // if we're in reject mode, this button acts as "برگشت"
    if (showRejectInput) {
      setShowRejectInput(false);
      setRejectReason("");
      setRejectError("");
      return;
    }

    onApprove?.(restaurant.id);
  };

  return (
    <div
      id="restaurant-review-modal"
      className="modal-overlay"
      style={{ display: "flex" }}
      onClick={(e) => e.target.id === "restaurant-review-modal" && onClose?.()}
    >
      <div className="modal-content" style={{ maxWidth: 820 }}>
        <div className="modal-header">
          <h3>درخواست ثبت رستوران — {restaurant.name || "نامشخص"}</h3>
          <button className="btn btn-icon" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="modal-body">
          {/* meta fields */}
          <div
            className="restaurant-meta"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <strong>نام رستوران:</strong> {restaurant.name || "نامشخص"}
            </div>
            <div>
              <strong>نوع رستوران:</strong> {restaurant.type || "ثبت نشده"}
            </div>
            <div>
              <strong>آدرس:</strong> {restaurant.address || "ثبت نشده"}
            </div>
            <div>
              <strong>ساعات فعالیت:</strong>{" "}
              {restaurant.workingHours || "ثبت نشده"}
            </div>
            <div>
              <strong>کد ملی صاحب رستوران:</strong>{" "}
              {restaurant.ownerNationalId || "ثبت نشده"}
            </div>
            <div>
              <strong>شماره حساب صاحب رستوران:</strong>{" "}
              {restaurant.ownerBankAccount || "ثبت نشده"}
            </div>
            <div>
              <strong>تاریخ تقاضا:</strong>{" "}
              {restaurant.requestedAt || "ثبت نشده"}
            </div>
          </div>

          {/* description */}
          <div className="restaurant-description" style={{ marginBottom: 8 }}>
            <strong>توضیحات رستوران:</strong>
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
              {restaurant.description ||
                "توضیحات برای این رستوران ثبت نشده است."}
            </div>
          </div>

          {/* if already rejected, show stored reason (history view) */}
          {restaurant.decision === "rejected" && restaurant.decisionReason && (
            <div
              className="restaurant-reject-reason-view"
              style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}
            >
              <strong>دلیل رد شدن:</strong> {restaurant.decisionReason}
            </div>
          )}
        </div>

        {/* footer: reject field + buttons */}
        <div
          className="modal-footer"
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {showRejectInput && (
            <div className="reject-reason-row" style={{ width: "100%" }}>
              <input
                id="restaurant-reject-reason"
                type="text"
                placeholder="دلیل رد کردن این رستوران را بنویسید..."
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
                <div className="restaurant-reject-error">{rejectError}</div>
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
