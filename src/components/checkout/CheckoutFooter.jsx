import React, { useState } from "react";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

const TABLE_OPTIONS = [
  { id: "t1", label: "میز 1" },
  { id: "t2", label: "میز 2" },
  { id: "t3", label: "میز 3" },
  { id: "t4", label: "میز 4" },
  { id: "t5", label: "میز 5" },
  { id: "t6", label: "میز 6" },
  { id: "takeout", label: "بیرون‌بر" },
];

export default function CheckoutFooter({
  total,
  items = [],
  discount = 0,
  onConfirm,
}) {
  const [isPickingTable, setIsPickingTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    // optional: reset table for next order
    setSelectedTable(null);
    setIsPickingTable(false);
  };

  const handlePayClick = async () => {
    // first click → open selector
    if (!isPickingTable) {
      setIsPickingTable(true);
      return;
    }

    // no table selected or already submitting → do nothing
    if (!selectedTable || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 🔹 Call parent to actually create the order
      if (onConfirm) {
        await onConfirm(selectedTable); // e.g. "t3" or "takeout"
      }

      // if backend succeeds → show success UI
      setShowSuccess(true);
    } catch (err) {
      console.error("Error while confirming order:", err);
      // optional: show toast / error UI here
    } finally {
      setIsSubmitting(false);
      setIsPickingTable(false);
    }
  };

  const handleCloseTableSelector = () => {
    setIsPickingTable(false);
  };

  const handleTableClick = (id) => {
    setSelectedTable(id);
  };

  // button state
  const isChoosingTable = isPickingTable && !selectedTable;
  const payDisabled = isChoosingTable || isSubmitting;

  const payLabel = !isPickingTable
    ? "پرداخت"
    : !selectedTable
    ? "میز خود را انتخاب کنید"
    : "تایید و پرداخت";

  return (
    <>
      {/* CLICK-OUTSIDE OVERLAY (behind footer) */}
      {isPickingTable && (
        <div className="table-overlay" onClick={handleCloseTableSelector} />
      )}

      {/* SINGLE fixed footer */}
      <div
        className={`checkout-footer ${
          isPickingTable ? "is-picking-table" : ""
        }`}
      >
        {/* discount code field */}
        <div className="discount-wrapper">
          <input
            type="text"
            className="discount-input"
            placeholder="کد تخفیف دارم..."
          />
        </div>

        {/* price + button row */}
        <div className="footer-main">
          <div className="footer-total">
            <div className="footer-total-label">قیمت کل</div>
            <div className="footer-total-amount">
              <span className="amount">{formatIR(total)}</span>
              <span className="currency">تومان</span>
            </div>
          </div>

          <div className="footer-action">
            <button
              className={
                "pay-btn" + (payDisabled ? " pay-btn--inactive" : "")
              }
              onClick={handlePayClick}
              disabled={payDisabled}
            >
              {payLabel}
            </button>
          </div>
        </div>

        {/* INLINE TABLE SELECTOR (part of the footer) */}
        <div
          className={
            "table-selector-inline" + (isPickingTable ? " is-open" : "")
          }
        >
          <div className="table-grid">
            {TABLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={
                  "table-chip" +
                  (selectedTable === opt.id ? " is-active" : "") +
                  (opt.id === "takeout" ? " is-wide" : "")
                }
                onClick={() => handleTableClick(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="order-success-backdrop">
          <div className="order-success-modal">
            <img
              src="/images/checkout-success.png"
              alt="سفارش با موفقیت ثبت شد"
              className="order-success-icon"
            />

            <h2 className="order-success-title">
              سفارش شما <span>ثبت شد</span>
            </h2>

            {items.length > 0 && (
              <div className="order-success-items">
                {items.map((item) => (
                  <div key={item.id} className="order-success-row">
                    <div className="order-success-row-left">
                      <div className="item-title">{item.title}</div>
                      {item.subtitle && (
                        <div className="item-sub">{item.subtitle}</div>
                      )}
                    </div>
                    <div className="order-success-row-right">
                      <span className="price">{formatIR(item.price)}</span>
                      <span className="currency">تومان</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="order-success-summary">
              <div className="order-success-summary-row discount">
                <span className="label">تخفیف</span>
                <span className="value">
                  {discount ? formatIR(discount) : "۰"}
                  <span className="currency"> تومان</span>
                </span>
              </div>
              <div className="order-success-summary-row total">
                <span className="label">مجموع سفارش</span>
                <span className="value">
                  {formatIR(total)}
                  <span className="currency"> تومان</span>
                </span>
              </div>
            </div>

            <button
              className="order-success-cta"
              onClick={handleSuccessContinue}
            >
              تایید و ادامه
            </button>
          </div>
        </div>
      )}
    </>
  );
}
