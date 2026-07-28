// src/components/orders/ContinueShopping.jsx
import React from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const ContinueShopping = () => {
  useDocumentTitle("سفارش");
  // Mock data using mocha.jpg
  const orderItems = [
    { id: 1, image: "/images/mocha.jpg", quantity: 13 },
    { id: 2, image: "/images/mocha.jpg", quantity: 21 },
    { id: 3, image: "/images/mocha.jpg", quantity: 2 },
    { id: 4, image: "/images/mocha.jpg", quantity: 1 },
    // Adding 9 more items to test the "+9" logic (Total 13 items)
    ...Array.from({ length: 9 }).map((_, index) => ({
      id: index + 5,
      image: "/images/mocha.jpg",
      quantity: 1,
    })),
  ];

  // Logic for displaying exactly 4 items and the remaining count box
  const maxVisible = 4;
  const visibleItems = orderItems.slice(0, maxVisible);
  const remainingCount = orderItems.length - maxVisible;

  return (
    <div dir="rtl" className="continue-shopping-container">
      {/* Header Section */}
      <div className="cs-header">
        <div className="cs-logo-wrapper">
          <img
            src="/images/menu-logo.jpg"
            alt="Menu Logo"
            className="cs-logo"
          />
        </div>
        <div className="cs-header-text">
          <h2 className="cs-title">ادامه خرید از - منرو</h2>
          <span className="cs-date">یکشنبه ۱۲ شهریور - ۱۸:۰۰</span>
        </div>
      </div>

      {/* Images Row (Fixed, no scrolling) */}
      <div className="cs-images-row">
        {visibleItems.map((item) => (
          <div key={item.id} className="cs-image-wrapper">
            <img src={item.image} alt="Order Item" className="cs-item-image" />
            <span className="cs-badge">{item.quantity}</span>
          </div>
        ))}

        {/* Render the black "+(n)" box ONLY if there are remaining items */}
        {remainingCount > 0 && (
          <div className="cs-more-items">+{remainingCount}</div>
        )}
      </div>

      {/* Total Order Amount */}
      <div className="cs-total-section">
        <span className="cs-total-label">مجموع سفارش</span>
        <div className="cs-total-value">
          <span className="cs-price">۲۴۰,۰۰۰</span>
          <span className="cs-currency">تومان</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="cs-actions">
        <button className="cs-btn cs-btn-delete">حذف سبد</button>
        <button className="cs-btn cs-btn-continue">ادامه خرید</button>
      </div>
    </div>
  );
};

export default ContinueShopping;
