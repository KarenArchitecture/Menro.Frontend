import React, { useState } from "react";
import StarIcon from "../icons/StarIcon";

function FoodCard({ item, onAddToCart, onQuantityChange }) {
  const {
    imageUrl,
    name,
    ingredients,
    price,
    restaurantName,
    restaurantCategory,
    rating,
    voters,
  } = item;

  const imgSrc = imageUrl?.startsWith?.("http")
    ? imageUrl
    : imageUrl
    ? `http://localhost:5096${imageUrl}`
    : "/images/food-placeholder.jpg";

  const safeRating = typeof rating === "number" ? rating : Number(rating) || 0;

  // 🔸 local quantity state (UI only; parent can optionally listen)
  const [qty, setQty] = useState(0);

  const inc = () => {
    const next = qty + 1;
    setQty(next);
    onAddToCart?.(name); // keep your existing callback
    onQuantityChange?.(item, next); // optional external listener
  };

  const dec = () => {
    if (qty === 0) return;
    const next = qty - 1;
    setQty(next);
    onQuantityChange?.(item, next);
  };

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
          {/* {ingredients ? <p className="food-ingredients">{ingredients}</p> : null} */}
        </div>

        {/* Price + Controls */}
        <div className="food-price-row">
          <p className="food-price">
            {(price ?? 0).toLocaleString("fa-IR")} <span>تومان</span>
          </p>

          {/* If qty is 0 → single + button; else → 3-part control */}
          {qty === 0 ? (
            <button
              className="add-btn"
              onClick={inc}
              aria-label={`افزودن ${name} به سبد`}
            >
              +
            </button>
          ) : (
            <div className="qty-controls" role="group" aria-label="تعداد">
              <button
                type="button"
                className="qty-btn qty-btn--minus"
                onClick={dec}
                aria-label="کم کردن"
              >
                –
              </button>
              <div className="qty-display" aria-live="polite">
                {qty}
              </div>
              <button
                type="button"
                className="qty-btn qty-btn--plus"
                onClick={inc}
                aria-label="افزودن"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="food-card-footer">
        <span className="food-restaurant-name">{restaurantName}</span>
      </div>
    </>
  );
}

export default FoodCard;
