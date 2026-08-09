import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BillItemCard from "../components/Bills/BillItemCard";
import { getOrderBill } from "../api/cart";
import resolveFileUrl from "../utils/resolveFileUrl";
import { toPersianDigits } from "../utils/persianNumbers";
import "../assets/css/styles-bills.css";

const toPersianNum = (n) =>
  Number(n).toLocaleString("fa-IR").replace(/٫/g, ".");

const InvoiceIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.3425 7.39511L14.6483 10.3559C14.0533 12.913 12.8775 13.9472 10.6675 13.7347C10.3133 13.7064 9.9308 13.6426 9.51996 13.5434L8.32996 13.2601C5.37621 12.5589 4.46246 11.0997 5.15663 8.13886L5.8508 5.17094C5.99246 4.56886 6.16246 4.04469 6.37496 3.61261C7.20371 1.89844 8.6133 1.43802 10.9791 1.99761L12.162 2.27386C15.13 2.96802 16.0366 4.43427 15.3425 7.39511Z"
      stroke="#FAFAF4"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.6675 13.7346C10.2283 14.0321 9.67583 14.28 9.00291 14.4996L7.88375 14.868C5.07166 15.7746 3.59125 15.0167 2.6775 12.2046L1.77083 9.40672C0.864164 6.59463 1.615 5.10713 4.42708 4.20047L5.54625 3.83213C5.83666 3.74005 6.11291 3.66213 6.375 3.61255C6.1625 4.04463 5.9925 4.5688 5.85083 5.17088L5.15666 8.1388C4.4625 11.0996 5.37625 12.5588 8.33 13.26L9.52 13.5434C9.93083 13.6425 10.3133 13.7063 10.6675 13.7346Z"
      stroke="#FAFAF4"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.95312 6.04199L12.3885 6.91324"
      stroke="#FAFAF4"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.25928 8.78345L10.3134 9.30761"
      stroke="#FAFAF4"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
    rating: Number(it.rating || 0).toFixed(1),
    reviews: it.voters ?? 0,
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

  const created = bill.createdAt ? new Date(bill.createdAt) : null;
  const dateLabel = created
    ? `${created.toLocaleDateString("fa-IR", { weekday: "long" })} ${created.toLocaleDateString("fa-IR", { day: "numeric", month: "long" })} - ${created.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`
    : "";

  // 🔧 backend changed table number (int) -> table label (string, e.g. "میز ۱",
  // "میز کنار پنجره"). The label already comes pre-formatted with Persian
  // digits baked in where relevant, so no toPersianDigits() conversion here —
  // just fall back to "بیرون‌بر" when there's no table (null/empty).
  const orderTypeLabel = bill.tableLabel ? bill.tableLabel : "بیرون‌بر";

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
            <InvoiceIcon />
            <h2 className="bills-header-title">
              فاکتور خرید - {bill.restaurantName}
            </h2>
          </div>
          <span className="bills-header-badge">
            {orderTypeLabel} — فاکتور{" "}
            {toPersianDigits(bill.invoiceNumber || "—")}
          </span>
          <span className="bills-header-date">{dateLabel}</span>
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
