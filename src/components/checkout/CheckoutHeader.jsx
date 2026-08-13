// components/checkout/CheckoutHeader.jsx
import React from "react";
import PageHeader from "../common/PageHeader";

const CartIcon = () => (
  <img src="/images/checkout-bag-hollow.svg" alt="" />
);

export default function CheckoutHeader() {
  return <PageHeader icon={<CartIcon />} title="سبد خرید" />;
}