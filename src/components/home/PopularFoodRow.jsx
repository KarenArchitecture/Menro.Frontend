import React from "react";
import SectionHeader from "../common/SectionHeader";
import FoodCard from "../home/FoodCard";
import StateMessage from "../common/StateMessage";

function PopularFoodRow({ data }) {
  if (!data || !data.foods || data.foods.length === 0) {
    return (
      <section className="popular-food-row">
        <StateMessage kind="empty">آیتمی برای نمایش وجود ندارد.</StateMessage>
      </section>
    ); 
  }

  const SvgIcon = () =>
    data.svgIcon ? (
      <span
        className="inline-svg"
        // backend supplies trusted svg markup seeded by you
        dangerouslySetInnerHTML={{ __html: data.svgIcon }}
      />
    ) : null;

  return (
    <section className="popular-food-row">
      <SectionHeader
        icon={<SvgIcon />}
        title={`${data.categoryTitle}‌های پرطرفدار`}
        linkText="مشاهده همه"
      />
      <div className="food-cards-container">
        {data.foods.map((item) => (
          <div key={item.id}>
            <FoodCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularFoodRow;
