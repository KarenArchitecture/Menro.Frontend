import React from "react";
import SearchBar from "../common/SearchBar";
import CartIcon from "../icons/CartIcon";
import BackIcon from "../icons/BackIcon";

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
        <button className="icon-btn icon-btn--ring" aria-label="Back">
          <BackIcon className="back-icon" />
        </button>

        <button className="icon-btn icon-btn--ring" aria-label="Cart">
          <CartIcon />
        </button>
      </nav>
      <div className="banner-content">
        <div className="restaurant-title">
          <h1 className="restaurant-name">{banner.name}</h1>
          <p className="restaurant-description">{banner.categoryName}</p>
        </div>

        <div className="search-and-music">
          <SearchBar
            className="search-bar--hero"
            placeholder="سفارش خود را پیدا کنید..."
          />
          <button className="music-request">
            <span>درخواست موسیقی</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="music-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l10.5-2.25v11.25"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9v10.125a3.375 3.375 0 11-2.25-3.194"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default ShopBanner;
