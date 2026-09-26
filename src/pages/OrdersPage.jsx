// src/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import "../assets/css/styles-orders.css";
import ContinueShopping from "../components/orders/ContinueShopping";
import { PreviousOrdersList } from "../components/orders/PreviousOrderCard";
import OrdersAuthPrompt from "../components/orders/OrdersAuthPrompt";
import StateMessage from "../components/common/StateMessage";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../components/shop/CartContext";
import { getUserOrderHistory } from "../api/orders";
import resolveFileUrl from "../utils/resolveFileUrl";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Orders() {
  useDocumentTitle("سفارش‌های من");
  const { user } = useAuth();
  const cart = useCart();

  const [orders, setOrders] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setHistoryLoaded(true);
      return;
    }

    let cancelled = false;
    setHistoryLoaded(false);

    getUserOrderHistory()
      .then((data) => {
        if (cancelled) return;
        setOrders(
          data.map((o) => ({
            id: o.id,
            restaurantName: o.restaurantName,
            orderTypeTag: o.tableLabel ? o.tableLabel : "بیرون‌بر",
            date: new Date(o.createdAt).toLocaleDateString("fa-IR"),
            logo: resolveFileUrl(
              o.restaurantLogoUrl,
              "/images/restaurant/logo-placeholder.png",
            ),
            items: o.previewItems.map((pi, idx) => ({
              id: idx,
              image: resolveFileUrl(
                pi.imageUrl,
                "/images/food/food-placeholder.png",
              ),
              quantity: pi.quantity,
            })),
            totalPrice: o.totalPrice,
            rating: null,
          })),
        );
      })
      .finally(() => !cancelled && setHistoryLoaded(true));

    return () => {
      cancelled = true;
    };
  }, [user]);

  const hasActiveCart = !!cart.restaurantId && cart.items.length > 0;
  const hasHistory = orders.length > 0;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* سبد خرید نیمه‌تمام — برای مهمان و لاگین‌شده هر دو */}
      {hasActiveCart && <ContinueShopping />}

      {/* کاربر مهمان: همیشه یادآوری لاگین برای دیدن تاریخچه */}
      {!user && <OrdersAuthPrompt compact={hasActiveCart} />}

      {/* 🔧 کاربر لاگین، در حال گرفتن تاریخچه از سرور، بدون سبد فعال */}
      {user && !historyLoaded && !hasActiveCart && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          در حال بارگذاری...
        </div>
      )}

      {/* کاربر لاگین: تاریخچه (اگر داره) */}
      {user && historyLoaded && hasHistory && (
        <PreviousOrdersList orders={orders} />
      )}

      {/* کاربر لاگین، بدون سبد فعال و بدون تاریخچه */}
      {user && historyLoaded && !hasHistory && !hasActiveCart && (
        <StateMessage kind="empty" title="هنوز سفارشی ثبت نکرده‌اید">
          با انتخاب یکی از رستوران‌ها اولین سفارش خودتون رو ثبت کنید.
        </StateMessage>
      )}
    </div>
  );
}