// // src/components/home/RestaurantList.jsx
// import React from "react";
// import SectionHeader from "../common/SectionHeader";
// import RestaurantCard from "./RestaurantCard";
// import { useQuery } from "@tanstack/react-query";
// import { getRandomRestaurants } from "../../api/restaurants";
// import LoadingSpinner from "../common/LoadingSpinner";
// import StarIcon2 from "../icons/StarIcon2";
// import publicAxios from "../../api/publicAxios";

// function RestaurantList() {
//   const {
//     data: restaurants,
//     isLoading,
//     isError,
//   } = useQuery({
//     queryKey: ["randomRestaurants"],
//     queryFn: getRandomRestaurants,
//   });

//   if (isLoading) return <LoadingSpinner />;
//   if (isError) return <div className="ui-alert ui-alert--error">خطای بارگذاری رستوران‌ها.</div>;
//   if (!restaurants || restaurants.length === 0)
//     return <div className="ui-alert ui-alert--muted">موردی یافت نشد.</div>;

//   const apiOrigin = new URL(publicAxios.defaults.baseURL).origin;
//   const appOrigin = window.location.origin;
//   const toAssetUrl = (url, fallback) => {
//     const candidate = url || fallback;
//     if (!candidate) return undefined;
//     if (candidate.startsWith("http://") || candidate.startsWith("https://")) return candidate;
//     const withSlash = candidate.startsWith("/") ? candidate : `/${candidate}`;
//     if (withSlash.startsWith("/img/")) return `${apiOrigin}${withSlash}`;
//     if (withSlash.startsWith("/images/")) return `${appOrigin}${withSlash}`;
//     return `${appOrigin}${withSlash}`;
//   };

//   return (
//     <section className="restaurants">
//       <SectionHeader icon={<StarIcon2 />} title="رستوران‌ و کافه‌ها" />
//       <div className="cards-container">
//         {restaurants.map((r) => (
//           <RestaurantCard
//             key={r.id}
//             restaurant={{
//               name: r.name,
//               type: r.category,
//               hours: `${r.openTime ?? "نامشخص"} تا ${r.closeTime ?? "نامشخص"}`,
//               discount: r.discount || 0,
//               rating: Number(r.rating) || 0,
//               ratingCount: r.voters || 0,
//               imageUrl: toAssetUrl(r.bannerImageUrl, "/images/res-card-1.png"),
//               logoUrl: toAssetUrl(r.logoImageUrl, "/images/logo-green.png"),
//               isOpen: !!r.isOpen,
//               slug: r.slug, // ✅ pass slug explicitly
//             }}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }

// export default RestaurantList;

//VERSION 2
// src/components/home/RestaurantList.jsx
// import React from "react";
// import SectionHeader from "../common/SectionHeader";
// import RestaurantCard from "./RestaurantCard";
// import { useQuery } from "@tanstack/react-query";
// import { getRandomRestaurants } from "../../api/restaurants";
// import StateMessage from "../common/StateMessage";
// import StarIcon2 from "../icons/StarIcon2";
// import publicAxios from "../../api/publicAxios";
// import ShimmerRow from "../common/ShimmerRow";

// function RestaurantList() {
//   const {
//     data: restaurants,
//     isLoading,
//     isError,
//   } = useQuery({
//     queryKey: ["randomRestaurants"],
//     queryFn: getRandomRestaurants,
//   });

//   const apiOrigin = new URL(publicAxios.defaults.baseURL).origin;
//   const appOrigin = window.location.origin;
//   const toAssetUrl = (url, fallback) => {
//     const candidate = url || fallback;
//     if (!candidate) return undefined;
//     if (candidate.startsWith("http://") || candidate.startsWith("https://"))
//       return candidate;
//     const withSlash = candidate.startsWith("/") ? candidate : `/${candidate}`;
//     if (withSlash.startsWith("/img/")) return `${apiOrigin}${withSlash}`;
//     if (withSlash.startsWith("/images/")) return `${appOrigin}${withSlash}`;
//     return `${appOrigin}${withSlash}`;
//   };

//   // ───────────── Loading ─────────────
//   if (isLoading) {
//     return (
//       <section className="restaurants">
//         <SectionHeader
//           icon={<StarIcon2 />}
//           title="رستوران‌ و کافه‌ها"
//           style={{ margin: "2rem 0" }}
//         />
//         <ShimmerRow height={200} style={{ margin: "1.6rem 0" }} />
//       </section>
//     );
//   }

//   // ───────────── Error ─────────────
//   if (isError) {
//     return (
//       <StateMessage kind="error" title="خطا در دریافت رستوران‌ها">
//         مشکلی در دریافت اطلاعات رستوران‌ها رخ داده است.
//         <div className="state-message__action">
//           <button onClick={() => window.location.reload()}>
//             دوباره تلاش کنید
//           </button>
//         </div>
//       </StateMessage>
//     );
//   }

//   // ───────────── Empty ─────────────
//   if (!restaurants || restaurants.length === 0) {
//     return (
//       <StateMessage kind="empty" title="موردی یافت نشد">
//         رستورانی برای نمایش موجود نیست.
//       </StateMessage>
//     );
//   }

//   // ───────────── Data ─────────────
//   return (
//     <section className="restaurants">
//       <SectionHeader icon={<StarIcon2 />} title="رستوران‌ و کافه‌ها" />
//       <div className="cards-container">
//         {restaurants.map((r) => (
//           <RestaurantCard
//             key={r.id}
//             restaurant={{
//               name: r.name,
//               type: r.category,
//               hours: `${r.openTime ?? "نامشخص"} تا ${r.closeTime ?? "نامشخص"}`,
//               discount: r.discount || 0,
//               rating: Number(r.rating) || 0,
//               ratingCount: r.voters || 0,
//               imageUrl: toAssetUrl(r.bannerImageUrl, "/images/res-card-1.png"),
//               logoUrl: toAssetUrl(r.logoImageUrl, "/images/logo-green.png"),
//               isOpen: !!r.isOpen,
//               slug: r.slug,
//             }}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }

// export default RestaurantList;

// src/components/home/RestaurantList.jsx
import React, { useEffect, useMemo } from "react";
import SectionHeader from "../common/SectionHeader";
import RestaurantCard from "./RestaurantCard";
import { useQuery } from "@tanstack/react-query";
import { getRandomRestaurants } from "../../api/restaurants";
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
  const {
    data: restaurants = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["randomRestaurants"],
    queryFn: getRandomRestaurants,
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
    if (candidate.startsWith("http://") || candidate.startsWith("https://"))
      return candidate;
    const withSlash = candidate.startsWith("/") ? candidate : `/${candidate}`;
    if (withSlash.startsWith("/img/")) return `${apiOrigin}${withSlash}`;
    if (withSlash.startsWith("/images/")) return `${appOrigin}${withSlash}`;
    return `${appOrigin}${withSlash}`;
  };

  const q = useMemo(() => normalizeFa(searchQuery), [searchQuery]);
  const isSearchMode = Boolean(q);

  const filteredRestaurants = useMemo(() => {
    if (!isSearchMode) return restaurants;

    const exact = [];
    const starts = [];
    const includes = [];

    for (const r of restaurants) {
      const name = normalizeFa(r?.name);
      if (!name) continue;

      if (name === q) exact.push(r);
      else if (name.startsWith(q)) starts.push(r);
      else if (name.includes(q)) includes.push(r);
    }
    return [...exact, ...starts, ...includes];
  }, [restaurants, isSearchMode, q]);

  // report count to HomePage (ONLY meaningful during search)
  useEffect(() => {
    if (!onSearchCount) return;

    if (!isSearchMode) {
      onSearchCount(null);
      return;
    }

    if (isLoading || isError) return; // let it stay "unknown" while loading/error
    onSearchCount(filteredRestaurants.length);
  }, [
    onSearchCount,
    isSearchMode,
    isLoading,
    isError,
    filteredRestaurants.length,
  ]);

  // ───────────── Loading ─────────────
  if (isLoading) {
    return (
      <section className="restaurants">
        <SectionHeader
          icon={<StarIcon2 />}
          title="رستوران‌ و کافه‌ها"
          style={{ margin: "2rem 0" }}
        />
        <ShimmerRow height={200} style={{ margin: "1.6rem 0" }} />
      </section>
    );
  }

  // ───────────── Error ─────────────
  if (isError) {
    return (
      <StateMessage kind="error" title="خطا در دریافت رستوران‌ها">
        مشکلی در دریافت اطلاعات رستوران‌ها رخ داده است.
        <div className="state-message__action">
          <button onClick={() => refetch()}>دوباره تلاش کنید</button>
        </div>
      </StateMessage>
    );
  }

  // ───────────── Empty base ─────────────
  if (!restaurants.length) {
    return (
      <StateMessage kind="empty" title="موردی یافت نشد">
        رستورانی برای نمایش موجود نیست.
      </StateMessage>
    );
  }

  // ✅ Search mode: if no restaurant results, hide this whole section (no empty box)
  if (isSearchMode && filteredRestaurants.length === 0) {
    return null;
  }

  const list = isSearchMode ? filteredRestaurants : restaurants;

  return (
    <section className="restaurants">
      <SectionHeader icon={<StarIcon2 />} title="رستوران‌ و کافه‌ها" />
      <div className="cards-container">
        {list.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={{
              name: r.name,
              type: r.category,
              hours: `${r.openTime ?? "نامشخص"} تا ${r.closeTime ?? "نامشخص"}`,
              discount: r.discount || 0,
              rating: Number(r.rating) || 0,
              ratingCount: r.voters || 0,
              imageUrl: toAssetUrl(r.bannerImageUrl, "/images/res-card-1.png"),
              logoUrl: toAssetUrl(r.logoImageUrl, "/images/logo-green.png"),
              isOpen: !!r.isOpen,
              slug: r.slug,
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default RestaurantList;
