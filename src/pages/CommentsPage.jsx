import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CommentCard from "../components/comments/CommentCard";
import ProtectedActionModal from "../components/common/ProtectedActionModal";
import useRequireLogin from "../hooks/useRequireLogin";
import { getFoodComments, createComment } from "../api/comments";
import "../assets/css/styles-comments.css";

function CommentsPage() {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    requireLogin,
    open,
    closeModal,
    goToLogin,
    modalConfig,
  } = useRequireLogin();

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [formError, setFormError] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["food-comments", foodId],
    queryFn: () => getFoodComments(foodId),
    enabled: Boolean(foodId),
  });

  const submitComment = useMutation({
    mutationFn: () =>
      createComment({ foodId: Number(foodId), rating, text: text.trim() }),
    onSuccess: () => {
      setText("");
      setRating(5);
      setFormError("");
      queryClient.invalidateQueries({ queryKey: ["food-comments", foodId] });
    },
    onError: (err) => {
      setFormError(err.response?.data || "ثبت نظر با خطا مواجه شد.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setFormError("لطفاً متن نظر را وارد کنید.");
      return;
    }
    requireLogin({ onAuthenticated: () => submitComment.mutate() });
  };

  return (
    <div className="comments-page">
      <div className="comments-header">
        <button className="comments-header__back" onClick={() => navigate(-1)}>
          <img
            src="/images/back-curve-icon.svg"
            alt="back"
            className="comments-header__icon comments-header__icon--back"
          />
        </button>

        <div className="comments-header__title">
          <img
            src="/images/comments/comment-icon.svg"
            alt="comments"
            className="comments-header__icon comments-header__icon--comment"
          />
          <span className="comments-header__text">کامنت‌ها</span>
        </div>
      </div>

      <form className="comment-form" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="نظر خود را بنویسید..."
          rows={3}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ستاره
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary" disabled={submitComment.isPending}>
            {submitComment.isPending ? "در حال ارسال..." : "ثبت نظر"}
          </button>
        </div>
        {formError && <div className="input-alert">{formError}</div>}
      </form>

      <div className="comments-list">
        {isLoading && <p>در حال بارگذاری نظرات...</p>}
        {!isLoading && comments.length === 0 && <p>هنوز نظری ثبت نشده است.</p>}
        {comments.map((c) => (
          <CommentCard key={c.id} comment={c} requireLogin={requireLogin} />
        ))}
      </div>

      <ProtectedActionModal
        open={open}
        onClose={closeModal}
        onLogin={goToLogin}
        icon={modalConfig.icon}
        title={modalConfig.title}
        description={modalConfig.description}
      />
    </div>
  );
}

export default CommentsPage;