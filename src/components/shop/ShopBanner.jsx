import SearchBar from "../common/SearchBar";
import MapIcon from "../icons/MapIcon";
import BackIcon from "../icons/BackIcon";
import StarIcon from "../icons/StarIcon";
import ShoppingBagIcon from "../icons/ShoppingBagIcon";
import MusicIcon from "../icons/MusicIcon";
import CircleIcon from "../icons/CircleIcon";
import { useNavigate } from "react-router-dom";
import { toPersianDigits } from "../../utils/persianNumbers";
import resolveFileUrl from "../../utils/resolveFileUrl";
import useRequireLogin from "../../hooks/useRequireLogin";
import ProtectedActionModal from "../common/ProtectedActionModal";
import { useCart } from "./CartContext";

function ShopBanner({ banner, onSearchSubmit, onSearchChange, searchValue = "" }) {
  const navigate = useNavigate();
  const cart = useCart();

  const {
    requireLogin,
    open: authModalOpen,
    closeModal: closeAuthModal,
    goToLogin,
    modalProps: authModalProps,
  } = useRequireLogin();

  if (!banner) {
    return (
      <div className="text-center py-6 text-red-500">
        خطا در بارگذاری اطلاعات رستوران
      </div>
    );
  }

  const bannerUrl =
    resolveFileUrl(banner.bannerImageUrl) ||
    "/images/Restaurant/top-banner.png";

  const handleMusicClick = () => {
    requireLogin({
      type: "music",
      returnUrl: `/restaurant/${banner.slug}/music`,
      onAuthenticated: () => {
        navigate(`/restaurant/${banner.slug}/music`, {
          state: {
            restaurantId: banner.id,
          },
        });
      },
    });
  };

  return (
    <section
      className="banner"
      style={{ backgroundImage: `url(${bannerUrl})` }}
    >
      <nav className="navbar">
        <div className="nav-right">
          <div className="shop-icon-wrapper">
            <button
              className="icon-btn"
              aria-label="Back"
              onClick={() => navigate(-1)}
            >
              <BackIcon />
            </button>
          </div>

          <div className="shop-icon-wrapper">
            <button className="icon-btn" aria-label="Map">
              <MapIcon />
            </button>
          </div>
        </div>

        <div className="nav-mid">
          <div className="restaurant-title">
            <h1 className="restaurant-name">{banner.name}</h1>
          </div>

          <div className="rating">
            <StarIcon />
            <span className="rate">
              {typeof banner.averageRating === "number"
                ? toPersianDigits(banner.averageRating.toFixed(1))
                : toPersianDigits("0.0")}
            </span>
            <span className="rate-voters-num">
              ({toPersianDigits(banner.votersCount ?? 0)})
            </span>
          </div>
        </div>

        <div className="nav-left">
          <button
            type="button"
            className="icon-btn shop-cart-btn"
            aria-label="Cart"
            onClick={() => navigate("/checkout")}
          >
            <ShoppingBagIcon />
            {cart.count > 0 && (
              <span className="shop-cart-badge">{toPersianDigits(cart.count)}</span>
            )}
          </button>
        </div>
      </nav>

      <div className="banner-content">
        <SearchBar
          className="search-bar--hero"
          placeholder="سفارش خود را پیدا کنید..."
          value={searchValue}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
        />

        <div className="reorder-and-music">
          <button className="reorder-and-music-btn">
            <span>همون همیشگی</span>
            <CircleIcon />
          </button>

          <button className="reorder-and-music-btn" onClick={handleMusicClick}>
            <span>درخواست موسیقی</span>
            <MusicIcon />
          </button>
        </div>
      </div>

      <ProtectedActionModal
        open={authModalOpen}
        onClose={closeAuthModal}
        onLogin={goToLogin}
        {...authModalProps}
      />
    </section>
  );
}

export default ShopBanner;
