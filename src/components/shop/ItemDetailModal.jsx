// src/components/shop/ItemDetailModal.jsx
import React, { useState, useEffect } from "react";

// This is the complete and final modal component.
// It now handles its own animation to ensure it's always smooth.
function ItemDetailModal({ item, onClose }) {
  // Internal state to control the 'active' class for the CSS transition.
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // When the 'item' prop is provided, we trigger the slide-in animation.
    // The timeout ensures that the component is mounted in the DOM before the
    // 'active' class is added, which allows the CSS transition to play.
    if (item) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 10); // A tiny delay is all that's needed.
      return () => clearTimeout(timer);
    }
  }, [item]);

  // This function handles closing the modal.
  const handleClose = () => {
    // 1. Remove the 'active' class to trigger the slide-out animation.
    setIsActive(false);

    // 2. Wait for the animation to finish (350ms, matching your CSS)
    //    before calling the parent's onClose function to remove the component.
    const timer = setTimeout(() => {
      onClose();
    }, 350);
    return () => clearTimeout(timer);
  };

  // If there's no item, we render nothing.
  if (!item) {
    return null;
  }

  return (
    <>
      {/* The backdrop fades in and out with the modal */}
      <div
        className={`modal-backdrop ${isActive ? "active" : ""}`}
        onClick={handleClose}
      ></div>

      {/* The modal slides up and down based on the 'active' class */}
      <div className={`bottom-modal ${isActive ? "active" : ""}`}>
        <div className="modal-content">
          <div className="modal-hero">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="modal-hero-img"
            />
            <div className="modal-info-panel">
              <div className="modal-info-top">
                <p className="modal-category">
                  <i className="fas fa-mug-hot"></i> نوشیدنی گرم
                </p>
                <div>
                  <h2 className="modal-title">{item.name}</h2>
                  <p className="modal-subtitle">{item.description}</p>
                </div>
              </div>
              <div className="modal-icons">
                <div className="modal-details-icons">
                  <div className="modal-icon">
                    <i className="fas fa-layer-group"></i>
                    <span>ترکیب‌ها</span>
                  </div>
                  <div className="modal-icon">
                    <i className="fas fa-heart"></i>
                    <span>علاقه‌مندی</span>
                  </div>
                </div>
                <div className="modal-rating">
                  <i className="fas fa-star"></i>
                  <span>4.5</span>
                  <span className="modal-reviews">(6,879)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <p className="section-label">نوع</p>
            <div className="size-options">
              <button className="size-btn">کوچک</button>
              <button className="size-btn">متوسط</button>
              <button className="size-btn">بزرگ</button>
            </div>
          </div>

          <div className="modal-footer">
            <div className="price">
              <span className="amount">{item.price}</span>
              <span className="currency">تومان</span>
            </div>
            <button className="add-to-cart-btn">اضافه به سبد خرید</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ItemDetailModal;
