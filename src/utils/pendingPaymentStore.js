import { currentIdentity, setIdentity, GUEST_ID } from "./pendingIdentity";
import { migratePendingOrdersIdentity } from "./pendingOrdersStore";

const KEY_PREFIX = "menro_pending_counter_order";
const BANNER_LIFETIME_MS = 2 * 60 * 60 * 1000;

const keyFor = (identity) => `${KEY_PREFIX}:${identity || GUEST_ID}`;

export function markPendingCounterOrder(orderId, restaurantName) {
  localStorage.setItem(
    keyFor(currentIdentity()),
    JSON.stringify({ orderId, restaurantName, expiresAt: Date.now() + BANNER_LIFETIME_MS })
  );
  window.dispatchEvent(new Event("menro-pending-order-changed"));
}

export function clearPendingCounterOrder(identity = currentIdentity()) {
  localStorage.removeItem(keyFor(identity));
  window.dispatchEvent(new Event("menro-pending-order-changed"));
}

export function readPendingCounterOrder() {
  const identity = currentIdentity();
  try {
    const raw = localStorage.getItem(keyFor(identity));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(keyFor(identity));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setPendingPaymentIdentity(userId) {
  const previous = currentIdentity();
  const next = userId || GUEST_ID;
  if (previous === next) return;

  if (previous === GUEST_ID && next !== GUEST_ID) {
    const guestRaw = localStorage.getItem(keyFor(GUEST_ID));
    if (guestRaw) {
      localStorage.setItem(keyFor(next), guestRaw);
      localStorage.removeItem(keyFor(GUEST_ID));
    }
  } else {
    localStorage.removeItem(keyFor(previous));
  }

  migratePendingOrdersIdentity(previous, next);

  setIdentity(next);
  window.dispatchEvent(new Event("menro-pending-order-changed"));
  window.dispatchEvent(new Event("menro-pending-orders-changed"));
}