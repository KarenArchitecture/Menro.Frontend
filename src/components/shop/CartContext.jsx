// CartContext.jsx
import React, { createContext, useContext, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function calcTotals(items) {
  let count = 0;
  let total = 0;

  for (const it of items.values()) {
    const qty = it.qty || 0;
    if (qty <= 0) continue;

    const basePrice = Number(it.price) || 0;

    const addonTotal =
      (it.addons || []).reduce(
        (s, a) => s + (Number(a.price) || 0) * (a.qty || 1),
        0
      ) * qty;

    count += qty;
    total += qty * basePrice + addonTotal;
  }

  return { count, total };
}

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_QTY": {
      const { key, item, qty } = action;

      const next = new Map(state.items);

      if (!item || qty <= 0) {
        next.delete(key);
      } else {
        next.set(key, { ...item, qty });
      }

      return {
        items: next,
        ...calcTotals(next),
      };
    }

    case "CLEAR":
      return { items: new Map(), count: 0, total: 0 };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: new Map(),
    count: 0,
    total: 0,
  });

  const api = useMemo(() => {
    const keyOf = (item) =>
      String(item?.id ?? item?.foodId ?? item?.name ?? "unknown");

    return {
      items: state.items,
      count: state.count,
      total: state.total,

      keyOf,
      getQty: (key) => state.items.get(key)?.qty ?? 0,

      setQty: (key, item, qty) =>
        dispatch({ type: "SET_QTY", key, item, qty }),

      clear: () => dispatch({ type: "CLEAR" }),

      // =========================
      // 🔥 SINGLE SOURCE OF TRUTH
      // =========================
      toOrderPayload: (restaurantId, tableNumber) => {
        const itemsDto = [];

        for (const item of state.items.values()) {
          const qty = item.qty || 0;
          if (qty <= 0) continue;

          const foodId =
            item.foodId ?? Number(String(item.id).split("__")[0]);

          itemsDto.push({
            foodId,
            variantId: item.variantId ?? null,
            quantity: qty,
            extras: (item.addons || []).map((a) => ({
              foodAddonId: a.foodAddonId ?? a.id,
              quantity: a.qty || 1,
            })),
          });
        }

        return {
          restaurantId,
          tableNumber,
          items: itemsDto,
        };
      },
    };
  }, [state]);

  return (
    <CartContext.Provider value={api}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}