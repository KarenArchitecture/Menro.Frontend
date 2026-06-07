// src/components/orders/RatingModal.jsx
import React, { useState, useEffect } from "react";
import "../../assets/css/rating-modal.css";

const RatingModal = ({
  isOpen,
  onClose,
  onSubmit,
  restaurantName = "منرو",
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // If the parent forces it closed (or on initial load), make sure isClosing is reset
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Intercept the close action to play the animation first
  const handleClose = () => {
    setIsClosing(true);
    // Wait for the CSS animation to finish (300ms) before actually unmounting
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      // Optional: reset rating on close
      // setRating(0);
    }, 300);
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking exactly on the overlay, and prevent double-clicks while closing
    if (e.target.classList.contains("rm-overlay") && !isClosing) {
      handleClose();
    }
  };

  const handleSubmit = () => {
    if (rating > 0 && !isClosing) {
      onSubmit(rating);
      setRating(0);
      handleClose();
    }
  };

  // If not open and not currently animating out, render nothing
  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`rm-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div className={`rm-container ${isClosing ? "closing" : ""}`}>
        {/* Header */}
        <div className="rm-header">
          <img
            src="/images/rating-header-stars.svg"
            alt="Stars"
            className="rm-header-icon"
          />
          <h3>به رستوران {restaurantName} چه امتیازی می‌دهید؟</h3>
        </div>

        {/* Stars Section */}
        <div className="rm-stars-container">
          {[1, 2, 3, 4, 5].map((star, index) => {
            const isActive = star <= (hover || rating);
            const persianNumbers = ["۱", "۲", "۳", "۴", "۵"];

            return (
              <div
                key={star}
                className="rm-star-wrapper"
                onMouseEnter={() => !isClosing && setHover(star)}
                onMouseLeave={() => !isClosing && setHover(0)}
                onClick={() => !isClosing && setRating(star)}
              >
                <i
                  className={`fa-star rm-star ${
                    isActive ? "fa-solid active" : "fa-regular inactive"
                  }`}
                ></i>
                <span
                  className={`rm-star-number ${isActive ? "active-num" : "inactive-num"}`}
                >
                  {persianNumbers[index]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          className={`rm-submit-btn ${rating > 0 ? "active" : "disabled"}`}
          onClick={handleSubmit}
          disabled={rating === 0 || isClosing}
        >
          ثبت امتیاز
        </button>
      </div>
    </div>
  );
};

export default RatingModal;
