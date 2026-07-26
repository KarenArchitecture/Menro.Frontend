// src/components/checkout/AddonsEditModal.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useCart } from "../shop/CartContext";
import BackIcon from "../icons/BackIcon";
import MokhalafatIcon from "../icons/MokhalafatIcon";

const toPersianDigits = (v) =>
    v === null || v === undefined ? "۰" : String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

const AddonScrollPicker = ({ value = 0, onChange, max = 10 }) => {
    const scrollRef = useRef(null);
    const numbers = Array.from({ length: max + 1 }, (_, i) => i);

    useEffect(() => {
        scrollRef.current?.children[value]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, [value]);

    return (
        <div className="addon-qty-scroll" ref={scrollRef} dir="ltr">
        {numbers.map((num) => (
            <button
            key={num}
            type="button"
            className={`addon-qty-item ${value === num ? (num === 0 ? "active-0" : "active-n") : ""}`}
            onClick={() => onChange(num)}
            >
            {toPersianDigits(num)}
            </button>
        ))}
        </div>
    );
};

export default function AddonsEditModal({ open, onClose }) {
    const cart = useCart();
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => setIsActive(true), 10);
        document.body.classList.add("modal-open");
        return () => {
        clearTimeout(t);
        document.body.classList.remove("modal-open");
        };
    }, [open]);

    const handleClose = () => {
        setIsActive(false);
        setTimeout(() => onClose?.(), 250);
    };

    const groupedByFood = React.useMemo(() => {
        const map = new Map();
        for (const it of cart.items) {
        if (!map.has(it.foodId)) map.set(it.foodId, { foodId: it.foodId, foodName: it.foodName, variants: [] });
        map.get(it.foodId).variants.push(it);
        }
        return Array.from(map.values());
    }, [cart.items]);

    const fmt = (n) => (Number(n) || 0).toLocaleString("fa-IR");

    const handleAddonQtyChange = (cartItem, addonId, newQty) => {
        const nextAddons = cartItem.addons.filter((a) => a.foodAddonId !== addonId);
        if (newQty > 0) nextAddons.push({ foodAddonId: addonId, quantity: newQty });

        cart.setItem({
        foodId: cartItem.foodId,
        variantId: cartItem.variantId,
        quantity: cartItem.quantity,
        addons: nextAddons.map((a) => ({ foodAddonId: a.foodAddonId, quantity: a.quantity })),
        });
    };

    if (!open) return null;

    const modalUI = (
        <>
        <div className={`modal-backdrop combo-foods-backdrop ${isActive ? "active" : ""}`} onClick={handleClose} />
        <div className={`bottom-modal combo-foods-modal ${isActive ? "active" : ""}`} dir="rtl">
            <div className="combo-foods-header">
            <button type="button" className="icon-btn combo-foods-header__back" onClick={handleClose}>
                <BackIcon />
            </button>
            <div className="combo-foods-header__title-group">
                <MokhalafatIcon />
                <span className="combo-foods-header__title">مخلفات سفارش</span>
            </div>
            </div>

            <div className="sheet-body" style={{ padding: "1.6rem 2rem calc(88px + 1.6rem)" }}>
            {groupedByFood.length === 0 && (
                <p style={{ textAlign: "center", opacity: 0.7 }}>سبد خرید شما خالی است.</p>
            )}

            {groupedByFood.map((food) => (
                <div key={food.foodId} className="variant-list" style={{ marginBottom: "2rem" }}>
                <div className="section-head">
                    <p className="section-label">{food.foodName}</p>
                </div>

                {food.variants.map((v) => (
                    <div key={v.id} className="variant-block">
                    <div className="variant-row">
                        <div className="variant-pill">
                        <span className="variant-name">{v.variantName}</span>
                        <span className="variant-price">
                            {fmt(v.unitPrice)} <span className="variant-currency">تومان</span>
                        </span>
                        </div>
                        <div className="qty-group">
                        <span className="qty-display">{toPersianDigits(v.quantity)}</span>
                        </div>
                    </div>

                    {v.availableAddons?.length > 0 && (
                        <div className="modal-subsection">
                        <div className="subsection-head">
                            <MokhalafatIcon />
                            <span>مخلفات</span>
                        </div>

                        <ul className="addons-list">
                            {v.availableAddons.map((a) => {
                            const displayPrice = a.quantity === 0 ? a.extraPrice : a.extraPrice * a.quantity;
                            return (
                                <li key={a.foodAddonId} className={`addon-row ${a.quantity > 0 ? "checked" : ""}`}>
                                <div className="addon-name">{a.name}</div>
                                <div className="addon-price-amount">
                                    <div className="addon-price">
                                    <span className="addon-amount">{toPersianDigits(fmt(displayPrice))}</span>
                                    <span className="addon-currency">تومان</span>
                                    </div>
                                    <div className="addon-control">
                                    <AddonScrollPicker
                                        value={a.quantity}
                                        onChange={(newQty) => handleAddonQtyChange(v, a.foodAddonId, newQty)}
                                        max={10}
                                    />
                                    </div>
                                </div>
                                </li>
                            );
                            })}
                        </ul>
                        </div>
                    )}
                    </div>
                ))}
                </div>
            ))}
            </div>
        </div>
        </>
    );

    return ReactDOM.createPortal(modalUI, document.body);
}