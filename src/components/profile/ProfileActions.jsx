import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionCard from "./ActionCard";
import LoginRequiredModal from "../common/ProtectedActionModal";
import { useAuth } from "../../context/AuthContext";

export default function ProfileActions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showLoginModal, setShowLoginModal] = useState(false);

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
      onClick: () => console.log("comments"),
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
          <ActionCard
            key={index}
            {...action}
          />
        ))}
      </div>

      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          sessionStorage.setItem("redirectAfterLogin", "/favorites");
          navigate("/login");
        }}
      />
    </>
  );
}