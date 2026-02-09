// import React from "react";
// import SectionHeader from "../common/SectionHeader";
// import FoodCard from "../home/FoodCard";
// import StateMessage from "../common/StateMessage";

// function PopularFoodRow({ data }) {
//   if (!data || !data.foods || data.foods.length === 0) {
//     return (
//       <section className="popular-food-row">
//         <StateMessage kind="empty">آیتمی برای نمایش وجود ندارد.</StateMessage>
//       </section>
//     );
//   }

//   const SvgIcon = () =>
//     data.svgIcon ? (
//       <span
//         className="inline-svg"
//         // backend supplies trusted svg markup seeded by you
//         dangerouslySetInnerHTML={{ __html: data.svgIcon }}
//       />
//     ) : null;

//   return (
//     <section className="popular-food-row">
//       <SectionHeader
//         icon={<SvgIcon />}
//         title={`${data.categoryTitle}‌های پرطرفدار`}
//         linkText="مشاهده همه"
//       />
//       <div className="food-cards-container">
//         {data.foods.map((item) => (
//           <div key={item.id}>
//             <FoodCard item={item} />
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// export default PopularFoodRow;

// src/components/home/PopularFoodRow.jsx

////SECOND VERSION
// import React from "react";
// import SectionHeader from "../common/SectionHeader";
// import FoodCard from "./FoodCard";
// import StateMessage from "../common/StateMessage";
// import ShimmerRow from "../common/ShimmerRow";

// function PopularFoodRow({ data, isLoading, isError, onRetry }) {
//   // ───────────── Loading ─────────────
//   if (isLoading) {
//     return (
//       <section className="popular-food-row">
//         <SectionHeader title="در حال بارگذاری..." />
//         <ShimmerRow height={160} width="90%" style={{ margin: "0 auto" }} />
//       </section>
//     );
//   }

//   // ───────────── Error ─────────────
//   if (isError) {
//     return (
//       <section className="popular-food-row">
//         <StateMessage kind="error" title="خطا در دریافت داده‌ها">
//           مشکلی در دریافت اطلاعات رخ داده است.
//           <div className="state-message__action">
//             <button onClick={onRetry || (() => window.location.reload())}>
//               دوباره تلاش کنید
//             </button>
//           </div>
//         </StateMessage>
//       </section>
//     );
//   }

//   // ───────────── Empty ─────────────
//   if (!data || !data.foods || data.foods.length === 0) {
//     return (
//       <section className="popular-food-row">
//         <StateMessage kind="empty" title="موردی یافت نشد">
//           آیتمی برای نمایش وجود ندارد.
//         </StateMessage>
//       </section>
//     );
//   }

//   // ───────────── Data ─────────────
//   const SvgIcon = () =>
//     data.svgIcon ? (
//       <span
//         className="inline-svg"
//         dangerouslySetInnerHTML={{ __html: data.svgIcon }}
//       />
//     ) : null;

//   return (
//     <section className="popular-food-row">
//       <SectionHeader
//         icon={<SvgIcon />}
//         title={`${data.categoryTitle}‌های پرطرفدار`}
//         linkText="مشاهده همه"
//       />
//       <div className="food-cards-container">
//         {data.foods.map((item) => (
//           <div key={item.id}>
//             <FoodCard item={item} />
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// export default PopularFoodRow;

////THIRD VERSION

import React from "react";
import SectionHeader from "../common/SectionHeader";
import FoodCard from "./FoodCard";
import StateMessage from "../common/StateMessage";
import ShimmerRow from "../common/ShimmerRow";

function PopularFoodRow({
  data,
  isLoading,
  isError,
  onRetry,
  hideTitle = false,
  isSearchMode = false,
  title = undefined,
  linkText = undefined,
}) {
  // ───────────── Loading ─────────────
  if (isLoading) {
    return (
      <section className="popular-food-row">
        {!hideTitle && <SectionHeader title="در حال بارگذاری..." />}
        <ShimmerRow height={160} width="90%" style={{ margin: "0 auto" }} />
      </section>
    );
  }

  // ───────────── Error ─────────────
  if (isError) {
    return (
      <section className="popular-food-row">
        <StateMessage kind="error" title="خطا در دریافت داده‌ها">
          مشکلی در دریافت اطلاعات رخ داده است.
          <div className="state-message__action">
            <button onClick={onRetry || (() => window.location.reload())}>
              دوباره تلاش کنید
            </button>
          </div>
        </StateMessage>
      </section>
    );
  }

  // ───────────── Empty ─────────────
  if (!data || !data.foods || data.foods.length === 0) {
    return (
      <section className="popular-food-row">
        <StateMessage kind="empty" title="موردی یافت نشد">
          آیتمی برای نمایش وجود ندارد.
        </StateMessage>
      </section>
    );
  }

  // ───────────── Header (optional) ─────────────
  const SvgIcon = () =>
    data.svgIcon ? (
      <span
        className="inline-svg"
        dangerouslySetInnerHTML={{ __html: data.svgIcon }}
      />
    ) : null;

  const computedTitle =
    title ?? (data.categoryTitle ? `${data.categoryTitle}‌های پرطرفدار` : ""); // when categoryTitle is empty in search mode

  return (
    <section className="popular-food-row">
      {!hideTitle && (
        <SectionHeader
          icon={<SvgIcon />}
          title={computedTitle}
          linkText={linkText ?? "مشاهده همه"}
        />
      )}

      <div
        className={`food-cards-container ${
          isSearchMode ? "food-cards-container--search" : ""
        }`}
      >
        {data.foods.map((item) => (
          <div
            key={item.id}
            className={isSearchMode ? "food-card-wrap--search" : ""}
          >
            <FoodCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularFoodRow;
