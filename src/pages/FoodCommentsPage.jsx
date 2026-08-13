import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CommentCard from "../components/comments/CommentCard";
import CommentComposer from "../components/comments/CommentComposer";
import FoodCommentsHeader from "../components/comments/FoodCommentsHeader";
import ProtectedActionModal from "../components/common/ProtectedActionModal";
import useRequireLogin from "../hooks/useRequireLogin";
import { getFoodComments, createComment } from "../api/comments";
import { useGlobalUI } from "../components/common/GlobalUI";
import useDocumentTitle from "../hooks/useDocumentTitle";
import "../assets/css/styles-comments.css";

export default function FoodCommentsPage() {
  useDocumentTitle("نظرات");
  const { notify } = useGlobalUI();
  const { foodId } = useParams();
  const queryClient = useQueryClient();
  const { requireLogin, open, closeModal, goToLogin, modalProps } =
    useRequireLogin();

  const { data, isLoading } = useQuery({
    queryKey: ["food-comments", foodId],
    queryFn: () => getFoodComments(foodId),
    enabled: Boolean(foodId),
  });

  const submitComment = useMutation({
    mutationFn: ({ text, rating }) =>
      createComment({ foodId: Number(foodId), rating, text }),
    onError: (err) => {
      const message =
        err.response?.data || "ثبت نظر با خطا مواجه شد. دوباره تلاش کنید.";
      notify({ type: "error", message });
    },
  });

  const handleComposerSubmit = ({ text, rating }, resetForm) => {
    requireLogin({
      type: "comments",
      onAuthenticated: () => {
        submitComment.mutate(
          { text, rating },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ["food-comments", foodId],
              });
              notify({ type: "success", message: "نظر شما با موفقیت ثبت شد." });
              resetForm();
            },
          },
        );
      },
    });
  };

  const food = data;
  const comments = food?.comments || [];
  const userStatus = food?.userCommentStatus; // "Pending" | "Approved" | "Rejected" | undefined/null

  return (
    <div className="comments-page">
      <FoodCommentsHeader
        imageUrl={food?.foodImageUrl}
        title={food?.foodTitle}
        approvedCount={food?.approvedCommentsCount ?? 0}
      />

      {isLoading && <p>در حال بارگذاری نظرات...</p>}

      <div className="comments-list">
        {!isLoading && comments.length === 0 && (
          <div className="comment-hint-box">
            <img
              src="/images/comments/comment-icon.svg"
              alt=""
              className="comment-hint-box__icon"
            />
            <p>
              هنوز نظری برای این غذا ثبت نشده. اولین نفری باش که نظرش رو
              می‌نویسه!
            </p>
          </div>
        )}
        {comments.map((c) => (
          <CommentCard
            key={c.id}
            comment={c}
            foodId={foodId}
            restaurantName={food?.restaurantName}
            restaurantSlug={food?.restaurantSlug}
            requireLogin={requireLogin}
          />
        ))}
      </div>

      {/* هنوز کامنتی نداده -> فرم ثبت نظر رو نشون بده */}
      {foodId && !userStatus && (
        <CommentComposer
          onSubmit={handleComposerSubmit}
          isSubmitting={submitComment.isPending}
        />
      )}

      {/* در انتظار تایید */}
      {foodId && userStatus === "Pending" && (
        <div className="comment-hint-box">
          <img
            src="/images/comments/star-active-icon.svg"
            alt=""
            className="comment-hint-box__icon"
          />
          <p>نظر شما ثبت شد و در انتظار تایید رستوران است.</p>
        </div>
      )}

      {/* تایید شده */}
      {foodId && userStatus === "Approved" && (
        <div className="comment-hint-box">
          <img
            src="/images/comments/star-active-icon.svg"
            alt=""
            className="comment-hint-box__icon"
          />
          <p>شما قبلاً برای این غذا نظر و امتیاز خود را ثبت کرده‌اید.</p>
        </div>
      )}

      {/* رد شده */}
      {foodId && userStatus === "Rejected" && (
        <div className="comment-hint-box">
          <img
            src="/images/comments/comment-icon.svg"
            alt=""
            className="comment-hint-box__icon"
          />
          <p>نظر قبلی شما برای این غذا تایید نشد.</p>
        </div>
      )}

      <ProtectedActionModal
        open={open}
        onClose={closeModal}
        onLogin={goToLogin}
        icon={modalProps.icon}
        title={modalProps.title}
        description={modalProps.description}
      />
    </div>
  );
}
