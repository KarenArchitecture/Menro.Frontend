import React, { useState } from "react";
import StarsRating from "../common/StarsRating";

function CommentCard({ comment }) {
  const [liked, setLiked] = useState(false);
  const [replyLiked, setReplyLiked] = useState(false);

  const toggleLike = () => {
    setLiked((prev) => !prev);
  };
  return (
    <div className="comment-block">
      {/* MAIN CARD */}
      <div className="comment-card">
        {/* TOP */}
        <div className="comment-top">
          <img src={comment.image} alt="" className="comment-img" />

          <div className="comment-meta">
            <h3 className="comment-title">{comment.title}</h3>

            <div className="comment-rating">
              ثبت نظر و امتیاز ({comment.rating} نظر)
            </div>
          </div>

          {/* ✅ MOVE HERE */}
          <div
            className={`comment-likes ${liked ? "liked" : ""}`}
            onClick={toggleLike}
          >
            <img
              src={
                liked
                  ? "/images/comments/heart-red-icon.svg"
                  : "/images/comments/heart-empty-icon.svg"
              }
              alt="like"
              className={`comment-heart ${liked ? "pop" : ""}`}
            />
            <span className="comment-like-count">{comment.likes}</span>
          </div>
        </div>
        {/* TEXT */}
        <p className="comment-text">{comment.text}</p>

        {/* STARS */}
        <StarsRating initial={comment.rating} />
      </div>

      {/* ✅ REPLY OUTSIDE */}
      {comment.reply && (
        <div className="comment-reply">
          <div className="reply-top">
            <span className="reply-title">پاسخ رستوران منرو</span>
            <div
              className={`reply-likes ${replyLiked ? "liked" : ""}`}
              onClick={() => setReplyLiked((prev) => !prev)}
            >
              <img
                src={
                  replyLiked
                    ? "/images/comments/heart-red-icon.svg"
                    : "/images/comments/heart-empty-icon.svg"
                }
                alt="like"
                className={`comment-heart ${replyLiked ? "pop" : ""}`}
              />
              <span>{comment.reply.likes}</span>
            </div>
          </div>

          <div className="reply-date">{comment.reply.date}</div>

          <p className="reply-text">{comment.reply.text}</p>
        </div>
      )}
    </div>
  );
}

export default CommentCard;
