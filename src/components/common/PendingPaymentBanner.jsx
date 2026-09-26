// src/components/common/PendingPaymentBanner.jsx
import React, { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrderBill } from "../../api/cart";
import { readPendingCounterOrder, clearPendingCounterOrder } from "../../utils/pendingPaymentStore";
import "../../assets/css/pending-payment-banner.css";

const REMINDER_INTERVAL_MS = 1 * 60 * 1000;
const STATUS_CHECK_INTERVAL_MS = 20000;

export default function PendingPaymentBanner() {
  const navigate = useNavigate();
  const pendingRef = useRef(readPendingCounterOrder());

  const showReminder = useCallback((pending) => {
    toast.custom(
      (t) => (
        <div
          dir="rtl"
          className="pending-payment-banner"
          onClick={() => {
            toast.dismiss(t.id);
            navigate(`/orders/bill/${pending.orderId}`);
          }}
        >
          <strong className="pending-payment-banner__title">یادآوری پرداخت</strong>
          <span className="pending-payment-banner__text">
            سفارش شما از {pending.restaurantName || "رستوران"} در انتظار پرداخت پای صندوق است.
          </span>
        </div>
      ),
      {
        id: "pending-payment-banner", // 🔧 جلوی چند نسخه‌ی هم‌زمان از همین بنر رو می‌گیره
        duration: 6000,
        position: "top-center",
      }
    );
  }, [navigate]);

  useEffect(() => {
    const sync = () => { pendingRef.current = readPendingCounterOrder(); };
    window.addEventListener("storage", sync);
    window.addEventListener("menro-pending-order-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("menro-pending-order-changed", sync);
    };
  }, []);

  useEffect(() => {
    const check = async () => {
      const pending = pendingRef.current;
      if (!pending?.orderId) return;
      try {
        const bill = await getOrderBill(pending.orderId);
        if (["Paid", "Completed", "Cancelled"].includes(bill.status)) {
          clearPendingCounterOrder();
          pendingRef.current = null;
        }
      } catch { /* ignore, retry next tick */ }
    };
    const interval = setInterval(check, STATUS_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const remind = () => {
      const pending = pendingRef.current;
      if (pending?.orderId) showReminder(pending);
    };
    const interval = setInterval(remind, REMINDER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [showReminder]);

  return null;
}