// src/components/home/SearchEmptyState.jsx
import React from "react";
import "../../assets/css/search-empty-state.css";

export default function SearchEmptyState() {
  return (
    <div className="search-empty" role="status">
      <div className="search-empty__visual">
        <img
          className="search-empty__img"
          src="/images/basket.png"
          alt=""
          aria-hidden="true"
        />
      </div>

      <p className="search-empty__title">
        <span className="search-empty__accent">نتیجه‌ای</span> یافت نشد...
      </p>
    </div>
  );
}