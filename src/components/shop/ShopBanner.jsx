import SearchBar from "../common/SearchBar";
import MapIcon from "../icons/MapIcon";
import BackIcon from "../icons/BackIcon";
import StarIcon from "../icons/StarIcon";
import ShoppingBagIcon from "../icons/ShoppingBagIcon";
import MusicIcon from "../icons/MusicIcon";
import CircleIcon from "../icons/CircleIcon";
function ShopBanner({ banner }) {
  if (!banner) {
    return (
      <div className="text-center py-6 text-red-500">
        خطا در بارگذاری اطلاعات رستوران
      </div>
    );
  }

  return (
    <section
      className="banner"
      style={{
        backgroundImage: `url(${banner.bannerImageUrl})`,
      }}
    >
      <nav className="navbar">
        <div className="nav-right">
          <div className="shop-icon-wrapper">
            <button className="icon-btn" aria-label="Back">
              <BackIcon />
            </button>
          </div>
          <div className="shop-icon-wrapper">
            <button className="icon-btn " aria-label="Map">
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
            <span className="rate">4</span>
            <span className="rate-voters-num">(250)</span>
          </div>
        </div>

        <div className="nav-left">
          <div className="shop-icon-wrapper">
            <button className="icon-btn " aria-label="Cart">
              <ShoppingBagIcon />
            </button>
          </div>
        </div>
      </nav>

      <div className="banner-content">
        <SearchBar
          className="search-bar--hero"
          placeholder="سفارش خود را پیدا کنید..."
        />

        <div className="reorder-and-music">
          <button className="reorder-and-music-btn">
            <span>همون همیشگی</span>
            <CircleIcon />
          </button>
          <button className="reorder-and-music-btn">
            <span>درخواست موسیقی</span>
            <MusicIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ShopBanner;
