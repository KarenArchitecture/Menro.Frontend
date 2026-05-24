// components/checkout/CheckoutHeader.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

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
      <div className="back-btn" onClick={() => navigate(-1)}>
        <svg
          width="29"
          height="29"
          viewBox="0 0 29 29"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1"
            y="1"
            width="26.9811"
            height="26.9811"
            rx="13.4906"
            fill="#222B3A"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M12.1448 7.30751C12.0065 7.25817 11.8598 7.23664 11.7132 7.24413C11.4187 7.2613 11.143 7.39443 10.9465 7.61438C10.7483 7.83296 10.6448 8.1212 10.6587 8.41594C10.6725 8.71068 10.8027 8.98791 11.0206 9.1869L17.4914 15.0544L11.0206 20.9154C10.8027 21.1144 10.6725 21.3916 10.6587 21.6863C10.6448 21.9811 10.7483 22.2693 10.9465 22.4879C11.1443 22.707 11.4209 22.8388 11.7157 22.8543C12.0104 22.8698 12.2993 22.7678 12.519 22.5707L19.9046 15.8777C20.02 15.7731 20.1123 15.6456 20.1754 15.5032C20.2385 15.3609 20.2711 15.2069 20.2711 15.0511C20.2711 14.8954 20.2385 14.7414 20.1754 14.5991C20.1123 14.4567 20.02 14.3291 19.9046 14.2246L12.519 7.53161C12.4102 7.433 12.283 7.35684 12.1448 7.30751Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}
