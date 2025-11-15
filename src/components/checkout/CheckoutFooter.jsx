import React from "react";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function CheckoutFooter({ total, modalOpen, onPayClick }) {
  return (
    <>
      <div className={`checkout-footer ${modalOpen ? "footer-pushed" : ""}`}>
        <div className="footer-action">
          <button className="pay-btn" onClick={onPayClick}>
            {modalOpen ? "روش‌های پرداخت" : "پرداخت"}
          </button>
        </div>
        <div className="footer-total">
          <div className="footer-total-label">قیمت</div>
          <div className="footer-total-amount">
            <span className="amount">{formatIR(total)}</span>
            <span className="currency">تومان</span>
          </div>
        </div>
      </div>
    </>
  );
}
