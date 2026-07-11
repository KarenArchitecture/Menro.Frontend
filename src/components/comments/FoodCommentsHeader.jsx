// src/components/comments/FoodCommentsHeader.jsx
import React from "react";
import { toPersianDigits } from "../../utils/persianFormat";
import { useNavigate } from "react-router-dom";

export default function FoodCommentsHeader({ imageUrl, title, approvedCount }) {
    const navigate = useNavigate();

    return (
        <div className="food-comments-header">
        <button className="comments-header__back" onClick={() => navigate(-1)}>
            <img src="/images/back-curve-icon.svg" alt="back" />
        </button>

        <div className="food-comments-header__info">
            <h2 className="food-comments-header__title" title={title}>
            {title}
            </h2>
            <span className="food-comments-header__count">
                ثبت نظر و امتیاز
                <span className="count-highlight">({toPersianDigits(approvedCount)} نظر)</span>
            </span>
        </div>

        <img
            src={imageUrl || "/images/food/food-placeholder.png"}
            alt=""
            className="food-comments-header__img"
        />
        </div>
    );
}