import React, { useEffect, useMemo, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useCart } from "./CartContext";

import BackIcon from "../icons/BackIcon";
import LikeIcon from "../icons/LikeIcon";
import MessageIcon from "../icons/MessageIcon";
import ModalCategoryIcon from "../icons/ModalCategoryIcon";
import MokhalafatIcon from "../icons/MokhalafatIcon";
import RestaurantCombosButton from "../common/RestaurantCombosButton";
import resolveFileUrl from "../../utils/resolveFileUrl";
import StarIcon from "../icons/StarIcon";
import SmartImage from "../common/SmartImage";

/* Helper for consistent Persian digits */
const toPersianDigits = (value) => {
  if (value === null || value === undefined) return "۰";
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);
};

/* --- NEW HORIZONTAL SCROLL PICKER COMPONENT --- */
const AddonScrollPicker = ({ value = 0, onChange, max = 99 }) => {
  const scrollRef = useRef(null);
  const numbers = Array.from({ length: max + 1 }, (_, i) => i);

  useEffect(() => {
    if (scrollRef.current) {
      const activeChild = scrollRef.current.children[value];
      if (activeChild) {
        activeChild.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [value]);

  return (
    <div className="addon-qty-scroll" ref={scrollRef} dir="ltr">
      {numbers.map((num) => {
        let activeClass = "";
        if (value === num) {
          activeClass = num === 0 ? "active-0" : "active-n";
        }

        return (
          <button
            key={num}
            type="button"
            className={`addon-qty-item ${activeClass}`}
            onClick={() => onChange(num)}
          >
            {toPersianDigits(num)}
          </button>
        );
      })}
    </div>
  );
};

function ItemDetailModal({ item, onClose }) {
  const cart = useCart();
  const [isActive, setIsActive] = useState(false);

  const formatRating = (value) => {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) {
      return toPersianDigits(num.toFixed(1));
    }
    return toPersianDigits("4.5");
  };

  const formatVoters = (value) => {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0) {
      return toPersianDigits(num.toLocaleString("en-US"));
    }
    return "۰";
  };

  /* 1) REAL VARIANTS FROM BACKEND */
  const variations = useMemo(() => item?.variants || [], [item]);

  /* ✅ SINGLE vs MULTI */
  const isSingleVariant = variations.length <= 1;
  const singleVariant = variations[0] || null;

  /* 2) BASE KEY */
  const baseKey = useMemo(() => cart.keyOf(item), [cart, item]);

  const defaultVariant = useMemo(
    () => variations.find((v) => v.isDefault) || variations[0] || null,
    [variations],
  );

  const getVariantKey = (variantId) =>
    defaultVariant && variantId === defaultVariant.id
      ? baseKey
      : `${baseKey}__${variantId}`;

  /* 3) ADDONS */
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

  const [selectedAddonsByVar, setSelectedAddonsByVar] = useState({});

  useEffect(() => {
    if (!item) return;

    const init = {};

    variations.forEach((v) => {
      const key = getVariantKey(v.id);
      const existing = cart.items.get(key);

      init[v.id] = {};

      if (existing?.addons?.length > 0) {
        existing.addons.forEach((addon) => {
          if (typeof addon === "object") {
            init[v.id][addon.id] = addon;
          } else {
            const addonDetail = v.addons?.find((a) => a.id === addon);
            if (addonDetail) {
              init[v.id][addon] = {
                id: addonDetail.id,
                name: addonDetail.name,
                price: addonDetail.extraPrice,
                qty: 1,
              };
            }
          }
        });
      }
    });

    setSelectedAddonsByVar(init);
  }, [item, variations, baseKey]);

  const fmt = (n) => (Number(n) || 0).toLocaleString("fa-IR");

  const addonSum = (variantId, overrideState) => {
    const selected = overrideState || selectedAddonsByVar[variantId] || {};
    return Object.values(selected).reduce(
      (sum, a) => sum + Number(a.price || 0) * (a.qty || 1),
      0,
    );
  };

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
        addons: Object.values(selectedAddonsByVar[variantId] || []),
      },
      qty,
    );
  };

  const handleAddonQtyChange = (variantId, addon, newQty) => {
    setSelectedAddonsByVar((prev) => {
      const currentVariantAddons = prev[variantId] || {};
      let nextVariantState;

      if (newQty === 0) {
        const { [addon.id]: removed, ...rest } = currentVariantAddons;
        nextVariantState = rest;
      } else {
        nextVariantState = {
          ...currentVariantAddons,
          [addon.id]: { ...addon, qty: newQty },
        };
      }

      const nextState = { ...prev, [variantId]: nextVariantState };

      const key = getVariantKey(variantId);
      const existing = cart.items.get(key);

      if (existing?.qty > 0) {
        const variant = variations.find((v) => v.id === variantId);
        if (variant) {
          const addonsTotal = addonSum(variantId, nextVariantState);
          const newPrice = Number(variant.price || 0) + addonsTotal;

          cart.setQty(
            key,
            {
              ...existing,
              price: newPrice,
              addons: Object.values(nextVariantState),
            },
            existing.qty,
          );
        }
      }

      return nextState;
    });
  };

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

  const modalImageFallback = "/images/food/food-placeholder.png";
  const modalImageSrc = resolveFileUrl(item.imageUrl, modalImageFallback);

  const modalRating =
    item?.rating !== undefined && item?.rating !== null && item?.rating !== ""
      ? item.rating
      : item?.averageRating !== undefined &&
        item?.averageRating !== null &&
        item?.averageRating !== ""
      ? item.averageRating
      : 4.5;

  const modalVoters =
    item?.voters !== undefined && item?.voters !== null && item?.voters !== ""
      ? item.voters
      : item?.votersCount !== undefined &&
        item?.votersCount !== null &&
        item?.votersCount !== ""
      ? item.votersCount
      : 0;

  return ReactDOM.createPortal(
    <>
      <div
        className={`modal-backdrop ${isActive ? "active" : ""}`}
        onClick={handleClose}
      />

      <div className={`bottom-modal ${isActive ? "active" : ""}`} dir="rtl">
        <div className="sheet-body modal-content">

          {/* HEADER */}
          <div className="modal-hero">
            <div className="modal-img-wrap">
              <nav className="img-topbar">
                <div className="img-topbar__right">
                  <button onClick={handleClose} className="icon-btn">
                    <BackIcon />
                  </button>
                </div>
              </nav>

              <SmartImage
                src={modalImageSrc}
                fallback={modalImageFallback}
                alt={item.name}
                className="modal-hero-img"
                lazy={false}
              />

              <div className="modal-info-panel">
                <h2 className="modal-title">{item.name}</h2>
              </div>
            </div>
          </div>

          {/* SINGLE VARIANT */}
          {isSingleVariant ? (
            <div className="variant-list">
              <div className="variant-block">
                <div className="variant-row">
                  <div className="variant-pill">
                    <span>{singleVariant?.name}</span>
                    <span>{fmt(singleVariant?.price || 0)} تومان</span>
                  </div>

                  <div className="qty-group">
                    <button
                      onClick={() =>
                        setVariantQty(
                          singleVariant.id,
                          (cart.items.get(getVariantKey(singleVariant.id))?.qty ?? 0) + 1
                        )
                      }
                    >
                      +
                    </button>

                    <span>
                      {toPersianDigits(
                        cart.items.get(getVariantKey(singleVariant.id))?.qty ?? 0
                      )}
                    </span>

                    <button
                      onClick={() =>
                        setVariantQty(
                          singleVariant.id,
                          (cart.items.get(getVariantKey(singleVariant.id))?.qty ?? 0) - 1
                        )
                      }
                    >
                      −
                    </button>
                  </div>
                </div>

                {(addonsByVar[singleVariant.id]?.length ?? 0) > 0 && (
                  <div className="modal-subsection">
                    <div className="subsection-head">
                      <MokhalafatIcon />
                      <span>مخلفات</span>
                    </div>

                    <ul className="addons-list">
                      {addonsByVar[singleVariant.id].map((a) => {
                        const currentQty =
                          selectedAddonsByVar[singleVariant.id]?.[a.id]?.qty || 0;

                        return (
                          <li key={a.id} className="addon-row">
                            <div>{a.name}</div>

                            <AddonScrollPicker
                              value={currentQty}
                              onChange={(q) =>
                                handleAddonQtyChange(singleVariant.id, a, q)
                              }
                              max={10}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            variations.map((v) => {
              const key = getVariantKey(v.id);
              const qty = cart.items.get(key)?.qty ?? 0;
              const addons = addonsByVar[v.id] || [];
              const unitPrice = Number(v.price || 0) + addonSum(v.id);

              return (
                <div key={v.id} className="variant-block">
                  <div className="variant-row">
                    <div className="variant-pill">
                      <span>{v.name}</span>
                      <span>{fmt(unitPrice)} تومان</span>
                    </div>

                    <div className="qty-group">
                      <button onClick={() => setVariantQty(v.id, qty + 1)}>+</button>
                      <span>{toPersianDigits(qty)}</span>
                      <button onClick={() => setVariantQty(v.id, qty - 1)}>−</button>
                    </div>
                  </div>

                  {addons.length > 0 && (
                    <div className="modal-subsection">
                      <div className="subsection-head">
                        <MokhalafatIcon />
                        <span>مخلفات</span>
                      </div>

                      <ul className="addons-list">
                        {addons.map((a) => {
                          const currentQty =
                            selectedAddonsByVar[v.id]?.[a.id]?.qty || 0;

                          return (
                            <li key={a.id} className="addon-row">
                              <div>{a.name}</div>

                              <AddonScrollPicker
                                value={currentQty}
                                onChange={(q) =>
                                  handleAddonQtyChange(v.id, a, q)
                                }
                                max={10}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

export default ItemDetailModal;