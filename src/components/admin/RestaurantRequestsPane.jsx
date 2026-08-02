// src/components/admin/RestaurantRequestsPane.jsx
import { useEffect, useState } from "react";
import {
  getRestaurants,
  updateRestaurantStatus,
} from "../../api/adminRestaurants";
import RestaurantDetailsModal from "./RestaurantDetailsModal";
import { useGlobalUI } from "../common/GlobalUI";

const STATUS = { pending: 1, approved: 2, rejected: 3 };

export default function RestaurantRequestsPane() {
  const { notify } = useGlobalUI();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(STATUS.pending);

  const loadRestaurants = async (currentStatus = status) => {
    setLoading(true);
    try {
      const res = await getRestaurants(currentStatus);
      setRestaurants(res.data);
    } catch (err) {
      console.error("Error loading restaurants:", err);
      notify({
        type: "error",
        message: "دریافت لیست رستوران‌ها با خطا مواجه شد",
      });
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
      setSelectedId(null);
      loadRestaurants(status);
      notify({ type: "success", message: "رستوران با موفقیت تایید شد" });
    } catch (err) {
      console.error("Error approving restaurant:", err);
      notify({ type: "error", message: "تایید رستوران با خطا مواجه شد" });
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await updateRestaurantStatus(id, STATUS.rejected, reason);
      setSelectedId(null);
      loadRestaurants(status);
      notify({ type: "success", message: "رستوران رد شد" });
    } catch (err) {
      console.error("Error rejecting restaurant:", err);
      notify({ type: "error", message: "رد رستوران با خطا مواجه شد" });
    }
  };

  return (
    <div className="panel orders-panel">
      <div className="view-header orders-header">
        <div className="orders-tabs">
          <button
            className={`btn ${status === STATUS.pending ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatus(STATUS.pending)}
          >
            در انتظار تأیید
          </button>
          <button
            className={`btn ${status === STATUS.approved ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatus(STATUS.approved)}
          >
            تایید شده‌ها
          </button>
          <button
            className={`btn ${status === STATUS.rejected ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setStatus(STATUS.rejected)}
          >
            رد شده‌ها
          </button>
        </div>
      </div>

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
              onClick={() => setSelectedId(r.id)}
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
                </span>
              </div>
            </button>
          ))}
      </div>

      <RestaurantDetailsModal
        restaurantId={selectedId}
        onClose={() => setSelectedId(null)}
        showReviewActions
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
