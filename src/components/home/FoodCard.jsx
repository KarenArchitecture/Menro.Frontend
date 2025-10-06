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
