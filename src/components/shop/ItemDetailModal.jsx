import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { useCart } from "./CartContext";

import BackIcon from "../icons/BackIcon";
import LikeIcon from "../icons/LikeIcon";
import MessageIcon from "../icons/MessageIcon";
import ModalCategoryIcon from "../icons/ModalCategoryIcon";
import MokhalafatIcon from "../icons/MokhalafatIcon";
import RestaurantCombosButton from "../common/RestaurantCombosButton";
import resolveFileUrl from "../../utils/resolveFileUrl";

function ItemDetailModal({ item, onClose }) {
  const cart = useCart();
  const [isActive, setIsActive] = useState(false);

  /* 1) REAL VARIANTS FROM BACKEND */
  const variations = useMemo(() => item?.variants || [], [item]);

  /* 2) BASE KEY + DEFAULT VARIANT */
  const baseKey = useMemo(() => cart.keyOf(item), [cart, item]);

  const defaultVariant = useMemo(
    () => variations.find((v) => v.isDefault) || variations[0] || null,
    [variations]
  );

  // helper: which cart key belongs to this variant?
  const getVariantKey = (variantId) =>
    defaultVariant && variantId === defaultVariant.id
      ? baseKey
      : `${baseKey}__${variantId}`;

  /* 3) MAP ADDONS PER VARIANT (backend → frontend shape) */
  const addonsByVar = useMemo(() => {
    const map = {};

    variations.forEach((v) => {
      map[v.id] =
        v.addons?.map((a) => ({
          id: a.id,
          name: a.name,
          price: a.extraPrice,
        })) || [];
    });

    return map;
  }, [variations]);

  /* 4) ADDONS SELECTION STATE */
  const [selectedAddonsByVar, setSelectedAddonsByVar] = useState({});

  // initialize when item / variants change (and preload from cart)
  useEffect(() => {
    if (!item) return;

    const init = {};

    variations.forEach((v) => {
      const key = getVariantKey(v.id);
      const existing = cart.items.get(key);

      if (existing?.addons?.length > 0) {
        init[v.id] = new Set(existing.addons);
      } else {
        init[v.id] = new Set();
      }
    });

    setSelectedAddonsByVar(init);
  }, [item, variations, baseKey]);

  /* helpers */
  const fmt = (n) => (Number(n) || 0).toLocaleString("fa-IR");

  const addonSum = (variantId, overrideSet) => {
    const selected = overrideSet || selectedAddonsByVar[variantId] || new Set();
    const list = addonsByVar[variantId] || [];

    return list.reduce(
      (sum, a) => (selected.has(a.id) ? sum + Number(a.price || 0) : sum),
      0
    );
  };

  /* 5) QUANTITY CHANGE */
  const setVariantQty = (variantId, newQty) => {
    if (!item) return;

    const variant = variations.find((v) => v.id === variantId);
    if (!variant) return;

    const key = getVariantKey(variantId);
    const qty = Math.max(0, newQty);

    if (qty === 0) {
      cart.setQty(key, null, 0);
      return;
    }

    const addonsTotal = addonSum(variantId);
    const price = Number(variant.price || 0) + addonsTotal;

    cart.setQty(
      key,
      {
        id: key,
        name: `${item.name} - ${variant.name}`,
        price,
        variantId,
        variantName: variant.name,
        imageUrl: item.imageUrl,
        addons: Array.from(selectedAddonsByVar[variantId] || []),
      },
      qty
    );
  };

  /* 6) TOGGLE ADDONS */
  const toggleAddon = (variantId, addonId) => {
    setSelectedAddonsByVar((prev) => {
      const oldSet = prev[variantId] || new Set();
      const updated = new Set(oldSet);

      updated.has(addonId) ? updated.delete(addonId) : updated.add(addonId);

      const nextState = { ...prev, [variantId]: updated };

      // update cart if variant already added
      const key = getVariantKey(variantId);
      const existing = cart.items.get(key);

      if (existing?.qty > 0) {
        const variant = variations.find((v) => v.id === variantId);

        if (variant) {
          const addonsTotal = addonSum(variantId, updated);
          const newPrice = Number(variant.price || 0) + addonsTotal;

          cart.setQty(
            key,
            {
              ...existing,
              price: newPrice,
              addons: Array.from(updated),
            },
            existing.qty
          );
        }
      }

      return nextState;
    });
  };

  /* 7) OPEN/CLOSE ANIMATION */
  useEffect(() => {
    if (!item) return;

    const t = setTimeout(() => setIsActive(true), 10);
    document.body.classList.add("modal-open");

    return () => {
      clearTimeout(t);
      document.body.classList.remove("modal-open");
    };
  }, [item]);

  const handleClose = () => {
    setIsActive(false);
    setTimeout(() => onClose?.(), 250);
  };

  if (!item) return null;

  const modalImageSrc =
    resolveFileUrl(item.imageUrl) || "/images/food/food-placeholder.png";

  /* 8) RENDER */
  const modalUI = (
    <>
      {/* backdrop */}
      <div
        className={`modal-backdrop ${isActive ? "active" : ""}`}
        onClick={handleClose}
      />

      {/* modal */}
      <div className={`bottom-modal ${isActive ? "active" : ""}`} dir="rtl">
        <div className="sheet-body modal-content">
          {/* HEADER */}
          <div className="modal-hero">
            <div className="modal-img-wrap">
              <nav className="img-topbar">
                <div className="img-topbar__right">
                  <button className="icon-btn" onClick={handleClose}>
                    <BackIcon />
                  </button>
                </div>

                <div className="img-topbar__left">
                  <button className="icon-btn">
                    <MessageIcon />
                  </button>

                  <button className="icon-btn">
                    <LikeIcon />
                  </button>
                </div>
              </nav>

              <img
                src={modalImageSrc}
                alt={item.name}
                className="modal-hero-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/food/food-placeholder.png";
                }}
              />

              <div className="modal-info-panel">
                <h2 className="modal-title">{item.name}</h2>

                <div className="modal-rating">
                  <i className="fas fa-star" />
                  <span>{item.averageRating?.toFixed(1) ?? "4.5"}</span>
                  <span>({item.votersCount ?? 0})</span>
                </div>

                {item.ingredients && (
                  <p className="modal-subtitle">{item.ingredients}</p>
                )}
              </div>
            </div>
          </div>

          {/* VARIANTS + ADDONS */}
          <div className="variant-list">
            <div className="modal-section">
              <div className="section-head">
                <ModalCategoryIcon />
                <p className="section-label">نوع</p>
              </div>

              {variations.map((v) => {
                const key = getVariantKey(v.id);
                const qty = cart.items.get(key)?.qty ?? 0;
                const addons = addonsByVar[v.id] || [];
                const unitPrice = Number(v.price || 0) + addonSum(v.id);

                return (
                  <div key={v.id} className="variant-block">
                    {/* VARIANT ROW */}
                    <div className="variant-row">
                      <div className="variant-pill">
                        <span>{v.name}</span>

                        <span>
                          {fmt(unitPrice)} <span>تومان</span>
                        </span>
                      </div>

                      <div className="qty-group">
                        <button
                          className="qty-btn"
                          onClick={() => setVariantQty(v.id, qty + 1)}
                        >
                          +
                        </button>

                        <span className="qty-display">{qty}</span>

                        <button
                          className="qty-btn"
                          onClick={() => setVariantQty(v.id, qty - 1)}
                        >
                          −
                        </button>
                      </div>
                    </div>

                    {/* ADDONS LIST */}
                    {addons.length > 0 && (
                      <div className="modal-subsection">
                        <div className="subsection-head">
                          <MokhalafatIcon />
                          <span>مخلفات</span>
                        </div>

                        <ul className="addons-list">
                          {addons.map((a) => {
                            const selected =
                              selectedAddonsByVar[v.id]?.has(a.id) ?? false;

                            return (
                              <li
                                key={a.id}
                                className={`addon-row ${
                                  selected ? "checked" : ""
                                }`}
                              >
                                <span>{a.name}</span>

                                <div className="addon-price">
                                  <span>{fmt(a.price)}</span>
                                  <span>تومان</span>

                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => toggleAddon(v.id, a.id)}
                                  />
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <RestaurantCombosButton />
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modalUI, document.body);
}

export default ItemDetailModal;
