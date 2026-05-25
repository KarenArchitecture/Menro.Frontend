// src/components/home/RestaurantCard.jsx

import React from "react";
import StarIcon from "../icons/StarIcon";
import { Link } from "react-router-dom";
import {
  formatPersianNumber,
  formatPersianRating,
  toPersianDigits,
} from "../../utils/persianNumbers";

function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;

  const {
    bannerImageUrl,
    discount = 0,
    openTime = "نامشخص",
    closeTime = "نامشخص",
    logoImageUrl,
    name = "رستوران",
    rating = 0,
    voters = 0,
    category = "نوع نامشخص",
    isOpen = false,
    slug,
  } = restaurant;

  const coverSrc =
    bannerImageUrl || "/images/restaurant/restaurant-home-placeholder.png";

  const logoSrc =
    logoImageUrl || "/images/restaurant/logo-placeholder.png";

  const formattedHours = `${toPersianDigits(openTime)} - ${toPersianDigits(closeTime)}`;

  const formattedDiscount = formatPersianNumber(discount, {
    useGrouping: false,
  });

  const formattedRating = formatPersianRating(rating);

  const formattedRatingCount = formatPersianNumber(voters);

  const cardContent = (
    <>
      <div className="card-img-container">
        <img
          src={coverSrc}
          alt={`عکس رستوران ${name}`}
          className="card-img"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/restaurant/restaurant-home-placeholder.png";
          }}
        />

        {discount > 0 && (
          <div className="discount-bubble">
            تا{" "}
            <span className="discount_num">
              {formattedDiscount}%
            </span>
            {" "}درصد تخفیف
          </div>
        )}

        <div className="logo-container">
          <img
            src={logoSrc}
            alt={`لوگو رستوران ${name}`}
            className="restaurant-badge"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/restaurant/logo-placeholder.png";
            }}
          />
        </div>
      </div>

      <div className="card-body">
        <span className="time-badge">
          <span className="time-badge__time">
            {formattedHours}
          </span>

          <span
            className={`time-badge__status ${
              isOpen ? "open" : "closed"
            }`}
          >
            {isOpen ? "باز است" : "بسته است"}
          </span>
        </span>

        <div className="restaurant-header">
          <h3 className="restaurant-name">
            {name}
          </h3>

          <div className="rating">
            <StarIcon />

            <span className="rate">
              {formattedRating}
            </span>

            <span className="rate-voters-num">
              ({formattedRatingCount})
            </span>
          </div>
        </div>

        <div className="restaurant-description">
          <p>{category}</p>
        </div>
      </div>
    </>
  );

  if (!slug) {
    console.warn("Restaurant slug is missing:", restaurant);

    return <div className="card">{cardContent}</div>;
  }

  return (
    <Link
      to={`/restaurant/${encodeURIComponent(slug)}`}
      className="card card-link"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {cardContent}
    </Link>
  );
}

export default RestaurantCard;