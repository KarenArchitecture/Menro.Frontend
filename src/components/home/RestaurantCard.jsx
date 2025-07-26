import React from "react";
import StarIcon from "../icons/StarIcon";

function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;

  const {
    imageUrl = "/img/default-restaurant.png",
    discount = 0,
    hours = "نامشخص",
    logoUrl = "/img/default-logo.png",
    name = "رستوران",
    rating = "N/A",
    ratingCount = 0,
    type = "نوع نامشخص",
  } = restaurant;

  return (
    <div className="card">
      <div className="card-img-container">
        <img
          src={`${imageUrl}`}
          alt={`عکس رستوران ${name}`}
          className="card-img"
        />
        {discount > 0 && (
          <div className="discount-bubble">
            تا <span className="discount_num">{discount}%</span> درصد تخفیف
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="time-badge">
          <span>{hours}</span>
        </div>
        <div className="logo-container">
          <img
            src={`${logoUrl}`}
            alt={`لوگو رستوران ${name}`}
            className="restaurant-badge"
          />
        </div>
        <div className="restaurant-header">
          <h3 className="restaurant-name">{name}</h3>
          <div className="rating">
            <StarIcon />
            <span className="rate">{typeof rating === "number" ? rating.toFixed(1) : rating}</span>
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

export default RestaurantCard;
