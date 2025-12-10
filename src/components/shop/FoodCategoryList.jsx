// src/components/shop/FoodCategoryList.jsx
import React, { useMemo, useState, useEffect } from "react";

/* ---------- constant SVG for “همه” (All) ------------------------------- */
export const ALL_CAT_SVG = `
<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.9716 3.58334H9.56742C5.64367 3.58334 3.58325 5.64376 3.58325 9.54959V12.9538C3.58325 16.8596 5.64367 18.92 9.5495 18.92H12.9537C16.8595 18.92 18.9199 16.8596 18.9199 12.9538V9.54959C18.9378 5.64376 16.8774 3.58334 12.9716 3.58334Z"/>
    <path d="M33.4495 3.58334H30.0454C26.1395 3.58334 24.0791 5.64376 24.0791 9.54959V12.9538C24.0791 16.8596 26.1395 18.92 30.0454 18.92H33.4495C37.3554 18.92 39.4158 16.8596 39.4158 12.9538V9.54959C39.4158 5.64376 37.3554 3.58334 33.4495 3.58334Z"/>
    <path d="M33.4495 24.0616H30.0454C26.1395 24.0616 24.0791 26.122 24.0791 30.0278V33.432C24.0791 37.3378 26.1395 39.3982 30.0454 39.3982H33.4495C37.3554 39.3982 39.4158 37.3378 39.4158 33.432V30.0278C39.4158 26.122 37.3554 24.0616 33.4495 24.0616Z"/>
    <path d="M12.9716 24.0616H9.56742C5.64367 24.0616 3.58325 26.122 3.58325 30.0278V33.432C3.58325 37.3557 5.64367 39.4161 9.5495 39.4161H12.9537C16.8595 39.4161 18.9199 37.3557 18.9199 33.4499V30.0457C18.9378 26.122 16.8774 24.0616 12.9716 24.0616Z"/>
</svg>
`;

const FoodCategoryList = ({
  categories = [],
  activeCategory,
  setActiveCategory,
  defaultFill = "#999FA8",
  activeFill = "#D17842",
}) => {
  /* ---------- helpers -------------------------------------------------- */
  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html || "";
    return txt.value;
  };

  const getColoredIcon = (svgString, fillColor) => {
    if (!svgString) return "";
    const decoded = decodeHtml(svgString);
    return decoded.replace(/fill=['"]?#?[a-zA-Z0-9]+['"]?/gi, `fill="${fillColor}"`);
  };

  /* ---------- full category list (prepend “همه”) ------------------------ */
  const fullCategoryList = useMemo(() => {
    const hasAll = categories.some((c) => c.id === "all");
    const allCat = { id: "all", name: "همه", svgIcon: ALL_CAT_SVG };
    return hasAll ? categories : [allCat, ...categories];
  }, [categories]);

  /* ---------- load & cache SVGs ---------------------------------------- */
  const [svgCache, setSvgCache] = useState({});

  useEffect(() => {
    const loadAll = async () => {
      const cache = {};
      for (const cat of fullCategoryList) {
        if (!cat.svgIcon) continue;
        if (cat.svgIcon.startsWith("http")) {
          try {
            const res = await fetch(cat.svgIcon);
            const text = await res.text();
            cache[cat.id] = text;
          } catch {
            cache[cat.id] = "";
          }
        } else {
          cache[cat.id] = cat.svgIcon;
        }
      }
      setSvgCache(cache);
    };
    loadAll();
  }, [fullCategoryList]);

  /* ---------- render ---------------------------------------------------- */
  const renderCategoryButton = (cat) => {
    const isActive = activeCategory === cat.id;
    const rawSvg = svgCache[cat.id] || "";
    const iconMarkup = getColoredIcon(rawSvg, isActive ? activeFill : defaultFill);

    return (
      <button
        key={cat.id}
        className={`category-btn ${isActive ? "active" : ""}`}
        onClick={() => setActiveCategory(cat.id)}
      >
        <span
          className="category-icon"
          dangerouslySetInnerHTML={{ __html: iconMarkup }}
        />
        <span>{cat.name}</span>
      </button>
    );
  };

  return (
    <>
      {/* ---------- vertical (desktop) ------------ */}
      <aside className="category-sidebar-vertical">
        {fullCategoryList.map(renderCategoryButton)}
      </aside>

      {/* ---------- horizontal (mobile) ----------- */}
      <nav className="category-wrap">
        <div className="category-bar">{fullCategoryList.map(renderCategoryButton)}</div>
      </nav>
    </>
  );
};

export default FoodCategoryList;
