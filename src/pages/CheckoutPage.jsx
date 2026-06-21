import React, { useMemo } from "react";
import usePageStyles from "../hooks/usePageStyles";
import { useCart } from "../components/shop/CartContext";

import CheckoutHeader from "../components/checkout/CheckoutHeader";
import CartCard from "../components/checkout/CartCard";
import CheckoutFooter from "../components/checkout/CheckoutFooter";
import { createOrder } from "../api/orders";

export default function CheckoutPage() {
  usePageStyles("/styles-checkout.css");

  const cart = useCart();

  const items = useMemo(
    () => Array.from(cart.items.values()),
    [cart.items]
  );

  const tableCount = 0;

  const handleConfirmOrder = async (tableNumber) => {
    try {
      // 🔥 FULL LOGIC IS INSIDE CART
      const payload = cart.toOrderPayload(null, tableNumber);

      const result = await createOrder(payload);

      console.log("Order created:", result);

      cart.clear();

      return result;
    } catch (err) {
      console.error("Failed to create order:", err);
      throw err;
    }
  };

  return (
    <div className="checkout-container" dir="rtl">
      <CheckoutHeader />

      <div className="checkout-cards">
        {items.map((item) => (
          <CartCard key={item.id} item={item} />
        ))}
      </div>

      <div className="footer-spacer" />

      <CheckoutFooter
        total={cart.total}
        items={items.map((i) => ({
          id: i.id,
          title: i.name ?? i.title,
          subtitle: i.variantName || "",
          price: (i.qty || 0) * (i.price || 0),
        }))}
        discount={0}
        onConfirm={handleConfirmOrder}
        tableCount={tableCount}
      />
    </div>
  );
}