// src/components/shop/ComboFoodsModal.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import MenuItem from "./MenuItem";
import BackIcon from "../icons/BackIcon";
import ComboIcon from "../icons/ComboIcon";

export default function ComboFoodsModal({ open, combos = [], onClose, onSelectFood }) {
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

    if (!open) return null;

    const modalUI = (
        <>
        <div
            className={`modal-backdrop combo-foods-backdrop ${isActive ? "active" : ""}`}
            onClick={handleClose}
        />

        <div className={`bottom-modal combo-foods-modal ${isActive ? "active" : ""}`} dir="rtl">
            <div className="combo-foods-header">
            <button type="button" className="icon-btn combo-foods-header__back" onClick={handleClose}>
                <BackIcon />
            </button>
            <div className="combo-foods-header__title-group">
                <ComboIcon />
                <span className="combo-foods-header__title">ترکیب ها</span>
            </div>
            </div>

            <div className="combo-foods-grid">
            {combos.map((food) => (
                <MenuItem
                    key={food.id}
                    item={food}
                    onOpen={() => onSelectFood?.(food)}
                    layout="vertical"
                />
            ))}
            </div>
        </div>
        </>
    );

    return ReactDOM.createPortal(modalUI, document.body);
}