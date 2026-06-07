import React from "react";
import "../../assets/css/skeleton.css";

export function ShopBannerSkeleton() {
  return (
    <section className="banner shop-banner-skeleton-reserve" aria-hidden="true" />
  );
}

export function CategoryBarSkeleton() {
  return (
    <>
      <aside
        className="category-sidebar-vertical category-sidebar-vertical--skeleton"
        aria-hidden="true"
      >
        <div className="shop-category-reserve shop-category-reserve--desktop" />
      </aside>

      <nav
        className="category-wrap category-wrap--skeleton"
        aria-hidden="true"
      >
        <div className="shop-category-reserve shop-category-reserve--mobile" />
      </nav>
    </>
  );
}


function MenuSectionHeaderSkeleton() {
  return (
    <div className="menu_nav menu_nav--skeleton" aria-hidden="true">
      <div className="menu_nav-title-holder">
        <div className="shop-section-icon-skeleton skeleton-shimmer" />
        <div className="shop-section-title-skeleton skeleton-shimmer" />
      </div>

      <div className="shop-section-btn-skeleton skeleton-shimmer" />
    </div>
  );
}

function MenuCardSkeleton({ vertical = false, shortTitle = false }) {
  return (
    <div className={`menu-card food-card-skeleton ${vertical ? "menu-card--vertical" : ""}`}>
      <div className="menu-card__media">
        <div className="menu-card__img food-image-skeleton skeleton-shimmer" />
      </div>

      <div className="menu-card__body">
        <div
          className={`food-title-skeleton skeleton-shimmer ${
            shortTitle ? "food-title-skeleton--short" : ""
          }`}
        />
        <div className="menu-card__price">
          <div className="shop-price-skeleton skeleton-shimmer" />
        </div>

        <div className="menu-card__footer">
          <div className="food-cta-skeleton skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}


export function ShopMenuSkeleton({
  sectionCount = 2,
  cardsPerSection = 4,
  vertical = false,
}) {
  return (
    <div className="res-menu">
      {Array.from({ length: sectionCount }).map((_, sectionIndex) => (
        <section key={sectionIndex}>
          <MenuSectionHeaderSkeleton />

          <div
            className={`food_items shop-food-row-skeleton ${
                vertical ? "vertical-scroll" : "horizontal-scroll"
            }`}
            >
            {Array.from({ length: cardsPerSection }).map((_, cardIndex) => (
              <MenuCardSkeleton
                key={cardIndex}
                vertical={vertical}
                shortTitle={cardIndex % 2 === 1}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
