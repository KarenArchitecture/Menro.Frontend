import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CommentModal from "./CommentModal";
import {
  getOwnerComments,
  approveComment,
  rejectComment,
} from "../../api/ownerComments";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import { formatPersianDate } from "../../utils/formatPersianDate";
import { toPersianDigits } from "../../utils/persianNumbers";

const TABS = [
  { key: "pending", label: "در انتظار پاسخ" },
  { key: "approved", label: "تایید شده" },
  { key: "rejected", label: "رد شده" },
];

export default function CommentsSection() {
  useDocumentTitle("مدیریت نظرات");
  const { notify, confirmModal } = useGlobalUI();
  const [activeTab, setActiveTab] = useState("pending");
  const [submittingAction, setSubmittingAction] = useState(null); // null | "approve" | "reject"
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["owner-comments", activeTab],
    queryFn: () => getOwnerComments(activeTab),
  });

  const { data: pendingList = [] } = useQuery({
    queryKey: ["owner-comments", "pending"],
    queryFn: () => getOwnerComments("pending"),
  });
  const { data: approvedList = [] } = useQuery({
    queryKey: ["owner-comments", "approved"],
    queryFn: () => getOwnerComments("approved"),
  });
  const { data: rejectedList = [] } = useQuery({
    queryKey: ["owner-comments", "rejected"],
    queryFn: () => getOwnerComments("rejected"),
  });

  const counts = {
    pending: pendingList.length,
    approved: approvedList.length,
    rejected: rejectedList.length,
  };

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: ["owner-comments"] });

  const handleApprove = async (id, replyText) => {
    setSubmittingAction("approve");
    try {
      await approveComment(id, replyText);
      invalidateAll();
      setSelected(null);
      notify({ type: "success", message: "نظر با موفقیت تایید شد" });
    } catch (err) {
      console.error("خطا در تایید نظر:", err);
      notify({ type: "error", message: "تایید نظر با خطا مواجه شد" });
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleReject = async (id, reason) => {
    const ok = await confirmModal({
      title: "رد نظر",
      message: "این نظر رد شود؟ این تصمیم برای کاربر قابل مشاهده خواهد بود.",
      danger: true,
    });
    if (!ok) return;

    setSubmittingAction("reject");
    try {
      await rejectComment(id, reason);
      invalidateAll();
      setSelected(null);
      notify({ type: "success", message: "نظر رد شد" });
    } catch (err) {
      console.error("خطا در رد نظر:", err);
      notify({ type: "error", message: "رد نظر با خطا مواجه شد" });
    } finally {
      setSubmittingAction(null);
    }
  };

  const statusPillClass = (status) =>
    status === "pending"
      ? "status-pending"
      : status === "approved"
        ? "status-approved"
        : "status-rejected";

  const statusPillText = (status) =>
    status === "pending"
      ? "در انتظار پاسخ"
      : status === "approved"
        ? "تایید شده"
        : "رد شده";

  const renderStars = (rating) => {
    const r = Number(rating) || 0;
    return "★".repeat(r) + "☆".repeat(5 - r);
  };

  return (
    <div className="panel orders-panel">
      <div className="view-header orders-header">
        <h3>مدیریت نظرات</h3>
        <div className="orders-controls">
          <div className="orders-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`btn ${activeTab === t.key ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label} ({toPersianDigits(counts[t.key])})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="orders-list orders-list--vertical">
        {isLoading && <div className="empty-hint">در حال بارگذاری...</div>}
        {!isLoading && comments.length === 0 && (
          <div className="empty-hint">نظری در این دسته وجود ندارد.</div>
        )}

        {comments.map((c) => (
          <button
            key={c.id}
            className={`order-bar ${c.status === "pending" ? "status-pending" : "status-archived"}`}
            onClick={() => setSelected(c)}
          >
            <div className="order-bar__info">
              <div className="order-bar__title">
                <span
                  className="order-code"
                  style={{ direction: "ltr", display: "inline-block" }}
                >
                  نظر #{toPersianDigits(c.code)}
                </span>
                <span className="order-customer"> — {c.title}</span>
              </div>
              <div className="order-bar__meta">
                <span>{c.userName}</span>
                <span className="dot-sep">·</span>
                <span
                  style={{ color: "#ff683c", direction: "ltr", display: "inline-block" }}
                >
                  {renderStars(c.rating)}
                </span>
                <span className="dot-sep">·</span>
                <span>{formatPersianDate(c.date)}</span>
              </div>
              <div className="order-bar__preview">{c.commentText}</div>
            </div>
            <div className="order-bar__side">
              <span className={`status-pill ${statusPillClass(c.status)}`}>
                {statusPillText(c.status)}
              </span>
            </div>
          </button>
        ))}
      </div>

      <CommentModal
        open={Boolean(selected)}
        comment={selected}
        onClose={() => setSelected(null)}
        onApprove={selected?.status === "pending" ? handleApprove : undefined}
        onReject={selected?.status === "pending" ? handleReject : undefined}
        submitting={submittingAction}
      />
    </div>
  );
}
