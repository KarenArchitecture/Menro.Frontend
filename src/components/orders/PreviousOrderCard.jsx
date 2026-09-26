// src/components/orders/PreviousOrderCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RatingModal from "../common/RatingModal";

const PreviousOrderCard = ({ order, currentRating = null, onRate }) => {
  const {
    id,
    restaurantId,
    restaurantName,
    orderTypeTag,
    date,
    logo,
    items = [],
    totalPrice,
  } = order;

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const maxVisible = 3;
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount =
    items.length > maxVisible ? items.length - maxVisible : 0;

  const handleViewBillClick = () => {
    navigate(`/orders/bill/${id}`);
  };

  // 🔧 دیگه رای رو داخل کارت ذخیره نمی‌کنیم — فقط به بالادستی (OrdersPage)
  // اطلاع می‌دیم که چه امتیازی برای این رستوران ثبت شده
  const handleRateSubmit = (selectedRating) => {
    onRate?.(restaurantId, selectedRating);
  };

  const hasRated = currentRating !== null && currentRating !== undefined;

  return (
    <div dir="rtl" className="po-container">
      <div className="po-header">
        <div className="po-logo-wrapper">
          <img src={logo} alt={restaurantName} className="po-logo" />
        </div>
        <div className="po-header-text">
          <h2 className="po-title">
            {restaurantName}
            {orderTypeTag && <span className="po-tag">{orderTypeTag}</span>}
          </h2>
          <span className="po-date">{date}</span>
        </div>
      </div>

      <div className="po-images-row">
        {visibleItems.map((item) => (
          <div key={item.id} className="po-image-wrapper">
            <img src={item.image} alt="Order Item" className="po-item-image" />
            <span className="po-badge">{item.quantity}</span>
          </div>
        ))}

        <button className="po-view-bill-btn" onClick={handleViewBillClick}>
          {remainingCount > 0 && (
            <span className="po-view-bill-count">+{remainingCount}</span>
          )}
          <span className="po-view-bill-text">مشاهده فاکتور</span>
        </button>
      </div>

      <div className="po-total-section">
        <span className="po-total-label">مجموع سفارش</span>
        <div className="po-total-value">
          <span className="po-price">{totalPrice.toLocaleString()}</span>
          <span className="po-currency">تومان</span>
        </div>
      </div>

      {!hasRated ? (
        <button className="po-rate-btn" onClick={() => setIsModalOpen(true)}>
          <span>به {restaurantName} امتیاز دهید</span>
          <span>ثبت امتیاز</span>
        </button>
      ) : (
        // 🔧 حالا قابل کلیک هست تا کاربر بتونه هر وقت خواست رایش رو اصلاح کنه
        <button
          type="button"
          className="po-rated-box po-rated-box--editable"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="po-rated-text">امتیاز شما به {restaurantName}</span>
          <div className="po-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={
                  star <= currentRating
                    ? "fa-solid fa-star po-star-filled"
                    : "fa-regular fa-star po-star-empty"
                }
              ></i>
            ))}
          </div>
        </button>
      )}

      <RatingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRateSubmit}
        restaurantName={restaurantName}
        initialRating={currentRating || 0}
      />
    </div>
  );
};

export function PreviousOrdersList({ orders, ratingsByRestaurant = {}, onRate }) {
  if (!orders?.length) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "2rem",
      }}
    >
      {orders.map((order) => (
        <PreviousOrderCard
          key={order.id}
          order={order}
          currentRating={ratingsByRestaurant[order.restaurantId] ?? null}
          onRate={onRate}
        />
      ))}
    </div>
  );
}

export default PreviousOrderCard;