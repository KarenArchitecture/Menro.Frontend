import React from "react";

export default function Qty({ qty, onInc, onDec }) {
  return (
    <div className="qty-controller">
      <button type="button" className="qty-btn plus" onClick={onInc}>
        +
      </button>
      <div className="qty-value">{qty}</div>
      <button
        type="button"
        className="qty-btn minus"
        onClick={() => qty > 1 && onDec()}
        disabled={qty <= 1}
      >
        -
      </button>
    </div>
  );
}
