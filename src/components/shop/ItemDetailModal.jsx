import React, { useEffect, useMemo, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useCart } from "./CartContext";

import BackIcon from "../icons/BackIcon";
import { useFavoriteIds, useToggleFavorite } from "../../hooks/useFavorites";
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

  /* ─────────────────────────────
     FAVORITE HOOKS (FIXED)
  ───────────────────────────── */
  const {
    data: favoriteIds = [],
    isLoading: favoriteLoading,
  } = useFavoriteIds();

  const toggleFavorite = useToggleFavorite();

  const isFavorite = favoriteIds.includes(item?.id);

  const handleToggleFavorite = () => {
    if (!item?.id) return;

    if (toggleFavorite.isPending) return;

    toggleFavorite.mutate(item.id);
  };

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

  /* 2) BASE KEY + DEFAULT VARIANT */
  const baseKey = useMemo(() => cart.keyOf(item), [cart, item]);

  const defaultVariant = useMemo(
    () => variations.find((v) => v.isDefault) || variations[0] || null,
    [variations],
  );

  const getVariantKey = (variantId) =>
    defaultVariant && variantId === defaultVariant.id
      ? baseKey
      : `${baseKey}__${variantId}`;

  /* 3) MAP ADDONS PER VARIANT */
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

  /* 4) ADDONS STATE */
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
      const current = prev[variantId] || {};
      let next;

      if (newQty === 0) {
        const { [addon.id]: removed, ...rest } = current;
        next = rest;
      } else {
        next = {
          ...current,
          [addon.id]: { ...addon, qty: newQty },
        };
      }

      const nextState = { ...prev, [variantId]: next };

      const key = getVariantKey(variantId);
      const existing = cart.items.get(key);

      if (existing?.qty > 0) {
        const variant = variations.find((v) => v.id === variantId);

        if (variant) {
          const addonsTotal = addonSum(variantId, next);
          const newPrice = Number(variant.price || 0) + addonsTotal;

          cart.setQty(
            key,
            {
              ...existing,
              price: newPrice,
              addons: Object.values(next),
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
      : item?.averageRating ?? 4.5;

  const modalVoters =
    item?.voters !== undefined && item?.voters !== null && item?.voters !== ""
      ? item.voters
      : item?.votersCount ?? 0;

  const modalUI = (
    <>
      <div
        className={`modal-backdrop ${isActive ? "active" : ""}`}
        onClick={handleClose}
      />

      <div className={`bottom-modal ${isActive ? "active" : ""}`} dir="rtl">
        <div className="sheet-body modal-content">
          <div className="modal-hero">
            <div className="modal-img-wrap">
              <nav className="img-topbar">
                <div className="img-topbar__right">
                  <button
                    type="button"
                    className="icon-btn modal-top-action"
                    onClick={handleClose}
                  >
                    <BackIcon />
                  </button>
                </div>

                <div className="img-topbar__left">
                  <button
                    type="button"
                    className="icon-btn modal-top-action"
                  >
                    <MessageIcon />
                  </button>

                  <button
                    type="button"
                    className="icon-btn modal-top-action"
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading || toggleFavorite.isPending}
                  >
                      <LikeIcon active={isFavorite} />
                  </button>
                </div>
              </nav>

              <SmartImage
                src={modalImageSrc}
                fallback={modalImageFallback}
                alt={item.name}
                className="modal-hero-img"
              />

              <div className="modal-info-panel">
                <h2 className="modal-title">{item.name}</h2>

                <div className="modal-rating">
                  <StarIcon />
                  <span>{formatRating(modalRating)}</span>
                  <span>({formatVoters(modalVoters)})</span>
                </div>

                {item.ingredients && (
                  <p className="modal-subtitle">{item.ingredients}</p>
                )}
              </div>
            </div>
          </div>

          <div className="variant-list">
            <div className="modal-section">
              <div className="section-head">
                <ModalCategoryIcon />
                <p>نوع</p>
              </div>

              {variations.map((v) => {
                const key = getVariantKey(v.id);
                const qty = cart.items.get(key)?.qty ?? 0;
                const addons = addonsByVar[v.id] || [];

                return (
                  <div key={v.id}>
                    <div className="variant-row">
                      <span>{v.name}</span>

                      <div>
                        <button onClick={() => setVariantQty(v.id, qty + 1)}>
                          +
                        </button>
                        <span>{qty}</span>
                        <button onClick={() => setVariantQty(v.id, qty - 1)}>
                          -
                        </button>
                      </div>
                    </div>

                    {addons.length > 0 && (
                      <ul>
                        {addons.map((a) => {
                          const currentQty =
                            selectedAddonsByVar[v.id]?.[a.id]?.qty || 0;

                          return (
                            <li key={a.id}>
                              <span>{a.name}</span>

                              <AddonScrollPicker
                                value={currentQty}
                                onChange={(q) =>
                                  handleAddonQtyChange(v.id, a, q)
                                }
                              />
                            </li>
                          );
                        })}
                      </ul>
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