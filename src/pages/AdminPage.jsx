// src/pages/AdminPage.jsx
import { useState, useCallback, useEffect } from "react";
import usePageStyles from "../hooks/usePageStyles";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

import DashboardSection from "../components/admin/DashboardSection";
import ProductsSection from "../components/admin/ProductsSection";
import CategoriesSection from "../components/admin/CategoriesSection";
import ThemeSection from "../components/admin/ThemeSection";
import MusicSection from "../components/admin/MusicSection";
import FinancialSection from "../components/admin/FinancialSection";
import AdsBookingSection from "../components/admin/AdsBookingSection";
import ProfileSection from "../components/admin/ProfileSection";
import OrdersSection from "../components/admin/OrdersSection";
import CategorySettingsSection from "../components/admin/CategorySettingsSection";
import RestaurantCategorySettingsSection from "../components/admin/RestaurantCategorySettingsSection";
import AdsSettingsSection from "../components/admin/AdsSettingsSection";
import AdsRequestsSection from "../components/admin/AdsRequestsSection";
import RestaurantsListForAdminSection from "../components/admin/RestaurantsListForAdminSection";
import RestaurantProfileSection from "../components/admin/RestaurantProfileSection";
import CommentsSection from "../components/admin/CommentsSection";
import BlogManagementSection from "../components/admin/BlogManagementSection";
import LandingManagementSection from "../components/admin/LandingManagementSection";

import ownerRestaurantAxios from "../api/ownerRestaurantAxios";
import { useAuth } from "../context/AuthContext";
import { useMusicSignalR } from "../hooks/useMusicSignalR";
import { useModal } from "../components/common/GlobalModal";

export default function AdminPage() {
  const cssReady = usePageStyles("/admin-dashboard.css");

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("admin-active-tab") || "dashboard",
  );

  const { user } = useAuth();

  const [restaurantId, setRestaurantId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasNewRequest, setHasNewRequest] = useState(false);

  const { showModal } = useModal();

  /* ---------------------------
   * LOAD RESTAURANT CONTEXT
   * -------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await ownerRestaurantAxios.get("/context");
        setRestaurantId(data.restaurantId);
      } catch (err) {
        console.error("restaurant context error:", err);
      }
    };

    if (user) load();
  }, [user]);

  useEffect(() => {
    console.log("hasNewRequest =", hasNewRequest);
  }, [hasNewRequest]);
  /* ---------------------------
   * SIGNALR (single source of truth)
   * -------------------------- */
  useMusicSignalR(restaurantId, {
    onCreated: (data) => {
      setHasNewRequest(true);

      showModal({
        title: "درخواست جدید موسیقی",
        message: "یک درخواست جدید موسیقی از طرف مشتری ثبت شده است.",
        buttonText: "متوجه شدم",
        onConfirm: () => {
          setActiveTab("music");
          localStorage.setItem("admin-active-tab", "music");
          setHasNewRequest(false);
        },
      });

      console.log("🔄 realtime update triggered");
    },
  });

  /* ---------------------------
   * UI HANDLERS
   * -------------------------- */
  const handleSelectTab = useCallback((tab) => {
    setActiveTab(tab);
    localStorage.setItem("admin-active-tab", tab);

    setSidebarOpen(false);

    if (tab === "music") {
      setHasNewRequest(false);
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);

  if (!cssReady) return null;

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardSection />;
      case "products":
        return <ProductsSection />;
      case "categories":
        return <CategoriesSection />;
      case "restaurant-category-settings":
        return <RestaurantCategorySettingsSection />;
      case "theme":
        return <ThemeSection />;
      case "music":
        return <MusicSection />;
      case "orders":
        return <OrdersSection />;
      case "comments":
        return <CommentsSection />;
      case "blog":
        return <BlogManagementSection />;
      case "landing":
        return <LandingManagementSection />;
      case "financial":
        return <FinancialSection />;
      case "ads":
        return <AdsBookingSection />;
      case "ads-settings":
        return <AdsSettingsSection />;
      case "ads-requests":
        return <AdsRequestsSection />;
      case "restaurants":
        return <RestaurantsListForAdminSection />;
      case "restaurant-profile":
        return <RestaurantProfileSection />;
      case "profile":
        return <ProfileSection />;
      case "category-settings":
        return <CategorySettingsSection />;
      default:
        return <div>در حال ساخت...</div>;
    }
  };

  return (
    <div className="dashboard-container page-ready" dir="rtl">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        activeTab={activeTab}
        onSelect={handleSelectTab}
        hasNewRequest={hasNewRequest}
      />

      <main className="main-content">
        <AdminHeader userName="کاربر ادمین" onHamburger={toggleSidebar} />

        <section className="content-view active">{renderActiveView()}</section>
      </main>
    </div>
  );
}
