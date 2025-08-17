import React from "react";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function PaymentModal({ open, onClose, total }) {
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
          <div className="checkout-modal-pay">
            <button className="checkout-modal-pay-btn" type="button">
              روش‌های پرداخت
            </button>

            <div className="checkout-modal-price">
              <span className="label">قیمت</span>
              <div className="checkout-modal-total">
                <strong>{formatIR(total)}</strong>
                <span>تومان</span>
              </div>
            </div>
          </div>

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
