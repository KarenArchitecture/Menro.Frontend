import React from "react";
import SectionHeader from "../common/SectionHeader";
import FoodCard from "../home/FoodCard";
import DrinkIcon from "../icons/DrinkIcon";

function PopularFoodRow({ data }) {
  const handleAddToCart = (name) => {
    console.log(`Added "${name}" to cart!`);
  };

  if (!data || !data.foods || data.foods.length === 0) {
    return <p>هیچ غذای پرطرفداری یافت نشد</p>;
  }

  return (
    <section className="popular-food-row">
      <SectionHeader
        icon={<DrinkIcon />}
        title={`${data.categoryTitle} پرطرفدار`}
        linkText="" // You can add a link if needed here
      />
      <div className="food-cards-container">
        {data.foods.map((item) => (
          <div key={item.id}>
            <FoodCard item={item} onAddToCart={handleAddToCart} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularFoodRow;
