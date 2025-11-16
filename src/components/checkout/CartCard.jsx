import React from "react";
import OptionRow from "./OptionRow";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function CartCard({ item, onChangeQty }) {
  return (
    <div className="cart-card-wrap">
      <div className="cart-card">
        <div className="cart-header">
          <img
            src="/images/checkout-pic.png"
            alt={item.title}
            className="product-img"
          />
          <div className="cart-info">
            <div className="product-title rating">
              <h3 className="product-title">{item.title}</h3>
              <div className="rating-score">
                <img src="/images/checkout-star.svg" alt="star rating" />
                <strong>{item.rating.score}</strong>
                <span>({formatIR(item.rating.count)})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="option-group">
          {item.options.map((opt) => (
            <OptionRow
              key={opt.id}
              itemId={item.id}
              option={opt}
              onChangeQty={onChangeQty}
            />
          ))}
        </div>
      </div>

      {/* pill is now sibling, not child */}
      <div className="cart-card-extra">
        <img src="/images/checkout-extras.svg" alt="food options svg" />
        با مخلفات
      </div>
    </div>
  );
}
