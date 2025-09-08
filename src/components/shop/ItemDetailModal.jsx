import React, { useState, useEffect } from "react";

function ItemDetailModal({ item, onClose }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (item) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [item]);

  const handleClose = () => {
    setIsActive(false);

    const timer = setTimeout(() => {
      onClose();
    }, 350);
    return () => clearTimeout(timer);
  };

  if (!item) {
    return null;
  }

  return (
    <>
      <div
        className={`modal-backdrop ${isActive ? "active" : ""}`}
        onClick={handleClose}
      ></div>

      <div className={`bottom-modal ${isActive ? "active" : ""}`}>
        <div className="modal-content">
          <div className="modal-hero">
            <img
              src={`http://localhost:5096${item.imageUrl}`}
              alt={item.name}
              className="modal-hero-img"
            />
            <div className="modal-info-panel">
              <div className="modal-info-top">
                <p className="modal-category">
                  <i className="fas fa-layer-group"></i>{" "}
                  {item.categoryTitle ?? "—"}
                </p>
                <div>
                  <h2 className="modal-title">{item.name}</h2>
                  <p className="modal-subtitle">{item.ingredients}</p>
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
                  <span>{item.rating.toFixed(1)}</span>
                  <span className="modal-reviews">
                    ({item.voters.toLocaleString("fa-IR")})
                  </span>
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
