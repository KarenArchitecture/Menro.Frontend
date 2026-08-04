// components/checkout/CheckoutHeader.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import BackIcon from "../icons/BackIcon";

export default function CheckoutHeader() {
  const navigate = useNavigate();

  return (
    <div className="checkout-header">
      <div className="checkout-cart">
        <h2>سبد خرید</h2>
        <img
          src="/images/checkout-bag-hollow.svg"
          alt="checkout-icon"
          className="checkout-icon"
        />
      </div>

      {/* Back button (full path) */}
      <button
        type="button"
        className="back-btn"
        onClick={() => navigate(-1)}
        aria-label="بازگشت"
      >
        <BackIcon />
      </button>
    </div>
  );
}
