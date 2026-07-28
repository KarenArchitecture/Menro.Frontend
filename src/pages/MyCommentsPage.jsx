// src/pages/MyCommentsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MyCommentCard from "../components/comments/MyCommentCard";
import { getMyComments } from "../api/comments";
import "../assets/css/styles-comments.css";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function MyCommentsPage() {
  useDocumentTitle("نظرات من");
  const navigate = useNavigate();

  const {
    data: comments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-comments"],
    queryFn: getMyComments,
  });

  return (
    <div className="comments-page">
      <div className="comments-header">
        <button className="comments-header__back" onClick={() => navigate(-1)}>
          <img src="/images/back-curve-icon.svg" alt="back" />
        </button>

        <div className="comments-header__title">
          <img src="/images/comments/comment-icon.svg" alt="comments" />
          <span className="comments-header__text">کامنت‌ها</span>
        </div>
      </div>

      <div className="comments-list">
        {isLoading && <p>در حال بارگذاری...</p>}
        {isError && <p>خطا در دریافت نظرات. لطفاً دوباره تلاش کنید.</p>}

        {!isLoading && !isError && comments.length === 0 && (
          <div className="comment-hint-box">
            <img
              src="/images/comments/comment-icon.svg"
              alt=""
              className="comment-hint-box__icon"
            />
            <p>هنوز نظری ثبت نکرده‌اید.</p>
          </div>
        )}

        {!isLoading &&
          comments
            .filter(Boolean)
            .map((c) => <MyCommentCard key={c.id} comment={c} />)}
      </div>
    </div>
  );
}
