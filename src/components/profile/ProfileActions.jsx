import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useRequireLogin from "../../hooks/useRequireLogin";
import ProtectedActionModal from "../common/ProtectedActionModal";
import ActionCard from "../profile/ActionCard";
import { useAuth } from "../../context/AuthContext";

export default function ProfileActions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { requireLogin, open, closeModal, goToLogin, modalProps } =
    useRequireLogin();

  const handleCommentsClick = () => {
    requireLogin({
      type: "comments",
      returnUrl: "/comments",
      onAuthenticated: () => navigate("/comments"),
    });
  };
  const handleFavoritesClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    navigate("/favorites");
  };

  const actions = [
    {
      icon: "/images/profile/profile-heart-icon.svg",
      label: "علاقه‌مندی",
      gradient: ["#A580EF", "#E98A8A"],
      onClick: handleFavoritesClick,
    },
    {
      icon: "/images/profile/profile-chat-icon.svg",
      label: "کامنت‌ها",
      gradient: ["#FF9352", "#A65728"],
      onClick: handleCommentsClick,
    },
    {
      icon: "/images/profile/profile-ticket-icon.svg",
      label: "کد تخفیف",
      gradient: ["#CCCCCC", "#F9AF47"],
      onClick: () => console.log("discounts"),
    },
  ];

  return (
    <>
      <div className="profile-actions">
        {actions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </div>

      <ProtectedActionModal
        open={open}
        onClose={closeModal}
        onLogin={goToLogin}
        icon={modalProps.icon}
        title={modalProps.title}
        description={modalProps.description}
      />
    </>
  );
}
