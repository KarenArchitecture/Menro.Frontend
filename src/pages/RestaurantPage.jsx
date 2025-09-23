import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import usePageStyles from "../hooks/usePageStyles";
import AppHeader from "../components/common/AppHeader";
import ShopBanner from "../components/shop/ShopBanner";
import MenuList from "../components/shop/MenuList";
import ItemDetailModal from "../components/shop/ItemDetailModal";
import MobileNav from "../components/common/MobileNav";
import FoodCategoryList, {
  ALL_CAT_SVG,
} from "../components/shop/FoodCategoryList";
import {
  getRestaurantBannerBySlug,
  getRestaurantMenuBySlug,
} from "../api/restaurants";
import SearchIcon from "../components/icons/SearchIcon";
import CartIcon from "../components/icons/CartIcon";
import ProfileIcon from "../components/icons/ProfileIcon";
import CheckoutBar from "../components/shop/CheckoutBar";

//  shared cart context */
import { CartProvider, useCart } from "../components/shop/CartContext";

/* -------- content  -------- */
function RestaurantContent() {
  const navigate = useNavigate();
  const { slug } = useParams();

  /* ---------- UI state ---------- */
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelectItem = (item) => setSelectedItem(item);
  const handleCloseModal = () => setSelectedItem(null);

  /* ---------- Cart from context  ---------- */
  const cart = useCart();

  useEffect(() => {
    document.body.classList.toggle("has-checkout", cart.count > 0);
  }, [cart.count]);
  /* ---------- Header icons ---------- */
  const leftIcons = useMemo(
    () => [
      { key: "profile", icon: <ProfileIcon /> },
      {
        key: "cart",
        icon: <CartIcon />,
        badge: cart.count > 0 ? cart.count : undefined,
      },
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

  /* ---------- Data queries ---------- */
  const {
    data: banner,
    isLoading: bannerLoading,
    isError: bannerError,
  } = useQuery({
    queryKey: ["restaurantBanner", slug],
    queryFn: () => getRestaurantBannerBySlug(slug),
  });

  const { data: menuData = [], isLoading: menuLoading } = useQuery({
    queryKey: ["restaurantMenu", slug],
    queryFn: () => getRestaurantMenuBySlug(slug),
  });

  /* ---------- Categories  ---------- */
  const categoriesWithAll = useMemo(() => {
    const apiCats = menuData.map((sec) => ({
      id: String(sec.categoryId),
      name: sec.categoryTitle,
      svgIcon: sec.svgIcon,
    }));
    return [{ id: "all", name: "همه", svgIcon: ALL_CAT_SVG }, ...apiCats];
  }, [menuData]);

  if (bannerLoading) return <div>Loading...</div>;
  if (bannerError) return <div>Error loading restaurant data</div>;

  return (
    <div>
      <AppHeader
        rightLinks={rightLinks}
        leftIcons={leftIcons}
        position="fixed"
        top={12}
        maxWidth={1140}
      />

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
          onSelectItem={handleSelectItem}
          categories={categoriesWithAll} // <-- add
          setActiveCategory={setActiveCategory} // <-- add
        />
      </div>

      {selectedItem && (
        <ItemDetailModal item={selectedItem} onClose={handleCloseModal} />
      )}

      <MobileNav />

      {/* Shows only when there is something in cart */}
      <CheckoutBar
        count={cart.count}
        total={cart.total}
        onCheckout={() => navigate("/checkout")}
      />
    </div>
  );
}

/* -------- Outer page: keep CSS hook + provide the cart -------- */
function RestaurantPage() {
  usePageStyles("/shop.css");
  return (
    <CartProvider>
      <RestaurantContent />
    </CartProvider>
  );
}

export default RestaurantPage;
