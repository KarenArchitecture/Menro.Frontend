import React from "react";
import OptionRow from "./OptionRow";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function CartCard({ item, onChangeQty }) {
  return (
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
              <svg
                width="19"
                height="20"
                viewBox="0 0 19 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.8912 2.25889L12.5254 5.52746C12.7483 5.98246 13.3426 6.41889 13.844 6.50246L16.8062 6.9946C18.7004 7.31032 19.1462 8.6846 17.7812 10.0403L15.4783 12.3432C15.0883 12.7332 14.8747 13.4853 14.9954 14.0239L15.6547 16.8746C16.1747 19.131 14.9769 20.0039 12.9804 18.8246L10.204 17.181C9.70258 16.8839 8.87615 16.8839 8.36544 17.181L5.58901 18.8246C3.60187 20.0039 2.39472 19.1217 2.91472 16.8746L3.57401 14.0239C3.69472 13.4853 3.48115 12.7332 3.09115 12.3432L0.788294 10.0403C-0.56742 8.6846 -0.130991 7.31032 1.76329 6.9946L4.72544 6.50246C5.21758 6.41889 5.81187 5.98246 6.03472 5.52746L7.66901 2.25889C8.56044 0.485318 10.009 0.485318 10.8912 2.25889Z"
                  fill="#D17842"
                />
              </svg>
              <strong>{item.rating.score}</strong>
              <span>({formatIR(item.rating.count)})</span>
            </div>
          </div>
          <p className="product-subtext">{item.subtext}</p>
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
  );
}
