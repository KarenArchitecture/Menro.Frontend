// src/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "../assets/css/styles-orders.css";
import ContinueShopping from "../components/orders/ContinueShopping";
import { PreviousOrdersList } from "../components/orders/PreviousOrderCard";
import OrdersAuthPrompt from "../components/orders/OrdersAuthPrompt";
import { useAuth } from "../context/AuthContext";
import { getUserOrderHistory } from "../api/orders";
import { rateRestaurant } from "../api/restaurantRating";
import resolveFileUrl from "../utils/resolveFileUrl";
import { formatOrderDateTime } from "../utils/formatOrderDateTime";
import useDocumentTitle from "../hooks/useDocumentTitle";

const LOGO_FALLBACK = "/images/restaurant/logo-placeholder.png";
const FOOD_FALLBACK = "/images/food/food-placeholder.png";

export default function Orders() {
  useDocumentTitle("سفارش‌های من");
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);

  // رای‌ها بر اساس restaurantId نگه داشته می‌شوند، نه orderId؛ چون فقط
  // یک رای برای هر رستوران معتبر است و همه‌ی کارت‌های همان رستوران
  // باید همزمان آپدیت شوند.
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
        // شماره میز نمایش داده نمی‌شود؛ فقط سفارش بیرون‌بر برچسب دارد
        orderTypeTag: o.tableLabel ? null : "بیرون‌بر",
        date: formatOrderDateTime(o.createdAt),
        logo: resolveFileUrl(o.restaurantLogoUrl, LOGO_FALLBACK),
        items: o.previewItems.map((pi, idx) => ({
          id: idx,
          image: resolveFileUrl(pi.imageUrl, FOOD_FALLBACK),
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

    // آپدیت آپتیمیستیک: همه‌ی کارت‌های این رستوران فوراً آپدیت می‌شوند
    setRatingsByRestaurant((prev) => ({ ...prev, [restaurantId]: score }));

    try {
      await rateRestaurant(restaurantId, score);
      toast.success("امتیاز شما ثبت شد");
    } catch (err) {
      console.error("Failed to submit restaurant rating:", err);
      toast.error("ثبت امتیاز با خطا مواجه شد. دوباره تلاش کنید.");
      // برگرداندن به حالت قبلی در صورت خطا
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
        <OrdersAuthPrompt />
      )}
    </div>
  );
}