// src/components/admin/RestaurantsAdminSection.jsx
import React, { useEffect, useState } from "react";
import {
  getRestaurants,
  updateRestaurantStatus,
} from "../../api/adminRestaurants";
import RestaurantReviewModal from "./RestaurantReviewModal";

export default function RestaurantsAdminSection() {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const STATUS = {
    pending: 1,
    approved: 2,
    rejected: 3,
  };

  const [status, setStatus] = useState(STATUS.pending);

  const loadRestaurants = async (currentStatus = status) => {
    setLoading(true);
    try {
      const res = await getRestaurants(currentStatus);
      setRestaurants(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants(status);
  }, [status]);

  const handleApprove = async (id) => {
    try {
      await updateRestaurantStatus(id, STATUS.approved, null);
      setSelected(null);
      loadRestaurants(status);
    } catch (err) {
      console.error("Error approving restaurant:", err);
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await updateRestaurantStatus(id, STATUS.rejected, reason);
      setSelected(null);
      loadRestaurants(status);
    } catch (err) {
      console.error("Error rejecting restaurant:", err);
    }
  };

  return (
    <div className="panel orders-panel">
      <div className="view-header orders-header">
        <h3>مدیریت رستوران‌ها</h3>

        {/* TAB UI (بدون تغییر CSS) */}
        <div className="orders-tabs">
          <button
            className={`btn ${
              status === STATUS.pending ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => setStatus(STATUS.pending)}
          >
            رستوران‌های در انتظار تأیید
          </button>

          <button
            className={`btn ${
              status === STATUS.approved ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => setStatus(STATUS.approved)}
          >
            تایید شده‌ها
          </button>

          <button
            className={`btn ${
              status === STATUS.rejected ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => setStatus(STATUS.rejected)}
          >
            رد شده‌ها
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
                <span className="status-pill">
                  {r.status === STATUS.approved
                    ? "تایید شده"
                    : r.status === STATUS.rejected
                      ? "رد شده"
                      : "در انتظار تأیید"}
                </span>{" "}
              </div>
            </button>
          ))}
      </div>

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
