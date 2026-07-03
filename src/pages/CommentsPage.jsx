import React from "react";
import CommentCard from "../components/comments/CommentCard";
import "../assets/css/styles-comments.css";
const mockComments = [
  {
    id: 1,
    title: "قهوه با نام طولانی دو خطی...",
    rating: 4,
    likes: 8,
    image: "/images/mocha.jpg",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ... رم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ...",
    reply: {
      likes: 5,
      date: "۹ شهریور ۱۴۰۳",
      text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ.",
    },
  },
  {
    id: 2,
    title: "قهوه با نام طولانی دو خطی...",
    rating: 4,
    likes: 8,
    image: "/images/mocha.jpg",
    text: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ...",
    reply: null,
  },
];

function CommentsPage() {
  return (
    <div className="comments-page">
      <div className="comments-header">
        <button className="comments-header__back">
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
      <div className="comments-list">
        {mockComments.map((c) => (
          <CommentCard key={c.id} comment={c} />
        ))}
      </div>
    </div>
  );
}

export default CommentsPage;
