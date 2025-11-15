// import React, { useState, useMemo, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import usePageStyles from "../hooks/usePageStyles";
// import AppHeader from "../components/common/AppHeader";
// import ShopBanner from "../components/shop/ShopBanner";
// import MenuList from "../components/shop/MenuList";
// import ItemDetailModal from "../components/shop/ItemDetailModal";
// import MobileNav from "../components/common/MobileNav";
// import FoodCategoryList, {
//   ALL_CAT_SVG,
// } from "../components/shop/FoodCategoryList";
// import {
//   getRestaurantBannerBySlug,
//   getRestaurantMenuBySlug,
// } from "../api/restaurants";
// import SearchIcon from "../components/icons/SearchIcon";
// import CartIcon from "../components/icons/CartIcon";
// import ProfileIcon from "../components/icons/ProfileIcon";
// import CheckoutBar from "../components/shop/CheckoutBar";

// //  shared cart context */
// import { CartProvider, useCart } from "../components/shop/CartContext";

// /* -------- content  -------- */
// function RestaurantContent() {
//   const navigate = useNavigate();
//   const { slug } = useParams();

//   /* ---------- UI state ---------- */
//   const [activeCategory, setActiveCategory] = useState("all");
//   const [selectedItem, setSelectedItem] = useState(null);

//   const handleSelectItem = (item) => setSelectedItem(item);
//   const handleCloseModal = () => setSelectedItem(null);

//   /* ---------- Cart from context  ---------- */
//   const cart = useCart();

//   useEffect(() => {
//     document.body.classList.toggle("has-checkout", cart.count > 0);
//   }, [cart.count]);

//   /* ---------- Header icons ---------- */
//   const leftIcons = useMemo(
//     () => [
//       { key: "profile", icon: <ProfileIcon /> },
//       {
//         key: "cart",
//         icon: <CartIcon />,
//         badge: cart.count > 0 ? cart.count : undefined,
//       },
//       { key: "search", icon: <SearchIcon /> },
//     ],
//     [cart.count]
//   );

//   const rightLinks = [
//     { label: "منرو", href: "#", active: true },
//     { label: "خانه", href: "#" },
//     { label: "نقشه", href: "#" },
//     { label: "مقالات", href: "#" },
//   ];

//   /* ---------- Data queries ---------- */
//   const {
//     data: banner,
//     isLoading: bannerLoading,
//     isError: bannerError,
//     refetch: refetchBanner,
//   } = useQuery({
//     queryKey: ["restaurantBanner", slug],
//     queryFn: () => getRestaurantBannerBySlug(slug),
//     keepPreviousData: false,
//     refetchOnWindowFocus: false,
//   });

//   useEffect(() => {
//     refetchBanner(); // refetch banner whenever slug changes
//   }, [slug, refetchBanner]);

//   const { data: menuData = [], isLoading: menuLoading } = useQuery({
//     queryKey: ["restaurantMenu", slug],
//     queryFn: () => getRestaurantMenuBySlug(slug),
//   });

//   /* ---------- Categories  ---------- */
//   const categoriesWithAll = useMemo(() => {
//     const apiCats = menuData.map((sec) => ({
//       id: String(sec.categoryId),
//       name: sec.categoryTitle,
//       svgIcon: sec.svgIcon,
//     }));
//     return [{ id: "all", name: "همه", svgIcon: ALL_CAT_SVG }, ...apiCats];
//   }, [menuData]);

//   if (bannerLoading) return <div>Loading...</div>;
//   if (bannerError) return <div>Error loading restaurant data</div>;

//   return (
//     <div>
//       <AppHeader
//         rightLinks={rightLinks}
//         leftIcons={leftIcons}
//         position="fixed"
//         top={12}
//         maxWidth={1140}
//       />

//       <ShopBanner banner={banner} />

//       <div className="res-menu-wrapper">
//         {!menuLoading && (
//           <FoodCategoryList
//             categories={categoriesWithAll}
//             activeCategory={activeCategory}
//             setActiveCategory={setActiveCategory}
//           />
//         )}

//         <MenuList
//           activeCategory={activeCategory}
//           onSelectItem={handleSelectItem}
//           categories={categoriesWithAll} // <-- add
//           setActiveCategory={setActiveCategory} // <-- add
//         />
//       </div>

//       {selectedItem && (
//         <ItemDetailModal item={selectedItem} onClose={handleCloseModal} />
//       )}

//       <MobileNav />

//       {/* Shows only when there is something in cart */}
//       <CheckoutBar
//         count={cart.count}
//         total={cart.total}
//         onCheckout={() => navigate("/checkout")}
//       />
//     </div>
//   );
// }

// /* -------- Outer page: keep CSS hook + provide the cart -------- */
// function RestaurantPage() {
//   usePageStyles("/shop.css");
//   return (
//     <CartProvider>
//       <RestaurantContent />
//     </CartProvider>
//   );
// }

// export default RestaurantPage;























// import React, { useState, useMemo, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import usePageStyles from "../hooks/usePageStyles";
// import AppHeader from "../components/common/AppHeader";
// import ShopBanner from "../components/shop/ShopBanner";
// import MenuList from "../components/shop/MenuList";
// import ItemDetailModal from "../components/shop/ItemDetailModal";
// import MobileNav from "../components/common/MobileNav";
// import FoodCategoryList, { ALL_CAT_SVG } from "../components/shop/FoodCategoryList";
// import { getRestaurantBannerBySlug } from "../api/restaurants";
// import { getRestaurantCategoriesBySlug } from "../api/foodCategories";
// import SearchIcon from "../components/icons/SearchIcon";
// import CartIcon from "../components/icons/CartIcon";
// import ProfileIcon from "../components/icons/ProfileIcon";
// import CheckoutBar from "../components/shop/CheckoutBar";
// import { CartProvider, useCart } from "../components/shop/CartContext";

// function RestaurantContent() {
//   const navigate = useNavigate();
//   const { slug } = useParams();

//   const [activeCategory, setActiveCategory] = useState("all");
//   const [selectedItem, setSelectedItem] = useState(null);
//   const cart = useCart();

//   const handleSelectItem = (item) => setSelectedItem(item);
//   const handleCloseModal = () => setSelectedItem(null);

//   useEffect(() => {
//     document.body.classList.toggle("has-checkout", cart.count > 0);
//   }, [cart.count]);

//   const leftIcons = useMemo(
//     () => [
//       { key: "profile", icon: <ProfileIcon /> },
//       { key: "cart", icon: <CartIcon />, badge: cart.count > 0 ? cart.count : undefined },
//       { key: "search", icon: <SearchIcon /> },
//     ],
//     [cart.count]
//   );

//   const rightLinks = [
//     { label: "منرو", href: "#", active: true },
//     { label: "خانه", href: "#" },
//     { label: "نقشه", href: "#" },
//     { label: "مقالات", href: "#" },
//   ];

//   // Fetch banner
//   const { data: banner, isLoading: bannerLoading, isError: bannerError } = useQuery({
//     queryKey: ["restaurantBanner", slug],
//     queryFn: () => getRestaurantBannerBySlug(slug),
//   });

//   // Fetch categories
//   const { data: categories = [], isLoading: categoriesLoading } = useQuery({
//     queryKey: ["restaurantCategories", slug],
//     queryFn: () => getRestaurantCategoriesBySlug(slug),
//   });

//   // Build categories with unique keys and all foods
//   const categoriesWithAll = useMemo(() => {
//     const allFoods = categories.flatMap((c) =>
//       (c.foods || []).map((f) => ({
//         ...f,
//         key: `food-${f.id}-${c.id}`, // unique key per food
//       }))
//     );

//     const mappedCats = categories.map((c) => ({
//       id: String(c.id),
//       key: c.globalFoodCategoryId ? `global-${c.globalFoodCategoryId}` : `custom-${c.id}`,
//       name: c.name,
//       svgIcon: c.svgIcon,
//       foods: (c.foods || []).map((f) => ({
//         ...f,
//         key: `food-${f.id}-${c.id}`,
//       })),
//     }));

//     const allCat = {
//       id: "all",
//       key: "all",
//       name: "همه",
//       svgIcon: ALL_CAT_SVG,
//       foods: allFoods,
//     };

//     return [allCat, ...mappedCats];
//   }, [categories]);

//   if (bannerLoading || categoriesLoading) return <div>Loading...</div>;
//   if (bannerError) return <div>Error loading restaurant data</div>;

//   return (
//     <div>
//       <AppHeader rightLinks={rightLinks} leftIcons={leftIcons} position="fixed" top={12} maxWidth={1140} />
//       <ShopBanner slug={slug} />

//       <div className="res-menu-wrapper">
//         <FoodCategoryList
//           categories={categoriesWithAll}
//           activeCategory={activeCategory}
//           setActiveCategory={setActiveCategory}
//         />

//         <MenuList
//           activeCategory={activeCategory}
//           onSelectItem={handleSelectItem}
//           categories={categoriesWithAll}
//         />
//       </div>

//       {selectedItem && <ItemDetailModal item={selectedItem} onClose={handleCloseModal} />}

//       <MobileNav />
//       <CheckoutBar count={cart.count} total={cart.total} onCheckout={() => navigate("/checkout")} />
//     </div>
//   );
// }

// function RestaurantPage() {
//   usePageStyles("/shop.css");
//   return (
//     <CartProvider>
//       <RestaurantContent />
//     </CartProvider>
//   );
// }

// export default RestaurantPage;

















// import React, { useState, useMemo, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import usePageStyles from "../hooks/usePageStyles";
// import AppHeader from "../components/common/AppHeader";
// import ShopBanner from "../components/shop/ShopBanner";
// import MenuList from "../components/shop/MenuList";
// import ItemDetailModal from "../components/shop/ItemDetailModal";
// import MobileNav from "../components/common/MobileNav";
// import FoodCategoryList, { ALL_CAT_SVG } from "../components/shop/FoodCategoryList";
// import { getRestaurantBannerBySlug } from "../api/restaurants";
// import { getRestaurantCategoriesBySlug } from "../api/foodCategories";
// import SearchIcon from "../components/icons/SearchIcon";
// import CartIcon from "../components/icons/CartIcon";
// import ProfileIcon from "../components/icons/ProfileIcon";
// import CheckoutBar from "../components/shop/CheckoutBar";
// import { CartProvider, useCart } from "../components/shop/CartContext";
// import ShimmerRow from "../components/common/ShimmerRow";
// import StateMessage from "../components/common/StateMessage";

// function RestaurantContent() {
//   const navigate = useNavigate();
//   const { slug } = useParams();

//   const [activeCategory, setActiveCategory] = useState("all");
//   const [selectedItem, setSelectedItem] = useState(null);
//   const cart = useCart();

//   const handleSelectItem = (item) => setSelectedItem(item);
//   const handleCloseModal = () => setSelectedItem(null);

//   useEffect(() => {
//     document.body.classList.toggle("has-checkout", cart.count > 0);
//   }, [cart.count]);

//   const leftIcons = useMemo(
//     () => [
//       { key: "profile", icon: <ProfileIcon /> },
//       { key: "cart", icon: <CartIcon />, badge: cart.count > 0 ? cart.count : undefined },
//       { key: "search", icon: <SearchIcon /> },
//     ],
//     [cart.count]
//   );

//   const rightLinks = [
//     { label: "منرو", href: "#", active: true },
//     { label: "خانه", href: "#" },
//     { label: "نقشه", href: "#" },
//     { label: "مقالات", href: "#" },
//   ];

//   // ───────────── Fetch banner ─────────────
//   const {
//     data: banner,
//     isLoading: bannerLoading,
//     isError: bannerError,
//   } = useQuery({
//     queryKey: ["restaurantBanner", slug],
//     queryFn: () => getRestaurantBannerBySlug(slug),
//   });

//   // ───────────── Fetch categories ─────────────
//   const {
//     data: categories = [],
//     isLoading: categoriesLoading,
//     isError: categoriesError,
//   } = useQuery({
//     queryKey: ["restaurantCategories", slug],
//     queryFn: () => getRestaurantCategoriesBySlug(slug),
//   });

//   const categoriesWithAll = useMemo(() => {
//     const allFoods = categories.flatMap((c) =>
//       (c.foods || []).map((f) => ({
//         ...f,
//         key: `food-${f.id}-${c.id}`,
//       }))
//     );

//     const mappedCats = categories.map((c) => ({
//       id: String(c.id),
//       key: c.globalFoodCategoryId ? `global-${c.globalFoodCategoryId}` : `custom-${c.id}`,
//       name: c.name,
//       svgIcon: c.svgIcon,
//       foods: (c.foods || []).map((f) => ({
//         ...f,
//         key: `food-${f.id}-${c.id}`,
//       })),
//     }));

//     const allCat = {
//       id: "all",
//       key: "all",
//       name: "همه",
//       svgIcon: ALL_CAT_SVG,
//       foods: allFoods,
//     };
//     return [allCat, ...mappedCats];
//   }, [categories]);

//   console.log("activeCategory", activeCategory);
//   console.log("categoriesWithAll", categoriesWithAll);
//   console.log("allCat foods", categoriesWithAll[0]?.foods);

//   // ───────────── Loading / Error / Empty states ─────────────
//   if (bannerLoading || categoriesLoading) {
//     return (
//       <div>
//         <AppHeader rightLinks={rightLinks} leftIcons={leftIcons} position="fixed" top={12} maxWidth={1140} />
//         <ShimmerRow height={200} style={{ margin: "16px 0" }} /> {/* banner shimmer */}
//         <ShimmerRow height={220} style={{ margin: "16px 0" }} /> {/* menu shimmer */}
//       </div>
//     );
//   }

//   if (bannerError || categoriesError) {
//     return (
//       <div>
//         <AppHeader rightLinks={rightLinks} leftIcons={leftIcons} position="fixed" top={12} maxWidth={1140} />
//         <StateMessage kind="error" title="خطا در دریافت اطلاعات رستوران">
//           اطلاعات رستوران بارگذاری نشد.
//           <div className="state-message__action">
//             <button onClick={() => window.location.reload()}>دوباره تلاش کنید</button>
//           </div>
//         </StateMessage>
//       </div>
//     );
//   }

//   if (!categoriesWithAll.length || !banner) {
//     return (
//       <div>
//         <AppHeader rightLinks={rightLinks} leftIcons={leftIcons} position="fixed" top={12} maxWidth={1140} />
//         <StateMessage kind="empty" title="اطلاعات موجود نیست">
//           دسته‌بندی یا بنر رستوران پیدا نشد.
//         </StateMessage>
//       </div>
//     );
//   }

//   // ───────────── Data loaded ─────────────
//   return (
//     <div>
//       <AppHeader rightLinks={rightLinks} leftIcons={leftIcons} position="fixed" top={12} maxWidth={1140} />
//       <ShopBanner slug={slug} />

//       <div className="res-menu-wrapper">
//         <FoodCategoryList
//           categories={categoriesWithAll}
//           activeCategory={activeCategory}
//           setActiveCategory={setActiveCategory}
//         />

//         <MenuList
//           restaurantSlug={slug}
//           activeCategory={activeCategory}
//           onSelectItem={handleSelectItem}
//           categories={categoriesWithAll}
//         />
//       </div>

//       {selectedItem && <ItemDetailModal item={selectedItem} onClose={handleCloseModal} />}

//       <MobileNav />
//       <CheckoutBar count={cart.count} total={cart.total} onCheckout={() => navigate("/checkout")} />
//     </div>
//   );
// }

// function RestaurantPage() {
//   usePageStyles("/shop.css");
//   return (
//     <CartProvider>
//       <RestaurantContent />
//     </CartProvider>
//   );
// }

// export default RestaurantPage;





















import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import usePageStyles from "../hooks/usePageStyles";
import AppHeader from "../components/common/AppHeader";
import ShopBanner from "../components/shop/ShopBanner";
import MenuList from "../components/shop/MenuList";
import ItemDetailModal from "../components/shop/ItemDetailModal";
import MobileNav from "../components/common/MobileNav";
import FoodCategoryList, { ALL_CAT_SVG } from "../components/shop/FoodCategoryList";
import { getRestaurantBannerBySlug } from "../api/restaurants";
import { getRestaurantCategoriesBySlug } from "../api/foodCategories";
import SearchIcon from "../components/icons/SearchIcon";
import CartIcon from "../components/icons/CartIcon";
import ProfileIcon from "../components/icons/ProfileIcon";
import CheckoutBar from "../components/shop/CheckoutBar";
import { CartProvider, useCart } from "../components/shop/CartContext";
import ShimmerRow from "../components/common/ShimmerRow";
import StateMessage from "../components/common/StateMessage";

function RestaurantContent() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const cart = useCart();

  const handleSelectItem = (item) => setSelectedItem(item);
  const handleCloseModal = () => setSelectedItem(null);

  // Toggle checkout class on body
  useEffect(() => {
    document.body.classList.toggle("has-checkout", cart.count > 0);
  }, [cart.count]);

  const leftIcons = useMemo(
    () => [
      { key: "profile", icon: <ProfileIcon /> },
      { key: "cart", icon: <CartIcon />, badge: cart.count > 0 ? cart.count : undefined },
      { key: "search", icon: <SearchIcon /> },
    ],
    [cart.count]
  );

  const rightLinks = [
    { label: "منرو", href: "#", active: true },
    { label: "خانه", href: "#" },
    { label: "نقشه", href: "#" },
    { label: "مقالات", href: "#" },
  ];

  // ───────────── Fetch banner ─────────────
  const { data: banner, isLoading: bannerLoading, isError: bannerError } = useQuery({
    queryKey: ["restaurantBanner", slug],
    queryFn: () => getRestaurantBannerBySlug(slug),
  });

  // ───────────── Fetch categories & foods ─────────────
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ["restaurantCategories", slug],
    queryFn: () => getRestaurantCategoriesBySlug(slug),
  });

  // ───────────── Build category list including “همه” ─────────────
  const categoriesWithAll = useMemo(() => {
    const mappedCats = categories.map((c) => ({
      id: String(c.id),
      key: c.globalFoodCategoryId ? `global-${c.globalFoodCategoryId}` : `custom-${c.id}`,
      name: c.name,
      svgIcon: c.svgIcon,
      foods: (c.foods || []).map((f) => ({ ...f, key: `food-${f.id}-${c.id}` })),
    }));

    const allFoods = mappedCats.flatMap((c) => c.foods);

    const allCat = {
      id: "all",
      key: "all",
      name: "همه",
      svgIcon: ALL_CAT_SVG,
      foods: allFoods,
    };

    return [allCat, ...mappedCats];
  }, [categories]);

  // ───────────── Loading / Error / Empty states ─────────────
  if (bannerLoading || categoriesLoading) {
    return (
      <div>
        <AppHeader rightLinks={rightLinks} leftIcons={leftIcons} position="fixed" top={12} maxWidth={1140} />
        <ShimmerRow height={200} style={{ margin: "16px 0" }} />
        <ShimmerRow height={220} style={{ margin: "16px 0" }} />
      </div>
    );
  }

  if (bannerError || categoriesError) {
    return (
      <div>
        <AppHeader rightLinks={rightLinks} leftIcons={leftIcons} position="fixed" top={12} maxWidth={1140} />
        <StateMessage kind="error" title="خطا در دریافت اطلاعات رستوران">
          اطلاعات رستوران بارگذاری نشد.
          <div className="state-message__action">
            <button onClick={() => window.location.reload()}>دوباره تلاش کنید</button>
          </div>
        </StateMessage>
      </div>
    );
  }

  if (!categoriesWithAll.length || !banner) {
    return (
      <div>
        <AppHeader rightLinks={rightLinks} leftIcons={leftIcons} position="fixed" top={12} maxWidth={1140} />
        <StateMessage kind="empty" title="اطلاعات موجود نیست">
          دسته‌بندی یا بنر رستوران پیدا نشد.
        </StateMessage>
      </div>
    );
  }

  // ───────────── Render ─────────────
  return (
    <div>
      <AppHeader rightLinks={rightLinks} leftIcons={leftIcons} position="fixed" top={12} maxWidth={1140} />
      <ShopBanner slug={slug} />

      <div className="res-menu-wrapper">
        {/* Categories */}
        <FoodCategoryList
          categories={categoriesWithAll}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* Menu foods */}
        <MenuList
          restaurantSlug={slug}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory} // needed for vertical actions
          onSelectItem={handleSelectItem}
          categories={categoriesWithAll}
        />
      </div>

      {/* Item Modal */}
      {selectedItem && <ItemDetailModal item={selectedItem} onClose={handleCloseModal} />}

      <MobileNav />
      <CheckoutBar count={cart.count} total={cart.total} onCheckout={() => navigate("/checkout")} />
    </div>
  );
}

function RestaurantPage() {
  usePageStyles("/shop.css");
  return (
    <CartProvider>
      <RestaurantContent />
    </CartProvider>
  );
}

export default RestaurantPage;
