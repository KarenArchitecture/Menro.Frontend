import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// import "../../public/shop.css";
import usePageStyles from "../hooks/usePageStyles";
// import AppHeader from "../components/common/AppHeader";
import ShopBanner from "../components/shop/ShopBanner";
import MenuList from "../components/shop/MenuList";
import ItemDetailModal from "../components/shop/ItemDetailModal";
import CheckoutBar from "../components/shop/CheckoutBar";
import FoodCategoryList, {
  ALL_CAT_SVG,
} from "../components/shop/FoodCategoryList";
import {
  getRestaurantBannerBySlug,
  getRestaurantMenuBySlug,
} from "../api/restaurants";
import { getRestaurantCategoriesBySlug } from "../api/foodCategories";
import { CartProvider, useCart } from "../components/shop/CartContext";
import {
  ShopBannerSkeleton,
  CategoryBarSkeleton,
  ShopMenuSkeleton,
} from "../components/shop/ShopSkeletons";

function RestaurantContent() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const cart = useCart();

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNearPageBottom, setIsNearPageBottom] = useState(false);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => setSelectedItem(null);

  const handleRestaurantSearch = (query) => {
    setSearchQuery(query);
    setActiveCategory("all");
  };

  const handleSeeAll = (catId) => {
    const id = String(catId);

    setSearchQuery("");
    setActiveCategory(id);

    setTimeout(() => {
      const topAnchor = document.getElementById("shop-menu-top");

      if (topAnchor) {
        const y =
          topAnchor.getBoundingClientRect().top + window.pageYOffset - 12;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }
    }, 80);
  };

  const fetchFoodDetails = async (id) => {
    const apiBase = import.meta.env.VITE_API_URL || "";
    const baseUrl = apiBase.replace(/\/api\/?$/, "");

    const res = await fetch(`${baseUrl}/api/public/food/${id}/details`);
    if (!res.ok) throw new Error("Failed loading details");
    return res.json();
  };

  const {
    data: banner,
    isLoading: bannerLoading,
    isError: bannerError,
  } = useQuery({
    queryKey: ["restaurantBanner", slug],
    queryFn: () => getRestaurantBannerBySlug(slug),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["restaurantCategories", slug],
    queryFn: () => getRestaurantCategoriesBySlug(slug),
    enabled: !!slug,
  });

  const {
    data: menuData = [],
    isLoading: menuLoading,
    isError: menuError,
  } = useQuery({
    queryKey: ["restaurantMenu", slug],
    queryFn: () => getRestaurantMenuBySlug(slug),
    enabled: !!slug,
  });

  const { data: modalData, isLoading: modalLoading } = useQuery({
    queryKey: ["foodDetails", selectedItem?.id],
    queryFn: () => fetchFoodDetails(selectedItem.id),
    enabled: !!selectedItem?.id,
  });

  const categoriesWithAll = useMemo(() => {
    const apiCats = categories.map((c) => ({
      id: String(c.id),
      name: c.name,
      svgIcon: c.svgIcon,
    }));

    return [{ id: "all", name: "همه", svgIcon: ALL_CAT_SVG }, ...apiCats];
  }, [categories]);

  const handleCheckout = () => {
    if (!banner) return;

    const items = Array.from(cart.items.values());

    navigate("/checkout", {
      state: {
        restaurantId: banner.id,
        restaurantSlug: slug,
        tableCount: banner.tableCount,
        items,
        total: cart.total,
        count: cart.count,
      },
    });
  };

  useEffect(() => {
    document.body.classList.toggle("has-checkout", cart.count > 0);
    return () => {
      document.body.classList.remove("has-checkout");
    };
  }, [cart.count]);

  useEffect(() => {
    const checkIfNearBottom = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const threshold = 120;

      const nearBottom = scrollTop + viewportHeight >= fullHeight - threshold;

      setIsNearPageBottom(nearBottom);
    };

    checkIfNearBottom();

    window.addEventListener("scroll", checkIfNearBottom, { passive: true });
    window.addEventListener("resize", checkIfNearBottom);

    return () => {
      window.removeEventListener("scroll", checkIfNearBottom);
      window.removeEventListener("resize", checkIfNearBottom);
    };
  }, []);

  if (bannerError) return <div>Error loading restaurant data</div>;

  return (
    <div>
      {bannerLoading ? (
        <ShopBannerSkeleton />
      ) : (
        <ShopBanner
          banner={banner}
          searchQuery={searchQuery}
          onSearch={handleRestaurantSearch}
        />
      )}

      <div id="shop-menu-top" className="res-menu-wrapper">
        {menuLoading ? (
          <CategoryBarSkeleton count={5} />
        ) : !menuError ? (
          <FoodCategoryList
            categories={categoriesWithAll}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        ) : null}

        {menuLoading ? (
          <ShopMenuSkeleton
            sectionCount={2}
            cardsPerSection={4}
            vertical={activeCategory !== "all" || searchQuery.trim().length > 0}
          />
        ) : (
          <MenuList
            menuData={menuData}
            isLoading={menuLoading}
            isError={menuError}
            activeCategory={activeCategory}
            onSelectItem={handleSelectItem}
            onSeeAll={handleSeeAll}
            categories={categoriesWithAll}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
          />
        )}

        {cart.count > 0 && isNearPageBottom && (
          <div className="checkout-safe-spacer" />
        )}
      </div>

      {selectedItem && modalLoading && (
        <div className="modal-loading">در حال بارگذاری...</div>
      )}

      {selectedItem && modalData && (
        <ItemDetailModal
          item={{
            ...selectedItem,
            ...modalData,
            voters:
              selectedItem?.voters ??
              selectedItem?.votersCount ??
              modalData?.voters ??
              modalData?.votersCount,
            rating: selectedItem?.rating ?? modalData?.rating,
          }}
          onClose={handleCloseModal}
        />
      )}

      <CheckoutBar
        count={cart.count}
        total={cart.total}
        onCheckout={handleCheckout}
      />
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
