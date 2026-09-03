// src/components/common/PendingPaymentBanner.jsx
import React, { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrderBill } from "../../api/cart";
import { readPendingCounterOrder, clearPendingCounterOrder } from "../../utils/pendingPaymentStore";

const REMINDER_INTERVAL_MS = 1 * 60 * 1000;
const STATUS_CHECK_INTERVAL_MS = 20000;

export default function PendingPaymentBanner() {
  const navigate = useNavigate();
  const pendingRef = useRef(readPendingCounterOrder());

  const showReminder = useCallback((pending) => {
    toast.custom(
      (t) => (
        <div
          onClick={() => {
            toast.dismiss(t.id);
            navigate(`/orders/bill/${pending.orderId}`);
          }}
          style={{ /* unchanged */ }}
        >
          <strong style={{ color: "#ff683c", fontSize: "1.3rem" }}>یادآوری پرداخت</strong>
          <span style={{ fontSize: "1.15rem", lineHeight: 1.7 }}>
            سفارش شما از {pending.restaurantName || "رستوران"} در انتظار پرداخت پای صندوق است.
          </span>
        </div>
      ),
      { duration: 6000, position: "top-center" }
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