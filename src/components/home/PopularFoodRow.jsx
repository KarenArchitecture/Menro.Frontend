// src/components/home/PopularFoodRow.jsx
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
  title, // optional override
  linkText, // optional override
}) {
  // ───────────── Loading ─────────────
  if (isLoading) {
    return (
      <section className="popular-food-row">
        {!hideTitle && <SectionHeader title="در حال بارگذاری..." />}
        <ShimmerRow height={160} style={{ margin: "2.8rem auto" }} />
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
          هیچ <span className="state-message-subject">آیتم محبوبی</span> برای نمایش وجود ندارد.
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
    title ?? (data.categoryTitle ? `${data.categoryTitle}‌های پرطرفدار` : "");

  // ✅ SAFE "View All" link:
  // - if backend provides categoryId => go to category-specific view
  // - otherwise => go to general popular browse (never breaks)
  const viewAllTo = data?.categoryId
    ? `/foods/popular/${data.categoryId}`
    : "/foods/popular";

  return (
    <section className="popular-food-row">
      {!hideTitle && (
        <SectionHeader
          icon={<SvgIcon />}
          title={computedTitle}
          linkText={linkText ?? "مشاهده همه"}
          to={viewAllTo}
          // optional: pass title for better UX in the browse page (no dependency)
          state={{ categoryTitle: data?.categoryTitle, categoryId: data?.categoryId }}
        />
      )}

      <div
        className={`food-cards-container ${
          isSearchMode ? "food-cards-container--search" : ""
        }`}
      >
        {data.foods.map((item) => (
          <div
            key={item.id ?? item.foodId ?? `${item.name}-${item.restaurantId}`}
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