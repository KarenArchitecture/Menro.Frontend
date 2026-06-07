// src/components/orders/PreviousOrderCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RatingModal from "../common/RatingModal";

const PreviousOrderCard = ({ order }) => {
  const {
    id, // Ensure we extract ID for routing and logging
    restaurantName,
    orderTypeTag,
    date,
    logo,
    items = [],
    totalPrice,
    rating: initialRating, // rename prop to initialize state
  } = order;

  const navigate = useNavigate();

  // State for modal visibility and the current rating
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState(initialRating);

  // Logic for displaying exactly 3 items and the "View Bill" box
  const maxVisible = 3;
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount =
    items.length > maxVisible ? items.length - maxVisible : 0;

  // Handle routing to the bill page
  const handleViewBillClick = () => {
    // Adjust this route to match your actual App.jsx routes
    navigate(`/orders/bill/${id}`);
  };

  // Handle rating submission from the modal
  const handleRateSubmit = (selectedRating) => {
    console.log(`Submitted rating: ${selectedRating} for order ${id}`);

    // 1. Send the rating to your backend here (e.g., axios.post)

    // 2. Update local state so the UI immediately switches to the rated view
    setCurrentRating(selectedRating);
  };

  return (
    <div dir="rtl" className="po-container">
      {/* Header Section */}
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

      {/* Images & View Bill Row */}
      <div className="po-images-row">
        {visibleItems.map((item) => (
          <div key={item.id} className="po-image-wrapper">
            <img src={item.image} alt="Order Item" className="po-item-image" />
            <span className="po-badge">{item.quantity}</span>
          </div>
        ))}

        {/* View Bill Button (Flexes to fill remaining space) */}
        <button className="po-view-bill-btn" onClick={handleViewBillClick}>
          {remainingCount > 0 && (
            <span className="po-view-bill-count">+{remainingCount}</span>
          )}
          <span className="po-view-bill-text">مشاهده فاکتور</span>
        </button>
      </div>

      {/* Total Order Amount */}
      <div className="po-total-section">
        <span className="po-total-label">مجموع سفارش</span>
        <div className="po-total-value">
          <span className="po-price">{totalPrice.toLocaleString()}</span>
          <span className="po-currency">تومان</span>
        </div>
      </div>

      {/* Action / Rating Section */}
      {currentRating === null || currentRating === undefined ? (
        <button className="po-rate-btn" onClick={() => setIsModalOpen(true)}>
          <span>به منرو امتیاز دهید</span>
          <span>ثبت امتیاز</span>
        </button>
      ) : (
        <div className="po-rated-box">
          <span className="po-rated-text">امتیاز شما به منرو</span>
          <div className="po-stars">
            {/* Renders 5 stars, filling them based on the currentRating */}
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
        </div>
      )}

      {/* Rating Modal Wrapper */}
      <RatingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRateSubmit}
        restaurantName={restaurantName}
      />
    </div>
  );
};

// --- EXPORTING A MOCK LIST TO TEST BOTH STATES ---
export default function PreviousOrdersList() {
  // Mock data representing the two cards in your screenshot
  const mockOrders = [
    {
      id: "ord-1",
      restaurantName: "منرو",
      orderTypeTag: "بیرون‌بر ۲۶۳",
      date: "یکشنبه ۱۲ شهریور - ۱۸:۰۰",
      logo: "/images/menu-logo.jpg", // Using your existing logo
      items: [
        { id: 1, image: "/images/mocha.jpg", quantity: 13 },
        { id: 2, image: "/images/mocha.jpg", quantity: 2 },
        { id: 3, image: "/images/mocha.jpg", quantity: 21 },
        ...Array.from({ length: 10 }).map((_, i) => ({
          id: i + 4,
          image: "/images/mocha.jpg",
          quantity: 1,
        })),
      ],
      totalPrice: 240000,
      rating: null, // Unrated state
    },
    {
      id: "ord-2",
      restaurantName: "منرو",
      orderTypeTag: null,
      date: "یکشنبه ۱۲ شهریور - ۱۸:۰۰",
      logo: "/images/menu-logo.jpg",
      items: [
        { id: 1, image: "/images/mocha.jpg", quantity: 13 },
        { id: 2, image: "/images/mocha.jpg", quantity: 2 },
        { id: 3, image: "/images/mocha.jpg", quantity: 21 },
        ...Array.from({ length: 13 }).map((_, i) => ({
          id: i + 4,
          image: "/images/mocha.jpg",
          quantity: 1,
        })),
      ],
      totalPrice: 2040000,
      rating: 4, // Rated state (4 out of 5 stars)
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "2rem",
      }}
    >
      {mockOrders.map((order) => (
        <PreviousOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
