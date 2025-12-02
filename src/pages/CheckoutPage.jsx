import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom"; // ⬅️ add this
import usePageStyles from "../hooks/usePageStyles";

import CheckoutHeader from "../components/checkout/CheckoutHeader";
import CartCard from "../components/checkout/CartCard";
import CheckoutFooter from "../components/checkout/CheckoutFooter";
export default function CheckoutPage() {
  usePageStyles("/styles-checkout.css");

  const location = useLocation();
  const navState = location.state;

  const [cart, setCart] = useState(() => {
    if (!navState?.items || !Array.isArray(navState.items)) {
      return initialCart;
    }

    return navState.items.map((ci) => ({
      id: ci.id,
      title: ci.name, // e.g. "کباب - بزرگ"
      img: ci.imageUrl
        ? `https://localhost:7270${ci.imageUrl}`
        : "/images/checkout-pic.png",
      rating: { score: 4.5, count: 0 }, // placeholder for now
      subtext: "",
      hasAddons: Array.isArray(ci.addons) && ci.addons.length > 0,
      options: [
        {
          id: ci.variantId || "default",
          title: ci.variantName || "سایز",
          unitPrice: ci.price,
          qty: ci.qty ?? 1,
          weight: "",
        },
      ],
    }));
  });

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const opts = item.options.reduce((s, o) => s + o.unitPrice * o.qty, 0);
      return sum + opts;
    }, 0);
  }, [cart]);

  const successItems = useMemo(
    () =>
      cart.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtext,
        price: item.options.reduce((s, o) => s + o.unitPrice * o.qty, 0),
      })),
    [cart]
  );

  const changeQty = (itemId, optionId, delta) => {
    setCart((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          options: it.options.map((op) => {
            if (op.id !== optionId) return op;
            const nextQty = Math.max(0, op.qty + delta);
            return { ...op, qty: nextQty };
          }),
        };
      })
    );
  };

  return (
    <div className="checkout-container" dir="rtl">
      <CheckoutHeader />

      <div className="checkout-cards">
        {cart.map((item) => (
          <CartCard key={item.id} item={item} onChangeQty={changeQty} />
        ))}
      </div>

      <div className="footer-spacer" aria-hidden="true" />

      <CheckoutFooter total={total} items={successItems} discount={0} />
    </div>
  );
}
