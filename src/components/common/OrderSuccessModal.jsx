import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toPersianDigits } from "../../utils/persianNumbers";
import "../../assets/css/order-success-modal.css";

const AUTO_CLOSE_MS = 10000; // ۱۰ ثانیه برای variant="checkout"

function defaultTitle(variant) {
  if (variant === "invoice") return <>سفارش شما <span>ثبت شد</span></>;
  if (variant === "music") return <>درخواست شما با موفقیت <span>ثبت شد</span></>;
  return <>سفارش در انتظار پرداخت حضوری شما <span>پای صندوق است</span></>;
}

function defaultSubtitle(variant) {
  if (variant === "music") return "لطفا منتظر تایید رستوران برای درخواستتان بمانید";
  return "";
}

// پرداخت پس از صرف غذا
function CheckIcon() {
  return (
    <svg width="37" height="29" viewBox="0 0 37 29" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 17.514L11.2174 26.5L34.5 2.5" stroke="#FAFAF4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// پرداخت پیش از صرف غذا (پای صندوق)
function ClipboardIcon() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43.75 14.5834V13.271C43.75 10.7856 43.75 9.54289 43.4209 8.54063C42.7969 6.64006 41.3475 5.1479 39.5013 4.50551C38.5277 4.16675 37.3205 4.16675 34.9062 4.16675H15.0938C12.6795 4.16675 11.4723 4.16675 10.4987 4.50551C8.65254 5.1479 7.20308 6.64006 6.57907 8.54063C6.25 9.54289 6.25 10.7856 6.25 13.271V31.2501M43.75 22.9167V42.4463C43.75 44.2343 41.6979 45.183 40.3998 43.9951C39.6371 43.2972 38.4879 43.2972 37.7252 43.9951L36.7187 44.9161C35.3821 46.1392 33.3679 46.1392 32.0312 44.9161C30.6946 43.693 28.6804 43.693 27.3437 44.9161C26.0071 46.1392 23.9929 46.1392 22.6562 44.9161C21.3196 43.693 19.3054 43.693 17.9687 44.9161C16.6321 46.1392 14.6179 46.1392 13.2812 44.9161L12.2748 43.9951C11.5121 43.2972 10.3629 43.2972 9.6002 43.9951C8.30208 45.183 6.25 44.2343 6.25 42.4463V39.5834" stroke="#FAFAF4" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M19.7917 21.6667L22.7679 25.0001L30.2084 16.6667" stroke="#FAFAF4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.625 32.2917H18.75M34.375 32.2917H25" stroke="#FAFAF4" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// حلقه‌ی نارنجی که در ۱۰ ثانیه پر می‌شه، دور آیکون کلیپ‌بورد
function ProgressRing({ durationMs, resetKey }) {
  const size = 96;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      key={resetKey} // 🔧 هر بار مودال باز میشه، انیمیشن از صفر ری‌استارت میشه
      className="order-success-modal__ring is-running"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        "--ring-duration": `${durationMs}ms`,
        "--ring-circumference": circumference,
      }}
    >
      <circle
        className="order-success-modal__ring-track"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        className="order-success-modal__ring-fill"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
      />
    </svg>
  );
}

export default function OrderSuccessModal({
  open,
  variant = "checkout",
  title,
  subtitle,
  items = [],
  discount = 0,
  total = 0,
  invoiceNumber = null,
  primaryActionTo = "",
  onPrimaryAction,
  onClose,
  formatPrice = (value) => value,
  closeOnBackdropClick = true,
}) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState(open ? "open" : "closed");
  const [locked, setLocked] = useState(false); // 🔧 قفل ۱۰ ثانیه‌ای فقط برای variant="checkout"
  const [ringKey, setRingKey] = useState(0);
  const autoCloseTimer = useRef(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPhase("entering");
      const id = requestAnimationFrame(() => setPhase("open"));
      return () => cancelAnimationFrame(id);
    }
    if (mounted) {
      setPhase("exiting");
      const timeout = window.setTimeout(() => setMounted(false), 240);
      return () => window.clearTimeout(timeout);
    }
  }, [open, mounted]);

  // 🔧 قفل + بستن خودکار بعد از ۱۰ ثانیه — فقط برای variant="checkout"
  useEffect(() => {
    window.clearTimeout(autoCloseTimer.current);

    if (!open || variant !== "checkout") {
      setLocked(false);
      return;
    }

    setLocked(true);
    setRingKey((k) => k + 1);

    autoCloseTimer.current = window.setTimeout(() => {
      setLocked(false);
      onClose?.();
    }, AUTO_CLOSE_MS);

    return () => window.clearTimeout(autoCloseTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !locked) onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, locked]);

  const resolvedTitle = title ?? defaultTitle(variant);
  const resolvedSubtitle = subtitle ?? defaultSubtitle(variant);
  const showDetails = variant !== "music";
  const showInvoiceChip = variant === "checkout";
  const showCtaButton = variant === "invoice";

  const handleBackdrop = () => {
    if (locked) return; // 🔧 در ۱۰ ثانیه‌ی اول قابل بسته‌شدن نیست
    if (closeOnBackdropClick) onClose?.();
  };

  const handlePrimary = () => {
    if (primaryActionTo) { navigate(primaryActionTo); return; }
    if (onPrimaryAction) { onPrimaryAction(); return; }
    onClose?.();
  };

  if (!mounted) return null;

  return createPortal(
    <div className={`order-success-modal-root ${phase} order-success-modal-root--${variant}`}>
      <button
        type="button"
        className="order-success-modal__backdrop"
        aria-label="بستن"
        onClick={handleBackdrop}
        disabled={locked}
      />

      <div className="order-success-modal">
        <div className="order-success-modal__hero" aria-hidden="true">
          <div className="order-success-modal__dots" />
          <div className="order-success-modal__iconWrap">
            {variant === "checkout" && (
              <ProgressRing durationMs={AUTO_CLOSE_MS} resetKey={ringKey} />
            )}
            <div className="order-success-modal__icon-circle">
              {variant === "invoice" ? <CheckIcon /> : <ClipboardIcon />}
            </div>
          </div>
        </div>

        <div className="order-success-modal__body">
          <h2 className="order-success-modal__title">{resolvedTitle}</h2>

          {resolvedSubtitle && <p className="order-success-modal__subtitle">{resolvedSubtitle}</p>}

          {showDetails && items.length > 0 && (
            <div className="order-success-modal__items">
              {items.map((item) => (
                <div key={item.id} className="order-success-modal__row">
                  <div className="order-success-modal__itemTitle">
                    <span className="order-success-modal__itemName" title={item.name}>
                      {item.name}
                    </span>
                    {item.hasAddons && (
                      <span className="order-success-modal__addonsTag">با مخلفات</span>
                    )}
                  </div>
                  <div className="order-success-modal__rowRight">
                    <span className="order-success-modal__price">{formatPrice(item.unitPrice)}</span>
                    <span className="order-success-modal__currency">تومان</span>
                    <span className="order-success-modal__qty">×{toPersianDigits(item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showDetails && (
            <div className="order-success-modal__summary">
              <div className="order-success-modal__summaryRow discount">
                <span className="label">تخفیف</span>
                <span className="value">
                  {discount ? formatPrice(discount) : "۰"}
                  <span className="currency"> تومان</span>
                </span>
              </div>
              <div className="order-success-modal__summaryRow total">
                <span className="label">مجموع سفارش</span>
                <span className="value">
                  {formatPrice(total)}
                  <span className="currency"> تومان</span>
                </span>
              </div>
            </div>
          )}

          {showInvoiceChip && (
            // 🔧 دیگه دکمه نیست — فقط نمایشیه، چون این حالت اصلاً CTA ندارد
            <div className="order-success-modal__invoice-chip">
              <span>شماره فاکتور</span>
              <span className="order-success-modal__invoice-number">
                {invoiceNumber ? toPersianDigits(invoiceNumber) : "—"}
              </span>
            </div>
          )}

          {showCtaButton && (
            <button type="button" className="order-success-modal__cta" onClick={handlePrimary}>
              تایید و ادامه
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}