// src/pages/RestaurantPage.jsx
import React, { useState, useMemo } from "react"; 
import { useParams } from "react-router-dom";       // << added
import { useQuery } from "@tanstack/react-query"; 
import usePageStyles from "../hooks/usePageStyles";
import ShopHeader from "../components/Shop/ShopHeader";
import ShopBanner from "../components/shop/ShopBanner";
import MenuList from "../components/shop/MenuList";
import ItemDetailModal from "../components/shop/ItemDetailModal";
import MobileNav from "../components/common/MobileNav";
import FoodCategoryList, { ALL_CAT_SVG } from "../components/shop/FoodCategoryList";
import { getRestaurantBannerBySlug } from "../api/restaurants";
import { getRestaurantMenuBySlug } from "../api/restaurants";


function RestaurantPage() {
  usePageStyles("/shop.css");

   // Added: read slug from url
  const { slug } = useParams();

  /* ---------- UI state --------------------------------------------------- */
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const defaultFill = "#999FA8";
  const activeFill = "#D17842";

  /* ---------- Queries ---------------------------------------------------- */
  const { data: banner, isLoading, isError } = useQuery({
    queryKey: ["restaurantBanner", slug],
    queryFn : () => getRestaurantBannerBySlug(slug),
  });

  const { data: menuData = [], isLoading: menuLoading } = useQuery({
    queryKey: ["restaurantMenu", slug],
    queryFn : () => getRestaurantMenuBySlug(slug),
  });

  const categoriesWithAll = useMemo(() => {
  // convert every section coming from the API ➜ a clean category object
  const apiCats = menuData.map(sec => ({
    id      : String(sec.categoryId), // 👈 always a string, always unique
    name    : sec.categoryTitle,
    svgIcon : sec.svgIcon,
  }));

    /// always prepend the hard-coded “همه”
  return [
    { id: "all", name: "همه", svgIcon: ALL_CAT_SVG }, // ✅ always present, with icon
    ...apiCats,
  ];
}, [menuData]);
    
  // const categories =
  // menuData?.map((section) => ({
  //   id: section.categoryId,
  //   title: section.categoryTitle,
  //   icon: section.svgIcon,
  //   key: section.categoryKey,
  // })) || [];

  /* ---------- Pick which foods to show ---------------------------------- */
  // const displayedFoods = useMemo(() => {
  //   if (activeCategory === "all") {
  //     return menuData.flatMap(sec => sec.foods);
  //   }
  //   const section = menuData.find(sec => String(sec.categoryId) === activeCategory);  // compare strings
  //   return section ? section.foods : [];
  // }, [activeCategory, menuData]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading restaurant data</div>;

  

//   
return (
    <div>
      <ShopHeader />
      <ShopBanner banner={banner} /> 

      <div className="res-menu-wrapper">
        {!menuLoading && (
          <FoodCategoryList
            categories={categoriesWithAll}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}

        <MenuList
          activeCategory={activeCategory}
          onSelectItem={setSelectedItem}
        />
      </div>

      {selectedItem && (
        <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      <MobileNav />
    </div>
  );
}

export default RestaurantPage;
