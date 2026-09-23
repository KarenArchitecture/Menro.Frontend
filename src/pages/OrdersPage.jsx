// src/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../assets/css/styles-orders.css";
import ContinueShopping from "../components/orders/ContinueShopping";
import { PreviousOrdersList } from "../components/orders/PreviousOrderCard";
import { useAuth } from "../context/AuthContext";
import { getUserOrderHistory } from "../api/orders";
import { rateRestaurant } from "../api/restaurantRating";
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

  // 🆕 رای‌ها بر اساس restaurantId نگه داشته می‌شن، نه orderId — چون فقط
  // یک رای برای هر رستوران معتبره و باید همه‌ی کارت‌های همون رستوران
  // همزمان آپدیت بشن.
  const [ratingsByRestaurant, setRatingsByRestaurant] = useState({});

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setRatingsByRestaurant({});
      return;
    }
    getUserOrderHistory().then((data) => {
      const mapped = data.map((o) => ({
        id: o.id,
        restaurantId: o.restaurantId,
        restaurantSlug: o.restaurantSlug,
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
        userRating: o.userRating ?? null,
      }));

      setOrders(mapped);

      const initialRatings = {};
      mapped.forEach((o) => {
        if (o.userRating != null) {
          initialRatings[o.restaurantId] = o.userRating;
        }
      });
      setRatingsByRestaurant(initialRatings);
    });
  }, [user]);

  const handleRate = async (restaurantId, score) => {
    const previous = ratingsByRestaurant[restaurantId] ?? null;

    // آپدیت آپتیمیستیک: همه‌ی کارت‌های این رستوران فوراً آپدیت می‌شن
    setRatingsByRestaurant((prev) => ({ ...prev, [restaurantId]: score }));

    try {
      await rateRestaurant(restaurantId, score);
      toast.success("امتیاز شما ثبت شد");
    } catch (err) {
      console.error("Failed to submit restaurant rating:", err);
      toast.error("ثبت امتیاز با خطا مواجه شد. دوباره تلاش کنید.");
      // برگردوندن به حالت قبلی در صورت خطا
      setRatingsByRestaurant((prev) => ({ ...prev, [restaurantId]: previous }));
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <ContinueShopping />
      {user ? (
        <PreviousOrdersList
          orders={orders}
          ratingsByRestaurant={ratingsByRestaurant}
          onRate={handleRate}
        />
      ) : (
        <GuestOrdersPrompt />
      )}
    </div>
  );
}