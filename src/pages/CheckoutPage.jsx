// src/pages/CheckoutPage.jsx
import React, { useMemo, useState } from "react";
import usePageStyles from "../hooks/usePageStyles";

import CheckoutHeader from "../components/checkout/CheckoutHeader";
import CartCard from "../components/checkout/CartCard";
// ❌ remove PaymentModal import
// import PaymentModal from "../components/checkout/PaymentModal";
import CheckoutFooter from "../components/checkout/CheckoutFooter";

const initialCart = [
  {
    id: "coffee-1",
    title: "موکا",
    img: "/images/checkout-pic.png",
    rating: { score: 4.5, count: 6879 },
    subtext: "٪99 شیر، ٪1 قهوه",
    options: [
      {
        id: "o-1",
        title: "کوچک",
        unitPrice: 300000,
        qty: 1,
        weight: "250 گرم",
      },
      {
        id: "o-2",
        title: "متوسط",
        unitPrice: 300000,
        qty: 1,
        weight: "250 گرم",
      },
      {
        id: "o-3",
        title: "بزرگ",
        unitPrice: 300000,
        qty: 1,
        weight: "250 گرم",
      },
    ],
  },
  {
    id: "coffee-2",
    title: "قهوه با اسم خیلی خیلی خیلی طولانی",
    img: "/images/checkout-pic.png",
    rating: { score: 4.5, count: 6879 },
    subtext: "٪99 شیر، ٪1 قهوه",
    options: [
      {
        id: "o-1",
        title: "کوچک",
        unitPrice: 300000,
        qty: 1,
        weight: "250 گرم",
      },
      {
        id: "o-2",
        title: "متوسط",
        unitPrice: 300000,
        qty: 1,
        weight: "250 گرم",
      },
      {
        id: "o-3",
        title: "بزرگ",
        unitPrice: 300000,
        qty: 1,
        weight: "250 گرم",
      },
    ],
  },
];

export default function CheckoutPage() {
  usePageStyles("/styles-checkout.css");

  const [cart, setCart] = useState(initialCart);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const opts = item.options.reduce((s, o) => s + o.unitPrice * o.qty, 0);
      return sum + opts;
    }, 0);
  }, [cart]);

  // آیتم‌هایی که در مودال موفقیت نمایش داده می‌شوند
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
