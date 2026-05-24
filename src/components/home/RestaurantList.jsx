import React, { useEffect, useMemo } from "react";
import SectionHeader from "../common/SectionHeader";
import RestaurantCard from "./RestaurantCard";
import { useQuery } from "@tanstack/react-query";
import { getRandomRestaurants } from "../../api/restaurants";
import { publicSearch } from "../../api/search";
import StateMessage from "../common/StateMessage";
import StarIcon2 from "../icons/StarIcon2";
import publicAxios from "../../api/publicAxios";
import ShimmerRow from "../common/ShimmerRow";

const normalizeFa = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();

function RestaurantList({ searchQuery = "", onSearchCount }) {
  const q = useMemo(() => normalizeFa(searchQuery), [searchQuery]);
  const isSearchMode = Boolean(q);

  const {
    data: restaurants = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: isSearchMode ? ["restaurantSearchDb", q] : ["randomRestaurants"],
    queryFn: async () => {
      if (!isSearchMode) return getRandomRestaurants();

      const res = await publicSearch(q, 50);
      const items = res?.items ?? [];

      // convert SearchItemDto -> shape your UI already uses
      return items
        .filter((x) => x?.type === "Restaurant")
        .map((x) => ({
          id: x.id,
          name: x.title,
          category: x.category ?? "",
          openTime: x.openTime ?? null,
          closeTime: x.closeTime ?? null,
          discount: x.discount ?? 0,
          rating: Number(x.rating) || 0,
          voters: x.voters ?? 0,
          bannerImageUrl: x.imageUrl,
          logoImageUrl: x.logoImageUrl,
          isOpen: !!x.isOpen,
          slug: x.restaurantSlug,
        }));
    },
    staleTime: 60_000,
    retry: 1,
  });

  const apiOrigin = useMemo(
    () => new URL(publicAxios.defaults.baseURL).origin,
    []
  );

  const appOrigin = useMemo(() => window.location.origin, []);

  const toAssetUrl = (url, fallback) => {
    const candidate = url || fallback;

    if (!candidate) return undefined;

    if (
      candidate.startsWith("http://") ||
      candidate.startsWith("https://")
    ) {
      return candidate;
    }

    const withSlash = candidate.startsWith("/")
      ? candidate
      : `/${candidate}`;

    if (withSlash.startsWith("/img/")) {
      return `${apiOrigin}${withSlash}`;
    }

    if (withSlash.startsWith("/images/")) {
      return `${appOrigin}${withSlash}`;
    }

    return `${appOrigin}${withSlash}`;
  };

  useEffect(() => {
    if (!onSearchCount) return;

    if (!isSearchMode) {
      onSearchCount(null);
      return;
    }

    if (isLoading || isError) return;

    onSearchCount(restaurants.length);
  }, [onSearchCount, isSearchMode, isLoading, isError, restaurants.length]);

  const showSeeMore = !isSearchMode;

  return (
    <section className="restaurants">
      <SectionHeader
        icon={<StarIcon2 />}
        title="رستوران‌ و کافه‌ها"
        linkText="مشاهده همه"
        to={showSeeMore ? "/restaurants" : undefined}
      />

      {isLoading && (
        <ShimmerRow height={200} style={{ margin: "1.6rem 0" }} />
      )}

      {isError && (
        <StateMessage kind="error" title="خطا در دریافت رستوران‌ها">
          مشکلی در دریافت اطلاعات رستوران‌ها رخ داده است.
          <div className="state-message__action">
            <button type="button" onClick={() => refetch()}>
              دوباره تلاش کنید
            </button>
          </div>
        </StateMessage>
      )}

      {!isLoading && !isError && !restaurants.length && (
        <StateMessage kind="empty" title="موردی یافت نشد">
          هیچ <span className="state-message-subject">رستورانی</span> برای نمایش موجود نیست.
        </StateMessage>
      )}

      {!isLoading && !isError && restaurants.length > 0 && (
        <div className="cards-container">
          {restaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={{
                name: r.name,
                type: r.category,
                hours: `${r.openTime ?? "نامشخص"} تا ${
                  r.closeTime ?? "نامشخص"
                }`,
                discount: r.discount || 0,
                rating: Number(r.rating) || 0,
                ratingCount: r.voters || 0,
                imageUrl: toAssetUrl(
                  r.bannerImageUrl,
                  "/images/res-card-1.png"
                ),
                logoUrl: toAssetUrl(
                  r.logoImageUrl,
                  "/images/logo-green.png"
                ),
                isOpen: !!r.isOpen,
                slug: r.slug,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default RestaurantList;