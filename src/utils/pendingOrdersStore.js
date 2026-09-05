import { currentIdentity, GUEST_ID } from "./pendingIdentity";

const KEY_PREFIX = "menro_pending_orders";
const ORDER_LIFETIME_MS = 4 * 60 * 60 * 1000; // ۴ ساعت

const keyFor = (identity) => `${KEY_PREFIX}:${identity || GUEST_ID}`;

function readRaw(identity) {
  try {
    const raw = localStorage.getItem(keyFor(identity));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeRaw(identity, list) {
  if (list.length === 0) localStorage.removeItem(keyFor(identity));
  else localStorage.setItem(keyFor(identity), JSON.stringify(list));
  window.dispatchEvent(new Event("menro-pending-orders-changed"));
}

// از CheckoutFooter بعد از ثبت هر سفارش (هر دو شیوه پرداخت) صدا زده میشه
export function addPendingOrder({ orderId, invoiceNumber, totalPrice }) {
  const identity = currentIdentity();
  const list = readRaw(identity).filter((o) => o.orderId !== orderId);
  list.unshift({
    orderId,
    invoiceNumber,
    totalPrice,
    expiresAt: Date.now() + ORDER_LIFETIME_MS,
  });
  writeRaw(identity, list);
}

export function removePendingOrder(orderId, identity = currentIdentity()) {
  writeRaw(identity, readRaw(identity).filter((o) => o.orderId !== orderId));
}

export function readPendingOrders() {
  const identity = currentIdentity();
  const list = readRaw(identity);
  const now = Date.now();
  const fresh = list.filter((o) => o.expiresAt > now);
  if (fresh.length !== list.length) writeRaw(identity, fresh); // پاکسازی خاموش سفارش‌های منقضی
  return fresh;
}

// از pendingPaymentStore.setPendingPaymentIdentity صدا زده میشه — همون
// سیاست guest→login (carry over) و هر سوییچ دیگه (drop) رو رعایت می‌کنه
export function migratePendingOrdersIdentity(previous, next) {
  if (previous === GUEST_ID && next !== GUEST_ID) {
    const guestList = readRaw(GUEST_ID);
    if (guestList.length) {
      const existingIds = new Set(readRaw(next).map((o) => o.orderId));
      const merged = [...readRaw(next), ...guestList.filter((o) => !existingIds.has(o.orderId))];
      writeRaw(next, merged);
    }
    localStorage.removeItem(keyFor(GUEST_ID));
  } else {
    localStorage.removeItem(keyFor(previous));
  }
}