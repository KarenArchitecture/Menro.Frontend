// src/components/admin/CommentsSection.jsx
import React, { useMemo, useState } from "react";
import CommentModal from "./CommentModal";

/* ---------------- MOCK DATA (static for now, backend wiring later) ---------------- */
const MOCK_COMMENTS = [
  // ---- pending ----
  {
    id: 1,
    code: "CMT-1",
    status: "pending",
    title: "پیتزا مخصوص رستوران",
    userName: "علی رضایی",
    rating: 4,
    commentText: "طعم فوق‌العاده‌ای داشت ولی کمی دیر رسید.",
    date: "۱۴۰۳/۰۴/۱۲",
    reply: null,
    rejectReason: null,
  },
  {
    id: 2,
    code: "CMT-2",
    status: "pending",
    title: "برگر دوبل چیز",
    userName: "سارا احمدی",
    rating: 5,
    commentText: "بهترین برگری که تا حالا خوردم، حتما دوباره سفارش میدم.",
    date: "۱۴۰۳/۰۴/۱۳",
    reply: null,
    rejectReason: null,
  },
  {
    id: 3,
    code: "CMT-3",
    status: "pending",
    title: "سالاد سزار",
    userName: "محمد کریمی",
    rating: 3,
    commentText: "سس کمی زیاد بود ولی در کل خوب بود.",
    date: "۱۴۰۳/۰۴/۱۴",
    reply: null,
    rejectReason: null,
  },
  {
    id: 4,
    code: "CMT-4",
    status: "pending",
    title: "پاستا آلفردو",
    userName: "نگار حسینی",
    rating: 2,
    commentText: "غذا سرد رسید و خیلی خوشمزه نبود.",
    date: "۱۴۰۳/۰۴/۱۵",
    reply: null,
    rejectReason: null,
  },

  // ---- approved ----
  {
    id: 5,
    code: "CMT-5",
    status: "approved",
    title: "پیتزا مخصوص رستوران",
    userName: "رضا مرادی",
    rating: 5,
    commentText: "عالی بود، ممنون از کیفیت خوبتون.",
    date: "۱۴۰۳/۰۴/۰۸",
    reply: "خوشحالیم که رضایت داشتید 🙏",
    rejectReason: null,
  },
  {
    id: 6,
    code: "CMT-6",
    status: "approved",
    title: "نوشابه خانواده",
    userName: "الهام صادقی",
    rating: 4,
    commentText: "بسته‌بندی خوب و ارسال سریع بود.",
    date: "۱۴۰۳/۰۴/۰۹",
    reply: "ممنون از همراهی شما.",
    rejectReason: null,
  },
  {
    id: 7,
    code: "CMT-7",
    status: "approved",
    title: "برگر دوبل چیز",
    userName: "امیر توکلی",
    rating: 5,
    commentText: "فوق‌العاده بود، حتما دوباره سفارش میدم.",
    date: "۱۴۰۳/۰۴/۱۰",
    reply: null,
    rejectReason: null,
  },

  // ---- rejected ----
  {
    id: 8,
    code: "CMT-8",
    status: "rejected",
    title: "پاستا آلفردو",
    userName: "کاربر ناشناس",
    rating: 1,
    commentText: "متن حاوی الفاظ نامناسب بود.",
    date: "۱۴۰۳/۰۴/۰۵",
    reply: null,
    rejectReason: "استفاده از الفاظ نامناسب در متن نظر.",
  },
  {
    id: 9,
    code: "CMT-9",
    status: "rejected",
    title: "سالاد سزار",
    userName: "حسین قاسمی",
    rating: 1,
    commentText: "لینک تبلیغاتی نامرتبط در متن قرار داده شده بود.",
    date: "۱۴۰۳/۰۴/۰۶",
    reply: null,
    rejectReason: "محتوای تبلیغاتی نامرتبط.",
  },
  {
    id: 10,
    code: "CMT-10",
    status: "rejected",
    title: "برگر دوبل چیز",
    userName: "کاربر مهمان",
    rating: 2,
    commentText: "نظر تکراری از همان کاربر در بازه زمانی کوتاه.",
    date: "۱۴۰۳/۰۴/۰۷",
    reply: null,
    rejectReason: "نظر تکراری.",
  },
];

const TABS = [
  { key: "pending", label: "در انتظار پاسخ" },
  { key: "approved", label: "تایید شده" },
  { key: "rejected", label: "رد شده" },
];

export default function CommentsSection() {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [activeTab, setActiveTab] = useState("pending");
  const [selected, setSelected] = useState(null);

  const counts = useMemo(
    () => ({
      pending: comments.filter((c) => c.status === "pending").length,
      approved: comments.filter((c) => c.status === "approved").length,
      rejected: comments.filter((c) => c.status === "rejected").length,
    }),
    [comments],
  );

  const list = useMemo(
    () => comments.filter((c) => c.status === activeTab),
    [comments, activeTab],
  );

  /* ---- Approve (with optional reply) ---- */
  const handleApprove = (id, replyText) => {
    // TODO: wire to backend — POST /comments/{id}/approve { reply: replyText }
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "approved",
              reply: replyText || null,
              rejectReason: null,
            }
          : c,
      ),
    );
    setSelected(null);
  };

  /* ---- Reject ---- */
  const handleReject = (id, reason) => {
    // TODO: wire to backend — POST /comments/{id}/reject { reason }
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "rejected", rejectReason: reason, reply: null }
          : c,
      ),
    );
    setSelected(null);
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
                className={`btn ${
                  activeTab === t.key ? "btn-primary" : "btn-secondary"
                }`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label} ({counts[t.key]})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="orders-list orders-list--vertical">
        {list.length === 0 && (
          <div className="empty-hint">نظری در این دسته وجود ندارد.</div>
        )}

        {list.map((c) => (
          <button
            key={c.id}
            className={`order-bar ${
              c.status === "pending" ? "status-pending" : "status-archived"
            }`}
            onClick={() => setSelected(c)}
          >
            <div className="order-bar__info">
              <div className="order-bar__title">
                <span className="order-code">نظر #{c.code}</span>
                <span className="order-customer"> — {c.title}</span>
              </div>

              <div className="order-bar__meta">
                <span>{c.userName}</span>
                <span className="dot-sep">·</span>
                <span style={{ color: "#f59e0b" }}>
                  {renderStars(c.rating)}
                </span>
                <span className="dot-sep">·</span>
                <span>{c.date}</span>
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
      />
    </div>
  );
}
