// src/components/orders/PreviousOrderCard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RatingModal from "../common/RatingModal";
import { getMyRestaurantRating, submitRestaurantRating } from "../../api/restaurantRating";
import { showError, showSuccess } from "../../utils/toast";

const PreviousOrderCard = ({ order }) => {
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
  const [currentRating, setCurrentRating] = useState(null);
  const [loadingRating, setLoadingRating] = useState(true);

  useEffect(() => {
    if (!restaurantId) {
      setLoadingRating(false);
      return;
    }
    let cancelled = false;

    getMyRestaurantRating(restaurantId)
      .then((res) => {
        if (!cancelled) setCurrentRating(res?.myScore ?? null);
      })
      .catch(() => {
        if (!cancelled) setCurrentRating(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingRating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const maxVisible = 3;
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length > maxVisible ? items.length - maxVisible : 0;

  const handleViewBillClick = () => {
    navigate(`/orders/bill/${id}`);
  };

  const handleRateSubmit = async (selectedRating) => {
    if (!restaurantId) {
      showError("امکان ثبت امتیاز برای این سفارش وجود ندارد.");
      return;
    }

    try {
      const result = await submitRestaurantRating(restaurantId, selectedRating);
      setCurrentRating(result?.myScore ?? selectedRating);
      showSuccess("امتیاز شما با موفقیت ثبت شد.");
    } catch (err) {
      showError(err?.response?.data?.message || "خطا در ثبت امتیاز رستوران.");
    }
  };

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

      {!loadingRating && (
        currentRating === null || currentRating === undefined ? (
          <button className="po-rate-btn" onClick={() => setIsModalOpen(true)}>
            <span>به {restaurantName} امتیاز دهید</span>
            <span>ثبت امتیاز</span>
          </button>
        ) : (
          <button className="po-rated-box" onClick={() => setIsModalOpen(true)}>
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
        )
      )}

      <RatingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRateSubmit}
        restaurantName={restaurantName}
      />
    </div>
  );
};

export function PreviousOrdersList({ orders }) {
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
        <PreviousOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}