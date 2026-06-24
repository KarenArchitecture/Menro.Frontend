import React, { useMemo, useState } from "react";
import OrderSuccessModal from "../common/OrderSuccessModal";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function CheckoutFooter({
  total,
  items = [],
  discount = 0,
  onConfirm,
  tableCount = 0,
}) {
  const [isPickingTable, setIsPickingTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState(undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successVariant, setSuccessVariant] = useState("checkout");
  const [invoiceNumber, setInvoiceNumber] = useState(null);

  const numericTableCount = Number(tableCount) || 0;

  const tableOptions = useMemo(() => {
    const opts = [];

    for (let i = 1; i <= numericTableCount; i += 1) {
      opts.push({
        id: i,
        label: `میز ${i}`,
      });
    }

    opts.push({
      id: null,
      label: "بیرون‌بر",
    });

    return opts;
  }, [numericTableCount]);

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    setSelectedTable(null);
    setIsPickingTable(false);
    setSuccessVariant("checkout");
    setInvoiceNumber(null);
  };

  const handlePayClick = async () => {
    if (!isPickingTable) {
      setSelectedTable(undefined);
      setIsPickingTable(true);
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const result = onConfirm ? await onConfirm(selectedTable) : null;

      const backendType = result?.successType || result?.type || "checkout";
      const nextInvoiceNumber =
        result?.invoiceNumber ?? result?.invoice ?? null;

      setSuccessVariant(backendType === "invoice" ? "invoice" : "checkout");
      setInvoiceNumber(nextInvoiceNumber);
      setShowSuccess(true);
    } catch (err) {
      console.error("Error while confirming order:", err);
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

  const isChoosingTable = isPickingTable && selectedTable === undefined;
  const payDisabled = isChoosingTable || isSubmitting;

  const payLabel = !isPickingTable
    ? "پرداخت"
    : selectedTable === undefined
      ? "میز خود را انتخاب کنید"
      : "تایید و پرداخت";

  return (
    <>
      {isPickingTable && (
        <div className="table-overlay" onClick={handleCloseTableSelector} />
      )}

      <div
        className={`checkout-footer ${isPickingTable ? "is-picking-table" : ""}`}
      >
        <div className="discount-wrapper">
          <input
            type="text"
            className="discount-input"
            placeholder="کد تخفیف دارم..."
          />
        </div>

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
              className={"pay-btn" + (payDisabled ? " pay-btn--inactive" : "")}
              onClick={handlePayClick}
              disabled={payDisabled}
            >
              {payLabel}
            </button>
          </div>
        </div>

        <div
          className={
            "table-selector-inline" + (isPickingTable ? " is-open" : "")
          }
        >
          <div className="table-grid">
            {tableOptions.map((opt) => (
              <button
                key={opt.id ?? "takeout"}
                type="button"
                className={
                  "table-chip" +
                  (selectedTable === opt.id ? " is-active" : "") +
                  (opt.id === null ? " is-wide" : "")
                }
                onClick={() => handleTableClick(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <OrderSuccessModal
        open={showSuccess}
        variant={successVariant}
        iconSrc={
          successVariant === "invoice"
            ? "/images/checkout-success-check.png"
            : "/images/checkout-success.png"
        }
        title={
          successVariant === "invoice" ? (
            <>
              سفارش شما <span>ثبت شد</span>
            </>
          ) : (
            <>
              سفارش در انتظار <span>پرداخت حضوری شماست</span>
            </>
          )
        }
        subtitle=""
        items={items}
        discount={discount}
        total={total}
        invoiceNumber={invoiceNumber}
        primaryActionTo={successVariant === "invoice" ? "/bills" : ""}
        primaryActionLabel={
          successVariant === "invoice" ? (
            <>
              شماره فاکتور{" "}
              <span className="order-success-modal__invoice-number">
                {invoiceNumber ?? "—"}
              </span>
            </>
          ) : (
            "تایید و ادامه"
          )
        }
        formatPrice={formatIR}
        onClose={handleSuccessContinue}
      />
    </>
  );
}
