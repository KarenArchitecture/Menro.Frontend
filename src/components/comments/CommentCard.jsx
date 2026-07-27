import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import StarsRating from "../common/StarsRating";
import { toggleCommentLike } from "../../api/comments";
import { formatPersianDate } from "../../utils/formatPersianDate";
import { toPersianDigits } from "../../utils/persianFormat";
import { DEFAULT_AVATAR } from "../../utils/defaultAvatar";

function CommentCard({ comment, foodId, restaurantName, restaurantSlug, requireLogin }) {
  const queryClient = useQueryClient();

  const [liked, setLiked] = useState(comment.liked);
  const [likes, setLikes] = useState(comment.likes);
  const [pop, setPop] = useState(false);

  const [replyLiked, setReplyLiked] = useState(comment.reply?.liked ?? false);
  const [replyLikes, setReplyLikes] = useState(comment.reply?.likes ?? 0);
  const [replyPop, setReplyPop] = useState(false);

  const likeMutation = useMutation({
    mutationFn: (target) => toggleCommentLike({ commentId: comment.id, target }),
    onSuccess: (result, target) => {
      // ✅ Always trust the server's number — no manual +1/-1 math, no drift possible
      if (target === "comment") {
        setLiked(result.liked);
        setLikes(result.likes);
      } else {
        setReplyLiked(result.liked);
        setReplyLikes(result.likes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["food-comments", String(foodId)] });
    },
  });

  const toggleLike = () => {
    requireLogin({
      onAuthenticated: () => {
        setPop(true);
        setTimeout(() => setPop(false), 250);
        likeMutation.mutate("comment");
      },
    });
  };

  const toggleReplyLike = () => {
    requireLogin({
      onAuthenticated: () => {
        setReplyPop(true);
        setTimeout(() => setReplyPop(false), 250);
        likeMutation.mutate("reply");
      },
    });
  };

  return (
    <div className="comment-block">
      <div className="comment-card">
        <div className="comment-top">
          <img
            src={comment.userAvatarUrl || DEFAULT_AVATAR}
            alt=""
            className="comment-avatar"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
          />

          <div className="comment-meta">
            <h3 className="comment-title">{comment.userName}</h3>
            <div className="comment-date">{formatPersianDate(comment.createdAt)}</div>
          </div>

          <div className={`comment-likes ${liked ? "liked" : ""}`} onClick={toggleLike}>
            <img
              src={
                liked
                  ? "/images/comments/heart-red-icon.svg"
                  : "/images/comments/heart-empty-icon.svg"
              }
              alt="like"
              className={`comment-heart ${pop ? "pop" : ""}`}
            />
            <span className="comment-like-count">{toPersianDigits(likes)}</span>
          </div>
        </div>

        <p className="comment-text">{comment.text}</p>

        <StarsRating initial={comment.rating} size="lg" />
      </div>

      {comment.reply && (
        <div className="comment-reply">
          <div className="reply-top">
            <Link to={`/restaurant/${restaurantSlug}`} className="reply-title">
              پاسخ {restaurantName}
            </Link>
            <div className={`reply-likes ${replyLiked ? "liked" : ""}`} onClick={toggleReplyLike}>
              <img
                src={
                  replyLiked
                    ? "/images/comments/heart-red-icon.svg"
                    : "/images/comments/heart-empty-icon.svg"
                }
                alt="like"
                className={`comment-heart ${replyPop ? "pop" : ""}`}
              />
              <span>{toPersianDigits(replyLikes)}</span>
            </div>
          </div>

          <div className="reply-date">{formatPersianDate(comment.reply.date)}</div>

          <p className="reply-text">{comment.reply.text}</p>
        </div>
      )}
    </div>
  );
}

export default CommentCard;