// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import StarsRating from "../components/common/StarsRating";
// import { toggleCommentLike } from "../api/comments";

// function MyCommentCard({ comment }) {
//     const queryClient = useQueryClient();

//     const [liked, setLiked] = useState(comment.liked);
//     const [likes, setLikes] = useState(comment.likes);
//     const [pop, setPop] = useState(false);

//     const [replyLiked, setReplyLiked] = useState(comment.reply?.liked ?? false);
//     const [replyLikes, setReplyLikes] = useState(comment.reply?.likes ?? 0);
//     const [replyPop, setReplyPop] = useState(false);

//     const likeMutation = useMutation({
//         mutationFn: (target) => toggleCommentLike({ commentId: comment.id, target }),
//         onError: (_err, target) => {
//         if (target === "comment") {
//             setLiked((prev) => !prev);
//             setLikes((prev) => (liked ? prev + 1 : prev - 1));
//         } else {
//             setReplyLiked((prev) => !prev);
//             setReplyLikes((prev) => (replyLiked ? prev + 1 : prev - 1));
//         }
//         },
//         onSettled: () => {
//         queryClient.invalidateQueries({ queryKey: ["my-comments"] });
//         },
//     });

//     const toggleLike = () => {
//         setLiked((prev) => !prev);
//         setLikes((prev) => (liked ? prev - 1 : prev + 1));
//         setPop(true);
//         setTimeout(() => setPop(false), 250);
//         likeMutation.mutate("comment");
//     };

//     const toggleReplyLike = () => {
//         setReplyLiked((prev) => !prev);
//         setReplyLikes((prev) => (replyLiked ? prev - 1 : prev + 1));
//         setReplyPop(true);
//         setTimeout(() => setReplyPop(false), 250);
//         likeMutation.mutate("reply");
//     };

//     return (
//         <div className="comment-block">
//         <div className="comment-card">
//             <div className="comment-top">
//             <Link to={`/restaurant/${comment.restaurantSlug}`} className="my-comment-food-link">
//                 <img
//                 src={comment.foodImageUrl || "/images/food/food-placeholder.png"}
//                 alt=""
//                 className="comment-img"
//                 />
//             </Link>

//             <div className="comment-meta">
//                 <Link to={`/restaurant/${comment.restaurantSlug}`} className="my-comment-food-link">
//                 <h3 className="comment-title">{comment.foodTitle}</h3>
//                 </Link>
//                 <div className="comment-rating">
//                 ثبت نظر و امتیاز (
//                 <span className="count-highlight">{comment.approvedCommentsCount} نظر</span>)
//                 </div>
//             </div>

//             <div className={`comment-likes ${liked ? "liked" : ""}`} onClick={toggleLike}>
//                 <img
//                 src={
//                     liked
//                     ? "/images/comments/heart-red-icon.svg"
//                     : "/images/comments/heart-empty-icon.svg"
//                 }
//                 alt="like"
//                 className={`comment-heart ${pop ? "pop" : ""}`}
//                 />
//                 <span className="comment-like-count">{likes}</span>
//             </div>
//             </div>

//             <p className="comment-text">{comment.text}</p>

//             <StarsRating initial={comment.rating} size="lg" />
//         </div>

//         {comment.reply && (
//             <div className="comment-reply">
//             <div className="reply-top">
//                 <Link to={`/restaurant/${comment.restaurantSlug}`} className="reply-title">
//                 پاسخ {comment.restaurantName}
//                 </Link>
//                 <div className={`reply-likes ${replyLiked ? "liked" : ""}`} onClick={toggleReplyLike}>
//                 <img
//                     src={
//                     replyLiked
//                         ? "/images/comments/heart-red-icon.svg"
//                         : "/images/comments/heart-empty-icon.svg"
//                     }
//                     alt="like"
//                     className={`comment-heart ${replyPop ? "pop" : ""}`}
//                 />
//                 <span>{replyLikes}</span>
//                 </div>
//             </div>

//             <div className="reply-date">
//                 {new Date(comment.reply.date).toLocaleDateString("fa-IR")}
//             </div>

//             <p className="reply-text">{comment.reply.text}</p>
//             </div>
//         )}
//         </div>
//     );
// }

// export default MyCommentCard;


// src/pages/MyCommentsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MyCommentCard from "../components/comments/MyCommentCard";
import { getMyComments } from "../api/comments";
import "../assets/css/styles-comments.css";

export default function MyCommentsPage() {
    const navigate = useNavigate();

    const { data: comments = [], isLoading, isError } = useQuery({
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