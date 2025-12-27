import React, { useMemo } from "react";
import { useCart } from "./CartContext";

export default function MenuItem({ item, onOpen }) {
  const cart = useCart();

  const { name, price, imageUrl, rating = 4.5, voters = 0 } = item || {};

  const formatTomans = (n) => (Number(n) || 0).toLocaleString("fa-IR");

  const apiBase = import.meta.env.VITE_API_URL || "https://localhost:7270/api";
  // remove "/api" from the end → hit backend root
  const baseUrl = apiBase.replace(/\/api\/?$/, "");
  const fullImageUrl = `${baseUrl}${imageUrl}`;

  // ---- cart key for this food ----
  const baseKey = cart.keyOf(item);

  // quantity of the simple (non-variant) item
  const baseQty = cart.getQty(baseKey);

  // total quantity = base item + all variant entries (baseKey__*)
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

    // 1) if base item exists, decrement that (old behavior)
    if (baseQty > 0) {
      cart.setQty(baseKey, item, Math.max(0, baseQty - 1));
      return;
    }

    // 2) otherwise, try to decrement one of the variant entries
    for (const [k, val] of cart.items.entries()) {
      if (k.startsWith(`${baseKey}__`) && val.qty > 0) {
        cart.setQty(k, null, val.qty - 1);
        break;
      }
    }
  };

  const openModal = () => onOpen?.(item);

  return (
    <article className="menu-card" dir="rtl" onClick={openModal}>
      <div className="menu-card__media">
        <img
          src={fullImageUrl}
          alt={name}
          className="menu-card__img"
          loading="lazy"
        />

        <div className="menu-card__imgShade" aria-hidden />
        <div className="menu-card__rating">
          <i className="fas fa-star menu-card__star" aria-hidden />
          <span className="menu-card__ratingValue">{rating}</span>
          <span className="menu-card__ratingCount">
            ({voters.toLocaleString("fa-IR")})
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
              <span className="menu-card__qtyDisplay">{totalQty}</span>
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
