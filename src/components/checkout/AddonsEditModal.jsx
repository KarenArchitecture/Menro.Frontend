// src/components/checkout/AddonsEditModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useCart } from "../shop/CartContext";
import usePageStyles from "../../hooks/usePageStyles";
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
        <div className="aem-qty-scroll" ref={scrollRef} dir="ltr">
        {numbers.map((num) => (
            <button
            key={num}
            type="button"
            className={`aem-qty-item ${value === num ? (num === 0 ? "active-0" : "active-n") : ""}`}
            onClick={() => onChange(num)}
            >
            {toPersianDigits(num)}
            </button>
        ))}
        </div>
    );
};

export default function AddonsEditModal({ open, onClose }) {
    usePageStyles("/addons-edit-modal.css");

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

    const groupedByFood = useMemo(() => {
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
        <div className={`aem-backdrop ${isActive ? "active" : ""}`} onClick={handleClose} />
        <div className={`aem-modal ${isActive ? "active" : ""}`} dir="rtl">
            <div className="aem-header">
            <button type="button" className="aem-back-btn" onClick={handleClose} aria-label="بستن">
                <BackIcon />
            </button>
            <div className="aem-title-group">
                <MokhalafatIcon />
                <span className="aem-title">مخلفات سفارش</span>
            </div>
            </div>

            <div className="aem-body">
            {groupedByFood.length === 0 && (
                <p className="aem-empty">سبد خرید شما خالی است.</p>
            )}

            {groupedByFood.map((food) => (
                <div key={food.foodId} className="aem-food-group">
                <p className="aem-food-title">{food.foodName}</p>

                {food.variants.map((v) => (
                    <div key={v.id} className="aem-variant-block">
                    <div className="aem-variant-row">
                        <span className="aem-variant-name">{v.variantName}</span>
                        <span className="aem-variant-price">
                        {fmt(v.unitPrice)} <span className="currency">تومان</span>
                        </span>
                        <span className="aem-variant-qty">{toPersianDigits(v.quantity)}</span>
                    </div>

                    {v.availableAddons?.length > 0 && (
                        <>
                        <div className="aem-addons-head">
                            <MokhalafatIcon />
                            <span>مخلفات</span>
                        </div>

                        <ul className="aem-addons-list">
                            {v.availableAddons.map((a) => {
                            const displayPrice = a.quantity === 0 ? a.extraPrice : a.extraPrice * a.quantity;
                            return (
                                <li key={a.foodAddonId} className={`aem-addon-row ${a.quantity > 0 ? "checked" : ""}`}>
                                <div className="aem-addon-name">{a.name}</div>
                                <div className="aem-addon-price-amount">
                                    <div className="aem-addon-price">
                                    <span>{toPersianDigits(fmt(displayPrice))}</span>
                                    <span className="currency">تومان</span>
                                    </div>
                                    <AddonScrollPicker
                                    value={a.quantity}
                                    onChange={(newQty) => handleAddonQtyChange(v, a.foodAddonId, newQty)}
                                    max={10}
                                    />
                                </div>
                                </li>
                            );
                            })}
                        </ul>
                        </>
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