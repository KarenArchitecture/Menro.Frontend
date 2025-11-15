import React from "react";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function PaymentModal({ open, onClose, total = 0 }) {
  return (
    <>
      <div
        className={`modal-overlay ${open ? "active" : ""}`}
        onClick={onClose}
      />
      <div
        className={`payment-modal ${open ? "active" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-content">
          {/* Header row inside sheet */}
          <div className="checkout-modal-pay">
            <button className="checkout-modal-pay-btn" type="button" disabled>
              روش‌های پرداخت
            </button>

            {/* Price block (label above number) */}
            <div className="checkout-modal-total" aria-live="polite">
              <span className="checkout-total-label">قیمت</span>
              <div className="checkout-modal-total-line">
                <strong className="checkout-total-amount">
                  {formatIR(total)}
                </strong>
                <span className="checkout-total-currency">تومان</span>
              </div>
            </div>
          </div>

          {/* Gateways */}
          <div className="payment-options">
            {[1, 2, 3].map((i) => (
              <button className="payment-card" key={i} type="button">
                <div className="checkout-modal-bank-logo">
                  <img
                    src="/images/checkout-bank.png"
                    alt="بانک ملی"
                    className="bank-logo"
                  />
                </div>
                <div className="checkout-modal-bank-detail">
                  <p className="checkout-modal-bank-name">بانک ملی</p>
                  <p className="checkout-modal-bank-description">
                    پرداخت از درگاه بانک ملی
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
