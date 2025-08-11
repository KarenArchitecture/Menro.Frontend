import React from "react";
import LineChart from "./LineChart";

const accountDetails = [
  { label: "نام صاحب حساب:", value: "کاربر ادمین" },
  { label: "شماره شبا:", value: "IR123456789012345678901234" },
  { label: "شماره حساب:", value: "987654321" },
];

const purchases = [
  {
    id: "#10542",
    date: "۱۸ خرداد ۱۴۰۴",
    amount: "۲۵۰,۰۰۰ تومان",
    status: "success",
  },
  {
    id: "#10541",
    date: "۱۷ خرداد ۱۴۰۴",
    amount: "۱۲۰,۰۰۰ تومان",
    status: "success",
  },
  {
    id: "#10539",
    date: "۱۷ خرداد ۱۴۰۴",
    amount: "۴۵,۰۰۰ تومان",
    status: "danger",
  },
  {
    id: "#10539",
    date: "۱۷ خرداد ۱۴۰۴",
    amount: "۴۵,۰۰۰ تومان",
    status: "danger",
  },
  {
    id: "#10539",
    date: "۱۷ خرداد ۱۴۰۴",
    amount: "۴۵,۰۰۰ تومان",
    status: "danger",
  },
  {
    id: "#10541",
    date: "۱۷ خرداد ۱۴۰۴",
    amount: "۱۲۰,۰۰۰ تومان",
    status: "success",
  },
];

function last7DaysFA() {
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(
      d.toLocaleDateString("fa-IR", { month: "short", day: "numeric" })
    );
  }
  return labels;
}

export default function FinancialSection() {
  return (
    <div className="financial-grid">
      {/* Account details */}
      <div className="panel">
        <h3>مشخصات حساب</h3>
        <div className="account-details">
          {accountDetails.map((row) => (
            <div key={row.label} className="detail-item">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Recent purchases — TABLE (desktop/tablet) + CARDS (phones) */}
      <div className="panel">
        <h3>خریدهای اخیر</h3>

        {/* Table for ≥768px */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>شماره سفارش</th>
                <th>تاریخ</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p, idx) => (
                <tr key={`${p.id}-${idx}`}>
                  <td>{p.id}</td>
                  <td>{p.date}</td>
                  <td>{p.amount}</td>
                  <td>
                    <span
                      className={`status-chip ${
                        p.status === "danger" ? "danger" : "active"
                      }`}
                    >
                      {p.status === "danger" ? "پرداخت ناموفق" : "پرداخت موفق"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards for <768px */}
        <div className="cards-list purchases-cards">
          {purchases.map((p, idx) => (
            <article
              className="data-card"
              key={`${p.id}-card-${idx}`}
              aria-label="آیتم خرید"
            >
              <div className="row">
                <span className="label">شماره سفارش</span>
                <span className="value">{p.id}</span>
              </div>
              <div className="row">
                <span className="label">تاریخ</span>
                <span className="value">{p.date}</span>
              </div>
              <div className="row">
                <span className="label">مبلغ</span>
                <span className="value">{p.amount}</span>
              </div>
              <div className="row">
                <span className="label">وضعیت</span>
                <span
                  className={`status-chip ${
                    p.status === "danger" ? "danger" : "active"
                  }`}
                >
                  {p.status === "danger" ? "پرداخت ناموفق" : "پرداخت موفق"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Profit chart */}
      <div className="panel chart-panel full-width">
        <h3>نمودار سود</h3>
        <div className="chart-container">
          <LineChart
            labels={last7DaysFA()}
            datasetLabel="میزان سود"
            data={[5, 12, 10, 22, 18, 25, 30]}
            colorConfig={{
              borderColor: "#10B981",
              gradientStart: "rgba(16, 185, 129, 0.3)",
              gradientEnd: "rgba(16, 185, 129, 0)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
