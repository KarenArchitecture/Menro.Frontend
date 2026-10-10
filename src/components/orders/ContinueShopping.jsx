// src/components/orders/ContinueShopping.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../shop/CartContext";
import SafeImage from "../common/SafeImage";
import useFittingCount from "../../hooks/useFittingCount";
import resolveFileUrl from "../../utils/resolveFileUrl";
import { toPersianDigits } from "../../utils/persianNumbers";
import { formatOrderDateTime } from "../../utils/formatOrderDateTime";

const LOGO_FALLBACK = "/images/restaurant/logo-placeholder.png";
const FOOD_FALLBACK = "/images/food/food-placeholder.png";

function CartCard({ cart }) {
  const navigate = useNavigate();
  const rowRef = useRef(null);

  // تعداد تصاویری که در عرض فعلی جا می‌شوند؛ بقیه به‌صورت +n در باکس آخر
  const fitCount = useFittingCount(rowRef, { total: cart.items.length });
  const visibleItems = cart.items.slice(0, fitCount);
  const remainingCount = cart.items.length - visibleItems.length;

  const createdLabel = formatOrderDateTime(cart.createdAt);

  return (
    <div dir="rtl" className="continue-shopping-container">
      <div className="cs-header">
        <div className="cs-logo-wrapper">
          <SafeImage
            src={resolveFileUrl(cart.restaurantLogoUrl)}
            fallback={LOGO_FALLBACK}
            alt={cart.restaurantName}
            className="cs-logo"
          />
        </div>
        <div className="cs-header-text">
          <h2 className="cs-title">ادامه خرید از - {cart.restaurantName}</h2>
          {createdLabel && <span className="cs-date">{createdLabel}</span>}
        </div>
      </div>

      <div className="cs-images-row" ref={rowRef}>
        {visibleItems.map((item) => (
          <div key={item.id} className="cs-image-wrapper">
            <SafeImage
              src={resolveFileUrl(item.imageUrl)}
              fallback={FOOD_FALLBACK}
              alt=""
              className="cs-item-image"
            />
            <span className="cs-badge">{toPersianDigits(item.quantity)}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="cs-more-items">
            +{toPersianDigits(remainingCount)}
          </div>
        )}
      </div>

      <div className="cs-total-section">
        <span className="cs-total-label">مجموع سفارش</span>
        <div className="cs-total-value">
          <span className="cs-price">{cart.total.toLocaleString("fa-IR")}</span>
          <span className="cs-currency">تومان</span>
        </div>
      </div>

      <div className="cs-actions">
        <button
          type="button"
          className="cs-btn cs-btn-delete"
          onClick={() => cart.clear()}
        >
          حذف سبد
        </button>
        <button
          type="button"
          className="cs-btn cs-btn-continue"
          onClick={() => navigate(`/restaurant/${cart.restaurantSlug}`)}
        >
          ادامه خرید
        </button>
      </div>
    </div>
  );
}

// گارد در کامپوننت بیرونی است تا هوک‌های CartCard بعد از return شرطی صدا زده نشوند
export default function ContinueShopping() {
  const cart = useCart();
  if (!cart.restaurantId || cart.items.length === 0) return null;
  return <CartCard cart={cart} />;
}