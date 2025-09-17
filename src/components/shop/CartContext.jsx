import React, { createContext, useContext, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function calcTotals(items) {
  let count = 0,
    total = 0;
  for (const it of items.values()) {
    count += it.qty;
    total += it.qty * (Number(it.price) || 0);
  }
  return { count, total };
}

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_QTY": {
      const { key, item, qty } = action;
      const next = new Map(state.items);
      if (qty <= 0) next.delete(key);
      else next.set(key, { ...item, qty });
      const { count, total } = calcTotals(next);
      return { items: next, count, total };
    }
    case "CLEAR":
      return { items: new Map(), count: 0, total: 0 };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: new Map(), // key -> {id,name,price,...,qty}
    count: 0,
    total: 0,
  });

  const api = useMemo(
    () => ({
      // derive a stable key for each menu item (id preferred; fallback to name)
      keyOf: (item) =>
        String(item?.id ?? item?.foodId ?? item?.name ?? "unknown"),
      getQty: (key) => state.items.get(key)?.qty ?? 0,
      setQty: (key, item, qty) => dispatch({ type: "SET_QTY", key, item, qty }),
      clear: () => dispatch({ type: "CLEAR" }),
      count: state.count,
      total: state.total,
      items: state.items, // Map
    }),
    [state]
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** Helper to read qty of a specific item (by item object) */
export function useCartItemQty(item) {
  const cart = useCart();
  const key = cart.keyOf(item);
  return cart.getQty(key);
}
