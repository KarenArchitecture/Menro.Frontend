import React from "react";
import StarIcon from "../icons/StarIcon";

function FoodCard({ item, onAddToCart }) {
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

    return (
        <div className="food-card">
        <div className="food-card-image">
            <img
            src={`http://localhost:5096${imageUrl}`}
            alt={name}
            className="food-img"
            />
        </div>

        <div className="food-info">
            <h3 className="food-title">{name}</h3>
            <p className="food-ingredients">{ingredients}</p>
        </div>

        <div className="food-price-row">
            <button className="add-btn" onClick={() => onAddToCart(name)}>
            +
            </button>
            <p>
            {price}
            <span className="food-price"> تومان</span>
            </p>
        </div>

        <div className="food-card-footer">
            <h4 className="food-restaurant-name">{restaurantName}</h4>
            <div className="rating-wrapper">
            <div className="rating-name">
                <p className="food-restaurant-category">{restaurantCategory}</p>
            </div>
            <div className="rating">
                <StarIcon />
                <span className="rate">{rating.toFixed(1)}</span>
                <span className="rate-voters-num">({voters})</span>
            </div>
            </div>
        </div>
        </div>
    );
}

export default FoodCard;
