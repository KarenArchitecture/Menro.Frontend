// src/components/shop/CartContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchCart, setCartItem, clearCart as clearCartApi, mergeGuestCart } from "../../api/cart";
import { useAuth } from "../../Context/AuthContext";

const CartContext = createContext(null);

const EMPTY_CART = {
  id: null,
  restaurantId: null,
  restaurantName: null,
  restaurantSlug: null,
  tableCount: 0,
  paymentMethod: "",
  items: [],
};

const DEBOUNCE_MS = 350;

function keyOf(foodId, variantId) {
  return `${foodId}:${variantId ?? "default"}`;
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [conflict, setConflict] = useState(null);

  // key -> { quantity, addons, meta } — local edits not yet confirmed by the server
  const [overrides, setOverrides] = useState({});
  const overridesRef = useRef({});
  useEffect(() => { overridesRef.current = overrides; }, [overrides]);

  const timersRef = useRef({});
  const inFlightRef = useRef({});
  const dirtyRef = useRef({});
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchCart();
      setCart(data?.items?.length ? data : EMPTY_CART);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    (async () => {
      if (user) {
        try { await mergeGuestCart(); } catch (err) { console.warn("Cart merge failed:", err?.response?.data?.message || err.message); }
      }
      await refresh();
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearOverride = useCallback((key) => {
    setOverrides((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const sendToServer = useCallback(async (key, dto) => {
    inFlightRef.current[key] = true;
    dirtyRef.current[key] = false;

    try {
      const result = await setCartItem(dto);
      if (result.conflict) {
        setConflict({ conflictingRestaurantName: result.conflictingRestaurantName, pendingDto: dto });
        if (result.cart) setCart(result.cart);
      } else {
        setCart(result.cart ?? EMPTY_CART);
      }
    } catch (err) {
      console.error("Cart update failed:", err?.response?.data?.message || err.message);
    } finally {
      inFlightRef.current[key] = false;

      if (dirtyRef.current[key]) {
        // A newer edit arrived while this request was in flight — fire it
        // now with the freshest desired state instead of dropping it.
        dirtyRef.current[key] = false;
        const latest = overridesRef.current[key];
        if (latest) {
          sendToServer(key, {
            foodId: latest.meta.foodId,
            variantId: latest.meta.variantId,
            quantity: latest.quantity,
            addons: latest.addons,
          });
          return;
        }
      }

      clearOverride(key);
      setPendingCount((c) => Math.max(0, c - 1));
    }
  }, [clearOverride]);

  const queueUpdate = useCallback((foodId, variantId, quantity, addons, meta) => {
    const key = keyOf(foodId, variantId);
    const wasPending = key in overridesRef.current;

    setOverrides((prev) => ({
      ...prev,
      [key]: { quantity, addons, meta: { ...meta, foodId, variantId } },
    }));
    if (!wasPending) setPendingCount((c) => c + 1);

    if (inFlightRef.current[key]) {
      dirtyRef.current[key] = true;
      return;
    }

    clearTimeout(timersRef.current[key]);
    timersRef.current[key] = setTimeout(() => {
      sendToServer(key, { foodId, variantId, quantity, addons });
    }, DEBOUNCE_MS);
  }, [sendToServer]);

  // Immediately flush any debounced/queued edits — call this before
  // checkout so we never submit against a not-yet-synced cart.
  const flushPending = useCallback(async () => {
    const keys = Object.keys(overridesRef.current);
    await Promise.all(
      keys.map((key) => {
        clearTimeout(timersRef.current[key]);
        if (inFlightRef.current[key]) return null; // already resolving; its own finally-block settles it
        const latest = overridesRef.current[key];
        if (!latest) return null;
        return sendToServer(key, {
          foodId: latest.meta.foodId,
          variantId: latest.meta.variantId,
          quantity: latest.quantity,
          addons: latest.addons,
        });
      })
    );
  }, [sendToServer]);

  const setItem = useCallback((dto) => {
    queueUpdate(dto.foodId, dto.variantId ?? null, dto.quantity, dto.addons ?? [], dto.meta || {});
  }, [queueUpdate]);

  const confirmSwitch = useCallback(async () => {
    if (!conflict?.pendingDto) return;
    const dto = { ...conflict.pendingDto, confirmRestaurantSwitch: true };
    setConflict(null);
    const result = await setCartItem(dto);
    setCart(result.cart ?? EMPTY_CART);
  }, [conflict]);

  const cancelSwitch = useCallback(() => setConflict(null), []);

  const clear = useCallback(async () => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    setOverrides({});
    setPendingCount(0);
    await clearCartApi();
    setCart(EMPTY_CART);
  }, []);

  /* ---------- merged view: server cart + optimistic overrides ---------- */

  const displayItems = useMemo(() => {
    const map = new Map();
    cart.items.forEach((it) => map.set(keyOf(it.foodId, it.variantId), { ...it }));

    Object.entries(overrides).forEach(([key, ov]) => {
      const existing = map.get(key);
      if (ov.quantity <= 0) {
        map.delete(key);
        return;
      }
      if (existing) {
        map.set(key, {
          ...existing,
          quantity: ov.quantity,
          addons: ov.addons,
          lineTotal: (existing.unitPrice || ov.meta.unitPrice || 0) * ov.quantity,
        });
      } else {
        const unitPrice = ov.meta.unitPrice || 0;
        map.set(key, {
          id: `optimistic:${key}`,
          foodId: ov.meta.foodId,
          foodName: ov.meta.foodName || "",
          imageUrl: ov.meta.imageUrl || null,
          variantId: ov.meta.variantId,
          variantName: ov.meta.variantName || "",
          isDefaultVariant: ov.meta.isDefaultVariant ?? true,
          quantity: ov.quantity,
          unitPrice,
          lineTotal: unitPrice * ov.quantity,
          addons: ov.addons || [],
          availableAddons: ov.meta.availableAddons || [],
          rating: ov.meta.rating,
          voters: ov.meta.voters,
        });
      }
    });

    return Array.from(map.values());
  }, [cart.items, overrides]);

  const total = useMemo(() => displayItems.reduce((s, it) => s + (it.lineTotal || 0), 0), [displayItems]);
  const count = useMemo(() => displayItems.reduce((s, it) => s + (it.quantity || 0), 0), [displayItems]);

  const getFoodItems = useCallback(
    (foodId) => displayItems.filter((i) => i.foodId === foodId),
    [displayItems]
  );

  const getFoodQty = useCallback(
    (foodId) => getFoodItems(foodId).reduce((sum, i) => sum + i.quantity, 0),
    [getFoodItems]
  );

  const getVariantItem = useCallback(
    (foodId, variantId) => displayItems.find((i) => i.foodId === foodId && i.variantId === variantId) || null,
    [displayItems]
  );

  const distinctFoodCount = useMemo(
    () => new Set(displayItems.map((i) => i.foodId)).size,
    [displayItems]
  );

  const quickIncrement = useCallback((food) => {
    const items = getFoodItems(food.id);
    const defaultLine = items.find((i) => i.isDefaultVariant) || null;
    const currentQty = defaultLine?.quantity ?? 0;

    setItem({
      foodId: food.id,
      variantId: defaultLine?.variantId ?? null,
      quantity: currentQty + 1,
      addons: defaultLine ? defaultLine.addons.map((a) => ({ foodAddonId: a.foodAddonId, quantity: a.quantity })) : [],
      meta: defaultLine
        ? { foodName: defaultLine.foodName, imageUrl: defaultLine.imageUrl, variantName: defaultLine.variantName, unitPrice: defaultLine.unitPrice, isDefaultVariant: true }
        : { foodName: food.name, imageUrl: food.imageUrl, variantName: "", unitPrice: food.price, isDefaultVariant: true },
    });
  }, [getFoodItems, setItem]);

  const quickDecrement = useCallback((food) => {
    const items = getFoodItems(food.id);
    const target = items.find((i) => i.isDefaultVariant && i.quantity > 0) || items.find((i) => i.quantity > 0);
    if (!target) return;

    setItem({
      foodId: food.id,
      variantId: target.variantId,
      quantity: target.quantity - 1,
      addons: target.addons.map((a) => ({ foodAddonId: a.foodAddonId, quantity: a.quantity })),
      meta: { foodName: target.foodName, imageUrl: target.imageUrl, variantName: target.variantName, unitPrice: target.unitPrice, isDefaultVariant: target.isDefaultVariant },
    });
  }, [getFoodItems, setItem]);

  const value = useMemo(() => ({
    items: displayItems,
    count,
    distinctFoodCount,
    total,
    restaurantId: cart.restaurantId,
    restaurantName: cart.restaurantName,
    restaurantSlug: cart.restaurantSlug,
    tableCount: cart.tableCount,
    paymentMethod: cart.paymentMethod,
    loading,
    conflict,
    hasPendingChanges: pendingCount > 0,
    setItem,
    confirmSwitch,
    cancelSwitch,
    clear,
    refresh,
    flushPending,
    getFoodItems,
    getFoodQty,
    getVariantItem,
    quickIncrement,
    quickDecrement,
  }), [displayItems, count, distinctFoodCount, total, cart, loading, conflict, pendingCount, setItem, confirmSwitch, cancelSwitch, clear, refresh, flushPending, getFoodItems, getFoodQty, getVariantItem, quickIncrement, quickDecrement]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}