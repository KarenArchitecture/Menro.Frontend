import { useState, useCallback } from "react";
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
import AdsSettingsSection from "../components/admin/AdsSettingsSection";

export default function AdminPage() {
  const cssReady = usePageStyles("/admin-dashboard.css");

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("admin-active-tab") || "dashboard"
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectTab = useCallback((tab) => {
    setActiveTab(tab);
    localStorage.setItem("admin-active-tab", tab);
    setSidebarOpen(false);
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

      case "theme":
        return <ThemeSection />;

      case "music":
        return <MusicSection />;

      case "orders":
        return <OrdersSection />;

      case "financial":
        return <FinancialSection />;

      case "ads":
        return <AdsBookingSection />;

      case "ads-settings":
        return <AdsSettingsSection />;

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
      />

      <main className="main-content">
        <AdminHeader userName="کاربر ادمین" onHamburger={toggleSidebar} />

        <section className="content-view active">{renderActiveView()}</section>
      </main>
    </div>
  );
}
