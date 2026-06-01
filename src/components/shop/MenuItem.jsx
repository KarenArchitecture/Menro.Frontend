import React, { useMemo } from "react";
import { useCart } from "./CartContext";
import StarIcon from "../icons/StarIcon";
import resolveFileUrl from "../../utils/resolveFileUrl";

export default function MenuItem({ item, onOpen, layout = "horizontal" }) {
  const cart = useCart();

  const { name, price, imageUrl, rating = 4.5, voters = 0 } = item || {};

  const toPersianDigits = (value) => {
    if (value === null || value === undefined) return "";

    return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);
  };

  const formatTomans = (n) => (Number(n) || 0).toLocaleString("fa-IR");

  const formatRating = (value) => {
    const num = Number(value) || 0;

    // اگر عدد اعشاری بود، یک رقم اعشار نگه می‌داریم
    // مثلا 4.5 => ۴.۵
    // اگر 4 بود => ۴.۰
    return toPersianDigits(num.toFixed(1));
  };

  const formatVoters = (value) => {
    return toPersianDigits((Number(value) || 0).toLocaleString("en-US"));
  };

  // اصلاح منطق ساخت URL
  const fullImageUrl =
    resolveFileUrl(imageUrl) || "/images/food/food-placeholder.png";


  // ---- cart key for this food ----
  const baseKey = cart.keyOf(item);
  const baseQty = cart.getQty(baseKey);

  const totalQty = useMemo(() => {
    let sum = 0;
    for (const [k, val] of cart.items.entries()) {
      if (k === baseKey || k.startsWith(`${baseKey}__`)) {
        sum += val.qty;
      }
    }
    return sum;
  }, [cart.items, baseKey]);

  // ---- handlers ----
  const addFirst = (e) => {
    e.stopPropagation();
    cart.setQty(baseKey, item, 1);
  };

  const inc = (e) => {
    e.stopPropagation();
    cart.setQty(baseKey, item, Math.min(99, baseQty + 1));
  };

  const dec = (e) => {
    e.stopPropagation();
    if (baseQty > 0) {
      cart.setQty(baseKey, item, Math.max(0, baseQty - 1));
      return;
    }

    for (const [k, val] of cart.items.entries()) {
      if (k.startsWith(`${baseKey}__`) && val.qty > 0) {
        cart.setQty(k, null, val.qty - 1);
        break;
      }
    }
  };

  const openModal = () => onOpen?.(item);

  return (
    <article
      className={`menu-card ${layout === "vertical" ? "menu-card--vertical" : "menu-card--horizontal"}`}
      dir="rtl"
      onClick={openModal}
    >
      <div className="menu-card__media">
        <img
          src={fullImageUrl}
          alt={name}
          className="menu-card__img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/food/food-placeholder.png";
          }}
        />

        <div className="menu-card__imgShade" aria-hidden />

        <div className="menu-card__rating">
          <StarIcon />

          <span className="menu-card__ratingValue">
            {formatRating(rating)}
          </span>

          <span className="menu-card__ratingCount">
            ({formatVoters(voters)})
          </span>
        </div>
      </div>

      <div className="menu-card__body">
        <h3 className="menu-card__title" title={name}>
          {name}
        </h3>

        <div className="menu-card__price">
          <span className="menu-card__priceNumber">
            {formatTomans(price)}
          </span>{" "}
          <span className="menu-card__currency">تومان</span>
        </div>

        <div className="menu-card__footer" onClick={(e) => e.stopPropagation()}>
          {totalQty <= 0 ? (
            <button className="menu-card__addBtn" onClick={addFirst}>
              +
            </button>
          ) : (
            <div className="menu-card__qtyGroup">
              <button
                className="menu-card__qtyBtn menu-card__qtyBtn--dec"
                onClick={dec}
              >
                −
              </button>

              <span className="menu-card__qtyDisplay">
                {toPersianDigits(totalQty)}
              </span>

              <button
                className="menu-card__qtyBtn menu-card__qtyBtn--inc"
                onClick={inc}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
