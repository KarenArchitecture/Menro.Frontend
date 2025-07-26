import React from "react";
import StarIcon from "../icons/StarIcon";

function WideRestaurantCard({ order }) {
  const {
    imageUrl,
    discount = 0,
    hours = "",
    logoUrl = "/images/Mask group.png",
    name = "نامشخص",
    rating,
    ratingCount = 0,
    type = "نامشخص",
  } = order || {};

  return (
    <div className="wide-card">
      <div className="wide-card-img-container">
        <img
          src={imageUrl ? `http://localhost:5096${imageUrl}` : "/img/default-restaurant.png"}
          alt={`عکس رستوران ${name}`}
          className="wide-card-img"
          loading="lazy"
          decoding="async"
        />
        <div className="discount-bubble">
          تا <span className="discount_num">{discount}%</span> درصد تخفیف ثبت سفارش در منرو
        </div>
      </div>
      <div className="wide-card-body">
        <div className="time-badge">
          <span>{hours}</span>
        </div>
        <div className="logo-container">
          <img
            src={logoUrl.startsWith("http") ? logoUrl : `http://localhost:5096${logoUrl}`}
            alt={`لوگو رستوران ${name}`}
            className="restaurant-badge"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="restaurant-header">
          <h3 className="restaurant-name">{name}</h3>
          <div className="rating">
            <StarIcon />
            <span className="rate">{typeof rating === "number" ? rating.toFixed(1) : "N/A"}</span>
            <span className="rate-voters-num">({ratingCount})</span>
          </div>
        </div>
        <div className="restaurant-description">
          <p>{type}</p>
        </div>
      </div>
    </div>
  );
}

export default WideRestaurantCard;
