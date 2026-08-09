// src/components/checkout/CheckoutFooter.jsx
import React, { useEffect, useMemo, useState } from "react";
import OrderSuccessModal from "../common/OrderSuccessModal";
import { markPendingCounterOrder } from "../common/PendingPaymentBanner";
import { fetchRestaurantTables } from "../../api/cart";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function CheckoutFooter({
  total,
  items = [],
  discount = 0,
  onConfirm,
  restaurantId, // ← جایگزین tableCount
  paymentMethod = "",
  hasItems = true,
}) {
  const [isPickingTable, setIsPickingTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState(undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;

    fetchRestaurantTables(restaurantId)
      .then((data) => {
        if (!cancelled) setTables(data ?? []);
      })
      .catch((err) => {
        console.error("Error fetching restaurant tables:", err);
        if (!cancelled) setTables([]);
      });

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const tableOptions = useMemo(() => {
    const opts = tables.map((t) => ({
      id: t.tableLabel,
      label: t.tableLabel,
    }));
    opts.push({ id: null, label: "بیرون‌بر" });
    return opts;
  }, [tables]);

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    setSelectedTable(null);
    setIsPickingTable(false);
    setOrderSnapshot(null);
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
      if (!result) return;

      const isPayAtCounter =
        result.paymentMethod === "PayAtCounterBeforeServing";

      setOrderSnapshot({
        orderId: result.orderId,
        invoiceNumber: result.invoiceNumber,
        // "checkout" -> pay-at-counter (invoice chip, no CTA)
        // "invoice"  -> pay-after-serving (CTA button, no chip)
        variant: isPayAtCounter ? "checkout" : "invoice",
        items: (result.items || []).map((it, idx) => ({
          id: idx,
          name: it.variantName
            ? `${it.foodName} ${it.variantName}`
            : it.foodName,
          hasAddons: it.hasAddons,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
        total: result.totalPrice,
      });

      if (isPayAtCounter) {
        markPendingCounterOrder(result.orderId, result.restaurantName || "");
      }

      setShowSuccess(true);
    } catch (err) {
      console.error("Error while confirming order:", err);
    } finally {
      setIsSubmitting(false);
      setIsPickingTable(false);
    }
  };

  const handleCloseTableSelector = () => setIsPickingTable(false);
  const handleTableClick = (id) => setSelectedTable(id);

  const isChoosingTable = isPickingTable && selectedTable === undefined;
  const payDisabled = isChoosingTable || isSubmitting;

  const payLabel = !isPickingTable
    ? "پرداخت"
    : selectedTable === undefined
      ? "میز خود را انتخاب کنید"
      : "تایید و پرداخت";

  return (
    <>
      {hasItems && isPickingTable && (
        <div className="table-overlay" onClick={handleCloseTableSelector} />
      )}

      {hasItems && paymentMethod === "PayAfterServing" && (
        <div className="checkout-payment-notice">
          پرداخت‌های این رستوران پس از صرف غذا، پای صندوق صورت می‌گیرد
        </div>
      )}

      {hasItems && (
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
      )}

      <OrderSuccessModal
        open={showSuccess}
        variant={orderSnapshot?.variant ?? "checkout"}
        iconSrc={
          orderSnapshot?.variant === "invoice"
            ? "/images/checkout-success-check.png"
            : "/images/checkout-success.png"
        }
        title={
          orderSnapshot?.variant === "invoice" ? (
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
        items={orderSnapshot?.items ?? []}
        discount={0}
        total={orderSnapshot?.total ?? 0}
        invoiceNumber={orderSnapshot?.invoiceNumber}
        primaryActionTo={
          orderSnapshot?.variant === "invoice"
            ? "/orders"
            : `/orders/bill/${orderSnapshot?.orderId}`
        }
        formatPrice={formatIR}
        onClose={handleSuccessContinue}
      />
    </>
  );
}
