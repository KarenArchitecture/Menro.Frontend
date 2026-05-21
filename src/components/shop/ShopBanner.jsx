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

//   const BACKEND_URL = "https://localhost:xxxx"; // secure backend

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

// // src/components/shop/ShopBanner.jsx
// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import SearchBar from "../common/SearchBar";
// import StateMessage from "../common/StateMessage";
// import StarIcon from "../icons/StarIcon";
// import MapIcon from "../icons/MapIcon";
// import BackIcon from "../icons/BackIcon";
// import ShoppingBagIcon from "../icons/ShoppingBagIcon";
// import MusicIcon from "../icons/MusicIcon";
// import CircleIcon from "../icons/CircleIcon";
// import { getRestaurantBannerBySlug } from "../../api/restaurants";

// function ShopBanner({ slug }) {
//   const BACKEND_URL = "https://localhost:xxxx"; // secure backend

//   const { data: banner, isLoading, isError } = useQuery({
//     queryKey: ["restaurantBanner", slug],
//     queryFn: () => getRestaurantBannerBySlug(slug),
//     enabled: !!slug,
//     retry: 1,
//   });

//   // Loading state
//   if (isLoading) {
//     return (
//       <StateMessage kind="info" title="در حال بارگذاری">
//         در حال بارگذاری اطلاعات رستوران...
//       </StateMessage>
//     );
//   }

//   // Not found state
//   if (!banner) {
//     return (
//       <StateMessage kind="empty" title="رستوران یافت نشد">
//         رستوران مورد نظر یافت نشد.
//       </StateMessage>
//     );
//   }

//   // Error state
//   if (isError) {
//     return (
//       <StateMessage kind="error" title="خطا در بارگذاری">
//         مشکلی در دریافت اطلاعات رستوران رخ داده است.
//         <div className="state-message__action">
//           <button onClick={() => window.location.reload()}>دوباره تلاش کنید</button>
//         </div>
//       </StateMessage>
//     );
//   }

//   // Resolve banner URL
//   const resolveBannerUrl = (url) => {
//     if (!url) return "/images/top-banner.png"; // local fallback

//     // If already an absolute URL (like http:// or https://), return as-is
//     if (url.startsWith("http")) return url;

//     // For relative URLs like "/img/...", prefix the backend base URL
//     if (url.startsWith("/")) return `${BACKEND_URL}${url}`;

//     // Otherwise assume it's missing slash and prefix it too
//     return `${BACKEND_URL}/${url}`;
//   };

//   const bannerUrl = resolveBannerUrl(banner.bannerImageUrl);
//   console.log("🖼 bannerUrl:", bannerUrl);

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

// export default ShopBanner;



// src/components/shop/ShopBanner.jsx
import SearchBar from "../common/SearchBar";
import MapIcon from "../icons/MapIcon";
import BackIcon from "../icons/BackIcon";
import StarIcon from "../icons/StarIcon";
import ShoppingBagIcon from "../icons/ShoppingBagIcon";
import MusicIcon from "../icons/MusicIcon";
import CircleIcon from "../icons/CircleIcon";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

function ShopBanner({ banner }) {
  const navigate = useNavigate();

  if (!banner) {
    return (
      <div className="text-center py-6 text-red-500">
        خطا در بارگذاری اطلاعات رستوران
      </div>
    );
  }

  /** Resolve URL from backend */
  const resolveBannerUrl = (url) => {
    if (!url) return "/images/top-banner.png"; // fallback
    if (url.startsWith("http")) return url;

    // ✅ clean "/api/public" if backend sends it
    let clean = url.replace(/^\/api\/public/i, "");

    if (!clean.startsWith("/")) clean = "/" + clean;
    return BACKEND_URL + clean;
  };

  // 🧠 Debug + clean URL
console.log("bannerImageUrl from backend:", banner.bannerImageUrl);

const bannerUrl = (() => {
  if (!banner.bannerImageUrl) return "/images/top-banner.png";
  if (banner.bannerImageUrl.startsWith("http")) return banner.bannerImageUrl;

  let clean = banner.bannerImageUrl.replace(/^\/api\/public/i, ""); // remove /api/public
  if (!clean.startsWith("/")) clean = "/" + clean;

  const full = BACKEND_URL.replace(/\/api\/public/i, "") + clean;
  return full;
})();

// 🖼️ apply background image directly
return (
  <section
    className="banner"
    style={{ backgroundImage: `url(${bannerUrl})` }}
  >

      {/* ───────────── NAVBAR ───────────── */}
      <nav className="navbar">
        <div className="nav-right">
          <div className="shop-icon-wrapper">
            <button className="icon-btn" aria-label="Back" onClick={() => navigate(-1)}>
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
            <span className="rate-voters-num">
              ({banner.votersCount ?? 0})
            </span>
          </div>
        </div>

        <div className="nav-left">
          <button className="icon-btn" aria-label="Cart">
            <ShoppingBagIcon />
          </button>
        </div>
      </nav>

      {/* ───────────── SEARCH & ACTIONS ───────────── */}
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
