import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileStats from "../../components/profile/ProfileStats";
import ProfileActions from "../../components/profile/ProfileActions";
import AdBanner from "../../components/common/AdBanner";
import "../../assets/css/styles-profile.css";

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const user = {
    name: "کافه‌گرد ۵۹۶۸",
    stats: [
      { value: 213, label: "خرید موفق" },
      { value: 32, label: "بازدید از رستوران‌ها" },
      { value: 5, label: "بررسی محصول" },
    ],
  };

  const handleLogout = () => {
    if (window.confirm("از حساب کاربری خود خارج می‌شوید؟")) {
      logout();
    }
  };

  return (
    <div className="profile-page">
      <button
        type="button"
        className="profile-logout-btn"
        aria-label="خروج از حساب کاربری"
        onClick={handleLogout}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>

      <ProfileHeader user={user} />
      <ProfileStats stats={user.stats} />
      <ProfileActions />

      <AdBanner slotKey="profile-1" />
      <AdBanner slotKey="profile-2" />
    </div>
  );
}
