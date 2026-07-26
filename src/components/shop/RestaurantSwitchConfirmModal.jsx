// src/components/shop/RestaurantSwitchConfirmModal.jsx
import ReactDOM from "react-dom";
import { useCart } from "./CartContext";
import "../../assets/css/protected-action-modal.css";

export default function RestaurantSwitchConfirmModal() {
    const { conflict, confirmSwitch, cancelSwitch } = useCart();
    if (!conflict) return null;

    const modal = (
        <div className="protected-action-backdrop" onClick={cancelSwitch}>
        <div className="protected-action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="protected-action-glow" />
            <div className="protected-action-shine" />
            <button className="protected-action-close" onClick={cancelSwitch} aria-label="بستن">×</button>
            <h2 className="protected-action-title">سبد خرید شما پر است</h2>
            <div className="protected-action-description">
            شما در حال سفارش از <span>{conflict.conflictingRestaurantName}</span> هستید.
            برای سفارش از این رستوران، سبد خرید قبلی شما خالی می‌شود.
            </div>
            <div className="protected-action-actions">
            <button className="protected-action-login" onClick={confirmSwitch}>باشه، سبد قبلی پاک شود</button>
            <button className="protected-action-later" onClick={cancelSwitch}>انصراف</button>
            </div>
        </div>
        </div>
    );

    return ReactDOM.createPortal(modal, document.body);
}