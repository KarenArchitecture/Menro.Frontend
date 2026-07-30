// src/components/shop/ItemDetailModal.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useCart } from "./CartContext";

import BackIcon from "../icons/BackIcon";
import LikeIcon from "../icons/LikeIcon";
import ModalCategoryIcon from "../icons/ModalCategoryIcon";
import MokhalafatIcon from "../icons/MokhalafatIcon";
import RestaurantCombosButton from "../common/RestaurantCombosButton";
import resolveFileUrl from "../../utils/resolveFileUrl";
import StarIcon from "../icons/StarIcon";
import SmartImage from "../common/SmartImage";
import { useFavoriteIds, useToggleFavorite } from "../../hooks/useFavorites";
import useRequireLogin from "../../hooks/useRequireLogin";
import ProtectedActionModal from "../common/ProtectedActionModal";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CommentIcon from "../icons/CommentIcon";
import { useQuery } from "@tanstack/react-query";
import { getFoodCombos } from "../../api/combos";
import ComboFoodsModal from "./ComboFoodsModal";
import { showError } from "../../utils/toast";

const toPersianDigits = (value) => {
  if (value === null || value === undefined) return "۰";
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);
};

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
        if (value === num) activeClass = num === 0 ? "active-0" : "active-n";
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

function ItemDetailModal({ item, onClose, onSelectComboFood }) {
  const [combosModalOpen, setCombosModalOpen] = useState(false);

  const { data: combos = [] } = useQuery({
    queryKey: ["food-combos", item?.id],
    queryFn: () => getFoodCombos(item.id),
    enabled: !!item?.id,
  });

  const cart = useCart();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);

  const { requireLogin, open, closeModal, goToLogin, modalProps } =
    useRequireLogin();

  const { user } = useAuth();
  const { data: favoriteIds = [], isLoading: favoriteLoading } =
    useFavoriteIds(!!user);
  const toggleFavorite = useToggleFavorite();
  const isFavorite = favoriteIds.includes(item?.id);

  const handleToggleFavorite = () => {
    requireLogin({
      type: "favorites",
      icon: <LikeIcon active />,
      onAuthenticated: () => {
        if (!item?.id) return;
        if (toggleFavorite.isPending) return;
        toggleFavorite.mutate(item.id);
      },
    });
  };

  const handleOpenComments = () => {
    if (!item?.id) return;
    const commentsUrl = `/foods/${item.id}/comments`;
    requireLogin({
      type: "comments",
      icon: <CommentIcon />,
      returnUrl: commentsUrl,
      onAuthenticated: () => navigate(commentsUrl),
    });
  };

  const handleSelectComboFood = (food) => {
    setCombosModalOpen(false);
    onSelectComboFood?.(food);
  };

  const formatRating = (value) => {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) return toPersianDigits(num.toFixed(1));
    return toPersianDigits("4.5");
  };

  const formatVoters = (value) => {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0)
      return toPersianDigits(num.toLocaleString("en-US"));
    return "۰";
  };

  /* ---------- variants + addon state (backend-backed) ---------- */

  const variations = useMemo(() => item?.variants || [], [item]);

  const [selectedAddonsByVar, setSelectedAddonsByVar] = useState({});
  const initializedVariants = useRef(new Set());

  useEffect(() => {
    variations.forEach((v) => {
      if (initializedVariants.current.has(v.id)) return;
      const cartItem = cart.getVariantItem(item.id, v.id);
      if (cartItem) {
        const map = {};
        cartItem.addons.forEach((a) => {
          map[a.foodAddonId] = a.quantity;
        });
        setSelectedAddonsByVar((prev) => ({ ...prev, [v.id]: map }));
      }
      initializedVariants.current.add(v.id);
    });
  }, [variations, cart, item?.id]);

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

  const fmt = (n) => (Number(n) || 0).toLocaleString("fa-IR");

  const addonsToPayload = (variantId) =>
    Object.entries(selectedAddonsByVar[variantId] || {})
      .filter(([, qty]) => qty > 0)
      .map(([foodAddonId, qty]) => ({
        foodAddonId: Number(foodAddonId),
        quantity: qty,
      }));

  const addonsTotalFor = (variantId) =>
    Object.entries(selectedAddonsByVar[variantId] || {}).reduce(
      (sum, [addonId, qty]) => {
        const addon = addonsByVar[variantId]?.find(
          (a) => a.id === Number(addonId),
        );
        return sum + (addon?.price || 0) * qty;
      },
      0,
    );

  const setVariantQty = (variantId, newQty) => {
    cart.setItem({
      foodId: item.id,
      variantId,
      quantity: Math.max(0, newQty),
      addons: addonsToPayload(variantId),
    });
  };

  // Addons belong to a variant, not the food itself. If the variant hasn't
  // been added to the cart yet (qty === 0), there is nothing to attach the
  // addon to — block the change and tell the person why, instead of
  // silently updating local UI state that never reaches the cart.
  const handleAddonQtyChange = (variantId, addon, newQty) => {
    const existingQty = cart.getVariantItem(item.id, variantId)?.quantity ?? 0;

    if (existingQty <= 0) {
      showError(
        "ابتدا این نوع را به سبد خرید اضافه کنید تا بتوانید مخلفات آن را انتخاب کنید.",
      );
      return;
    }

    setSelectedAddonsByVar((prev) => {
      const current = { ...(prev[variantId] || {}) };
      if (newQty <= 0) delete current[addon.id];
      else current[addon.id] = newQty;
      return { ...prev, [variantId]: current };
    });

    const nextAddons = { ...(selectedAddonsByVar[variantId] || {}) };
    if (newQty <= 0) delete nextAddons[addon.id];
    else nextAddons[addon.id] = newQty;

    cart.setItem({
      foodId: item.id,
      variantId,
      quantity: existingQty,
      addons: Object.entries(nextAddons)
        .filter(([, q]) => q > 0)
        .map(([foodAddonId, q]) => ({
          foodAddonId: Number(foodAddonId),
          quantity: q,
        })),
    });
  };

  /* ---------- open/close animation ---------- */

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
                    aria-label="بستن"
                  >
                    <BackIcon />
                  </button>
                </div>

                <div className="img-topbar__left">
                  <button
                    type="button"
                    className="icon-btn modal-top-action"
                    aria-label="پیام"
                    onClick={handleOpenComments}
                  >
                    <CommentIcon />
                  </button>

                  <button
                    type="button"
                    className="icon-btn modal-top-action"
                    aria-label="علاقه‌مندی"
                    onClick={handleToggleFavorite}
                    disabled={
                      !!user && (favoriteLoading || toggleFavorite.isPending)
                    }
                  >
                    <LikeIcon active={isFavorite} />
                  </button>
                </div>
              </nav>

              <SmartImage
                src={modalImageSrc}
                fallback={modalImageFallback}
                alt={`تصویر ${item.name}`}
                className="modal-hero-img"
                lazy={false}
              />

              <div className="modal-info-panel">
                <h2 className="modal-title">{item.name}</h2>

                <div className="modal-rating">
                  <StarIcon />
                  <span className="modal-rating__value">
                    {formatRating(modalRating)}
                  </span>
                  <span className="modal-rating__count">
                    ({formatVoters(modalVoters)})
                  </span>
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
                <p className="section-label">نوع</p>
              </div>

              {variations.map((v) => {
                const qty = cart.getVariantItem(item.id, v.id)?.quantity ?? 0;
                const addons = addonsByVar[v.id] || [];
                const unitPrice = Number(v.price || 0) + addonsTotalFor(v.id);
                const isVariantAdded = qty > 0;

                return (
                  <div key={v.id} className="variant-block">
                    <div className="variant-row">
                      <div className="variant-pill">
                        <span className="variant-name">{v.name}</span>
                        <span className="variant-price">
                          {fmt(unitPrice)}{" "}
                          <span className="variant-currency">تومان</span>
                        </span>
                      </div>

                      <div className="qty-group">
                        <button
                          className="qty-btn"
                          onClick={() => setVariantQty(v.id, qty + 1)}
                        >
                          +
                        </button>
                        <span className="qty-display">
                          {toPersianDigits(qty)}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() => setVariantQty(v.id, qty - 1)}
                        >
                          −
                        </button>
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
                              selectedAddonsByVar[v.id]?.[a.id] || 0;
                            const displayPrice =
                              currentQty === 0 ? a.price : a.price * currentQty;

                            return (
                              <li
                                key={a.id}
                                className={`addon-row ${currentQty > 0 ? "checked" : ""} ${!isVariantAdded ? "addon-row--locked" : ""}`}
                              >
                                <div className="addon-name">{a.name}</div>
                                <div className="addon-price-amount">
                                  <div className="addon-price">
                                    <span className="addon-amount">
                                      {toPersianDigits(fmt(displayPrice))}
                                    </span>
                                    <span className="addon-currency">
                                      تومان
                                    </span>
                                  </div>

                                  <div className="addon-control">
                                    <AddonScrollPicker
                                      value={currentQty}
                                      onChange={(newQty) =>
                                        handleAddonQtyChange(v.id, a, newQty)
                                      }
                                      max={10}
                                    />
                                  </div>
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

            {combos.length > 0 && (
              <RestaurantCombosButton
                onClick={() => setCombosModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <ProtectedActionModal
        open={open}
        onClose={closeModal}
        onLogin={goToLogin}
        icon={modalProps.icon}
        title={modalProps.title}
        description={modalProps.description}
      />

      <ComboFoodsModal
        open={combosModalOpen}
        combos={combos}
        onClose={() => setCombosModalOpen(false)}
        onSelectFood={handleSelectComboFood}
      />
    </>
  );

  return ReactDOM.createPortal(modalUI, document.body);
}

export default ItemDetailModal;
