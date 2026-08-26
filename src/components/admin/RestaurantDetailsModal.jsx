// src/components/admin/RestaurantDetailsModal.jsx
import { useEffect, useState } from "react";
import {
  getRestaurantProfileForAdmin,
  apiErrorMessage,
} from "../../api/adminRestaurants";
import { useGlobalUI } from "../common/GlobalUI";
import "../../assets/css/admin/admin-modal.css";

const STATUS = { pending: 1, approved: 2, rejected: 3 };

function toPersianDigits(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

function renderStars(average = 0) {
  const rounded = Math.round(average * 2) / 2;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let icon = "fa-regular fa-star";
    if (rounded >= i) icon = "fa-solid fa-star";
    else if (rounded >= i - 0.5) icon = "fa-solid fa-star-half-stroke";
    stars.push(<i key={i} className={`${icon} restaurant-mgmt__star`} />);
  }
  return stars;
}

/* ======================================================================
 * RestaurantDetailsModal
 * ----------------------------------------------------------------------
 * مودال مشترک «جزئیات رستوران» بین RestaurantsOverviewPane و
 * RestaurantRequestsPane.
 *
 * showReviewActions: caller اجازه‌ی نمایش دکمه‌های تایید/رد را می‌دهد
 * (فقط از RestaurantRequestsPane پاس داده می‌شود). حتی وقتی true باشد،
 * این دکمه‌ها فقط زمانی واقعاً نمایش داده می‌شوند که وضعیت واقعی رستوران
 * (که از سرور می‌آید) Pending باشد — یعنی caller نباید و نمی‌تواند
 * دکمه‌ی تایید را روی یک رستوران already-approved نشان بدهد.
 * ==================================================================== */
export default function RestaurantDetailsModal({
  restaurantId,
  onClose,
  showReviewActions = false,
  onApprove,
  onReject,
}) {
  const { notify } = useGlobalUI();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReasonDraft, setRejectReasonDraft] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!restaurantId) {
      setRestaurant(null);
      setShowRejectInput(false);
      setRejectReasonDraft("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    getRestaurantProfileForAdmin(restaurantId)
      .then((data) => {
        if (!cancelled) setRestaurant(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            apiErrorMessage(err, "دریافت اطلاعات رستوران با خطا مواجه شد."),
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  if (!restaurantId) return null;

  const canReview = showReviewActions && restaurant?.status === STATUS.pending;

  const handleApproveClick = async () => {
    setActionLoading(true);
    try {
      await onApprove(restaurantId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReasonDraft.trim()) {
      notify({ type: "warning", message: "لطفاً دلیل رد را وارد کنید." });
      return;
    }
    setActionLoading(true);
    try {
      await onReject(restaurantId, rejectReasonDraft.trim());
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="admin-modal-overlay"
      onClick={() => !actionLoading && onClose?.()}
    >
      <div
        className="admin-modal restaurant-mgmt__view-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal__header">
          <h3>
            <i className="fas fa-store" />
            اطلاعات رستوران
          </h3>
          <button
            className="btn-icon"
            onClick={onClose}
            disabled={actionLoading}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="admin-modal__body">
          {loading && <div className="empty-hint">در حال بارگذاری...</div>}
          {error && <span className="form-error">{error}</span>}

          {!loading && restaurant && (
            <>
              <div className="restaurant-mgmt__view-header">
                <div className="restaurant-mgmt__avatar restaurant-mgmt__avatar--lg">
                  {restaurant.logoImageUrl ? (
                    <img src={restaurant.logoImageUrl} alt={restaurant.name} />
                  ) : (
                    <i className="fas fa-store restaurant-mgmt__avatar-icon" />
                  )}
                </div>
                <div className="restaurant-mgmt__view-header-text">
                  <strong>{restaurant.name}</strong>
                  {restaurant.slug && (
                    <span className="restaurant-mgmt__muted">
                      menro.ir/restaurant/{restaurant.slug}
                    </span>
                  )}
                </div>
              </div>

              <div className="restaurant-mgmt__rating-row">
                <div className="restaurant-mgmt__stars">
                  {renderStars(restaurant.averageRating)}
                </div>
                <span className="restaurant-mgmt__rating-value">
                  {toPersianDigits((restaurant.averageRating || 0).toFixed(1))}
                </span>
                <span className="restaurant-mgmt__muted">
                  ({toPersianDigits(restaurant.votersCount || 0)} رای)
                </span>
              </div>

              {restaurant.status === STATUS.rejected &&
                restaurant.rejectReason && (
                  <div className="restaurant-mgmt__reject-banner">
                    <i className="fa-solid fa-circle-info" /> دلیل رد:{" "}
                    {restaurant.rejectReason}
                  </div>
                )}

              <div className="restaurant-mgmt__detail-grid">
                <div className="restaurant-mgmt__detail-item">
                  <span>دسته‌بندی</span>
                  <strong>{restaurant.categoryName || "—"}</strong>
                </div>
                <div className="restaurant-mgmt__detail-item">
                  <span>صاحب رستوران</span>
                  <strong>{restaurant.ownerName || "—"}</strong>
                </div>

                <div className="restaurant-mgmt__detail-item">
                  <span>شماره تماس</span>
                  <strong>{restaurant.phoneNumber || "—"}</strong>
                </div>
                <div className="restaurant-mgmt__detail-item">
                  <span>ساعت فعالیت</span>
                  <strong>{restaurant.workingHours || "—"}</strong>
                </div>

                <div className="restaurant-mgmt__detail-item restaurant-mgmt__detail-item--full">
                  <span>آدرس</span>
                  <strong>{restaurant.address || "—"}</strong>
                </div>

                <div className="restaurant-mgmt__detail-item">
                  <span>تاریخ ثبت</span>
                  <strong>{restaurant.createdAt || "—"}</strong>
                </div>
                <div className="restaurant-mgmt__detail-item">
                  <span>کد ملی</span>
                  <strong>{restaurant.nationalCode || "—"}</strong>
                </div>

                <div className="restaurant-mgmt__detail-item">
                  <span>شماره حساب</span>
                  <strong>{restaurant.bankAccountNumber || "—"}</strong>
                </div>
                <div className="restaurant-mgmt__detail-item">
                  <span>شماره شبا</span>
                  <strong>
                    {restaurant.shebaNumber
                      ? `IR${restaurant.shebaNumber}`
                      : "—"}
                  </strong>
                </div>
              </div>

              {canReview && showRejectInput && (
                <div className="form-vertical">
                  <textarea
                    rows={3}
                    placeholder="دلیل رد درخواست را بنویسید..."
                    value={rejectReasonDraft}
                    onChange={(e) => setRejectReasonDraft(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          {canReview ? (
            showRejectInput ? (
              <>
                <button
                  className="btn btn-secondary"
                  disabled={actionLoading}
                  onClick={() => setShowRejectInput(false)}
                >
                  انصراف
                </button>
                <button
                  className="btn btn-danger"
                  disabled={actionLoading}
                  onClick={handleRejectSubmit}
                >
                  {actionLoading ? (
                    <>
                      <span className="submit-spinner" aria-hidden="true" />
                      در حال ثبت...
                    </>
                  ) : (
                    "تایید رد درخواست"
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={actionLoading}
                >
                  بستن
                </button>
                <button
                  className="btn btn-danger"
                  disabled={actionLoading}
                  onClick={() => setShowRejectInput(true)}
                >
                  رد درخواست
                </button>
                <button
                  className="btn btn-primary"
                  disabled={actionLoading}
                  onClick={handleApproveClick}
                >
                  {actionLoading ? (
                    <>
                      <span className="submit-spinner" aria-hidden="true" />
                      در حال تایید...
                    </>
                  ) : (
                    "تایید رستوران"
                  )}
                </button>
              </>
            )
          ) : (
            <button className="btn btn-secondary" onClick={onClose}>
              بستن
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
