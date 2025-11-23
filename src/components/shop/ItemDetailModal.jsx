import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { useCart } from "./CartContext";

import BackIcon from "../icons/BackIcon";
import LikeIcon from "../icons/LikeIcon";
import MessageIcon from "../icons/MessageIcon";
import ModalCategoryIcon from "../icons/ModalCategoryIcon";
import MokhalafatIcon from "../icons/MokhalafatIcon";

function ItemDetailModal({ item, onClose }) {
  const cart = useCart();
  const [isActive, setIsActive] = useState(false);

  /* Variants (as you had) */
  const variations = useMemo(() => {
    if (item?.variations?.length) return item.variations;
    const base = Number(item?.price) || 0;
    return [
      {
        id: "l",
        name: "بزرگ",
        price: Math.max(0, base + Math.round(base * 0.2)),
      },
      { id: "m", name: "متوسط", price: base },
      {
        id: "s",
        name: "کوچک",
        price: Math.max(0, base - Math.round(base * 0.15)),
      },
    ];
  }, [item]);

  // مخلفات
  const addonsByVar = useMemo(() => {
    if (item?.addonsByVar) return item.addonsByVar;

    // mock
    return {
      l: [
        { id: "a1", name: "بیسکویت خرد شده", price: 12000 },
        { id: "a2", name: "بیسکویت خرد نشده", price: 12000 },
        { id: "a3", name: "بیسکویت یمدل دیگه", price: 12000 },
      ],
      m: [
        { id: "b1", name: "شیر اضافه", price: 9000 },
        { id: "b2", name: "سیروپ وانیل", price: 8000 },
      ],

      s: [],
    };
  }, [item]);

  const [qtyByVar, setQtyByVar] = useState(() =>
    Object.fromEntries(variations.map((v) => [v.id, 1]))
  );
  useEffect(() => {
    setQtyByVar((prev) => {
      const next = { ...prev };
      for (const v of variations) if (next[v.id] == null) next[v.id] = 1;
      for (const k of Object.keys(next))
        if (!variations.find((v) => v.id === k)) delete next[k];
      return next;
    });
  }, [variations]);

  const [selectedAddonsByVar, setSelectedAddonsByVar] = useState(() => {
    const init = {};
    for (const v of variations) init[v.id] = new Set();
    return init;
  });
  // keep state in sync if variants change
  useEffect(() => {
    setSelectedAddonsByVar((prev) => {
      const next = { ...prev };
      for (const v of variations) if (!next[v.id]) next[v.id] = new Set();
      for (const k of Object.keys(next))
        if (!variations.find((v) => v.id === k)) delete next[k];
      return next;
    });
  }, [variations]);

  /* Helpers */
  const fmt = (n) => (Number(n) || 0).toLocaleString("fa-IR");
  const addonSum = (varId) =>
    (addonsByVar[varId] || []).reduce(
      (s, a) =>
        s + (selectedAddonsByVar[varId]?.has(a.id) ? Number(a.price) || 0 : 0),
      0
    );

  const toggleAddon = (varId, addonId) => {
    setSelectedAddonsByVar((prev) => {
      const set = new Set(prev[varId] || []);
      set.has(addonId) ? set.delete(addonId) : set.add(addonId);
      return { ...prev, [varId]: set };
    });
  };

  /* open/close + body lock (as you had) */
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
    const t = setTimeout(() => onClose?.(), 250);
    return () => clearTimeout(t);
  };

  if (!item) return null;

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
                  <div className="shop-icon-wrapper">
                    <button
                      className="icon-btn"
                      aria-label="Back"
                      onClick={handleClose}
                    >
                      <BackIcon />
                    </button>
                  </div>
                </div>
                <div className="img-topbar__left">
                  <div className="shop-icon-wrapper">
                    <button className="icon-btn" aria-label="Comments">
                      <MessageIcon />
                    </button>
                  </div>
                  <div className="shop-icon-wrapper">
                    <button className="icon-btn" aria-label="Like">
                      <LikeIcon />
                    </button>
                  </div>
                </div>
              </nav>

              <img
                src={`https://localhost:7270${item.imageUrl}`}
                alt={item.name}
                className="modal-hero-img"
              />
              <div className="modal-info-panel">
                <div className="modal-info-top">
                  <h2 className="modal-title">{item.name}</h2>
                  <div className="modal-rating">
                    <i className="fas fa-star" />
                    <span className="modal-rating-count">
                      {Number(item?.rating ?? 4.5).toFixed(1)}
                    </span>
                    <span className="modal-reviews">
                      (
                      {Number(
                        item?.voters ?? item?.reviewsCount ?? 0
                      ).toLocaleString("fa-IR")}
                      )
                    </span>
                  </div>
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
                <ModalCategoryIcon /> <p className="section-label">نوع</p>
              </div>

              {variations.map((v) => {
                const q = qtyByVar[v.id] ?? 1;
                const totalUnit = (Number(v.price) || 0) + addonSum(v.id); // base + selected addons
                const addons = addonsByVar[v.id] || [];

                return (
                  <div key={v.id} className="variant-block">
                    {/* Row: variant pill + qty */}
                    <div className="variant-row">
                      <div className="variant-pill" role="button" tabIndex={0}>
                        <span className="variant-name">{v.name}</span>
                        <span className="variant-price">
                          <span className="amount">{fmt(totalUnit)}</span>
                          <span className="currency">تومان</span>
                        </span>
                      </div>

                      <div className="qty-group">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() =>
                            setQtyByVar((s) => ({
                              ...s,
                              [v.id]: Math.min(99, (s[v.id] ?? 1) + 1),
                            }))
                          }
                        >
                          +
                        </button>
                        <span className="qty-display">{q}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() =>
                            setQtyByVar((s) => ({
                              ...s,
                              [v.id]: Math.max(1, (s[v.id] ?? 1) - 1),
                            }))
                          }
                        >
                          −
                        </button>
                      </div>
                    </div>

                    {/* مخلفات for this variant (auto hidden if none) */}
                    {addons.length > 0 && (
                      <div className="modal-subsection">
                        <div className="subsection-head">
                          <MokhalafatIcon />
                          <span className="subsection-title">مخلفات</span>
                        </div>
                        <ul className="addons-list">
                          {addons.map((a) => {
                            const checked = selectedAddonsByVar[v.id]?.has(
                              a.id
                            );
                            return (
                              <li
                                key={a.id}
                                className={`addon-row ${
                                  checked ? "checked" : ""
                                }`}
                              >
                                <span className="addon-name">{a.name}</span>

                                <div className="addon-price">
                                  <span className="amount">{fmt(a.price)}</span>
                                  <span className="currency">تومان</span>
                                  <input
                                    type="checkbox"
                                    checked={checked}
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
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modalUI, document.body);
}

export default ItemDetailModal;








// import React, { useEffect, useMemo, useState } from "react";
// import ReactDOM from "react-dom";
// import { useCart } from "./CartContext";

// import BackIcon from "../icons/BackIcon";
// import LikeIcon from "../icons/LikeIcon";
// import MessageIcon from "../icons/MessageIcon";
// import ModalCategoryIcon from "../icons/ModalCategoryIcon";
// import MokhalafatIcon from "../icons/MokhalafatIcon";

// function ItemDetailModal({ item, onClose }) {
//   const cart = useCart();
//   const [isActive, setIsActive] = useState(false);

//   /* Variants (as you had) */
//   const variations = useMemo(() => {
//     if (item?.variations?.length) return item.variations;
//     const base = Number(item?.price) || 0;
//     return [
//       {
//         id: "l",
//         name: "بزرگ",
//         price: Math.max(0, base + Math.round(base * 0.2)),
//       },
//       { id: "m", name: "متوسط", price: base },
//       {
//         id: "s",
//         name: "کوچک",
//         price: Math.max(0, base - Math.round(base * 0.15)),
//       },
//     ];
//   }, [item]);

//   // مخلفات
//   const addonsByVar = useMemo(() => {
//     if (item?.addonsByVar) return item.addonsByVar;

//     // mock
//     return {
//       l: [
//         { id: "a1", name: "بیسکویت خرد شده", price: 12000 },
//         { id: "a2", name: "بیسکویت خرد نشده", price: 12000 },
//         { id: "a3", name: "بیسکویت یمدل دیگه", price: 12000 },
//       ],
//       m: [
//         { id: "b1", name: "شیر اضافه", price: 9000 },
//         { id: "b2", name: "سیروپ وانیل", price: 8000 },
//       ],

//       s: [],
//     };
//   }, [item]);

//   const [qtyByVar, setQtyByVar] = useState(() =>
//     Object.fromEntries(variations.map((v) => [v.id, 1]))
//   );
//   useEffect(() => {
//     setQtyByVar((prev) => {
//       const next = { ...prev };
//       for (const v of variations) if (next[v.id] == null) next[v.id] = 1;
//       for (const k of Object.keys(next))
//         if (!variations.find((v) => v.id === k)) delete next[k];
//       return next;
//     });
//   }, [variations]);

//   const [selectedAddonsByVar, setSelectedAddonsByVar] = useState(() => {
//     const init = {};
//     for (const v of variations) init[v.id] = new Set();
//     return init;
//   });
//   // keep state in sync if variants change
//   useEffect(() => {
//     setSelectedAddonsByVar((prev) => {
//       const next = { ...prev };
//       for (const v of variations) if (!next[v.id]) next[v.id] = new Set();
//       for (const k of Object.keys(next))
//         if (!variations.find((v) => v.id === k)) delete next[k];
//       return next;
//     });
//   }, [variations]);

//   /* Helpers */
//   const fmt = (n) => (Number(n) || 0).toLocaleString("fa-IR");
//   const addonSum = (varId) =>
//     (addonsByVar[varId] || []).reduce(
//       (s, a) =>
//         s + (selectedAddonsByVar[varId]?.has(a.id) ? Number(a.price) || 0 : 0),
//       0
//     );

//   const toggleAddon = (varId, addonId) => {
//     setSelectedAddonsByVar((prev) => {
//       const set = new Set(prev[varId] || []);
//       set.has(addonId) ? set.delete(addonId) : set.add(addonId);
//       return { ...prev, [varId]: set };
//     });
//   };

//   /* open/close + body lock (as you had) */
//   useEffect(() => {
//     if (!item) return;
//     const t = setTimeout(() => setIsActive(true), 10);
//     document.body.classList.add("modal-open");
//     return () => {
//       clearTimeout(t);
//       document.body.classList.remove("modal-open");
//     };
//   }, [item]);

//   const handleClose = () => {
//     setIsActive(false);
//     const t = setTimeout(() => onClose?.(), 250);
//     return () => clearTimeout(t);
//   };

//   if (!item) return null;

//   const apiRoot = import.meta.env.VITE_API_URL.replace("/api", "");
//   const modalUI = (
//     <>
//       <div
//         className={`modal-backdrop ${isActive ? "active" : ""}`}
//         onClick={handleClose}
//       />
//       <div className={`bottom-modal ${isActive ? "active" : ""}`} dir="rtl">
//         <div className="sheet-body modal-content">
//           <div className="modal-hero">
//             <div className="modal-img-wrap">
//               <nav className="img-topbar">
//                 <div className="img-topbar__right">
//                   <div className="shop-icon-wrapper">
//                     <button
//                       className="icon-btn"
//                       aria-label="Back"
//                       onClick={handleClose}
//                     >
//                       <BackIcon />
//                     </button>
//                   </div>
//                 </div>
//                 <div className="img-topbar__left">
//                   <div className="shop-icon-wrapper">
//                     <button className="icon-btn" aria-label="Comments">
//                       <MessageIcon />
//                     </button>
//                   </div>
//                   <div className="shop-icon-wrapper">
//                     <button className="icon-btn" aria-label="Like">
//                       <LikeIcon />
//                     </button>
//                   </div>
//                 </div>
//               </nav>


//               <img
//                 src={`${apiRoot}${item.imageUrl}`}
//                 alt={item.name}
//                 className="modal-hero-img"
//               />
//               <div className="modal-info-panel">
//                 <div className="modal-info-top">
//                   <h2 className="modal-title">{item.name}</h2>
//                   <div className="modal-rating">
//                     <i className="fas fa-star" />
//                     <span className="modal-rating-count">
//                       {Number(item?.rating ?? 4.5).toFixed(1)}
//                     </span>
//                     <span className="modal-reviews">
//                       (
//                       {Number(
//                         item?.voters ?? item?.reviewsCount ?? 0
//                       ).toLocaleString("fa-IR")}
//                       )
//                     </span>
//                   </div>
//                 </div>
//                 {item.ingredients && (
//                   <p className="modal-subtitle">{item.ingredients}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* VARIANTS + ADDONS */}
//           <div className="variant-list">
//             <div className="modal-section">
//               <div className="section-head">
//                 <ModalCategoryIcon /> <p className="section-label">نوع</p>
//               </div>

//               {variations.map((v) => {
//                 const q = qtyByVar[v.id] ?? 1;
//                 const totalUnit = (Number(v.price) || 0) + addonSum(v.id); // base + selected addons
//                 const addons = addonsByVar[v.id] || [];

//                 return (
//                   <div key={v.id} className="variant-block">
//                     {/* Row: variant pill + qty */}
//                     <div className="variant-row">
//                       <div className="variant-pill" role="button" tabIndex={0}>
//                         <span className="variant-name">{v.name}</span>
//                         <span className="variant-price">
//                           <span className="amount">{fmt(totalUnit)}</span>
//                           <span className="currency">تومان</span>
//                         </span>
//                       </div>

//                       <div className="qty-group">
//                         <button
//                           type="button"
//                           className="qty-btn"
//                           onClick={() =>
//                             setQtyByVar((s) => ({
//                               ...s,
//                               [v.id]: Math.min(99, (s[v.id] ?? 1) + 1),
//                             }))
//                           }
//                         >
//                           +
//                         </button>
//                         <span className="qty-display">{q}</span>
//                         <button
//                           type="button"
//                           className="qty-btn"
//                           onClick={() =>
//                             setQtyByVar((s) => ({
//                               ...s,
//                               [v.id]: Math.max(1, (s[v.id] ?? 1) - 1),
//                             }))
//                           }
//                         >
//                           −
//                         </button>
//                       </div>
//                     </div>

//                     {/* مخلفات for this variant (auto hidden if none) */}
//                     {addons.length > 0 && (
//                       <div className="modal-subsection">
//                         <div className="subsection-head">
//                           <MokhalafatIcon />
//                           <span className="subsection-title">مخلفات</span>
//                         </div>
//                         <ul className="addons-list">
//                           {addons.map((a) => {
//                             const checked = selectedAddonsByVar[v.id]?.has(
//                               a.id
//                             );
//                             return (
//                               <li
//                                 key={a.id}
//                                 className={`addon-row ${
//                                   checked ? "checked" : ""
//                                 }`}
//                               >
//                                 <span className="addon-name">{a.name}</span>

//                                 <div className="addon-price">
//                                   <span className="amount">{fmt(a.price)}</span>
//                                   <span className="currency">تومان</span>
//                                   <input
//                                     type="checkbox"
//                                     checked={checked}
//                                     onChange={() => toggleAddon(v.id, a.id)}
//                                   />
//                                 </div>
//                               </li>
//                             );
//                           })}
//                         </ul>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );

//   return ReactDOM.createPortal(modalUI, document.body);
// }

// export default ItemDetailModal;