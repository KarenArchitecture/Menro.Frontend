// import React from "react";
// import { useCart } from "./CartContext";

// export default function MenuItem({ item, onOpen }) {
//   const { name, price, imageUrl, rating = 4.5, reviewsCount = 0 } = item || {};
//   const cart = useCart();

//   const key = cart.keyOf(item);
//   const qty = cart.getQty(key);

//   const formatTomans = (n) => (Number(n) || 0).toLocaleString("fa-IR");

//   const addFirst = (e) => {
//     e.stopPropagation();
//     cart.setQty(key, item, 1);
//   };
//   const inc = (e) => {
//     e.stopPropagation();
//     cart.setQty(key, item, Math.min(99, qty + 1));
//   };
//   const dec = (e) => {
//     e.stopPropagation();
//     cart.setQty(key, item, Math.max(0, qty - 1));
//   };

//   const openModal = () => onOpen?.(item);

//   return (
//     <article className="menu-card" dir="rtl" onClick={openModal}>
//       <div className="menu-card__media">
//         <img
//           src={`http://localhost:5096${imageUrl}`}
//           alt={name}
//           className="menu-card__img"
//           loading="lazy"
//         />
//         <div className="menu-card__imgShade" aria-hidden />
//         <div className="menu-card__rating">
//           <i className="fas fa-star menu-card__star" aria-hidden />
//           <span className="menu-card__ratingValue">{rating}</span>
//           <span className="menu-card__ratingCount">
//             ({reviewsCount.toLocaleString("fa-IR")})
//           </span>
//         </div>
//       </div>

//       <div className="menu-card__body">
//         <h3 className="menu-card__title" title={name}>
//           {name}
//         </h3>

//         <div className="menu-card__price">
//           <span className="menu-card__priceNumber">{formatTomans(price)}</span>{" "}
//           <span className="menu-card__currency">تومان</span>
//         </div>

//         <div className="menu-card__footer" onClick={(e) => e.stopPropagation()}>
//           {qty <= 0 ? (
//             <button
//               type="button"
//               className="menu-card__addBtn"
//               onClick={addFirst}
//             >
//               +
//             </button>
//           ) : (
//             <div className="menu-card__qtyGroup">
//               <button
//                 type="button"
//                 className="menu-card__qtyBtn menu-card__qtyBtn--dec"
//                 onClick={dec}
//               >
//                 −
//               </button>
//               <span className="menu-card__qtyDisplay">{qty}</span>
//               <button
//                 type="button"
//                 className="menu-card__qtyBtn menu-card__qtyBtn--inc"
//                 onClick={inc}
//               >
//                 +
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </article>
//   );
// }


import React from "react";
import { useCart } from "./CartContext";

export default function MenuItem({ item, onOpen }) {
  if (!item) return null;

  const {
    id,
    name,
    price,
    imageUrl,
    averageRating = 0,
    votersCount = 0,
    isAvailable = true,
  } = item;

  const cart = useCart();
  const key = cart.keyOf(item);
  const qty = cart.getQty(key);

  // ───────────── Helpers ─────────────
  const formatTomans = (n) => (Number(n) || 0).toLocaleString("fa-IR");

  const addFirst = (e) => {
    e.stopPropagation();
    cart.setQty(key, item, 1);
  };

  const inc = (e) => {
    e.stopPropagation();
    cart.setQty(key, item, Math.min(99, qty + 1));
  };

  const dec = (e) => {
    e.stopPropagation();
    cart.setQty(key, item, Math.max(0, qty - 1));
  };

  const openModal = () => onOpen?.(item);

  // ───────────── Disable interaction if not available ─────────────
  const cardClass = `menu-card${!isAvailable ? " menu-card--disabled" : ""}`;

  return (
    <article className={cardClass} dir="rtl" onClick={openModal}>
      <div className="menu-card__media">
        <img
          src={`http://localhost:5096${imageUrl}`}
          alt={name}
          className="menu-card__img"
          loading="lazy"
        />
        <div className="menu-card__imgShade" aria-hidden />
        {isAvailable && (
          <div className="menu-card__rating">
            <i className="fas fa-star menu-card__star" aria-hidden />
            <span className="menu-card__ratingValue">{averageRating}</span>
            <span className="menu-card__ratingCount">
              ({votersCount.toLocaleString("fa-IR")})
            </span>
          </div>
        )}
      </div>

      <div className="menu-card__body">
        <h3 className="menu-card__title" title={name}>
          {name}
        </h3>

        <div className="menu-card__price">
          <span className="menu-card__priceNumber">{formatTomans(price)}</span>{" "}
          <span className="menu-card__currency">تومان</span>
        </div>

        {isAvailable && (
          <div className="menu-card__footer" onClick={(e) => e.stopPropagation()}>
            {qty <= 0 ? (
              <button
                type="button"
                className="menu-card__addBtn"
                onClick={addFirst}
              >
                +
              </button>
            ) : (
              <div className="menu-card__qtyGroup">
                <button
                  type="button"
                  className="menu-card__qtyBtn menu-card__qtyBtn--dec"
                  onClick={dec}
                >
                  −
                </button>
                <span className="menu-card__qtyDisplay">{qty}</span>
                <button
                  type="button"
                  className="menu-card__qtyBtn menu-card__qtyBtn--inc"
                  onClick={inc}
                >
                  +
                </button>
              </div>
            )}
          </div>
        )}

        {!isAvailable && (
          <div className="menu-card__unavailable">
            این آیتم در حال حاضر موجود نیست
          </div>
        )}
      </div>
    </article>
  );
}
