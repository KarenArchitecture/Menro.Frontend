import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRestaurantBannerBySlug } from "../../api/restaurants";

// function ShopBanner() {
//   const { slug } = useParams();

//   const {
//     data: banner,
//     isLoading,
//     isError,
//   } = useQuery({
//   queryKey: ["restaurantBanner", slug],
//   queryFn: () => getRestaurantBannerBySlug(slug),
//   enabled: !!slug,
//   })

//   if (isLoading) return <div className="text-center py-6">در حال بارگذاری...</div>;
//   if (isError || !banner) return <div className="text-center text-red-500 py-6">خطا در بارگذاری اطلاعات رستوران</div>;

//   return (
//     <section
//       className="banner"
//       style={{
//         backgroundImage: `url(${banner.bannerImageUrl})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
  function ShopBanner({ banner }) {     // banner now arrives as a prop
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
        backgroundImage   : `url(${banner.bannerImageUrl})`,
        backgroundSize    : "cover",
        backgroundPosition: "center",
      }}
    >
      <nav className="navbar">
        <div className="circle-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 rtl:rotate-180"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </div>
        <div className="cart-wrapper">
          <div className="cart-icon-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3.75 3.75 0 007.5 0m-7.5 0h7.5m-7.5 0L5.25 6.75m0 0h14.036c.977 0 1.636.958 1.348 1.9l-1.41 4.7a1.5 1.5 0 01-1.432 1.05H5.902a1.5 1.5 0 01-1.432-1.05l-1.41-4.7a1.357 1.357 0 011.348-1.9z"
              />
            </svg>
          </div>
          <span className="cart-badge" style={{ display: "none" }}>
            0
          </span>
        </div>
      </nav>

      <div className="banner-content">
        <div className="restaurant-title">
          <h1 className="restaurant-name">{banner.name}</h1>
          <p className="restaurant-description">{banner.categoryName}</p>
        </div>
        <div className="search-and-music">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="سفارش خود را پیدا کنید..."
            />
            <button className="search-button" aria-label="Search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11.25 18a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z"
                />
              </svg>
            </button>
          </div>
          <button className="music-request">
            <span>درخواست موسیقی</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
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
