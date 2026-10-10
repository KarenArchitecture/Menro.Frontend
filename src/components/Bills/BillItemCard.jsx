import React from "react";

const toPersianNum = (num) =>
  Number(num).toLocaleString("fa-IR").replace(/٫/g, ".");

const CheckIcon = () => (
  <svg
    width="8"
    height="6"
    viewBox="0 0 8 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.75 3.44L2.36 5.05L6.66 0.75"
      stroke="#FAFAF4"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function BillItemCard({ item }) {
  return (
    <div className="bill-card" dir="rtl">
      {/* 1. Header Section */}
      <div className="bill-card__header">
        <div className="bill-card__image-wrapper">
          <img src={item.image} alt={item.title} className="bill-card__image" />
        </div>

        <div className="bill-card__info">
          <h3 className="bill-card__title">{item.title}</h3>
        </div>

        <div className="bill-card__rating">
          <img
            src="/images/checkout-star.svg"
            alt="rating"
            className="star-icon"
          />
          <span className="rating-score">{toPersianNum(item.rating)}</span>
          <span className="rating-count">({toPersianNum(item.reviews)})</span>
        </div>
      </div>

      {/* 2. Items List */}
      <div className="bill-card__items">
        {item.variants.map((variant) => (
          <React.Fragment key={variant.id}>
            {/* Main Category (Variant) */}
            <div className="bill-row variant-row">
              <span className="bill-row__name">{variant.name}</span>
              <div className="bill-row__details">
                {variant.quantity && (
                  <span className="bill-row__qty">
                    x{toPersianNum(variant.quantity)}
                  </span>
                )}
                {variant.price && (
                  <span className="bill-row__price">
                    {toPersianNum(variant.price)}{" "}
                    <span className="bill-currency">تومان</span>
                  </span>
                )}
              </div>
            </div>

            {/* Sub-items (Addons) */}
            {variant.addons?.map((addon) => (
              <div key={addon.id} className="bill-row bill-addon-row">
                <div className="addon-name-wrapper">
                  <span className="bill-row__name">{addon.name}</span>
                </div>
                <div className="bill-row__details">
                  {addon.quantity && (
                    <span className="bill-row__qty">
                      x{toPersianNum(addon.quantity)}
                    </span>
                  )}
                  {addon.price && (
                    <span className="bill-row__price">
                      {toPersianNum(addon.price)}{" "}
                      <span className="bill-currency">تومان</span>
                    </span>
                  )}
                  {/* Styled entirely via CSS now */}
                  <div className="addon-check-icon">
                    <CheckIcon />
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* 3. Total Section */}
      <div className="bill-card__total">
        <span className="total-label">مجموعا</span>
        <div className="bill-row__details">
          <span className="bill-row__price total-price">
            {toPersianNum(item.totalPrice)}{" "}
            <span className="bill-currency">تومان</span>
          </span>
        </div>
      </div>
    </div>
  );
}
