// src/components/comments/MyCommentCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import StarsRating from "../common/StarsRating";
import { formatPersianDate } from "../../utils/formatPersianDate";
import { toPersianDigits } from "../../utils/persianFormat";
import { toggleCommentLike } from "../../api/comments";

function MyCommentCard({ comment }) {
    if (!comment) return null;

    const queryClient = useQueryClient();

    const [liked, setLiked] = useState(comment.liked ?? false);
    const [likes, setLikes] = useState(comment.likes ?? 0);
    const [pop, setPop] = useState(false);

    const [replyLiked, setReplyLiked] = useState(comment.reply?.liked ?? false);
    const [replyLikes, setReplyLikes] = useState(comment.reply?.likes ?? 0);
    const [replyPop, setReplyPop] = useState(false);

    const likeMutation = useMutation({
        mutationFn: (target) => toggleCommentLike({ commentId: comment.id, target }),
        onSuccess: (result, target) => {
        // ✅ Same fix as CommentCard — trust the server's number, never guess
        if (target === "comment") {
            setLiked(result.liked);
            setLikes(result.likes);
        } else {
            setReplyLiked(result.liked);
            setReplyLikes(result.likes);
        }
        },
        onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["my-comments"] });
        },
    });

    const toggleLike = () => {
        setPop(true);
        setTimeout(() => setPop(false), 250);
        likeMutation.mutate("comment");
    };

    const toggleReplyLike = () => {
        setReplyPop(true);
        setTimeout(() => setReplyPop(false), 250);
        likeMutation.mutate("reply");
    };

    return (
        <div className="comment-block">
        <div className="comment-card">
            <div className="comment-top">
            <Link to={`/restaurant/${comment.restaurantSlug}`} className="my-comment-food-link">
                <img
                src={comment.foodImageUrl || "/images/food/food-placeholder.png"}
                alt=""
                className="comment-img"
                />
            </Link>

            <div className="comment-meta">
                <Link to={`/restaurant/${comment.restaurantSlug}`} className="my-comment-food-link">
                <h3 className="comment-title">{comment.foodTitle}</h3>
                </Link>
                <div className="comment-rating">
                ثبت نظر و امتیاز
                <span className="count-highlight">
                    ({toPersianDigits(comment.approvedCommentsCount)} نظر)
                </span>
                </div>
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
                <Link to={`/restaurant/${comment.restaurantSlug}`} className="reply-title">
                پاسخ {comment.restaurantName}
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

export default MyCommentCard;