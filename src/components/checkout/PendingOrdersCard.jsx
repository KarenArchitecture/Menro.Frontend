//src/components/checkout/PendingOrdersCard.jsx
import React from "react";
import { toPersianDigits } from "../../utils/persianNumbers";
import "../../assets/css/pending-orders-card.css";

export default function PendingOrdersCard({ orders, variant = "empty" }) {
  if (!orders?.length) return null;

  const invoiceList = orders.map((o) => toPersianDigits(o.invoiceNumber)).join("، ");

  if (variant === "empty") {
    const title =
      orders.length === 1
        ? <>سفارش شما <span>ثبت شده</span></>
        : <>سفارش‌های شما <span>ثبت شده</span></>;

    return (
      <div className="pending-orders-card">
        <h2 className="pending-orders-card__title">{title}</h2>
        <div className="pending-orders-card__row">
          <span className="pending-orders-card__label">شماره فاکتور</span>
          <span className="pending-orders-card__value">{invoiceList}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-orders-card pending-orders-card--compact">
      <div className="pending-orders-card__row">
        <span className="pending-orders-card__label">شماره فاکتور سفارش‌های قبلی شما</span>
        <span className="pending-orders-card__value">{invoiceList}</span>
      </div>
    </div>
  );
}