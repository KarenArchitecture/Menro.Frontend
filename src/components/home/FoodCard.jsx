// src/components/FoodCard.jsx
import React from "react";
import StarIcon from "../icons/StarIcon";

export default function FoodCard({
  item,

  LinkComponent,
  onAddToCart,
  onQuantityChange,
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
    restaurantPath,
  } = item || {};

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

  const buildRestaurantHref = () => {
    if (restaurantPath) return restaurantPath;
    if (restaurantSlug)
      return `/restaurants/${encodeURIComponent(restaurantSlug)}`;
    if (restaurantId !== undefined && restaurantId !== null)
      return `/restaurants/${encodeURIComponent(String(restaurantId))}`;
    if (displayRestaurantName && displayRestaurantName !== "نام رستوران")
      return `/restaurants/search?name=${encodeURIComponent(
        displayRestaurantName
      )}`;
    return "/restaurants";
  };

  const href = buildRestaurantHref();
  const CTA = LinkComponent || "a";
  const linkProps = LinkComponent ? { to: href } : { href };

  return (
    <>
      <div className="food-card">
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
