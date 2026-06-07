import React from "react";

const toPersianNum = (num) => Number(num).toLocaleString("fa-IR");

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 3L4.5 8.5L2 6"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="#ff623d"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
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
          <StarIcon />
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
                    <span className="currency">تومان</span>
                  </span>
                )}
              </div>
            </div>

            {/* Sub-items (Addons) */}
            {variant.addons.map((addon) => (
              <div key={addon.id} className="bill-row addon-row">
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
                      <span className="currency">تومان</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* 3. Total Section */}
      <div className="bill-card__total">
        <span className="total-label">مجموعا</span>
        <div className="bill-card__total">
          <span className="total-label">مجموعا</span>
          <div className="bill-row__details">
            <span className="bill-row__price total-price">
              {toPersianNum(item.totalPrice)}{" "}
              <span className="currency">تومان</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
