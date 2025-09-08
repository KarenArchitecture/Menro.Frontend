// src/components/FoodCard.jsx
import React from "react";
import StarIcon from "../icons/StarIcon";

/**
 * FoodCard
 * - Preserves existing classNames to avoid CSS impact
 * - Replaces cart (+) UI with a footer CTA that links to the restaurant
 * - Builds a dynamic href with sensible placeholders so backend can wire it up later
 * - Optional LinkComponent prop for React Router / Next.js integration
 */
export default function FoodCard({
  item,
  /** Optional custom link component (e.g., React Router's Link or Next.js Link). */
  LinkComponent,
  /** Unused now, kept for backward compatibility. */
  onAddToCart,
  /** Unused now, kept for backward compatibility. */
  onQuantityChange,
  /** Optional click handler when CTA is used (analytics, etc.). */
  onRestaurantClick,
}) {
  const {
    imageUrl,
    name,
    ingredients,
    price,
    restaurantName,
    restaurantCategory,
    rating,
    voters,
    restaurantId,
    restaurantSlug,
    restaurantPath, // preferred if backend provides a ready-to-use path
  } = item || {};

  // Why: robust image fallback to keep cards stable even when API returns relative paths
  const imgSrc = imageUrl?.startsWith?.("http")
    ? imageUrl
    : imageUrl
    ? `http://localhost:5096${imageUrl}`
    : "/images/food-placeholder.jpg";

  const safeRating = typeof rating === "number" ? rating : Number(rating) || 0;
  const displayRestaurantName = (
    restaurantName ||
    item?.restaurant?.name ||
    "نام رستوران"
  ).trim();

  // Helper to build the restaurant URL with graceful fallbacks.
  const buildRestaurantHref = () => {
    if (restaurantPath) return restaurantPath; // e.g. "/restaurants/meno-roy"
    if (restaurantSlug)
      return `/restaurants/${encodeURIComponent(restaurantSlug)}`;
    if (restaurantId !== undefined && restaurantId !== null)
      return `/restaurants/${encodeURIComponent(String(restaurantId))}`;
    if (displayRestaurantName && displayRestaurantName !== "نام رستوران")
      return `/restaurants/search?name=${encodeURIComponent(
        displayRestaurantName
      )}`;
    return "/restaurants"; // ultimate fallback
  };

  const href = buildRestaurantHref();
  const CTA = LinkComponent || "a"; // allows <Link to> or <a href>
  const linkProps = LinkComponent ? { to: href } : { href };

  return (
    <>
      <div className="food-card">
        {/* Image + rating chip overlay */}
        <div className="food-card-image">
          <img
            src={imgSrc}
            alt={name}
            className="food-img"
            onError={(e) => {
              e.currentTarget.src = "/images/food-placeholder.jpg";
            }}
          />

          <div className="rating-chip">
            <StarIcon />
            <span className="score">{safeRating.toFixed(1)}</span>
            <span className="voters">
              ({(voters ?? 0).toLocaleString("fa-IR")})
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="food-info">
          <h3 className="food-title" title={name}>
            {name}
          </h3>
          {/* Keep ingredients optional; uncomment if needed */}
          {/* {ingredients ? <p className="food-ingredients">{ingredients}</p> : null} */}
        </div>

        {/* Price row with restaurant CTA inside the button area */}
        <div className="food-price-row">
          <p className="food-price">
            {(price ?? 0).toLocaleString("fa-IR")} <span>تومان</span>
          </p>

          {/* Button now navigates to the restaurant (no CSS class changes) */}
          <CTA
            {...linkProps}
            className="add-btn"
            data-restaurant-id={restaurantId ?? undefined}
            aria-label={`مشاهده ${displayRestaurantName}`}
            onClick={(e) => {
              onRestaurantClick?.(item, href, e);
            }}
            title={`مشاهده ${displayRestaurantName}`}
          >
            {`رستوران ${displayRestaurantName} `}
            <span aria-hidden>‹</span>
          </CTA>
        </div>
      </div>
    </>
  );
}
