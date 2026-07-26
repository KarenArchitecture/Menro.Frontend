// src/components/shop/CartContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCart, setCartItem, clearCart as clearCartApi, mergeGuestCart } from "../../api/cart";
import { useAuth } from "../../Context/AuthContext";

const CartContext = createContext(null);

const EMPTY_CART = {
  id: null,
  restaurantId: null,
  restaurantName: null,
  restaurantSlug: null,
  tableCount: 0,
  items: [],
  total: 0,
  count: 0,
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [conflict, setConflict] = useState(null);

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

  // Runs whenever auth state changes (login/logout). On login, merges the
  // guest-token cart into the user's cart first, then loads whatever's live.
  useEffect(() => {
    setLoading(true);
    (async () => {
      if (user) {
        try {
          await mergeGuestCart();
        } catch (err) {
          console.warn("Cart merge failed:", err?.response?.data?.message || err.message);
        }
      }
      await refresh();
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setItem = useCallback(async (dto) => {
    try {
      const result = await setCartItem(dto);
      if (result.conflict) {
        setConflict({ conflictingRestaurantName: result.conflictingRestaurantName, pendingDto: dto });
        if (result.cart) setCart(result.cart);
        return;
      }
      setCart(result.cart ?? EMPTY_CART);
    } catch (err) {
      console.error("Cart update failed:", err?.response?.data?.message || err.message);
      throw err;
    }
  }, []);

  const confirmSwitch = useCallback(async () => {
    if (!conflict?.pendingDto) return;
    const dto = { ...conflict.pendingDto, confirmRestaurantSwitch: true };
    setConflict(null);
    const result = await setCartItem(dto);
    setCart(result.cart ?? EMPTY_CART);
  }, [conflict]);

  const cancelSwitch = useCallback(() => setConflict(null), []);

  const clear = useCallback(async () => {
    await clearCartApi();
    setCart(EMPTY_CART);
  }, []);

  /* ---------- selectors ---------- */

  const getFoodItems = useCallback(
    (foodId) => cart.items.filter((i) => i.foodId === foodId),
    [cart.items]
  );

  const getFoodQty = useCallback(
    (foodId) => getFoodItems(foodId).reduce((sum, i) => sum + i.quantity, 0),
    [getFoodItems]
  );

  const getVariantItem = useCallback(
    (foodId, variantId) => cart.items.find((i) => i.foodId === foodId && i.variantId === variantId) || null,
    [cart.items]
  );

  const distinctFoodCount = useMemo(
    () => new Set(cart.items.map((i) => i.foodId)).size,
    [cart.items]
  );

  const quickIncrement = useCallback(
    async (food) => {
      const items = getFoodItems(food.id);
      const defaultLine = items.find((i) => i.isDefaultVariant) || null;
      const currentQty = defaultLine?.quantity ?? 0;

      await setItem({
        foodId: food.id,
        variantId: defaultLine?.variantId ?? null,
        quantity: currentQty + 1,
        addons: defaultLine
          ? defaultLine.addons.map((a) => ({ foodAddonId: a.foodAddonId, quantity: a.quantity }))
          : [],
      });
    },
    [getFoodItems, setItem]
  );

  const quickDecrement = useCallback(
    async (food) => {
      const items = getFoodItems(food.id);
      const target = items.find((i) => i.isDefaultVariant && i.quantity > 0) || items.find((i) => i.quantity > 0);
      if (!target) return;

      await setItem({
        foodId: food.id,
        variantId: target.variantId,
        quantity: target.quantity - 1,
        addons: target.addons.map((a) => ({ foodAddonId: a.foodAddonId, quantity: a.quantity })),
      });
    },
    [getFoodItems, setItem]
  );

  const value = useMemo(
    () => ({
      items: cart.items,
      count: cart.count,
      distinctFoodCount,
      total: cart.total,
      restaurantId: cart.restaurantId,
      restaurantName: cart.restaurantName,
      restaurantSlug: cart.restaurantSlug,
      tableCount: cart.tableCount,
      loading,
      conflict,
      setItem,
      confirmSwitch,
      cancelSwitch,
      clear,
      refresh,
      getFoodItems,
      getFoodQty,
      getVariantItem,
      quickIncrement,
      quickDecrement,
    }),
    [cart, loading, conflict, distinctFoodCount, setItem, confirmSwitch, cancelSwitch, clear, refresh, getFoodItems, getFoodQty, getVariantItem, quickIncrement, quickDecrement]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}