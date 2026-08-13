import React from "react";
import MenuItem from "./MenuItem";
import resolveFileUrl from "../../utils/resolveFileUrl";


function MenuList({
  menuData = [],
  isLoading,
  isError,
  activeCategory,
  onSelectItem,
  onSeeAll,
  categories = [],
  setActiveCategory,
  searchQuery = "",
}) {
  const isSearching = searchQuery.trim().length > 0;
  const isHorizontal = activeCategory === "all" && !isSearching;
  const isFocusedCategory = !isHorizontal && !isSearching;
  const scrollClass = isHorizontal ? "horizontal-scroll" : "vertical-scroll";

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

  const [svgCache, setSvgCache] = React.useState({});

  React.useEffect(() => {
    const loadSvgs = async () => {
      const cache = {};

      for (const c of catList) {
        const icon = c.svgIcon;
        if (!icon) continue;

        const isUrl = icon.startsWith("/") || icon.startsWith("http");

        try {
          if (isUrl) {
            const res = await fetch(resolveFileUrl(icon));
            const text = await res.text();
            cache[c.id] = text;
          } else {
            cache[c.id] = icon;
          }
        } catch {
          cache[c.id] = "";
        }

      }

      setSvgCache(cache);
    };

    loadSvgs();
  }, [catList]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredMenuData = React.useMemo(() => {
    let sections = menuData;

    if (activeCategory !== "all") {
      sections = sections.filter(
        (section) => String(section.categoryId) === String(activeCategory)
      );
    }

    if (!normalizedQuery) return sections;

    return sections
      .map((section) => {
        const filteredFoods = (section.foods || []).filter((item) => {
          const name = item.name?.toLowerCase() || "";
          const description = item.description?.toLowerCase() || "";

          return (
            name.includes(normalizedQuery) ||
            description.includes(normalizedQuery)
          );
        });

        return {
          ...section,
          foods: filteredFoods,
        };
      })
      .filter((section) => section.foods.length > 0);
  }, [menuData, activeCategory, normalizedQuery]);

  const activeIndex = catList.findIndex(
    (c) => String(c.id) === String(activeCategory)
  );

  const prevCat = activeIndex > 0 ? catList[activeIndex - 1] : null;
  const nextCat =
    activeIndex >= 0 && activeIndex < catList.length - 1
      ? catList[activeIndex + 1]
      : null;

  const showPrev = Boolean(prevCat && String(prevCat.id) !== "all");
  const showNext = Boolean(nextCat);
  const showCategoryNavigationRow =
    !isHorizontal && !isSearching && (showPrev || showNext);

  const DoubleArrowIcon = ({ direction = "right" }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={direction === "left" ? "vaction-pill__arrow-icon--left" : ""}
    >
      <path
        d="M3 3L4.69211 4.69647C6.2307 6.23903 7 7.01031 7 8C7 8.98969 6.2307 9.76097 4.69211 11.3035L3 13"
        stroke="#FAFAF4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 3L10.6921 4.69647C12.2307 6.23903 13 7.01031 13 8C13 8.98969 12.2307 9.76097 10.6921 11.3035L9 13"
        stroke="#FAFAF4"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );


  
  if (isError) return <p>خطا در بارگیری منو</p>;
  if (!menuData?.length) return <p>موردی یافت نشد</p>;
  if (!filteredMenuData?.length) return <p>غذایی با این جستجو پیدا نشد</p>;

  return (
    <div className="res-menu">
      {filteredMenuData.map((section) => {
        const catId = String(section.categoryId);

        if (!isHorizontal && !isSearching && catId !== activeCategory) {
          return null;
        }

        return (
          <section
            key={catId}
            data-category-section={catId}
            className={
              isFocusedCategory
                ? "menu-section menu-section--focused"
                : "menu-section"
            }
          >
            <div
              className={`menu_nav ${isFocusedCategory ? "menu_nav--focused" : ""}`}
            >
              <div
                key={`${catId}-${section.categoryTitle}`}
                className="menu_nav-title-holder"
              >
                <span
                  className="menu_nav-icon"
                  dangerouslySetInnerHTML={{
                    __html: getColoredIcon(svgCache[catId], "#FFF"),
                  }}
                />
                <p className="menu_nav-title">{section.categoryTitle}</p>
              </div>

              {!isFocusedCategory && (
                <button
                  type="button"
                  className="menu_nav-btn"
                  onClick={() => onSeeAll?.(catId, section)}
                >
                  مشاهده همه{" "}
                  <span className="arrow">
                    <svg
                      width="4"
                      height="7"
                      viewBox="0 0 4 7"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.25806 0.75L2.19708 1.65634C1.23236 2.48046 0.75 2.89252 0.75 3.42126C0.75 3.95001 1.23236 4.36207 2.19708 5.18618L3.25806 6.09253"
                        stroke="#FAFAF4"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>
              )}
            </div>

            <div className={`food_items ${scrollClass}`}>
              {section.foods.map((item) => (
                <MenuItem
                  key={item.id}
                  item={{ ...item, categoryTitle: section.categoryTitle }}
                  onOpen={onSelectItem}
                  layout={isHorizontal ? "horizontal" : "vertical"}
                />
              ))}

              {isHorizontal && (
                <button
                  type="button"
                  className="seeall-card"
                  onClick={() => onSeeAll?.(catId, section)}
                >
                  <span className="seeall-arrow">
                    <svg
                      width="12"
                      height="21"
                      viewBox="0 0 12 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.5 19.5L6.69275 16.4464C3.23092 13.6698 1.5 12.2814 1.5 10.5C1.5 8.71855 3.23092 7.33025 6.69275 4.55365L10.5 1.5"
                        stroke="#FAFAF4"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="seeall-text">مشاهده همه</span>
                </button>
              )}
            </div>

            {showCategoryNavigationRow && (
              <div
                className={`vertical-actions ${
                  showPrev && showNext
                    ? "vertical-actions--between"
                    : showNext
                    ? "vertical-actions--next-only"
                    : "vertical-actions--prev-only"
                }`}
                dir="rtl"
              >
                {showPrev && (
                  <button
                    type="button"
                    className="vaction-pill vaction-pill--prev"
                    onClick={() => setActiveCategory?.(prevCat.id)}
                  >
                    <span className="vaction-pill__arrow">
                      <DoubleArrowIcon direction="right" />
                    </span>

                    <span className="vaction-pill__content">
                      <span
                        className="category-icon"
                        dangerouslySetInnerHTML={{
                          __html: getColoredIcon(svgCache[prevCat.id], "#FAFAF4"),
                        }}
                      />
                      <span className="vaction-pill__label">{prevCat.name}</span>
                    </span>
                  </button>
                )}

                {showNext && (
                  <button
                    type="button"
                    className="vaction-pill vaction-pill--next"
                    onClick={() => setActiveCategory?.(nextCat.id)}
                  >
                    <span className="vaction-pill__content">
                      <span
                        className="category-icon"
                        dangerouslySetInnerHTML={{
                          __html: getColoredIcon(svgCache[nextCat.id], "#FAFAF4"),
                        }}
                      />
                      <span className="vaction-pill__label">{nextCat.name}</span>
                    </span>

                    <span className="vaction-pill__arrow">
                      <DoubleArrowIcon direction="left" />
                    </span>
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
