// src/components/home/HomeSkeletons.jsx
import React from "react";
import SectionHeader from "../common/SectionHeader";
import StarIcon2 from "../icons/StarIcon2";
import ReceiptIcon from "../icons/ReceiptIcon";
import "../../assets/css/skeleton.css";


export function RestaurantCardsSkeleton({
    count = 4,
    title = "رستوران‌ و کافه‌ها",
    showHeader = true,
    }) {
    return (
        <section className="restaurants">
        {showHeader && (
            <SectionHeader
            icon={<StarIcon2 />}
            title={title}
            />
        )}

        <div className="cards-container">
            {Array.from({ length: count }).map((_, index) => (
            <div className="card card-skeleton" key={index}>
                <div className="card-img-container card-img-skeleton">
                <div className="logo-container logo-skeleton-wrap">
                    <div className="restaurant-badge-skeleton skeleton-shimmer" />
                </div>
                </div>

                <div className="card-body">
                <div className="time-badge-skeleton skeleton-shimmer" />
                <div className="restaurant-title-skeleton skeleton-shimmer" />
                <div className="restaurant-meta-skeleton skeleton-shimmer" />
                </div>
            </div>
            ))}
        </div>
        </section>
    );
}

export function FoodCardsSkeleton({
count = 4,
title = "در حال بارگذاری...",
showHeader = true,
icon = null,
}) {
return (
<section className="popular-food-row" aria-hidden="true">
    {showHeader && (
    <SectionHeader
        icon={icon}
        title={title}
    />
    )}

    <div className="food-cards-container">
    {Array.from({ length: count }).map((_, index) => (
        <div className="food-card food-card-skeleton" key={index}>
        <div className="food-card-image food-image-skeleton skeleton-shimmer">
            <div className="food-rating-chip-skeleton skeleton-shimmer" />
        </div>

        <div className="food-info">
            <div className="food-title-skeleton skeleton-shimmer" />
            <div className="food-title-skeleton food-title-skeleton--short skeleton-shimmer" />
        </div>

        <div className="food-price-row">
            <span />
            <div className="food-cta-skeleton skeleton-shimmer" />
        </div>
        </div>
    ))}
    </div>
</section>
);
}

export function BannerSkeleton({ height = 260 }) {
return (
    <section className="single-banner">
    <div
        className="banner-skeleton skeleton-shimmer"
        style={{ height: typeof height === "number" ? `${height}px` : height }}
    />
    </section>
);
}

export function CarouselSkeleton({ height = 380 }) {
return (
<section className="carousel" aria-hidden="true">
    <div className="carousel-container">
    <div
        className="carousel-skeleton skeleton-shimmer"
        style={{ height: typeof height === "number" ? `${height}px` : height }}
    />
    </div>

    <div className="indicators-container carousel-indicators-skeleton">
    <span className="indicator-skeleton skeleton-shimmer" />
    <span className="indicator-skeleton skeleton-shimmer" />
    <span className="indicator-skeleton skeleton-shimmer" />
    </div>
</section>
);
}


export function PreviousOrdersSkeleton({ count = 4 }) {
return (
<section className="previous-orders" aria-hidden="true">
    <SectionHeader
    icon={<ReceiptIcon />}
    title="سفارش‌های پیشین"
    />

    <div className="food-cards-container">
    {Array.from({ length: count }).map((_, index) => (
        <div className="food-card food-card-skeleton" key={index}>
        <div className="food-card-image food-image-skeleton skeleton-shimmer">
            <div className="food-rating-chip-skeleton skeleton-shimmer" />
        </div>

        <div className="food-info">
            <div className="food-title-skeleton skeleton-shimmer" />
            <div className="food-title-skeleton food-title-skeleton--short skeleton-shimmer" />
        </div>

        <div className="food-price-row">
            <span />
            <div className="food-cta-skeleton skeleton-shimmer" />
        </div>
        </div>
    ))}
    </div>
</section>
);
}

