import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import usePageStyles from "../hooks/usePageStyles";

import CheckoutHeader from "../components/checkout/CheckoutHeader";
import CartCard from "../components/checkout/CartCard";
import CheckoutFooter from "../components/checkout/CheckoutFooter";
import { createOrder } from "../api/orders";

export default function CheckoutPage() {
  usePageStyles("/styles-checkout.css");

  const location = useLocation();
  const navState = location.state;

  const [cart, setCart] = useState(() => {
    if (!navState?.items || !Array.isArray(navState.items)) {
      return initialCart; // keep your existing fallback
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
      addons: Array.isArray(ci.addons) ? ci.addons : [], // keep extraIds
      variantId: ci.variantId ?? null, // keep variant
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

  const tableCount = navState?.tableCount ?? 0;

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

  const restaurantId = navState?.restaurantId;

  const handleConfirmOrder = async (tableCode) => {
    if (!restaurantId) {
      throw new Error("Missing restaurantId in checkout state");
    }

    const itemsDto = [];

    cart.forEach((item) => {
      const [foodIdStr] = String(item.id).split("__");
      const foodId = Number(foodIdStr);

      item.options.forEach((opt) => {
        const qty = opt.qty || 0;
        if (qty <= 0) return;

        let variantId = null;
        if (item.variantId != null) {
          variantId = item.variantId;
        } else if (opt.id !== "default") {
          variantId = Number(opt.id);
        }

        itemsDto.push({
          foodId,
          variantId,
          quantity: qty,
          unitPrice: opt.unitPrice,
          extraIds: item.addons || [],
        });
      });
    });

    if (!itemsDto.length) {
      throw new Error("No items with quantity > 0");
    }

    const payload = {
      restaurantId,
      tableCode, // "t1", "t2", ..., "takeout"
      items: itemsDto,
    };

    try {
      const result = await createOrder(payload); // result = { orderId }
      console.log("Order created:", result);
      return result;
    } catch (err) {
      console.error("Failed to create order:", err);
      throw err; // IMPORTANT: let CheckoutFooter know it failed
    }
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

      <CheckoutFooter
        total={total}
        items={successItems}
        discount={0}
        onConfirm={handleConfirmOrder}
        tableCount={tableCount}
      />
    </div>
  );
}
