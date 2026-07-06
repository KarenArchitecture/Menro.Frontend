import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import StarsRating from "../common/StarsRating";
import { toggleCommentLike } from "../../api/comments";

function CommentCard({ comment, requireLogin }) {
  const queryClient = useQueryClient();

  const [liked, setLiked] = useState(comment.liked);
  const [likes, setLikes] = useState(comment.likes);
  const [pop, setPop] = useState(false);

  const [replyLiked, setReplyLiked] = useState(comment.reply?.liked ?? false);
  const [replyLikes, setReplyLikes] = useState(comment.reply?.likes ?? 0);
  const [replyPop, setReplyPop] = useState(false);

  const likeMutation = useMutation({
    mutationFn: (target) => toggleCommentLike({ commentId: comment.id, target }),
    onError: (_err, target) => {
      if (target === "comment") {
        setLiked((prev) => !prev);
        setLikes((prev) => (liked ? prev + 1 : prev - 1));
      } else {
        setReplyLiked((prev) => !prev);
        setReplyLikes((prev) => (replyLiked ? prev + 1 : prev - 1));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["food-comments", String(comment.foodId)] });
    },
  });

  const toggleLike = () => {
    requireLogin({
      onAuthenticated: () => {
        setLiked((prev) => !prev);
        setLikes((prev) => (liked ? prev - 1 : prev + 1));
        setPop(true);
        setTimeout(() => setPop(false), 250);
        likeMutation.mutate("comment");
      },
    });
  };

  const toggleReplyLike = () => {
    requireLogin({
      onAuthenticated: () => {
        setReplyLiked((prev) => !prev);
        setReplyLikes((prev) => (replyLiked ? prev - 1 : prev + 1));
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
          <img src={comment.foodImageUrl || "/images/mocha.jpg"} alt="" className="comment-img" />

          <div className="comment-meta">
            <h3 className="comment-title">{comment.foodTitle}</h3>
            <div className="comment-rating">ثبت نظر و امتیاز ({comment.rating} نظر)</div>
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
            <span className="comment-like-count">{likes}</span>
          </div>
        </div>

        <p className="comment-text">{comment.text}</p>

        <StarsRating initial={comment.rating} readOnly />
      </div>

      {comment.reply && (
        <div className="comment-reply">
          <div className="reply-top">
            <span className="reply-title">پاسخ رستوران منرو</span>
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
              <span>{replyLikes}</span>
            </div>
          </div>

          <div className="reply-date">
            {new Date(comment.reply.date).toLocaleDateString("fa-IR")}
          </div>

          <p className="reply-text">{comment.reply.text}</p>
        </div>
      )}
    </div>
  );
}

export default CommentCard;