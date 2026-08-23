// src/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/styles-orders.css";
import ContinueShopping from "../components/orders/ContinueShopping";
import { PreviousOrdersList } from "../components/orders/PreviousOrderCard";
import { useAuth } from "../context/AuthContext";
import { getUserOrderHistory } from "../api/orders";
import resolveFileUrl from "../utils/resolveFileUrl";

function GuestOrdersPrompt() {
  const navigate = useNavigate();
  return (
    <div
      dir="rtl"
      style={{
        maxWidth: 480,
        margin: "2rem auto",
        padding: "2rem",
        background: "#1b2026",
        borderRadius: "1.6rem",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <p style={{ marginBottom: "1.6rem", color: "#9ca3af" }}>
        برای مشاهده سفارش‌های قبلی خود باید وارد حساب کاربری شوید.
      </p>
      <button
        type="button"
        className="cs-btn cs-btn-continue"
        style={{ width: "100%" }}
        onClick={() =>
          navigate(`/login?returnUrl=${encodeURIComponent("/orders")}`)
        }
      >
        ورود به حساب کاربری
      </button>
    </div>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    getUserOrderHistory().then((data) => {
      setOrders(
        data.map((o) => ({
          id: o.id,
          restaurantId: o.restaurantId,
          restaurantName: o.restaurantName,
          // 🔧 backend changed table number (int) -> table label (string,
          // e.g. "میز ۱", "میز کنار پنجره"). The label already comes fully
          // formatted, so we no longer prepend "میز " ourselves — that would
          // now double it up (e.g. "میز میز ۱").
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
    });
  }, [user]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <ContinueShopping />
      {user ? <PreviousOrdersList orders={orders} /> : <GuestOrdersPrompt />}
    </div>
  );
}
