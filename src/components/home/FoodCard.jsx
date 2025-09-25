// // src/components/FoodCard.jsx
// import React from "react";
// import StarIcon from "../icons/StarIcon";

// /**
//  * FoodCard
//  * - Preserves existing classNames to avoid CSS impact
//  * - Replaces cart (+) UI with a footer CTA that links to the restaurant
//  * - Builds a dynamic href with sensible placeholders so backend can wire it up later
//  * - Optional LinkComponent prop for React Router / Next.js integration
//  */
// export default function FoodCard({
//   item,
//   /** Optional custom link component (e.g., React Router's Link or Next.js Link). */
//   LinkComponent,
//   /** Unused now, kept for backward compatibility. */
//   onAddToCart,
//   /** Unused now, kept for backward compatibility. */
//   onQuantityChange,
//   /** Optional click handler when CTA is used (analytics, etc.). */
//   onRestaurantClick,
// }) {
//   const {
//     imageUrl,
//     name,
//     price,
//     restaurantName,
//     rating,
//     voters,
//     restaurantId,
//     restaurantSlug,
//     restaurantPath, // preferred if backend provides a ready-to-use path
//   } = item || {};

//   // Why: robust image fallback to keep cards stable even when API returns relative paths
//   const imgSrc = imageUrl?.startsWith?.("http")
//     ? imageUrl
//     : imageUrl
//     ? `http://localhost:5096${imageUrl}`
//     : "/images/food-placeholder.jpg";

//   const safeRating = typeof rating === "number" ? rating : Number(rating) || 0;
//   const displayRestaurantName = (
//     restaurantName ||
//     item?.restaurant?.name ||
//     "نام رستوران"
//   ).trim();

//   // Helper to build the restaurant URL with graceful fallbacks.
//   const buildRestaurantHref = () => {
//     if (restaurantPath) return restaurantPath; // e.g. "/restaurants/meno-roy"
//     if (restaurantSlug)
//       return `/restaurants/${encodeURIComponent(restaurantSlug)}`;
//     if (restaurantId !== undefined && restaurantId !== null)
//       return `/restaurants/${encodeURIComponent(String(restaurantId))}`;
//     if (displayRestaurantName && displayRestaurantName !== "نام رستوران")
//       return `/restaurants/search?name=${encodeURIComponent(
//         displayRestaurantName
//       )}`;
//     return "/restaurants"; // ultimate fallback
//   };

//   const href = buildRestaurantHref();
//   const CTA = LinkComponent || "a"; // allows <Link to> or <a href>
//   const linkProps = LinkComponent ? { to: href } : { href };

//   return (
//     <>
//       <div className="food-card">
//         {/* Image + rating chip overlay */}
//         <div className="food-card-image">
//           <img
//             src={imgSrc}
//             alt={name}
//             className="food-img"
//             onError={(e) => {
//               e.currentTarget.src = "/images/food-placeholder.jpg";
//             }}
//           />

//           <div className="rating-chip">
//             <StarIcon />
//             <span className="score">{safeRating.toFixed(1)}</span>
//             <span className="voters">
//               ({(voters ?? 0).toLocaleString("fa-IR")})
//             </span>
//           </div>
//         </div>

//         {/* Title */}
//         <div className="food-info">
//           <h3 className="food-title" title={name}>
//             {name}
//           </h3>
//           {/* Keep ingredients optional; uncomment if needed */}
//           {/* {ingredients ? <p className="food-ingredients">{ingredients}</p> : null} */}
//         </div>

//         {/* Price row with restaurant CTA inside the button area */}
//         <div className="food-price-row">
//           <p className="food-price">
//             {(price ?? 0).toLocaleString("fa-IR")} <span>تومان</span>
//           </p>

//           {/* Button now navigates to the restaurant (no CSS class changes) */}
//           <CTA
//             {...linkProps}
//             className="add-btn"
//             data-restaurant-id={restaurantId ?? undefined}
//             aria-label={`مشاهده ${displayRestaurantName}`}
//             onClick={(e) => {
//               onRestaurantClick?.(item, href, e);
//             }}
//             title={`مشاهده ${displayRestaurantName}`}
//           >
//             {`رستوران ${displayRestaurantName} `}
//             <span aria-hidden>‹</span>
//           </CTA>
//         </div>
//       </div>
//     </>
//   );
// }


import React from "react";
import StarIcon from "../icons/StarIcon";
import publicAxios from "../../api/publicAxios";
import { Link } from "react-router-dom";

export default function FoodCard({
  item,
  LinkComponent,
  onRestaurantClick, // optional analytics
}) {
  const {
    imageUrl,
    name,
    restaurantName,
    rating,
    voters,
    restaurantId,
    restaurantSlug,
    restaurantPath,
  } = item || {};

  // Resolve relative URLs from backend (/img/...) or frontend (/images/...)
  const apiOrigin = new URL(publicAxios.defaults.baseURL).origin;
  const appOrigin = window.location.origin;
  const toAssetUrl = (url) => {
    if (!url) return "/images/food-placeholder.jpg";
    if (/^https?:\/\//i.test(url)) return url;
    const withSlash = url.startsWith("/") ? url : `/${url}`;
    if (withSlash.startsWith("/img/"))     return `${apiOrigin}${withSlash}`;
    if (withSlash.startsWith("/images/"))  return `${appOrigin}${withSlash}`;
    return `${appOrigin}${withSlash}`;
  };

  const imgSrc = toAssetUrl(imageUrl);
  const safeRating = typeof rating === "number" ? rating : Number(rating) || 0;
  const displayRestaurantName =
    (restaurantName || item?.restaurant?.name || "نام رستوران").trim();

  // Build a best-effort href
  const buildRestaurantHref = () => {
    if (restaurantPath) return restaurantPath;
    if (restaurantSlug) return `/restaurant/${encodeURIComponent(restaurantSlug)}`;
    if (restaurantId != null) return `/restaurant/${encodeURIComponent(String(restaurantId))}`;
    if (displayRestaurantName && displayRestaurantName !== "نام رستوران")
      return `/restaurants/search?name=${encodeURIComponent(displayRestaurantName)}`;
    return undefined; // no link available
  };

  const href = buildRestaurantHref();
  const CTA = LinkComponent || (href ? Link : "button");
  const linkProps = href ? { to: href } : { type: "button", disabled: true };

  return (
    <div className="food-card">
      <div className="food-card-image">
        <img
          src={imgSrc}
          alt={name}
          className="food-img"
          onError={(e) => { e.currentTarget.src = "/images/food-placeholder.jpg"; }}
        />
        <div className="rating-chip">
          <StarIcon />
          <span className="score">{safeRating.toFixed(1)}</span>
          <span className="voters">({(voters ?? 0).toLocaleString("fa-IR")})</span>
        </div>
      </div>

      <div className="food-info">
        <h3 className="food-title" title={name}>{name}</h3>
      </div>

      {/* Footer: just the restaurant CTA/chip (no price on homepage) */}
      <div className="food-price-row">
        {/* omit price on homepage */}
        <span />
        <CTA
          {...linkProps}
          className="add-btn"
          data-restaurant-id={restaurantId ?? undefined}
          aria-label={`مشاهده ${displayRestaurantName}`}
          onClick={(e) => { onRestaurantClick?.(item, href, e); }}
          title={`مشاهده ${displayRestaurantName}`}
        >
          {`${displayRestaurantName}`}
          <span aria-hidden>
            <svg width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.50806 1L2.44708 1.90634C1.48236 2.73046 1 3.14252 1 3.67126C1 4.20001 1.48236 4.61207 2.44708 5.43618L3.50806 6.34253" stroke="#FAFAF4" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </CTA>
      </div>
    </div>
  );
}
