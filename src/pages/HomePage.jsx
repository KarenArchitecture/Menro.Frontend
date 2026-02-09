// // // import Header from "../components/common/Header";
// // import React, { useEffect } from "react";
// // import Header from "../components/common/Header";
// // import Carousel from "../components/home/Carousel";
// // import RestaurantList from "../components/home/RestaurantList";
// // import PreviousOrders from "../components/home/PreviousOrders";
// // import PopularFoodAndAdBannerLazyList from "../components/home/PopularFoodAndAdBannerLazyList";
// // import AuthActions from "../components/common/AuthActions";

// // export default function HomePage() {
// //   useEffect(() => {
// //     // reset per-page banner memory so each visit can show fresh random ads
// //     window.__menroAdExcludes = [];
// //   }, []);
// //   return (
// //     <>
// //       <Header />
// //       <main className="content">
// //         <AuthActions />
// //         <Carousel />
// //         <RestaurantList />
// //         <PreviousOrders />
// //         <PopularFoodAndAdBannerLazyList />  {/* ← contains both popular sections + ad banners */}
// //       </main>
// //     </>
// //   );
// // }

// // src/pages/HomePage.jsx
// import React, { useEffect } from "react";
// import Header from "../components/common/Header";
// import Carousel from "../components/home/Carousel";
// import RestaurantList from "../components/home/RestaurantList";
// import PreviousOrders from "../components/home/PreviousOrders";
// import PopularFoodAndAdBannerLazyList from "../components/home/PopularFoodAndAdBannerLazyList";

// export default function HomePage() {
//   console.log("🏠 Home rendered");
//   useEffect(() => {
//     console.log("🔹 Home mounted");
//     return () => console.log("🔸 Home unmounted");
//   }, []);
//   useEffect(() => {
//     window.__menroAdExcludes = [];
//   }, []);

//   return (
//     <>
//       <Header />
//       <main className="content">
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
    window.__menroAdExcludes = [];
  }, []);

  // reset counts whenever a new search is submitted
  useEffect(() => {
    if (!isSearchActive) {
      setRestaurantCount(null);
      setFoodCount(null);
      return;
    }
    setRestaurantCount(null);
    setFoodCount(null);
  }, [isSearchActive, searchQuery]);

  const totalResults = (restaurantCount ?? 0) + (foodCount ?? 0);
  const bothKnown = restaurantCount !== null && foodCount !== null;
  const showGlobalEmpty = isSearchActive && bothKnown && totalResults === 0;

  return (
    <>
      <Header onSearchSubmit={setSearchQuery} />

      <main className="content">
        {/* ✅ Search label */}
        {isSearchActive && (
          <SectionHeader
            title={`نتایج جستجو (${totalResults.toLocaleString("fa-IR")})`}
          />
        )}

        {/* ✅ Only show section if it has results (or still loading/unknown) */}
        {(!isSearchActive ||
          restaurantCount === null ||
          restaurantCount > 0) && (
          <RestaurantList
            searchQuery={searchQuery}
            onSearchCount={setRestaurantCount}
          />
        )}

        {(!isSearchActive || foodCount === null || foodCount > 0) && (
          <PopularFoodAndAdBannerLazyList
            searchQuery={searchQuery}
            onSearchCount={setFoodCount}
          />
        )}

        {/* ✅ If BOTH are empty, show ONE global empty message */}
        {showGlobalEmpty && (
          <StateMessage kind="empty" title="موردی یافت نشد">
            نتیجه‌ای برای جستجوی شما پیدا نشد.
          </StateMessage>
        )}

        {/* Normal mode components */}
        {!isSearchActive && (
          <>
            <Carousel />
            <PreviousOrders />
          </>
        )}
      </main>
    </>
  );
}
