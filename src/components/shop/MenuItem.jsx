import React, { useMemo } from "react";
import { useCart } from "./CartContext";
import StarIcon from "../icons/StarIcon";
import resolveFileUrl from "../../utils/resolveFileUrl";
import SmartImage from "../common/SmartImage";

const toPersianDigits = (v) =>
  v === null || v === undefined ? "" : String(v).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

export default function MenuItem({ item, onOpen, layout = "horizontal" }) {
  const cart = useCart();
  const { id, name, price, imageUrl, rating = 4.5, voters = item?.votersCount ?? 0 } = item || {};

  const formatTomans = (n) => (Number(n) || 0).toLocaleString("fa-IR");
  const formatRating = (v) => toPersianDigits((Number(v) || 0).toFixed(1));
  const formatVoters = (v) => toPersianDigits((Number(v) || 0).toLocaleString("en-US"));

  const foodImageFallback = "/images/food/food-placeholder.png";
  const fullImageUrl = resolveFileUrl(imageUrl) || foodImageFallback;

  const totalQty = useMemo(() => cart.getFoodQty(id), [cart, id]);

  const addFirst = (e) => { e.stopPropagation(); cart.quickIncrement(item); };
  const inc = (e) => { e.stopPropagation(); cart.quickIncrement(item); };
  const dec = (e) => { e.stopPropagation(); cart.quickDecrement(item); };
  const openModal = () => onOpen?.(item);

  return (
    <article
      className={`menu-card ${layout === "vertical" ? "menu-card--vertical" : "menu-card--horizontal"}`}
      dir="rtl"
      onClick={openModal}
    >
      <div className="menu-card__media">
        <SmartImage src={fullImageUrl} fallback={foodImageFallback} alt={name || "تصویر غذا"} className="menu-card__img" lazy={true} />
        <div className="menu-card__imgShade" aria-hidden />
        <div className="menu-card__rating">
          <StarIcon />
          <span className="menu-card__ratingValue">{formatRating(rating)}</span>
          <span className="menu-card__ratingCount">({formatVoters(voters)})</span>
        </div>
      </div>

      <div className="menu-card__body">
        <h3 className="menu-card__title" title={name}>{name}</h3>
        <div className="menu-card__price">
          <span className="menu-card__priceNumber">{formatTomans(price)}</span>{" "}
          <span className="menu-card__currency">تومان</span>
        </div>
        <div className="menu-card__footer" onClick={(e) => e.stopPropagation()}>
          {totalQty <= 0 ? (
            <button className="menu-card__addBtn" onClick={addFirst}>+</button>
          ) : (
            <div className="menu-card__qtyGroup">
              <button className="menu-card__qtyBtn menu-card__qtyBtn--dec" onClick={dec}>−</button>
              <span className="menu-card__qtyDisplay">{toPersianDigits(totalQty)}</span>
              <button className="menu-card__qtyBtn menu-card__qtyBtn--inc" onClick={inc}>+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}