import React from "react";
import MenuItem from "./MenuItem";

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
            const res = await fetch(icon);
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

  const prevCat =
    !isHorizontal && activeIndex > 0 ? catList[activeIndex - 1] : null;

  const nextCat =
    !isHorizontal && activeIndex >= 0 ? catList[activeIndex + 1] : null;

  const showPrev = prevCat && String(prevCat.id) !== "all";
  const showNext = Boolean(nextCat);

  if (isLoading) return <p>در حال بارگذاری…</p>;
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
          <section key={catId} data-category-section={catId}>
            <div className="menu_nav">
              <div className="menu_nav-title-holder">
                <span
                  className="menu_nav-icon"
                  dangerouslySetInnerHTML={{
                    __html: getColoredIcon(svgCache[catId], "#FFF"),
                  }}
                />
                <p className="menu_nav-title">{section.categoryTitle}</p>
              </div>

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

            {!isHorizontal && !isSearching && (
              <div className="vertical-actions" dir="rtl">
                {showNext && (
                  <button
                    type="button"
                    className="vaction-pill"
                    onClick={() => setActiveCategory?.(nextCat.id)}
                  >
                    <span>{nextCat.name}</span>
                    <span
                      className="category-icon"
                      dangerouslySetInnerHTML={{
                        __html: getColoredIcon(svgCache[nextCat.id], "#D17842"),
                      }}
                    />
                  </button>
                )}

                {showPrev && (
                  <button
                    type="button"
                    className="vaction-pill"
                    onClick={() => setActiveCategory?.(prevCat.id)}
                  >
                    <span
                      className="category-icon"
                      dangerouslySetInnerHTML={{
                        __html: getColoredIcon(svgCache[prevCat.id], "#D17842"),
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
