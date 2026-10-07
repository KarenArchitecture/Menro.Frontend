// src/components/shop/FrequentOrdersModal.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { getUserFrequentFoodsAtRestaurant } from "../../api/orders";
import MenuItem from "./MenuItem";
import { MenuCardSkeleton } from "./ShopSkeletons";
import StateMessage from "../common/StateMessage";
import OrdersAuthPrompt from "../orders/OrdersAuthPrompt";
import BackIcon from "../icons/BackIcon";
import CircleIcon from "../icons/CircleIcon";

export default function FrequentOrdersModal({
  open,
  slug,
  onClose,
  onSelectFood,
}) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);

  const {
    data: foods = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["frequentFoods", slug, user?.id],
    queryFn: () => getUserFrequentFoodsAtRestaurant(slug),
    enabled: open && !!user && !!slug,
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

  let content;

  if (!user) {
    // مهمان: همان پیام «باید وارد شوید»
    content = (
      <div className="frequent-foods-state">
        <OrdersAuthPrompt />
      </div>
    );
  } else if (isLoading) {
    content = (
      <div className="combo-foods-grid">
        {[0, 1, 2, 3].map((i) => (
          <MenuCardSkeleton key={i} vertical shortTitle={i % 2 === 1} />
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <div className="frequent-foods-state">
        <StateMessage kind="error" title="خطا در دریافت اطلاعات">
          مشکلی در دریافت سفارش‌های شما پیش آمد. لطفاً دوباره تلاش کنید.
        </StateMessage>
      </div>
    );
  } else if (foods.length === 0) {
    content = (
      <div className="frequent-foods-state">
        <StateMessage kind="empty" title="سفارشی ثبت نشده است">
          شما تا به حال از این فروشگاه سفارشی ثبت نکرده‌اید.
        </StateMessage>
      </div>
    );
  } else {
    content = (
      <div className="combo-foods-grid">
        {foods.map((food) => (
          <MenuItem
            key={food.id}
            item={food}
            onOpen={() => onSelectFood?.(food)}
            layout="vertical"
          />
        ))}
      </div>
    );
  }

  const modalUI = (
    <>
      <div
        className={`modal-backdrop combo-foods-backdrop frequent-foods-backdrop ${isActive ? "active" : ""}`}
        onClick={handleClose}
      />

      <div
        className={`bottom-modal combo-foods-modal frequent-foods-modal ${isActive ? "active" : ""}`}
        dir="rtl"
      >
        <div className="combo-foods-header">
          <button
            type="button"
            className="icon-btn combo-foods-header__back"
            onClick={handleClose}
            aria-label="بستن"
          >
            <BackIcon />
          </button>
          <div className="combo-foods-header__title-group">
            <CircleIcon />
            <span className="combo-foods-header__title">همون همیشگی</span>
          </div>
        </div>

        {content}
      </div>
    </>
  );

  return ReactDOM.createPortal(modalUI, document.body);
}