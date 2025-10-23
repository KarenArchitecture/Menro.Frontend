// // src/components/home/PreviousOrders.jsx
// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import SectionHeader from "../common/SectionHeader";
// import ReceiptIcon from "../icons/ReceiptIcon";
// import FoodCard from "./FoodCard";
// import { getUserRecentOrders } from "../../api/orders";

// function PreviousOrders() {
//   const token = localStorage.getItem("token");
//   const hasToken = !!token;

//   const { data = [], isLoading, isError, error } = useQuery({
//     queryKey: ["userRecentOrders", token, 8],
//     queryFn: () => getUserRecentOrders(8),
//     enabled: hasToken, // only run when token exists
//     refetchOnMount: "always",
//     staleTime: 60 * 1000,
//     retry: (tries, err) => (err?.response?.status === 401 ? false : tries < 2),
//   });

//   const header = (
//     <SectionHeader
//       icon={<ReceiptIcon />}
//       title="سفارش‌های پیشین"
//       linkText="مشاهده همه"
//       linkHref={hasToken ? "/orders" : "/login"}
//     />
//   );

//   // ───────────── Unauthenticated CTA (full-width) ─────────────
//   if (!hasToken) {
//     return (
//       <section className="previous-orders unauth-cta">
//         {header}
//         <div className="unauth-cta__inner">
//           <p className="unauth-cta__title">
//             لطفاً برای مشاهده این بخش به حساب کاربری خود وارد شوید
//           </p>
//           <a className="unauth-cta__button" href="/login">
//             ورود / عضویت
//           </a>
//         </div>
//       </section>
//     );
//   }

//   if (isLoading) {
//     return (
//       <section className="previous-orders">
//         {header}
//         <div className="food-cards-container">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <div key={i} className="food-card" />
//           ))}
//         </div>
//       </section>
//     );
//   }

//   // ───────────── Error state ─────────────
//   if (isError) {
//     const status = error?.response?.status;

//     // If token is present but invalid/expired → mirror the unauth CTA (so the login button shows)
//     if (status === 401) {
//       return (
//         <section className="previous-orders unauth-cta">
//           {header}
//           <div className="unauth-cta__inner">
//             <p className="unauth-cta__title">
//               لطفاً برای مشاهده این بخش به حساب کاربری خود وارد شوید
//             </p>
//             <a className="unauth-cta__button" href="/login">
//               ورود / عضویت
//             </a>
//           </div>
//         </section>
//       );
//     }

//     // Other errors: keep a simple message (you can style this class in your CSS if you want)
//     return (
//       <section className="previous-orders">
//         {header}
//         <p className="text-red-600 text-sm">خطا در دریافت سفارش‌های پیشین.</p>
//       </section>
//     );
//   }

//   if (data.length === 0) {
//     return (
//       <section className="previous-orders">
//         {header}
//         <div className="state state--empty">سفارشی یافت نشد</div>
//       </section>
//     );
//   }

//   return (
//     <section className="previous-orders">
//       {header}
//       <div className="food-cards-container">
//         {data.map((item) => (
//           <FoodCard key={item.id} item={item} />
//         ))}
//       </div>
//     </section>
//   );
// }

// export default PreviousOrders;




// src/components/home/PreviousOrders.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import SectionHeader from "../common/SectionHeader";
import ReceiptIcon from "../icons/ReceiptIcon";
import FoodCard from "./FoodCard";
import StateMessage from "../common/StateMessage";
import { getUserRecentOrders } from "../../api/orders";
import ShimmerRow from "../common/ShimmerRow";


function PreviousOrders() {
  const token = localStorage.getItem("token");
  const hasToken = !!token;

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["userRecentOrders", token, 8],
    queryFn: () => getUserRecentOrders(8),
    enabled: hasToken, // only run when token exists
    refetchOnMount: "always",
    staleTime: 60 * 1000,
    retry: (tries, err) => (err?.response?.status === 401 ? false : tries < 2),
  });

  const header = (
    <SectionHeader
      icon={<ReceiptIcon />}
      title="سفارش‌های پیشین"
      linkText="مشاهده همه"
      linkHref={hasToken ? "/orders" : "/login"}
    />
  );

  // ───────────── Unauthenticated CTA (full-width) ─────────────
  if (!hasToken) {
    return (
      <section className="previous-orders unauth-cta">
        {header}
        <div className="unauth-cta__inner">
          <p className="unauth-cta__title">
            لطفاً برای مشاهده این بخش به حساب کاربری خود وارد شوید
          </p>
          <a className="unauth-cta__button" href="/login">
            ورود / عضویت
          </a>
        </div>
      </section>
    );
  }

  // ───────────── Loading state ─────────────
  // if (isLoading) {
  //   return (
  //     <section className="previous-orders">
  //       {header}
  //       <StateMessage kind="info" title="در حال بارگذاری">
  //         در حال بارگذاری سفارش‌های پیشین شما...
  //       </StateMessage>
  //     </section>
  //   );
  // }

  if (isLoading) {
    return (
      <section className="previous-orders">
        <SectionHeader icon={<ReceiptIcon />} title="سفارش‌های پیشین" />
        <ShimmerRow height={220} style={{ margin: "16px 0" }} />
      </section>
    );
  }

  // ───────────── Error state ─────────────
  if (isError) {
    const status = error?.response?.status;

    // Token invalid → mirror unauth CTA
    if (status === 401) {
      return (
        <section className="previous-orders unauth-cta">
          {header}
          <div className="unauth-cta__inner">
            <p className="unauth-cta__title">
              لطفاً برای مشاهده این بخش به حساب کاربری خود وارد شوید
            </p>
            <a className="unauth-cta__button" href="/login">
              ورود / عضویت
            </a>
          </div>
        </section>
      );
    }

    // Other errors → professional error message
    return (
      <section className="previous-orders">
        {header}
        <StateMessage kind="error" title="خطا در دریافت سفارش‌ها">
          خطایی در دریافت سفارش‌های پیشین رخ داده است.
          <div className="state-message__action">
            <button onClick={() => window.location.reload()}>
              دوباره تلاش کنید
            </button>
          </div>
        </StateMessage>
      </section>
    );
  }

  // ───────────── Empty state ─────────────
  if (data.length === 0) {
    return (
      <section className="previous-orders">
        {header}
        <StateMessage kind="empty" title="سفارشی یافت نشد">
          شما هنوز هیچ سفارشی ثبت نکرده‌اید.
        </StateMessage>
      </section>
    );
  }

  // ───────────── Data loaded ─────────────
  return (
    <section className="previous-orders">
      {header}
      <div className="food-cards-container">
        {data.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default PreviousOrders;