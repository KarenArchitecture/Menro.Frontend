// components/checkout/OptionRow.jsx
import React from "react";
const f = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function OptionRow({ itemId, option, onChangeQty }) {
  const inc = () => onChangeQty(itemId, option.id, +1);
  const dec = () => onChangeQty(itemId, option.id, -1);
  const lineTotal = (option.qty || 0) * option.unitPrice;

  return (
    <div className="option-row">
      <div className="qty-option">
        <div className="option-box">{option.title}</div>

        <div className="qty-controller">
          <button className="qty-btn plus" type="button" onClick={inc}>
            +
          </button>
          <div className="qty-value">{option.qty || 0}</div>
          <button className="qty-btn minus" type="button" onClick={dec}>
            −
          </button>
        </div>
      </div>

      <div className="price-option">
        <div className="price">
          <strong>{f(lineTotal)}</strong>
          <span>تومان</span>
        </div>
        <div className="weight">{option.weight}</div>
      </div>
    </div>
  );
}
