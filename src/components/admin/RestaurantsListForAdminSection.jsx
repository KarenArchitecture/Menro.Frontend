// src/components/admin/RestaurantsAdminSection.jsx
import React, { useEffect, useState } from "react";
import {
  getRestaurants,
  approveRestaurant,
  rejectRestaurant,
} from "../../api/adminRestaurants";
import RestaurantReviewModal from "./RestaurantReviewModal";

export default function RestaurantsAdminSection() {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [approvedTab, setApprovedTab] = useState(false); // false = pending, true = approved(history)
  const [loading, setLoading] = useState(false);

  // Load restaurants list from API
  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const res = await getRestaurants(approvedTab ? true : false);
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRestaurants();
  }, [approvedTab]);

  const handleApprove = async (id) => {
    try {
      await approveRestaurant(id);
      setSelected(null);
      loadRestaurants();
    } catch (err) {
      console.error("Error approving restaurant:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRestaurant(id);
      setSelected(null);
      loadRestaurants();
    } catch (err) {
      console.error("Error rejecting restaurant:", err);
    }
  };

  return (
    <div className="panel orders-panel">
      <div className="view-header orders-header">
        <h3>مدیریت رستوران‌ها</h3>

        <div className="orders-tabs">
          <button
            className={`btn ${!approvedTab ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setApprovedTab(false)}
          >
            رستوران‌های در انتظار تأیید
          </button>

          <button
            className={`btn ${approvedTab ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setApprovedTab(true)}
          >
            تایید شده‌ها
          </button>
        </div>
      </div>

      {/* list */}
      <div className="orders-list orders-list--vertical">
        {loading && <div className="empty-hint">در حال بارگذاری...</div>}

        {!loading && restaurants.length === 0 && (
          <div className="empty-hint">موردی یافت نشد.</div>
        )}

        {!loading &&
          restaurants.map((r) => (
            <button
              key={r.id}
              className="order-bar"
              onClick={() => setSelected(r.id)}
            >
              <div className="order-bar__info">
                <div className="order-bar__title">
                  <span className="order-code">{r.name}</span>
                </div>

                <div className="order-bar__meta">
                  <span>{r.ownerName}</span>
                  <span className="dot-sep">·</span>
                  <span>{r.phoneNumber}</span>
                  <span className="dot-sep">·</span>
                  <span>{r.createdAt}</span>
                </div>
              </div>

              <div className="order-bar__side">
                <span className={`status-pill`}>
                  {r.isApproved ? "تایید شده" : "در انتظار تأیید"}
                </span>
              </div>
            </button>
          ))}
      </div>

      {/* modal */}
      <RestaurantReviewModal
        open={Boolean(selected)}
        restaurantId={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
