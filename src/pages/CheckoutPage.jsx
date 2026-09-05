// src/pages/CheckoutPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePageStyles from "../hooks/usePageStyles";
import CheckoutHeader from "../components/checkout/CheckoutHeader";
import CartCard from "../components/checkout/CartCard";
import CheckoutFooter from "../components/checkout/CheckoutFooter";
import StateMessage from "../components/common/StateMessage";
import { useCart } from "../components/shop/CartContext";
import { checkoutCart } from "../api/cart";
import resolveFileUrl from "../utils/resolveFileUrl";
import useDocumentTitle from "../hooks/useDocumentTitle";
import usePendingOrders from "../hooks/usePendingOrders";
import PendingOrdersCard from "../components/checkout/PendingOrdersCard";

export default function CheckoutPage() {
  useDocumentTitle("تسویه حساب");
  usePageStyles("/styles-checkout.css");
  const navigate = useNavigate();
  const cart = useCart();
  const [localCart, setLocalCart] = useState([]);
  const pendingOrders = usePendingOrders();

  useEffect(() => {
    setLocalCart(
      cart.items.map((ci) => ({
        id: ci.id,
        title: `${ci.foodName} - ${ci.variantName}`,
        img: resolveFileUrl(ci.imageUrl, "/images/checkout-pic.png"),
        rating: { score: ci.rating ?? 4.5, count: ci.voters ?? 0 },
        hasAddons: ci.addons.length > 0,
        options: [
          {
            id: ci.id,
            title: ci.variantName,
            unitPrice: ci.unitPrice,
            qty: ci.quantity,
          },
        ],
      })),
    );
  }, [cart.items]);

  const changeQty = async (itemId, _optionId, delta) => {
    const item = cart.items.find((ci) => ci.id === itemId);
    if (!item) return;
    await cart.setItem({
      foodId: item.foodId,
      variantId: item.variantId,
      quantity: Math.max(0, item.quantity + delta),
      addons: item.addons.map((a) => ({
        foodAddonId: a.foodAddonId,
        quantity: a.quantity,
      })),
    });
  };

  const successItems = localCart.map((it) => ({
    id: it.id,
    title: it.title,
    price: it.options.reduce((s, o) => s + o.unitPrice * o.qty, 0),
  }));

  const handleConfirmOrder = async (tableLabel) => {
    await cart.flushPending();
    const result = await checkoutCart(
      tableLabel === undefined ? null : tableLabel,
    );
    await cart.refresh();
    return result;
  };

  return (
    <div className="checkout-container" dir="rtl">
      <CheckoutHeader />

      {cart.items.length === 0 ? (
        pendingOrders.length > 0 ? (
          <PendingOrdersCard orders={pendingOrders} variant="empty" />
        ) : (
          <StateMessage kind="empty" title="سبد خرید شما خالی است">
            ...
          </StateMessage>
        )
      ) : (
        <>
          {pendingOrders.length > 0 && (
            <PendingOrdersCard orders={pendingOrders} variant="withCart" />
          )}
          <div className="checkout-cards">
            {localCart.map((item) => (
              <CartCard key={item.id} item={item} onChangeQty={changeQty} />
            ))}
          </div>
          <div className="footer-spacer" aria-hidden="true" />
        </>
      )}


      <CheckoutFooter
        total={cart.total}
        items={successItems}
        discount={0}
        onConfirm={handleConfirmOrder}
        restaurantId={cart.restaurantId}
        restaurantName={cart.restaurantName}
        paymentMethod={cart.paymentMethod}
        hasItems={cart.items.length > 0}
      />
    </div>
  );
}
