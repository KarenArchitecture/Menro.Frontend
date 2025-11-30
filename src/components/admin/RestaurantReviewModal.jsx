// src/components/admin/RestaurantReviewModal.jsx
import { useEffect, useState } from "react";
import { getRestaurantDetails } from "../../api/adminRestaurants";

export default function RestaurantReviewModal({
  open,
  restaurantId,
  onClose,
  onApprove,
  onReject,
}) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Fetch restaurant details on open
  useEffect(() => {
    if (!open || !restaurantId) return;

    setLoading(true);

    getRestaurantDetails(restaurantId)
      .then((res) => {
        setRestaurant(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, restaurantId]);

  if (!open) return null;

  // modal close by clicking outside
  const handleOverlayClick = (e) => {
    if (e.target.id === "restaurant-review-modal") {
      onClose?.();
    }
  };

  const handleRejectClick = () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      setRejectError("");
      return;
    }

    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError("ثبت توضیح برای رد الزامی است.");
      return;
    }

    setRejectError("");
    onReject?.(restaurantId, trimmed);
  };

  const handleApproveOrBack = () => {
    if (showRejectInput) {
      setShowRejectInput(false);
      setRejectReason("");
      setRejectError("");
      return;
    }

    onApprove?.(restaurantId);
  };

  return (
    <div
      id="restaurant-review-modal"
      className="modal-overlay"
      style={{ display: "flex" }}
      onClick={handleOverlayClick}
    >
      <div className="modal-content" style={{ maxWidth: 820 }}>
        <div className="modal-header">
          <h3>
            بررسی درخواست ثبت رستوران
            {restaurant?.name ? ` — ${restaurant.name}` : ""}
          </h3>
          <button className="btn btn-icon" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="modal-body">
          {loading && <div className="empty-hint">در حال بارگذاری...</div>}

          {!loading && restaurant && (
            <>
              {/* Meta fields */}
              <div
                className="restaurant-meta"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <strong>نام رستوران:</strong> {restaurant.name}
                </div>
                <div>
                  <strong>نوع رستوران:</strong> {restaurant.type}
                </div>

                <div>
                  <strong>آدرس:</strong> {restaurant.address}
                </div>
                <div>
                  <strong>ساعات فعالیت:</strong> {restaurant.workingHours}
                </div>

                <div>
                  <strong>نام مالک:</strong> {restaurant.ownerName}
                </div>
                <div>
                  <strong>شماره موبایل:</strong> {restaurant.ownerPhoneNumber}
                </div>

                <div>
                  <strong>کد ملی:</strong> {restaurant.ownerNationalId}
                </div>
                <div>
                  <strong>شماره حساب:</strong> {restaurant.ownerBankAccount}
                </div>

                <div>
                  <strong>تاریخ ثبت:</strong> {restaurant.createdAt}
                </div>
              </div>

              {/* Description */}
              <div
                className="restaurant-description"
                style={{ marginBottom: 8 }}
              >
                <strong>توضیحات رستوران:</strong>
                <div
                  style={{
                    marginTop: 6,
                    padding: 10,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {restaurant.description || "توضیحات ثبت نشده"}
                </div>
              </div>
            </>
          )}
        </div>

        {/* footer */}
        {!loading && restaurant && !restaurant.isApproved && (
          <div
            className="modal-footer"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {showRejectInput && (
              <div style={{ width: "100%" }}>
                <input
                  type="text"
                  placeholder="دلیل رد را بنویسید..."
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError && e.target.value.trim()) {
                      setRejectError("");
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(248,113,113,0.6)",
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    fontSize: 14,
                  }}
                />
                {rejectError && (
                  <div
                    className="restaurant-reject-error"
                    style={{ marginTop: 8, color: "#f88" }}
                  >
                    {rejectError}
                  </div>
                )}
              </div>
            )}

            <div
              className="modal-footer-buttons"
              style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}
            >
              {onApprove && (
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleApproveOrBack}
                >
                  {showRejectInput ? "برگشت" : "تایید"}
                </button>
              )}

              {onReject && (
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={handleRejectClick}
                >
                  {showRejectInput ? "ثبت رد" : "رد"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
