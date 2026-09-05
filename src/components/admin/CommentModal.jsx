// src/components/admin/CommentModal.jsx
import React, { useEffect, useState } from "react";

import { formatPersianDate } from "../../utils/formatPersianDate";
import { toPersianDigits } from "../../utils/persianNumbers";

export default function CommentModal({
  open,
  comment,
  onClose,
  onApprove,
  onReject,
  submitting = null, // null | "approve" | "reject"
}) {
  // ✅ Hooks must be called unconditionally (React rules)
  const [mode, setMode] = useState("idle"); // "idle" | "reply" | "reject"
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // reset UI whenever modal opens/closes or a different comment is selected
  useEffect(() => {
    setMode("idle");
    setReplyText("");
    setReplyError("");
    setRejectReason("");
    setRejectError("");
  }, [open, comment?.id]);

  if (!open || !comment) return null;

  const renderStars = (rating) => {
    const r = Number(rating) || 0;
    return (
      <span style={{ letterSpacing: 2, direction: "ltr", display: "inline-block" }}>
        <span style={{ color: "#ff683c" }}>{"★".repeat(r)}</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>
          {"★".repeat(5 - r)}
        </span>
      </span>
    );
  };

  const handleReplyToggle = () => {
    if (mode !== "reply") {
      setMode("reply");
      setReplyError("");
      return;
    }
    const trimmed = replyText.trim();
    if (!trimmed) {
      setReplyError("لطفا متن پاسخ را وارد کنید.");
      return;
    }
    setReplyError("");
    onApprove?.(comment.id, trimmed);
  };

  const handleApproveOnly = () => {
    onApprove?.(comment.id, null);
  };

  const handleRejectToggle = () => {
    if (mode !== "reject") {
      setMode("reject");
      setRejectError("");
      return;
    }
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError("ثبت دلیل برای رد نظر الزامی است.");
      return;
    }
    setRejectError("");
    onReject?.(comment.id, trimmed);
  };

  const handleCancel = () => {
    setMode("idle");
    setReplyText("");
    setReplyError("");
    setRejectReason("");
    setRejectError("");
  };

  const isPending = comment.status === "pending";

  return (
    <div
      id="comment-modal"
      className="modal-overlay"
      style={{ display: "flex" }}
      onClick={(e) =>
        e.target.id === "comment-modal" && !submitting && onClose?.()
      }
    >
      <div className="modal-content" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h3>
            نظر #{toPersianDigits(comment.code)} — {comment.title}
          </h3>
          <button
            className="btn btn-icon"
            onClick={onClose}
            disabled={Boolean(submitting)}
          >
            {" "}
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="modal-body">
          {/* meta */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <strong>نام غذا:</strong> {comment.title || "نامشخص"}
            </div>
            <div>
              <strong>ثبت‌کننده:</strong> {comment.userName || "کاربر مهمان"}
            </div>
            <div>
              <strong>امتیاز:</strong> {renderStars(comment.rating)}
            </div>
            <div>
              <strong>تاریخ ثبت:</strong> {formatPersianDate(comment.date)}
            </div>
          </div>

          {/* comment text */}
          <div style={{ marginBottom: 8 }}>
            <strong>متن نظر:</strong>
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
              {comment.commentText || "متنی ثبت نشده است."}
            </div>
          </div>

          {/* existing reply (history) */}
          {comment.status === "approved" && comment.reply && (
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                padding: 10,
                borderRadius: 8,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              <strong>پاسخ ادمین:</strong> {comment.reply}
            </div>
          )}

          {/* existing reject reason (history) */}
          {comment.status === "rejected" && comment.rejectReason && (
            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
              <strong>دلیل رد شدن:</strong> {comment.rejectReason}
            </div>
          )}
        </div>

        {/* footer — only for pending comments */}
        {isPending && (
          <div
            className="modal-footer"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {mode === "reply" && (
              <div style={{ width: "100%" }}>
                <textarea
                  placeholder="پاسخ خود را به این نظر بنویسید..."
                  value={replyText}
                  rows={3}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    if (replyError && e.target.value.trim()) setReplyError("");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(245,158,11,0.6)",
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    fontSize: 14,
                  }}
                />
                {replyError && (
                  <div className="ad-reject-error">{replyError}</div>
                )}
              </div>
            )}

            {mode === "reject" && (
              <div style={{ width: "100%" }}>
                <input
                  type="text"
                  placeholder="دلیل رد کردن این نظر را بنویسید..."
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError && e.target.value.trim())
                      setRejectError("");
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
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >
              {mode === "idle" && (
                <>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleReplyToggle}
                    disabled={Boolean(submitting)}
                  >
                    پاسخ و تایید
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleApproveOnly}
                    disabled={Boolean(submitting)}
                  >
                    {submitting === "approve" ? (
                      <>
                        <span className="submit-spinner" aria-hidden="true" />
                        در حال تایید...
                      </>
                    ) : (
                      "تایید بدون پاسخ"
                    )}
                  </button>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={handleRejectToggle}
                    disabled={Boolean(submitting)}
                  >
                    رد
                  </button>
                </>
              )}

              {mode === "reply" && (
                <>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleReplyToggle}
                    disabled={Boolean(submitting)}
                  >
                    {submitting === "approve" ? (
                      <>
                        <span className="submit-spinner" aria-hidden="true" />
                        در حال ثبت...
                      </>
                    ) : (
                      "ثبت پاسخ و تایید"
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleCancel}
                    disabled={Boolean(submitting)}
                  >
                    انصراف
                  </button>
                </>
              )}

              {mode === "reject" && (
                <>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={handleRejectToggle}
                    disabled={Boolean(submitting)}
                  >
                    {submitting === "reject" ? (
                      <>
                        <span className="submit-spinner" aria-hidden="true" />
                        در حال ثبت...
                      </>
                    ) : (
                      "ثبت رد"
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleCancel}
                    disabled={Boolean(submitting)}
                  >
                    انصراف
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
