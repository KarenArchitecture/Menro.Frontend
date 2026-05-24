import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function CheckoutBar({ count = 0, total = 0, onCheckout }) {
  const fmt = (n) => (Number(n) || 0).toLocaleString("fa-IR");

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          className="checkout-bar"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="region"
          aria-label="خلاصه سبد خرید"
        >
          <div className="checkout-bar__inner">
            <div className="checkout-bar__meta" aria-live="polite">
              <div className="checkout-bar__count">{fmt(count)} محصول</div>
              <div className="checkout-bar__total">
                <span className="checkout-bar__total-num">{fmt(total)}</span>
                <span className="checkout-bar__total-currency">تومان</span>
              </div>
            </div>

            <button
              type="button"
              className="checkout-bar__cta"
              onClick={onCheckout}
            >
              تکمیل خرید
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ABDOLLAH VERSION //

// import React from "react";
// import { AnimatePresence, motion } from "framer-motion";

// export default function CheckoutBar({ count = 0, total = 0, onCheckout }) {
//   const fmt = (n) => (Number(n) || 0).toLocaleString("fa-IR");

//   return (
//     <AnimatePresence>
//       {count > 0 && (
//         <motion.div
//           className="checkout-bar"
//           initial={{ y: "100%", opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           exit={{ y: "100%", opacity: 0 }}
//           transition={{ duration: 0.2, ease: "easeOut" }}
//           role="region"
//           aria-label="خلاصه سبد خرید"
//         >
//           <div className="checkout-bar__inner">
//             <div className="checkout-bar__meta" aria-live="polite">
//               <div className="checkout-bar__count">{fmt(count)} محصول</div>
//               <div className="checkout-bar__total">
//                 <span className="checkout-bar__total-num">{fmt(total)}</span>
//                 <span className="checkout-bar__total-currency">تومان</span>
//               </div>
//             </div>

//             <button
//               type="button"
//               className="checkout-bar__cta"
//               onClick={onCheckout}
//             >
//               تکمیل خرید
//             </button>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
