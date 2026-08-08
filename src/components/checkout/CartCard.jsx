import React, { useState } from "react";
import OptionRow from "./OptionRow";
import AddonsEditModal from "./AddonsEditModal";
import { toPersianDigits } from "../../utils/persianNumbers";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function CartCard({ item, onChangeQty }) {
  const [addonsModalOpen, setAddonsModalOpen] = useState(false);

  return (
    <div className="cart-card-wrap">
      <div className="cart-card">
        <div className="cart-header">
          <img src={item.img} alt={item.title} className="product-img" />
          <div className="cart-info">
            <div className="product-title rating">
              <h3 className="product-title">{item.title}</h3>
              <div className="rating-score">
                <img src="/images/checkout-star.svg" alt="star rating" />
                <strong>{toPersianDigits(Number(item.rating.score || 0).toFixed(1))}</strong>
                <span>({toPersianDigits(formatIR(item.rating.count))})</span>
              </div>
            </div>
          </div>
        </div>
        <div className="option-group">
          {item.options.map((opt) => (
            <OptionRow key={opt.id} itemId={item.id} option={opt} onChangeQty={onChangeQty} />
          ))}
        </div>
      </div>

      {item.hasAddons && (
        <button
          type="button"
          className="cart-card-extra"
          onClick={() => setAddonsModalOpen(true)}
          style={{ border: "none", cursor: "pointer" }}
        >
          <img src="/images/checkout-extras.svg" alt="food options svg" />
          با مخلفات
        </button>
      )}

      <AddonsEditModal open={addonsModalOpen} onClose={() => setAddonsModalOpen(false)} />
    </div>
  );
}