// import SearchBar from "../common/SearchBar";
// import MapIcon from "../icons/MapIcon";
// import BackIcon from "../icons/BackIcon";
// import StarIcon from "../icons/StarIcon";
// import ShoppingBagIcon from "../icons/ShoppingBagIcon";
// import MusicIcon from "../icons/MusicIcon";
// import CircleIcon from "../icons/CircleIcon";
// function ShopBanner({ banner }) {
//   if (!banner) {
//     return (
//       <div className="text-center py-6 text-red-500">
//         خطا در بارگذاری اطلاعات رستوران
//       </div>
//     );
//   }

//   return (
//     <section
//       className="banner"
//       style={{
//         backgroundImage: `url(${banner.bannerImageUrl})`,
//       }}
//     >
//       <nav className="navbar">
//         <div className="nav-right">
//           <div className="shop-icon-wrapper">
//             <button className="icon-btn" aria-label="Back">
//               <BackIcon />
//             </button>
//           </div>
//           <div className="shop-icon-wrapper">
//             <button className="icon-btn " aria-label="Map">
//               <MapIcon />
//             </button>
//           </div>
//         </div>

//         <div className="nav-mid">
//           <div className="restaurant-title">
//             <h1 className="restaurant-name">{banner.name}</h1>
//           </div>
//           <div className="rating">
//             <StarIcon />
//             <span className="rate">
//               {typeof banner.averageRating === "number"
//                 ? banner.averageRating.toFixed(1)
//                 : "0.0"}
//             </span>
//             <span className="rate-voters-num">
//               ({banner.votersCount ?? 0})
//             </span>
//           </div>
//         </div>

//         <div className="nav-left">
//           <div className="shop-icon-wrapper">
//             <button className="icon-btn " aria-label="Cart">
//               <ShoppingBagIcon />
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="banner-content">
//         <SearchBar
//           className="search-bar--hero"
//           placeholder="سفارش خود را پیدا کنید..."
//         />

//         <div className="reorder-and-music">
//           <button className="reorder-and-music-btn">
//             <span>همون همیشگی</span>
//             <CircleIcon />
//           </button>
//           <button className="reorder-and-music-btn">
//             <span>درخواست موسیقی</span>
//             <MusicIcon />
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default ShopBanner;


// import SearchBar from "../common/SearchBar";
// import MapIcon from "../icons/MapIcon";
// import BackIcon from "../icons/BackIcon";
// import StarIcon from "../icons/StarIcon";
// import ShoppingBagIcon from "../icons/ShoppingBagIcon";
// import MusicIcon from "../icons/MusicIcon";
// import CircleIcon from "../icons/CircleIcon";

// function ShopBanner({ banner }) {
//   if (!banner) {
//     return (
//       <div className="text-center py-6 text-red-500">
//         خطا در بارگذاری اطلاعات رستوران
//       </div>
//     );
//   }

//   const BACKEND_URL = "https://localhost:7270"; // secure backend

//   // Resolve banner URL from backend or frontend fallback
//   function resolveBannerUrl(url) {
//     if (!url) return "/images/top-banner.png"; // fallback from frontend/public
//     if (url.startsWith("http")) return url; // already a full URL
//     if (url.startsWith("/img")) return `${BACKEND_URL}${url}`; // backend file
//     return url; // default (covers future cases)
//   }

//   const bannerUrl = resolveBannerUrl(banner.bannerImageUrl);

//   return (
//     <section
//       className="banner"
//       style={{
//         backgroundImage: `url(${bannerUrl})`,
//       }}
//     >
//       <nav className="navbar">
//         <div className="nav-right">
//           <div className="shop-icon-wrapper">
//             <button className="icon-btn" aria-label="Back">
//               <BackIcon />
//             </button>
//           </div>
//           <div className="shop-icon-wrapper">
//             <button className="icon-btn" aria-label="Map">
//               <MapIcon />
//             </button>
//           </div>
//         </div>

//         <div className="nav-mid">
//           <div className="restaurant-title">
//             <h1 className="restaurant-name">{banner.name}</h1>
//           </div>
//           <div className="rating">
//             <StarIcon />
//             <span className="rate">
//               {typeof banner.averageRating === "number"
//                 ? banner.averageRating.toFixed(1)
//                 : "0.0"}
//             </span>
//             <span className="rate-voters-num">({banner.votersCount ?? 0})</span>
//           </div>
//         </div>

//         <div className="nav-left">
//           <div className="shop-icon-wrapper">
//             <button className="icon-btn" aria-label="Cart">
//               <ShoppingBagIcon />
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="banner-content">
//         <SearchBar
//           className="search-bar--hero"
//           placeholder="سفارش خود را پیدا کنید..."
//         />

//         <div className="reorder-and-music">
//           <button className="reorder-and-music-btn">
//             <span>همون همیشگی</span>
//             <CircleIcon />
//           </button>
//           <button className="reorder-and-music-btn">
//             <span>درخواست موسیقی</span>
//             <MusicIcon />
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

// src/components/shop/ShopBanner.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "../common/SearchBar";
import StateMessage from "../common/StateMessage";
import StarIcon from "../icons/StarIcon";
import MapIcon from "../icons/MapIcon";
import BackIcon from "../icons/BackIcon";
import ShoppingBagIcon from "../icons/ShoppingBagIcon";
import MusicIcon from "../icons/MusicIcon";
import CircleIcon from "../icons/CircleIcon";
import { getRestaurantBannerBySlug } from "../../api/restaurants";

function ShopBanner({ slug }) {
  const BACKEND_URL = "https://localhost:7270"; // secure backend

  const { data: banner, isLoading, isError } = useQuery({
    queryKey: ["restaurantBanner", slug],
    queryFn: () => getRestaurantBannerBySlug(slug),
    enabled: !!slug,
    retry: 1,
  });

  // Loading state
  if (isLoading) {
    return (
      <StateMessage kind="info" title="در حال بارگذاری">
        در حال بارگذاری اطلاعات رستوران...
      </StateMessage>
    );
  }

  // Not found state
  if (!banner) {
    return (
      <StateMessage kind="empty" title="رستوران یافت نشد">
        رستوران مورد نظر یافت نشد.
      </StateMessage>
    );
  }

  // Error state
  if (isError) {
    return (
      <StateMessage kind="error" title="خطا در بارگذاری">
        مشکلی در دریافت اطلاعات رستوران رخ داده است.
        <div className="state-message__action">
          <button onClick={() => window.location.reload()}>دوباره تلاش کنید</button>
        </div>
      </StateMessage>
    );
  }

  // Resolve banner URL
  const resolveBannerUrl = (url) => {
    if (!url) return "/images/top-banner.png";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/img")) return `${BACKEND_URL}${url}`;
    return url;
  };

  const bannerUrl = resolveBannerUrl(banner.bannerImageUrl);

  return (
    <section
      className="banner"
      style={{
        backgroundImage: `url(${bannerUrl})`,
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
                ? banner.averageRating.toFixed(1)
                : "0.0"}
            </span>
            <span className="rate-voters-num">({banner.votersCount ?? 0})</span>
          </div>
        </div>

        <div className="nav-left">
          <div className="shop-icon-wrapper">
            <button className="icon-btn" aria-label="Cart">
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
