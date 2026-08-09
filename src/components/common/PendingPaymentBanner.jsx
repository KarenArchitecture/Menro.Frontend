// src/components/common/PendingPaymentBanner.jsx
import React, { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrderBill } from "../../api/cart";

const STORAGE_KEY = "menro_pending_counter_order";
const BANNER_LIFETIME_MS = 2 * 60 * 60 * 1000; // stop nagging after 2h regardless
const REMINDER_INTERVAL_MS = 1 * 60 * 1000;    // nudge every 1 minute
const STATUS_CHECK_INTERVAL_MS = 20000;

export function markPendingCounterOrder(orderId, restaurantName) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ orderId, restaurantName, expiresAt: Date.now() + BANNER_LIFETIME_MS })
  );
  window.dispatchEvent(new Event("menro-pending-order-changed"));
}

export function clearPendingCounterOrder() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("menro-pending-order-changed"));
}

function readPending() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// Renders nothing directly — surfaces a dismissible toast reminder instead
// of a permanent header-covering bar.
export default function PendingPaymentBanner() {
    const navigate = useNavigate();
    const pendingRef = useRef(readPending());

    const showReminder = useCallback((pending) => {
        toast.custom(
        (t) => (
            <div
            onClick={() => {
                toast.dismiss(t.id);
                navigate(`/orders/bill/${pending.orderId}`);
            }}
            style={{
                background: "#1a1f26",
                color: "#fff",
                border: "1px solid #ff683c",
                borderRadius: "1.2rem",
                padding: "1.2rem 1.6rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                maxWidth: 320,
                cursor: "pointer",
                direction: "rtl",
                fontFamily: "inherit",
                boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
            }}
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
        const sync = () => { pendingRef.current = readPending(); };
        window.addEventListener("storage", sync);
        window.addEventListener("menro-pending-order-changed", sync);
        return () => {
        window.removeEventListener("storage", sync);
        window.removeEventListener("menro-pending-order-changed", sync);
        };
    }, []);

    // auto-clear once the order is actually resolved
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

    // periodic nudge
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