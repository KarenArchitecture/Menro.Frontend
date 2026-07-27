import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../shop/CartContext";
import resolveFileUrl from "../../utils/resolveFileUrl";

export default function ContinueShopping() {
  const cart = useCart();
  const navigate = useNavigate();

  if (!cart.restaurantId || cart.items.length === 0) return null;

  const maxVisible = 4;
  const visibleItems = cart.items.slice(0, maxVisible);
  const remainingCount = cart.items.length > maxVisible ? cart.items.length - maxVisible : 0;

  return (
    <div dir="rtl" className="continue-shopping-container">
      <div className="cs-header">
        <div className="cs-logo-wrapper">
          <img src="/images/menu-logo.jpg" alt="Menu Logo" className="cs-logo" />
        </div>
        <div className="cs-header-text">
          <h2 className="cs-title">ادامه خرید از - {cart.restaurantName}</h2>
        </div>
      </div>

      <div className="cs-images-row">
        {visibleItems.map((item) => (
          <div key={item.id} className="cs-image-wrapper">
            <img src={resolveFileUrl(item.imageUrl, "/images/food/food-placeholder.png")} alt="Order Item" className="cs-item-image" />
            <span className="cs-badge">{item.quantity}</span>
          </div>
        ))}
        {remainingCount > 0 && <div className="cs-more-items">+{remainingCount}</div>}
      </div>

      <div className="cs-total-section">
        <span className="cs-total-label">مجموع سفارش</span>
        <div className="cs-total-value">
          <span className="cs-price">{cart.total.toLocaleString("fa-IR")}</span>
          <span className="cs-currency">تومان</span>
        </div>
      </div>

      <div className="cs-actions">
        <button className="cs-btn cs-btn-delete" onClick={() => cart.clear()}>حذف سبد</button>
        <button className="cs-btn cs-btn-continue" onClick={() => navigate(`/restaurant/${cart.restaurantSlug}`)}>ادامه خرید</button>
      </div>
    </div>
  );
}