// // import Header from "../components/common/Header";
// import React, { useEffect } from "react";
// import Header from "../components/common/Header";
// import Carousel from "../components/home/Carousel";
// import RestaurantList from "../components/home/RestaurantList";
// import PreviousOrders from "../components/home/PreviousOrders";
// import PopularFoodAndAdBannerLazyList from "../components/home/PopularFoodAndAdBannerLazyList";
// import AuthActions from "../components/common/AuthActions";

// export default function HomePage() {
//   useEffect(() => {
//     // reset per-page banner memory so each visit can show fresh random ads
//     window.__menroAdExcludes = [];
//   }, []);
//   return (
//     <>
//       <Header />
//       <main className="content">
//         <AuthActions />
//         <Carousel />
//         <RestaurantList />
//         <PreviousOrders />
//         <PopularFoodAndAdBannerLazyList />
//       </main>
//     </>
//   );
// }

// VERSION 3

// src/pages/HomePage.jsx
// import React, { useEffect, useState } from "react";
// import Header from "../components/common/Header";
// import Carousel from "../components/home/Carousel";
// import RestaurantList from "../components/home/RestaurantList";
// import PreviousOrders from "../components/home/PreviousOrders";
// import PopularFoodAndAdBannerLazyList from "../components/home/PopularFoodAndAdBannerLazyList";

// export default function HomePage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const isSearchActive = Boolean(searchQuery.trim());

//   useEffect(() => {
//     window.__menroAdExcludes = [];
//   }, []);

//   return (
//     <>
//       <Header onSearchSubmit={setSearchQuery} />

//       <main className="content">
//         {/* Always visible (you said restaurants must stay) */}
//         <RestaurantList
//           searchQuery={searchQuery}
//           hideEmptyOnSearch={isSearchActive}
//         />

//         {/* Always visible in search mode (you said popular foods must stay) */}
//         <PopularFoodAndAdBannerLazyList searchQuery={searchQuery} />

//         {/* Hidden during search */}
//         {!isSearchActive && (
//           <>
//             <Carousel />
//             <PreviousOrders />
//           </>
//         )}
//       </main>
//     </>
//   );
// }

// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/common/Header";
import Carousel from "../components/home/Carousel";
import RestaurantList from "../components/home/RestaurantList";
import PreviousOrders from "../components/home/PreviousOrders";
import PopularFoodAndAdBannerLazyList from "../components/home/PopularFoodAndAdBannerLazyList";
import SectionHeader from "../components/common/SectionHeader";
import StateMessage from "../components/common/StateMessage";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const isSearchActive = Boolean(searchQuery.trim());

  const [restaurantCount, setRestaurantCount] = useState(null); // null = unknown/loading
  const [foodCount, setFoodCount] = useState(null);

  useEffect(() => {
    // reset banner/page memory on each visit
    window.__menroAdExcludes = [];
    window.__menroBannerExcludeAdIds = [];
  }, []);

  // reset counts whenever search mode toggles
  useEffect(() => {
    if (!isSearchActive) {
      setRestaurantCount(null);
      setFoodCount(null);
      return;
    }
    setRestaurantCount(null);
    setFoodCount(null);
  }, [isSearchActive]);

  const totalResults = (restaurantCount ?? 0) + (foodCount ?? 0);
  const bothKnown = restaurantCount !== null && foodCount !== null;
  const showGlobalEmpty = isSearchActive && bothKnown && totalResults === 0;

  return (
    <>
      <Header onSearchSubmit={setSearchQuery} />

      <main className="content">
        {/* ✅ Normal mode top hero */}
        {!isSearchActive && <Carousel />}

        {/* ✅ Search label */}
        {isSearchActive && (
          <SectionHeader title={`نتایج جستجو (${totalResults.toLocaleString("fa-IR")})`} />
        )}

        {/* ✅ Random restaurants (also supports search mode) */}
        {(!isSearchActive || restaurantCount === null || restaurantCount > 0) && (
          <RestaurantList searchQuery={searchQuery} onSearchCount={setRestaurantCount} />
        )}

        {/* ✅ Latest orders only in normal mode */}
        {!isSearchActive && <PreviousOrders />}

        {/* ✅ Popular foods (and ads only in normal mode) */}
        {(!isSearchActive || foodCount === null || foodCount > 0) && (
          <PopularFoodAndAdBannerLazyList
            searchQuery={searchQuery}
            showAds={!isSearchActive}
            onSearchCount={setFoodCount}
          />
        )}

        {/* ✅ One global empty message if BOTH sections are empty */}
        {showGlobalEmpty && (
          <StateMessage kind="empty" title="موردی یافت نشد">
            نتیجه‌ای برای جستجوی شما پیدا نشد.
          </StateMessage>
        )}
      </main>
    </>
  );
}

