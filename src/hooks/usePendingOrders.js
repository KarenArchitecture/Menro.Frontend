import { useCallback, useEffect, useRef, useState } from "react";
import { getOrderBill } from "../api/cart";
import { readPendingOrders, removePendingOrder } from "../utils/pendingOrdersStore";

const STATUS_CHECK_INTERVAL_MS = 20000;
const RESOLVED_STATUSES = ["Completed", "Cancelled"];

export default function usePendingOrders() {
  const [orders, setOrders] = useState(() => readPendingOrders());
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  const sync = useCallback(() => setOrders(readPendingOrders()), []);

  useEffect(() => {
    window.addEventListener("storage", sync);
    window.addEventListener("menro-pending-orders-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("menro-pending-orders-changed", sync);
    };
  }, [sync]);

  useEffect(() => {
    const check = async () => {
      const current = ordersRef.current;
      if (current.length === 0) return;
      await Promise.all(
        current.map(async (o) => {
          try {
            const bill = await getOrderBill(o.orderId);
            if (RESOLVED_STATUSES.includes(bill.status)) removePendingOrder(o.orderId);
          } catch (err) {
            if (err?.response?.status === 404) removePendingOrder(o.orderId);
            // خطای دیگه (شبکه و ...) → نادیده، تیک بعدی دوباره امتحان میشه
          }
        }),
      );
      sync();
    };
    check();
    const interval = setInterval(check, STATUS_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [sync]);

  return orders;
}