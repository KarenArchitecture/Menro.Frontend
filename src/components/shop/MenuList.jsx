// import React from "react";
// import MenuItem from "./MenuItem";
// import { useQuery } from "@tanstack/react-query";
// import { getRestaurantMenuBySlug } from "../../api/restaurants";
// import { useParams } from "react-router-dom";

// function MenuList({
//   activeCategory,
//   onSelectItem,
//   onSeeAll,
//   categories = [],
//   setActiveCategory,
// }) {
//   const { slug } = useParams();
//   const isHorizontal = activeCategory === "all";
//   const scrollClass = isHorizontal ? "horizontal-scroll" : "vertical-scroll";
//   const {
//     data: menuData = [],
//     isLoading,
//     isError,
//   } = useQuery({
//     queryKey: ["restaurantMenu", slug],
//     queryFn: () => getRestaurantMenuBySlug(slug),
//   });

//   // ------- helpers for svg coloring (same approach as nav) -------
//   const decodeHtml = (html) => {
//     const txt = document.createElement("textarea");
//     txt.innerHTML = html || "";
//     return txt.value;
//   };
//   const getColoredIcon = (svgString, fillColor = "#999FA8") => {
//     if (!svgString) return "";
//     const decoded = decodeHtml(svgString);
//     return decoded.replace(
//       /fill=['"]?#?[a-zA-Z0-9]+['"]?/gi,
//       `fill="${fillColor}"`
//     );
//   };

//   // ------- compute prev/next categories for vertical mode -------
//   // Fallback list if categories prop is empty: build from menuData (+ a minimal "all")
//   const catList = React.useMemo(() => {
//     if (categories && categories.length) return categories;
//     if (!menuData?.length) return [];
//     return [
//       { id: "all", name: "همه", svgIcon: "" },
//       ...menuData.map((sec) => ({
//         id: String(sec.categoryId),
//         name: sec.categoryTitle,
//         svgIcon: sec.svgIcon,
//       })),
//     ];
//   }, [categories, menuData]);

//   const activeIndex = catList.findIndex(
//     (c) => String(c.id) === String(activeCategory)
//   );
//   const prevCat =
//     !isHorizontal && activeIndex > 0 ? catList[activeIndex - 1] : null;
//   const nextCat =
//     !isHorizontal && activeIndex >= 0 ? catList[activeIndex + 1] : null;
//   const showPrev = prevCat && String(prevCat.id) !== "all";
//   const showNext = Boolean(nextCat);

//   if (isLoading) return <p>در حال بارگذاری…</p>;
//   if (isError) return <p>خطا در بارگیری منو</p>;
//   if (!menuData?.length) return <p>موردی یافت نشد</p>;

//   return (
//     <div className="res-menu">
//       {menuData.map((section) => {
//         const catId = String(section.categoryId);
//         if (!isHorizontal && catId !== activeCategory) return null;

//         return (
//           <section key={catId} data-category-section={catId}>
//             <div className="menu_nav">
//               <p className="menu_nav-title">{section.categoryTitle}</p>
//               <button
//                 className="menu_nav-btn"
//                 onClick={() => onSeeAll?.(catId, section)}
//               >
//                 مشاهده همه <span className="arrow">‹</span>
//               </button>
//             </div>

//             <div className={`food_items ${scrollClass}`}>
//               {section.foods.map((item) => (
//                 <MenuItem
//                   key={item.id}
//                   item={{ ...item, categoryTitle: section.categoryTitle }}
//                   onOpen={onSelectItem}
//                 />
//               ))}

//               {/* trailing card only in horizontal mode */}
//               {isHorizontal && (
//                 <button
//                   type="button"
//                   className="seeall-card"
//                   onClick={() => onSeeAll?.(catId, section)}
//                 >
//                   <span className="seeall-arrow">‹</span>
//                   <span className="seeall-text">مشاهده همه</span>
//                 </button>
//               )}
//             </div>

//             {/* NEW: vertical-mode actions under the list */}
//             {!isHorizontal && (
//               <div className="vertical-actions" dir="rtl">
//                 {/* NEXT category on the left */}
//                 {showNext && (
//                   <button
//                     type="button"
//                     className="vaction-pill"
//                     onClick={() => setActiveCategory?.(nextCat.id)}
//                     aria-label={`رفتن به ${nextCat.name}`}
//                   >
//                     <span>{nextCat.name}</span>
//                     <span
//                       className="category-icon"
//                       dangerouslySetInnerHTML={{
//                         __html: getColoredIcon(nextCat.svgIcon, "#D17842"),
//                       }}
//                     />
//                   </button>
//                 )}

//                 {/* PREVIOUS category on the right */}
//                 {showPrev && (
//                   <button
//                     type="button"
//                     className="vaction-pill"
//                     onClick={() => setActiveCategory?.(prevCat.id)}
//                     aria-label={`رفتن به ${prevCat.name}`}
//                   >
//                     <span
//                       className="category-icon"
//                       dangerouslySetInnerHTML={{
//                         __html: getColoredIcon(prevCat.svgIcon, "#D17842"),
//                       }}
//                     />
//                     <span>{prevCat.name}</span>
//                   </button>
//                 )}
//               </div>
//             )}
//           </section>
//         );
//       })}
//     </div>
//   );
// }

// export default MenuList;

import React from "react";
import { useQuery } from "@tanstack/react-query";
import MenuItem from "./MenuItem";
import StateMessage from "../common/StateMessage";
import ShimmerRow from "../common/ShimmerRow";
import { getRestaurantMenuBySlug } from "../../api/restaurants";
import { ALL_CAT_SVG } from "./FoodCategoryList";

function MenuList({ restaurantSlug, activeCategory, onSelectItem, onSeeAll, setActiveCategory }) {
  const isHorizontal = activeCategory === "all";
  const scrollClass = isHorizontal ? "horizontal-scroll" : "vertical-scroll";

  // Helpers for SVG coloring
  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html || "";
    return txt.value;
  };
  const getColoredIcon = (svgString, fillColor = "#999FA8") => {
    if (!svgString) return "";
    const decoded = decodeHtml(svgString);
    return decoded.replace(/fill=['"]?#?[a-zA-Z0-9]+['"]?/gi, `fill="${fillColor}"`);
  };

  // Fetch menu from API
  const { data: foods = [], isLoading, isError } = useQuery({
    queryKey: ["restaurantMenu", restaurantSlug],
    queryFn: () => getRestaurantMenuBySlug(restaurantSlug),
    enabled: !!restaurantSlug,
    refetchOnMount: "always",
    staleTime: 60 * 1000,
  });

  // Loading state
  if (isLoading) return <ShimmerRow height={250} style={{ margin: "16px 0" }} />;

  // Error state
  if (isError) {
    return (
      <StateMessage kind="error" title="خطا در دریافت منو">
        دریافت منوی رستوران با مشکل مواجه شد.
      </StateMessage>
    );
  }

  // Empty state
  if (!foods?.length) {
    return <StateMessage kind="empty" title="هیچ غذایی موجود نیست" />;
  }

  // Group foods by category dynamically
  const catMap = {};
  foods.forEach((food) => {
    const catId = food.customFoodCategoryId ?? "uncategorized";
    const catName = food.customFoodCategoryName ?? "نامشخص";
    const catSvg = food.customFoodCategorySvg ?? "";
    if (!catMap[catId]) {
      catMap[catId] = { id: catId, name: catName, svgIcon: catSvg, foods: [] };
    }
    catMap[catId].foods.push(food);
  });

  const catList = [
    { id: "all", name: "همه", svgIcon: ALL_CAT_SVG, foods }, // horizontal "all"
    ...Object.values(catMap),
  ];

  console.log("activeCategory:", activeCategory);
  console.log("catList IDs:", catList.map(c => c.id));

  const activeIndex = catList.findIndex((c) => String(c.id) === String(activeCategory));
  const prevCat = !isHorizontal && activeIndex > 0 ? catList[activeIndex - 1] : null;
  const nextCat = !isHorizontal && activeIndex >= 0 ? catList[activeIndex + 1] : null;
  const showPrev = prevCat && String(prevCat.id) !== "all";
  const showNext = Boolean(nextCat);

  return (
    <div className="res-menu">
      {catList.map((section) => {
        const catId = String(section.id);
        // if (!isHorizontal && catId !== activeCategory) return null;
        if (!isHorizontal && String(catId) !== String(activeCategory)) return null;

        return (
          <section key={catId} data-category-section={catId}>
            <div className="menu_nav">
              <p className="menu_nav-title">{section.name}</p>
              <button className="menu_nav-btn" onClick={() => onSeeAll?.(catId, section)}>
                مشاهده همه <span className="arrow">‹</span>
              </button>
            </div>

            <div className={`food_items ${scrollClass}`}>
              {section.foods.map((item) => (
                <MenuItem key={item.id} item={{ ...item, categoryTitle: section.name }} onOpen={onSelectItem} />
              ))}

              {isHorizontal && (
                <button type="button" className="seeall-card" onClick={() => onSeeAll?.(catId, section)}>
                  <span className="seeall-arrow">‹</span>
                  <span className="seeall-text">مشاهده همه</span>
                </button>
              )}
            </div>

            {!isHorizontal && (
              <div className="vertical-actions" dir="rtl">
                {showNext && (
                  <button
                    type="button"
                    className="vaction-pill"
                    onClick={() => setActiveCategory?.(nextCat.id)}
                    aria-label={`رفتن به ${nextCat.name}`}
                  >
                    <span>{nextCat.name}</span>
                    <span className="category-icon" dangerouslySetInnerHTML={{ __html: getColoredIcon(nextCat.svgIcon, "#D17842") }} />
                  </button>
                )}
                {showPrev && (
                  <button
                    type="button"
                    className="vaction-pill"
                    onClick={() => setActiveCategory?.(prevCat.id)}
                    aria-label={`رفتن به ${prevCat.name}`}
                  >
                    <span className="category-icon" dangerouslySetInnerHTML={{ __html: getColoredIcon(prevCat.svgIcon, "#D17842") }} />
                    <span>{prevCat.name}</span>
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default MenuList;
