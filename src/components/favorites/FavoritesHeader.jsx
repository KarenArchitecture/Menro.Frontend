import { useNavigate } from "react-router-dom";

export default function FavoritesHeader() {
  const navigate = useNavigate();

  return (
    <div className="favorites-header">
      <button className="favorites-header__back" onClick={() => navigate(-1)}>
        <img src="/images/icons/back.svg" alt="back" />
      </button>

      <div className="favorites-header__title">
        <img src="/images/profile/profile-heart-icon.svg" alt="favorites" />
        <span>علاقه‌مندی‌ها</span>
      </div>
    </div>
  );
}
