// src/components/checkout/CheckoutFooter.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import OrderSuccessModal from "../common/OrderSuccessModal";
import { markPendingCounterOrder } from "../../utils/pendingPaymentStore";
import { fetchRestaurantTables } from "../../api/cart";
import { addPendingOrder } from "../../utils/pendingOrdersStore";
import { toPersianDigits } from "../../utils/persianNumbers";

const formatIR = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function CheckoutFooter({
  total,
  items = [],
  discount = 0,
  onConfirm,
  restaurantId,
  restaurantName,
  restaurantSlug,
  paymentMethod = "",
  hasItems = true,
  pendingOrders = [], // 🔧 سفارش‌های ثبت‌شده‌ی هنوز completed-نشده (حالت سوم)
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

  const footerRef = useRef(null);
  const noticeRef = useRef(null);
  const pickingRef = useRef(false);

  const hasNotice = hasItems && paymentMethod === "PayAfterServing";

  useEffect(() => {
    pickingRef.current = isPickingTable;
  }, [isPickingTable]);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || !hasItems) return;
    const notice = noticeRef.current;
    const root = document.documentElement;

    const update = () => {
      root.style.setProperty("--footer-live-h", `${footer.offsetHeight}px`);
      if (!pickingRef.current) {
        root.style.setProperty("--footer-base-h", `${footer.offsetHeight}px`);
      }
      root.style.setProperty(
        "--notice-h",
        notice ? `${notice.offsetHeight}px` : "0px"
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(footer);
    if (notice) ro.observe(notice);

    return () => {
      ro.disconnect();
      ["--footer-live-h", "--footer-base-h", "--notice-h"].forEach((v) =>
        root.style.removeProperty(v)
      );
    };
  }, [hasItems, hasNotice, pendingOrders.length, paymentMethod, restaurantName]);

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

    // 🔧 قبل از onConfirm بگیرش — چون داخل onConfirm، cart.refresh() سبد
    // (و از جمله restaurantSlug) رو پاک می‌کنه و prop بعدش دیگه معتبر نیست
    const capturedRestaurantSlug = restaurantSlug;

    try {
      setIsSubmitting(true);

      const result = onConfirm ? await onConfirm(selectedTable) : null;
      if (!result) return;

      const isPayAtCounter =
        result.paymentMethod === "PayAtCounterBeforeServing";

      setOrderSnapshot({
        orderId: result.orderId,
        invoiceNumber: result.invoiceNumber,
        variant: isPayAtCounter ? "checkout" : "invoice",
        restaurantSlug: capturedRestaurantSlug, // 🔧 مقدار درست، نه prop زنده
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
      addPendingOrder({
        orderId: result.orderId,
        invoiceNumber: result.invoiceNumber,
        totalPrice: result.totalPrice,
      });

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

  // 🔧 متن دکمه به شیوه‌ی پرداخت وابسته‌ست و بعد از انتخاب میز دیگه عوض نمی‌شه
  const baseLabel = paymentMethod === "BankGateway" ? "پرداخت" : "ثبت سفارش";
  const payLabel = isChoosingTable ? "میز خود را انتخاب کنید" : baseLabel;

  const pendingInvoiceList = pendingOrders
    .map((o) => toPersianDigits(o.invoiceNumber))
    .join("، ");

  return (
    <>
      {hasItems && isPickingTable && (
        <div className="table-overlay" onClick={handleCloseTableSelector} />
      )}

      {hasNotice && (
        <p className="checkout-payment-notice" ref={noticeRef}>
          {restaurantName ? <>پرداخت‌های «{restaurantName}»</> : <>پرداخت‌های این رستوران</>}{" "}
          <span>پس از صرف غذا</span>، پای صندوق صورت می‌گیرد
        </p>
      )}

      {hasItems && (
        <div
          ref={footerRef}
          className={`checkout-footer ${isPickingTable ? "is-picking-table" : ""} ${hasNotice ? "has-notice" : ""
            }`}
        >
          {/* 🔧 حالت سوم: سبد پر + سفارش قبلی هنوز completed-نشده — ادغام‌شده با فوتر، نه یه کارت جدا */}
          {pendingOrders.length > 0 && (
            <div className="checkout-footer__pending-row">
              <span className="checkout-footer__pending-label">
                شماره فاکتور سفارش‌های قبل شما
              </span>
              <span className="checkout-footer__pending-value">
                {pendingInvoiceList}
              </span>
            </div>
          )}

          {/* 🔧 فقط برای پرداخت آنلاین (فعلاً هیچ رستورانی این رو انتخاب نکرده) */}
          {paymentMethod === "BankGateway" && (
            <div className="discount-wrapper">
              <input
                type="text"
                className="discount-input"
                placeholder="کد تخفیف دارم..."
              />
            </div>
          )}

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
        items={orderSnapshot?.items ?? []}
        discount={0}
        total={orderSnapshot?.total ?? 0}
        invoiceNumber={orderSnapshot?.invoiceNumber}
        primaryActionTo={
          orderSnapshot?.restaurantSlug
            ? `/restaurant/${orderSnapshot.restaurantSlug}`
            : "/orders"
        }
        formatPrice={formatIR}
        onClose={handleSuccessContinue}
      />
    </>
  );
}