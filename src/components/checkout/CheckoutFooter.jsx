import React, { useState, useMemo } from "react";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function CheckoutFooter({
  total,
  items = [],
  discount = 0,
  onConfirm,
  // new prop
  tableCount = 0,
}) {
  const [isPickingTable, setIsPickingTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ------------------------ dynamic table options ------------------------ */
  // ensure tableCount is a number >= 0
  const numericTableCount = Number(tableCount) || 0;

  const tableOptions = useMemo(() => {
    const opts = [];

    // add numbered tables 1..N
    for (let i = 1; i <= numericTableCount; i += 1) {
      opts.push({
        id: String(i),        // "1", "2", ...
        label: `میز ${i}`,
      });
    }

    // always add بیرون‌بر at the end
    opts.push({
      id: "takeout",
      label: "بیرون‌بر",
    });

    return opts;
  }, [numericTableCount]);

  /* ------------------------ handlers ------------------------ */
  const handleSuccessContinue = () => {
    setShowSuccess(false);
    setSelectedTable(null);
    setIsPickingTable(false);
  };

  const handlePayClick = async () => {
    // first click → open selector
    if (!isPickingTable) {
      setIsPickingTable(true);
      return;
    }

    // nothing selected or already submitting
    if (!selectedTable || isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (onConfirm) {
        // pass selectedTable like "1", "2", ..., or "takeout"
        await onConfirm(selectedTable);
      }

      // show success UI
      setShowSuccess(true);
    } catch (err) {
      console.error("Error while confirming order:", err);
      // optional: show toast or error message
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

  /* ------------------------ UI state ------------------------ */
  const isChoosingTable = isPickingTable && !selectedTable;
  const payDisabled = isChoosingTable || isSubmitting;

  const payLabel = !isPickingTable
    ? "پرداخت"
    : !selectedTable
    ? "میز خود را انتخاب کنید"
    : "تایید و پرداخت";

  /* ------------------------ render ------------------------ */
  return (
    <>
      {/* overlay behind footer when picking table */}
      {isPickingTable && (
        <div className="table-overlay" onClick={handleCloseTableSelector} />
      )}

      {/* fixed footer */}
      <div
        className={`checkout-footer ${
          isPickingTable ? "is-picking-table" : ""
        }`}
      >
        {/* discount input */}
        <div className="discount-wrapper">
          <input
            type="text"
            className="discount-input"
            placeholder="کد تخفیف دارم..."
          />
        </div>

        {/* total + pay button */}
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

        {/* inline table selector */}
        <div
          className={
            "table-selector-inline" + (isPickingTable ? " is-open" : "")
          }
        >
          <div className="table-grid">
            {tableOptions.map((opt) => (
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

      {/* success modal */}
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
