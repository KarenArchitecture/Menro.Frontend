import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "../../assets/css/order-success-modal.css";

function defaultTitle(variant) {
  if (variant === "invoice") {
    return (
      <>
        سفارش شما <span>ثبت شد</span>
      </>
    );
  }

  if (variant === "music") {
    return (
      <>
        درخواست شما با موفقیت <span>ثبت شد</span>
      </>
    );
  }

  return (
    <>
      سفارش در انتظار <span>پرداخت حضوری شماست</span>
    </>
  );
}

function defaultSubtitle(variant) {
  if (variant === "music") {
    return "لطفا منتظر تایید رستوران برای درخواستتان بمانید";
  }

  return "";
}

function defaultIcon(variant) {
  if (variant === "invoice") return "/images/checkout-success-check.png";
  if (variant === "music") return "/images/music/success-modal-icon.svg";
  return "/images/checkout-success.png";
}

export default function OrderSuccessModal({
  open,
  variant = "checkout", // checkout | invoice | music
  iconSrc,
  title,
  subtitle,

  items = [],
  discount = 0,
  total = 0,
  invoiceNumber = null,

  primaryActionLabel,
  primaryActionTo = "",
  onPrimaryAction,
  onClose,

  formatPrice = (value) => value,

  closeOnBackdropClick = true,
}) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState(open ? "open" : "closed");

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPhase("entering");

      const id = requestAnimationFrame(() => {
        setPhase("open");
      });

      return () => cancelAnimationFrame(id);
    }

    if (mounted) {
      setPhase("exiting");
      const timeout = window.setTimeout(() => setMounted(false), 240);
      return () => window.clearTimeout(timeout);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;

    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const resolvedTitle = title ?? defaultTitle(variant);
  const resolvedSubtitle = subtitle ?? defaultSubtitle(variant);
  const resolvedIcon = iconSrc ?? defaultIcon(variant);
  const showDetails = variant !== "music";

  const resolvedActionLabel = useMemo(() => {
    if (primaryActionLabel) return primaryActionLabel;

    if (variant === "invoice") {
      return (
        <>
          شماره فاکتور{" "}
          <span className="order-success-modal__invoice-number">
            {invoiceNumber ?? "—"}
          </span>
        </>
      );
    }

    return "تایید و ادامه";
  }, [primaryActionLabel, variant, invoiceNumber]);

  const handleBackdrop = () => {
    if (closeOnBackdropClick) onClose?.();
  };

  const handlePrimary = () => {
    if (primaryActionTo) {
      navigate(primaryActionTo);
      return;
    }

    if (onPrimaryAction) {
      onPrimaryAction();
      return;
    }

    onClose?.();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`order-success-modal-root ${phase} order-success-modal-root--${variant}`}
    >
      <button
        type="button"
        className="order-success-modal__backdrop"
        aria-label="بستن"
        onClick={handleBackdrop}
      />

      <div className="order-success-modal">
        <div className="order-success-modal__hero" aria-hidden="true">
          <div className="order-success-modal__dots" />
          <div className="order-success-modal__iconWrap">
            <img
              src={resolvedIcon}
              alt=""
              className="order-success-modal__icon"
            />
          </div>
        </div>

        <div className="order-success-modal__body">
          <h2 className="order-success-modal__title">{resolvedTitle}</h2>

          {resolvedSubtitle && (
            <p className="order-success-modal__subtitle">{resolvedSubtitle}</p>
          )}

          {showDetails && items.length > 0 && (
            <div className="order-success-modal__items">
              {items.map((item) => (
                <div key={item.id} className="order-success-modal__row">
                  <div className="order-success-modal__rowLeft">
                    <div className="order-success-modal__itemTitle">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="order-success-modal__itemSub">
                        {item.subtitle}
                      </div>
                    )}
                  </div>

                  <div className="order-success-modal__rowRight">
                    <span className="order-success-modal__price">
                      {formatPrice(item.price)}
                    </span>
                    <span className="order-success-modal__currency">تومان</span>
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

          <button
            type="button"
            className="order-success-modal__cta"
            onClick={handlePrimary}
          >
            {resolvedActionLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
