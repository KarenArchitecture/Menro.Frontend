// src/pages/AdminPage.jsx
import { useState, useCallback, useEffect } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";

/* ===================== Layout ===================== */
import usePageStyles from "../hooks/usePageStyles";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

/* ===================== Sections: restaurant-mgmt ===================== */
import MenuManagementSection from "../components/admin/MenuManagementSection";
import CategoriesSection from "../components/admin/CategoriesSection";
import CommentsSection from "../components/admin/CommentsSection";
import CombosSection from "../components/admin/CombosSection";

/* ===================== Sections: business ===================== */
import OrdersSection from "../components/admin/OrdersSection";
import AdsBookingSection from "../components/admin/AdsBookingSection";
import FinancialSection from "../components/admin/FinancialSection";

/* ===================== Sections: platform-admin ===================== */
import UserManagementSection from "../components/admin/UserManagementSection";
import RestaurantsListForAdminSection from "../components/admin/RestaurantsListForAdminSection";
import CategorySettingsSection from "../components/admin/CategorySettingsSection";
import RestaurantCategorySettingsSection from "../components/admin/RestaurantCategorySettingsSection";

/* ===================== Sections: content-ads-admin ===================== */
import AdsSettingsSection from "../components/admin/AdsSettingsSection";
import AdsRequestsSection from "../components/admin/AdsRequestsSection";
import BlogManagementSection from "../components/admin/BlogManagementSection";
import LandingManagementSection from "../components/admin/LandingManagementSection";

/* ===================== Sections: account ===================== */
import ProfileSection from "../components/admin/ProfileSection";
import RestaurantProfileSection from "../components/admin/RestaurantProfileSection";

/* ===================== Sections: misc / unused in current sidebar ===================== */
import DashboardSection from "../components/admin/DashboardSection";
import ThemeSection from "../components/admin/ThemeSection";
import MusicSection from "../components/admin/MusicSection";

/* ===================== Data / context / hooks ===================== */
import ownerRestaurantAxios from "../api/ownerRestaurantAxios";
import { useAuth } from "../context/AuthContext";
import { useMusicSignalR } from "../hooks/useMusicSignalR";
import { useGlobalUI } from "../components/common/GlobalUI";

export default function AdminPage() {
  useDocumentTitle("پنل مدیریت");
  const cssReady = usePageStyles("/admin-dashboard.css");

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("admin-active-tab") || "dashboard",
  );

  const { user } = useAuth();

  const [restaurantId, setRestaurantId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasNewRequest, setHasNewRequest] = useState(false);

  const { alertModal } = useGlobalUI();
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

  /* ---------------------------
   * SIGNALR (single source of truth)
   * -------------------------- */
  useMusicSignalR(restaurantId, {
    onCreated: () => {
      setHasNewRequest(true);

      alertModal({
        title: "درخواست جدید موسیقی",
        message: "یک درخواست جدید موسیقی از طرف مشتری ثبت شده است.",
        buttonText: "مشاهده",
      }).then(() => {
        setActiveTab("music");
        localStorage.setItem("admin-active-tab", "music");
        setHasNewRequest(false);
      });
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
      // --- restaurant-mgmt ---
      case "menu":
        return (
          <MenuManagementSection
            onNavigateToCategories={() => handleSelectTab("categories")}
          />
        );
      case "categories":
        return <CategoriesSection />;
      case "comments":
        return <CommentsSection />;
      case "combos":
        return <CombosSection />;

      // --- business ---
      case "orders":
        return <OrdersSection />;
      case "ads":
        return <AdsBookingSection />;
      case "financial":
        return <FinancialSection />;

      // --- platform-admin ---
      case "user-roles":
        return <UserManagementSection />;
      case "restaurants":
        return <RestaurantsListForAdminSection />;
      case "category-settings":
        return <CategorySettingsSection />;
      case "restaurant-category-settings":
        return <RestaurantCategorySettingsSection />;

      // --- content-ads-admin ---
      case "ads-settings":
        return <AdsSettingsSection />;
      case "ads-requests":
        return <AdsRequestsSection />;
      case "blog":
        return <BlogManagementSection />;
      case "landing":
        return <LandingManagementSection />;

      // --- account ---
      case "profile":
        return <ProfileSection />;
      case "restaurant-profile":
        return <RestaurantProfileSection />;

      // --- misc ---
      case "dashboard":
        return <DashboardSection />;
      case "theme":
        return <ThemeSection />;
      case "music":
        return <MusicSection />;

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
