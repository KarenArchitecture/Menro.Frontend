import React from "react";
import StarIcon from "../icons/StarIcon";
import resolveFileUrl from "../../utils/resolveFileUrl";
import { Link } from "react-router-dom";
import SmartImage from "../common/SmartImage";

export default function FoodCard({ item, LinkComponent, onRestaurantClick }) {
  const {
    imageUrl,
    name,
    restaurantName,
    rating,
    voters,
    restaurantId,
    restaurantSlug,
    restaurantPath,

    // 👇 NEW (safe extraction)
    price,
    finalPrice,
    amount,
  } = item || {};

  // ✅ IMAGE
  const imgSrc = resolveFileUrl(imageUrl, "/images/food/food-placeholder.png");

  // ✅ RATING (safe)
  const safeRating = typeof rating === "number" ? rating : Number(rating) || 0;

  // ✅ RESTAURANT NAME (safe fallback)
  const displayRestaurantName = (
    restaurantName ||
    item?.restaurant?.name ||
    "نام رستوران"
  ).trim();

  // ✅ PRICE (robust fallback chain)
  const resolvedPrice =
    price ??
    finalPrice ??
    amount ??
    item?.pricing?.price ??
    item?.pricing?.finalPrice ??
    null;

  const formattedPrice =
    typeof resolvedPrice === "number"
      ? resolvedPrice.toLocaleString("fa-IR")
      : null;

  // ✅ LINK BUILDER (unchanged logic)
  const buildRestaurantHref = () => {
    if (restaurantPath) return restaurantPath;
    if (restaurantSlug) {
      return `/restaurant/${encodeURIComponent(restaurantSlug)}`;
    }
    if (restaurantId != null) {
      return `/restaurant/${encodeURIComponent(String(restaurantId))}`;
    }
    if (displayRestaurantName && displayRestaurantName !== "نام رستوران") {
      return `/restaurants/search?name=${encodeURIComponent(
        displayRestaurantName,
      )}`;
    }
    return undefined;
  };

  const href = buildRestaurantHref();
  const CTA = LinkComponent || (href ? Link : "button");
  const linkProps = href ? { to: href } : { type: "button", disabled: true };

  return (
    <div className="food-card">
      {/* IMAGE */}
      <div className="food-card-image">
        <SmartImage
          src={imgSrc}
          fallback="/images/food/food-placeholder.png"
          alt={name ? `تصویر ${name}` : "تصویر غذا"}
          className="food-img"
          lazy={true}
        />

        <div className="rating-chip">
          <StarIcon />
          <span className="score">{safeRating.toFixed(1)}</span>
          <span className="voters">
            ({(voters ?? 0).toLocaleString("fa-IR")})
          </span>
        </div>
      </div>

      {/* INFO */}
      <div className="food-info">
        <h3 className="food-title" title={name}>
          {name}
        </h3>

        {/* ✅ PRICE (only renders if exists → SAFE for Home page) */}
        {formattedPrice && (
          <p className="food-price">
            {formattedPrice} <span>تومان</span>
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="food-price-row">
        <span /> {/* keeps layout intact */}
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
          {displayRestaurantName}
          <span aria-hidden>
            <svg width="5" height="8" viewBox="0 0 5 8" fill="none">
              <path
                d="M3.50806 1L2.44708 1.90634C1.48236 2.73046 1 3.14252 1 3.67126C1 4.20001 1.48236 4.61207 2.44708 5.43618L3.50806 6.34253"
                stroke="#FAFAF4"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </CTA>
      </div>
    </div>
  );
}
