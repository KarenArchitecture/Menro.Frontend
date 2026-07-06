import ActionCard from "./ActionCard";
import { useNavigate } from "react-router-dom";

export default function ProfileActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: "/images/profile/profile-heart-icon.svg",
      label: "علاقه‌مندی",
      gradient: ["#A580EF", "#E98A8A"],
      onClick: () => navigate("/favorites"),
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
    <div className="profile-actions">
      {actions.map((action, index) => (
        <ActionCard key={index} {...action} />
      ))}
    </div>
  );
}
