// src/components/shop/MenuItem.jsx
import React from "react";

// 1. The component now accepts 'onSelectItem' as a prop
function MenuItem({ item, onSelectItem }) {
  const { name, description, price, imageUrl } = item;

  return (
    <div className="item">
      <img src={imageUrl} alt={name} className="item-image" />
      <div className="item-info">
        <h2 className="item-name">{name}</h2>
        <p className="item-description">{description}</p>
      </div>
      <div className="add-to-cart">
        <button className="add-btn" onClick={() => onSelectItem(item)}>
          +
        </button>
        <p className="item-price">
          {price} <span className="currency">تومان</span>
        </p>
      </div>
    </div>
  );
}

export default MenuItem;
