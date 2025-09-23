import React from "react";
import MenuItem from "./MenuItem";
import { useQuery } from "@tanstack/react-query";
import { getRestaurantMenuBySlug } from "../../api/restaurants";
import { useParams } from "react-router-dom";

function MenuList({
  activeCategory,
  onSelectItem,
  onSeeAll,
  categories = [],
  setActiveCategory,
}) {
  const { slug } = useParams();
  const isHorizontal = activeCategory === "all";
  const scrollClass = isHorizontal ? "horizontal-scroll" : "vertical-scroll";
  const {
    data: menuData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["restaurantMenu", slug],
    queryFn: () => getRestaurantMenuBySlug(slug),
  });

  // ------- helpers for svg coloring (same approach as nav) -------
  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html || "";
    return txt.value;
  };
  const getColoredIcon = (svgString, fillColor = "#999FA8") => {
    if (!svgString) return "";
    const decoded = decodeHtml(svgString);
    return decoded.replace(
      /fill=['"]?#?[a-zA-Z0-9]+['"]?/gi,
      `fill="${fillColor}"`
    );
  };

  // ------- compute prev/next categories for vertical mode -------
  // Fallback list if categories prop is empty: build from menuData (+ a minimal "all")
  const catList = React.useMemo(() => {
    if (categories && categories.length) return categories;
    if (!menuData?.length) return [];
    return [
      { id: "all", name: "همه", svgIcon: "" },
      ...menuData.map((sec) => ({
        id: String(sec.categoryId),
        name: sec.categoryTitle,
        svgIcon: sec.svgIcon,
      })),
    ];
  }, [categories, menuData]);

  const activeIndex = catList.findIndex(
    (c) => String(c.id) === String(activeCategory)
  );
  const prevCat =
    !isHorizontal && activeIndex > 0 ? catList[activeIndex - 1] : null;
  const nextCat =
    !isHorizontal && activeIndex >= 0 ? catList[activeIndex + 1] : null;
  const showPrev = prevCat && String(prevCat.id) !== "all";
  const showNext = Boolean(nextCat);

  if (isLoading) return <p>در حال بارگذاری…</p>;
  if (isError) return <p>خطا در بارگیری منو</p>;
  if (!menuData?.length) return <p>موردی یافت نشد</p>;

  return (
    <div className="res-menu">
      {menuData.map((section) => {
        const catId = String(section.categoryId);
        if (!isHorizontal && catId !== activeCategory) return null;

        return (
          <section key={catId} data-category-section={catId}>
            <div className="menu_nav">
              <p className="menu_nav-title">{section.categoryTitle}</p>
              <button
                className="menu_nav-btn"
                onClick={() => onSeeAll?.(catId, section)}
              >
                مشاهده همه <span className="arrow">‹</span>
              </button>
            </div>

            <div className={`food_items ${scrollClass}`}>
              {section.foods.map((item) => (
                <MenuItem
                  key={item.id}
                  item={{ ...item, categoryTitle: section.categoryTitle }}
                  onOpen={onSelectItem}
                />
              ))}

              {/* trailing card only in horizontal mode */}
              {isHorizontal && (
                <button
                  type="button"
                  className="seeall-card"
                  onClick={() => onSeeAll?.(catId, section)}
                >
                  <span className="seeall-arrow">‹</span>
                  <span className="seeall-text">مشاهده همه</span>
                </button>
              )}
            </div>

            {/* NEW: vertical-mode actions under the list */}
            {!isHorizontal && (
              <div className="vertical-actions" dir="rtl">
                {/* NEXT category on the left */}
                {showNext && (
                  <button
                    type="button"
                    className="vaction-pill"
                    onClick={() => setActiveCategory?.(nextCat.id)}
                    aria-label={`رفتن به ${nextCat.name}`}
                  >
                    <span>{nextCat.name}</span>
                    <span
                      className="category-icon"
                      dangerouslySetInnerHTML={{
                        __html: getColoredIcon(nextCat.svgIcon, "#D17842"),
                      }}
                    />
                  </button>
                )}

                {/* PREVIOUS category on the right */}
                {showPrev && (
                  <button
                    type="button"
                    className="vaction-pill"
                    onClick={() => setActiveCategory?.(prevCat.id)}
                    aria-label={`رفتن به ${prevCat.name}`}
                  >
                    <span
                      className="category-icon"
                      dangerouslySetInnerHTML={{
                        __html: getColoredIcon(prevCat.svgIcon, "#D17842"),
                      }}
                    />
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
