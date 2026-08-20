// src/components/shop/UsualOrdersModal.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useQuery } from "@tanstack/react-query";
import MenuItem from "./MenuItem";
import BackIcon from "../icons/BackIcon";
import CircleIcon from "../icons/CircleIcon";
import { getUsualOrders } from "../../api/usualOrders";

export default function UsualOrdersModal({ open, restaurantId, onClose, onSelectFood }) {
    const [isActive, setIsActive] = useState(false);

    const { data: usualFoods = [] } = useQuery({
        queryKey: ["usual-orders", restaurantId],
        queryFn: () => getUsualOrders(restaurantId),
        enabled: open && !!restaurantId,
    });

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
            className={`modal-backdrop usual-orders-backdrop ${isActive ? "active" : ""}`}
            onClick={handleClose}
        />

        <div className={`bottom-modal usual-orders-modal ${isActive ? "active" : ""}`} dir="rtl">
            <div className="usual-orders-header">
            <button type="button" className="icon-btn usual-orders-header__back" onClick={handleClose}>
                <BackIcon />
            </button>
            <div className="usual-orders-header__title-group">
                <CircleIcon />
                <span className="usual-orders-header__title">همون همیشگی</span>
            </div>
            </div>

            <div className="usual-orders-grid">
            {usualFoods.map((food) => (
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