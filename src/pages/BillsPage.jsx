import React from "react";
import { useNavigate } from "react-router-dom";
import BillItemCard from "../components/Bills/BillItemCard";
import "../assets/css/styles-bills.css";
import useDocumentTitle from "../hooks/useDocumentTitle";

// Utility function to convert numbers to Persian digits
const toPersianNum = (num) =>
  Number(num).toLocaleString("fa-IR").replace(/٫/g, ".");

const DUMMY_BILL_ITEMS = [
  {
    id: 1,
    title: "قهوه با نام طولانی سه خطی خیلی طولان...",
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=200&h=200",
    rating: 4.5,
    reviews: "6,879",
    totalPrice: 24000000,
    variants: [
      {
        id: "v1",
        name: "بزرگ",
        quantity: 15,
        price: 240000,
        addons: [
          { id: "a1", name: "بیسکوییت خرد شده", quantity: 12, price: 12000 },
          { id: "a2", name: "قاشق یکبار مصرف", quantity: 8, price: 12000 },
        ],
      },
      { id: "v2", name: "متوسط", quantity: 2, price: 240000, addons: [] },
      {
        id: "v3",
        name: "کوچک",
        quantity: null,
        price: 240000,
        addons: [{ id: "a3", name: "نی", quantity: null, price: 12000 }],
      },
    ],
  },
  {
    id: 2,
    title: "قهوه با نام طولانی سه خطی خیلی طولان...",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=200&h=200",
    rating: 4.5,
    reviews: "6,879",
    totalPrice: 3400000,
    variants: [
      {
        id: "v4",
        name: "قهوه با نام طولانی سه خطی...",
        quantity: 15,
        price: 240000,
        addons: [
          { id: "a4", name: "بیسکوییت خرد شده", quantity: null, price: null },
          { id: "a5", name: "اسماتیز", quantity: null, price: null },
        ],
      },
    ],
  },
];

export default function BillsPage() {
  const navigate = useNavigate();
  const orderTotal = 27400000;
  useDocumentTitle("فاکتور خرید - بیرون‌بر ۲۶۳");

  return (
    <div className="bills-page-container">
      {/* 1. Header (Updated to match design) */}
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
            {/* Document/Receipt Icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 13H8"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 17H8"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 9H8"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="bills-header-title">فاکتور خرید - منرو</h2>
            <span className="bills-header-badge">بیرون‌بر ۲۶۳</span>
          </div>
          <span className="bills-header-date">یکشنبه ۱۲ شهریور - ۱۸:۰۰</span>
        </div>
      </div>

      {/* 2. Scrollable Content Area */}
      <div className="bills-scroll-area">
        {DUMMY_BILL_ITEMS.map((item) => (
          <BillItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* 3. Fixed Footer */}
      <div className="bills-footer" dir="rtl">
        <span className="bills-footer-label">مجموع کل سفارش</span>
        <span className="bills-footer-total">
          {toPersianNum(orderTotal)}{" "}
          <span className="bill-currency">تومان</span>
        </span>
      </div>
    </div>
  );
}
