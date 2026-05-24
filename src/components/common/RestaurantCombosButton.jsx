import React from "react";

export default function RestaurantCombosButton() {
  return (
    <button
      id="restaurant-combos-button"
      className="combos-entry-card"
      type="button"
      // onClick={...}
    >
      <div className="combos-entry-icon" aria-hidden="true">
        <img src="/images/combos-icon.svg" alt="Hamburger and Drink Icon" />
      </div>

      <div className="combos-entry-text">
        <div className="combos-entry-title">ترکیب ها</div>
        <div className="combos-entry-subtitle">
          ترکیبشو با محصولای دیگه امتحان کن
        </div>
      </div>
    </button>
  );
}
