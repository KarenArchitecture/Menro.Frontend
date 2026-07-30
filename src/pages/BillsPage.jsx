import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BillItemCard from "../components/Bills/BillItemCard";
import { getOrderBill } from "../api/cart";
import resolveFileUrl from "../utils/resolveFileUrl";
import "../assets/css/styles-bills.css";

const toPersianNum = (n) =>
  Number(n).toLocaleString("fa-IR").replace(/٫/g, ".");

export default function BillsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    if (!id) return;
    getOrderBill(id)
      .then(setBill)
      .catch(() => setBill(null));
  }, [id]);

  if (!bill) return null;

  const items = bill.items.map((it, idx) => ({
    id: idx,
    title: it.name,
    image: resolveFileUrl(it.imageUrl, "/images/food/food-placeholder.png"),
    rating: 4.5,
    reviews: "0",
    totalPrice: it.unitPrice * it.quantity,
    variants: [
      {
        id: `v-${idx}`,
        name: it.name,
        quantity: it.quantity,
        price: it.unitPrice,
        addons: it.addons.map((a, ai) => ({
          id: `a-${idx}-${ai}`,
          name: a.name,
          quantity: a.quantity,
          price: a.extraPrice,
        })),
      },
    ],
  }));

  return (
    <div className="bills-page-container">
      <div className="bills-header" dir="rtl">
        <button className="bills-back-btn" onClick={() => navigate(-1)}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 18L16 12L10 6"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="bills-header-info">
          <div className="bills-header-title-row">
            <h2 className="bills-header-title">
              فاکتور خرید - {bill.restaurantName}
            </h2>
            <span className="bills-header-badge">
              {bill.tableNumber === null
                ? "بیرون‌بر"
                : `میز ${bill.tableNumber}`}{" "}
              — سفارش #{toPersianNum(bill.restaurantOrderNumber)}
            </span>
          </div>
          <span className="bills-header-date">
            {new Date(bill.createdAt).toLocaleDateString("fa-IR")}
          </span>
        </div>
      </div>

      <div className="bills-scroll-area">
        {items.map((item) => (
          <BillItemCard key={item.id} item={item} />
        ))}
      </div>

      <div className="bills-footer" dir="rtl">
        <span className="bills-footer-label">مجموع کل سفارش</span>
        <span className="bills-footer-total">
          {toPersianNum(bill.totalPrice)}{" "}
          <span className="bill-currency">تومان</span>
        </span>
      </div>
    </div>
  );
}
