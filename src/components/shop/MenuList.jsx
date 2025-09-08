import React from "react";
import MenuItem from "./MenuItem";
import { useQuery } from "@tanstack/react-query";
import { getRestaurantMenuBySlug } from "../../api/restaurants";
import { useParams } from "react-router-dom";

function MenuList({ activeCategory, onSelectItem }) {
  const { slug } = useParams(); // assumes your route includes :slug
  const {
    data: menuData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["restaurantMenu", slug],
    queryFn: () => getRestaurantMenuBySlug(slug),
  });

  // 1. Determine which scroll class to use based on the active category.
  const scrollClass =
    activeCategory === "all" ? "horizontal-scroll" : "vertical-scroll";

  if (isLoading) return <p>در حال بارگذاری…</p>;
  if (isError) return <p>خطا در بارگیری منو</p>;
  if (!menuData?.length) return <p>موردی یافت نشد</p>;

  return (
    <div className="res-menu">
      {menuData.map((section) => {
        if (
          activeCategory !== "all" &&
          String(section.categoryId) !== activeCategory
        )
          return null;

        return (
          <section
            key={String(section.categoryId)}
            data-category-section={String(section.categoryId)}
          >
            <div className="menu_nav">
              <p>{section.categoryTitle}</p>
            </div>
            <div className={`food_items ${scrollClass}`}>
              {section.foods.map((item) => (
                <MenuItem
                  key={item.id}
                  item={{ ...item, categoryTitle: section.categoryTitle }}
                  onSelectItem={onSelectItem}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default MenuList;
