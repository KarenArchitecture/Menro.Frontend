// src/components/orders/PreviousOrderCard.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RatingModal from "../common/RatingModal";
import SafeImage from "../common/SafeImage";
import useFittingCount from "../../hooks/useFittingCount";
import { toPersianDigits } from "../../utils/persianNumbers";

const LOGO_FALLBACK = "/images/restaurant/logo-placeholder.png";
const FOOD_FALLBACK = "/images/food/food-placeholder.png";

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
  const rowRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // تعداد تصاویری که کنار دکمه‌ی «مشاهده فاکتور» جا می‌شوند؛ بقیه به‌صورت +n
  const fitCount = useFittingCount(rowRef, { total: items.length });
  const visibleItems = items.slice(0, fitCount);
  const remainingCount = items.length - visibleItems.length;

  const hasRated = currentRating !== null && currentRating !== undefined;

  // رای داخل کارت ذخیره نمی‌شود؛ فقط به OrdersPage اطلاع می‌دهیم
  const handleRateSubmit = (selectedRating) => {
    onRate?.(restaurantId, selectedRating);
  };

  return (
    <div dir="rtl" className="po-container">
      <div className="po-header">
        <div className="po-logo-wrapper">
          <SafeImage
            src={logo}
            fallback={LOGO_FALLBACK}
            alt={restaurantName}
            className="po-logo"
          />
        </div>
        <div className="po-header-text">
          <h2 className="po-title">
            {restaurantName}
            {orderTypeTag && <span className="po-tag">{orderTypeTag}</span>}
          </h2>
          <span className="po-date">{date}</span>
        </div>
      </div>

      <div className="po-images-row" ref={rowRef}>
        {visibleItems.map((item) => (
          <div key={item.id} className="po-image-wrapper">
            <SafeImage
              src={item.image}
              fallback={FOOD_FALLBACK}
              alt=""
              className="po-item-image"
            />
            <span className="po-badge">{toPersianDigits(item.quantity)}</span>
          </div>
        ))}

        <button
          type="button"
          className="po-view-bill-btn"
          onClick={() => navigate(`/orders/bill/${id}`)}
        >
          {remainingCount > 0 && (
            <span className="po-view-bill-count">
              +{toPersianDigits(remainingCount)}
            </span>
          )}
          <span className="po-view-bill-text">مشاهده فاکتور</span>
        </button>
      </div>

      <div className="po-total-section">
        <span className="po-total-label">مجموع سفارش</span>
        <div className="po-total-value">
          <span className="po-price">{totalPrice.toLocaleString("fa-IR")}</span>
          <span className="po-currency">تومان</span>
        </div>
      </div>

      {!hasRated ? (
        <button
          type="button"
          className="po-rate-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <span>به {restaurantName} امتیاز دهید</span>
          <span>ثبت امتیاز</span>
        </button>
      ) : (
        // قابل کلیک است تا کاربر هر وقت خواست رایش را اصلاح کند
        <button
          type="button"
          className="po-rated-box"
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
    <div className="po-list">
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