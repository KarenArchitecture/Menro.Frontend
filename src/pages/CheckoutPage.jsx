import React, { useEffect, useState } from "react";
import usePageStyles from "../hooks/usePageStyles";
import CheckoutHeader from "../components/checkout/CheckoutHeader";
import CartCard from "../components/checkout/CartCard";
import CheckoutFooter from "../components/checkout/CheckoutFooter";
import { useCart } from "../components/shop/CartContext";
import { checkoutCart } from "../api/cart";
import resolveFileUrl from "../utils/resolveFileUrl";

export default function CheckoutPage() {
  usePageStyles("/styles-checkout.css");
  const cart = useCart();
  const [localCart, setLocalCart] = useState([]);

  useEffect(() => {
    setLocalCart(
      cart.items.map((ci) => ({
        id: ci.id,
        title: `${ci.foodName} - ${ci.variantName}`,
        img: resolveFileUrl(ci.imageUrl, "/images/checkout-pic.png"),
        rating: { score: 4.5, count: 0 },
        hasAddons: ci.addons.length > 0,
        options: [{ id: ci.id, title: ci.variantName, unitPrice: ci.unitPrice, qty: ci.quantity }],
      }))
    );
  }, [cart.items]);

  const changeQty = async (itemId, _optionId, delta) => {
    const item = cart.items.find((ci) => ci.id === itemId);
    if (!item) return;
    await cart.setItem({
      foodId: item.foodId,
      variantId: item.variantId,
      quantity: Math.max(0, item.quantity + delta),
      addons: item.addons.map((a) => ({ foodAddonId: a.foodAddonId, quantity: a.quantity })),
    });
  };

  const successItems = localCart.map((it) => ({
    id: it.id,
    title: it.title,
    price: it.options.reduce((s, o) => s + o.unitPrice * o.qty, 0),
  }));

  const handleConfirmOrder = async (tableNumber) => {
    const result = await checkoutCart(tableNumber === undefined ? null : tableNumber);
    await cart.refresh();
    return result;
  };

  return (
    <div className="checkout-container" dir="rtl">
      <CheckoutHeader />
      <div className="checkout-cards">
        {localCart.map((item) => (
          <CartCard key={item.id} item={item} onChangeQty={changeQty} />
        ))}
      </div>
      <div className="footer-spacer" aria-hidden="true" />
      <CheckoutFooter
        total={cart.total}
        items={successItems}
        discount={0}
        onConfirm={handleConfirmOrder}
        tableCount={cart.tableCount}
      />
    </div>
  );
}