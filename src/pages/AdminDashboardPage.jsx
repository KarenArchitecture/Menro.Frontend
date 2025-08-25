import React, { useEffect, useState, useCallback } from "react";
import usePageStyles from "../hooks/usePageStyles";

import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import Panel from "../components/admin/Panel";
import StatCard from "../components/admin/StatCard";
import LineChart from "../components/admin/LineChart";
import ProductsSection from "../components/admin/ProductsSection";
import CategoriesSection from "../components/admin/CategoriesSection";
import ThemeSection from "../components/admin/ThemeSection";
import MusicSection from "../components/admin/MusicSection";
import FinancialSection from "../components/admin/FinancialSection";
import AdsBookingSection from "../components/admin/AdsBookingSection";
import ProfileSection from "../components/admin/ProfileSection";

const last7DaysFA = () => {
  const lbl = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    lbl.push(d.toLocaleDateString("fa-IR", { month: "short", day: "numeric" }));
  }
  return lbl;
};

/* component */
export default function AdminDashboardPage() {
  /* wait until CSS is fetched */
  const cssReady = usePageStyles("/admin-dashboard.css");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  /* select tab , collapse sidebar on mobile */
  const handleSelectTab = useCallback(
    (tab) => {
      setActiveTab(tab);
      closeSidebar();
    },
    [closeSidebar]
  );

  /* esc-key close sidebar */
  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e) => e.key === "Escape" && closeSidebar();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sidebarOpen, closeSidebar]);

  const viewClass = (tab) =>
    `content-view ${activeTab === tab ? "active" : ""}`;

  if (!cssReady) return null;

  return (
    <div className="dashboard-container page-ready" dir="rtl">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      {/* sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        activeTab={activeTab}
        onSelect={handleSelectTab}
      />

      {/* main area */}
      <main className="main-content">
        <AdminHeader
          userName={me?.name}
          avatarUrl={me?.avatarUrl}
          isLoading={isLoadingFromQuery}
          onHamburger={toggleSidebar}
        />
        {/* DASHBOARD */}
        <section id="dashboard-view" className={viewClass("dashboard")}>
          <h2 className="content-title">نمای کلی</h2>

          <div className="stats-grid">
            <StatCard
              iconClass="fas fa-dollar-sign"
              color="#f59e0b"
              title="درآمد کل"
              value="۱۲,۵۰۰,۰۰۰ تومان"
            />
            <StatCard
              iconClass="fas fa-receipt"
              color="#10b981"
              title="سفارشات جدید"
              value="۳۵۲"
            />
            <StatCard
              iconClass="fas fa-users"
              color="#3b82f6"
              title="کاربران فعال"
              value="۱,۴۲۰"
            />
            <StatCard
              iconClass="fas fa-exclamation-triangle"
              color="#ef4444"
              title="گزارش‌های خطا"
              value="۳"
            />
          </div>

          <div className="panels-grid">
            <Panel title="نمودار فروش ماهانه" className="chart-panel">
              <div className="chart-container">
                <LineChart
                  labels={last7DaysFA()}
                  datasetLabel="تعداد فروش"
                  data={[12, 19, 28, 35, 22, 38, 45]}
                  colorConfig={{
                    borderColor: "#F59E0B",
                    gradientStart: "rgba(245,158,11,0.4)",
                    gradientEnd: "rgba(245,158,11,0)",
                  }}
                />
              </div>
            </Panel>

            <Panel title="فعالیت‌های اخیر" className="activity-panel">
              <ul>
                <li>کاربر #۵۴۲ یک سفارش جدید ثبت کرد.</li>
                <li>رستوران "چیلان" محصول "کباب برگ" را به‌روزرسانی کرد.</li>
              </ul>
            </Panel>
          </div>
        </section>
        {/* PRODUCTS */}
        <section id="products-view" className={viewClass("products")}>
          <ProductsSection />
        </section>
        {/* CATEGORIES */}
        <section id="categories-view" className={viewClass("categories")}>
          <h2 className="content-title">مدیریت دسته‌بندی‌ها</h2>
          <CategoriesSection />
        </section>
        {/* THEME */}
        <section id="theme-view" className={viewClass("theme")}>
          <h2 className="content-title">مدیریت قالب رستوران</h2>
          <ThemeSection />
        </section>
        {/* MUSIC */}
        <section id="music-view" className={viewClass("music")}>
          <h2 className="content-title">مدیریت موزیک پلیر</h2>
          <MusicSection />
        </section>
        {/* FINANCIAL */}
        <section id="financial-view" className={viewClass("financial")}>
          <h2 className="content-title">اطلاعات مالی</h2>
          <FinancialSection />
        </section>
        {/* ADS */}
        <section id="ads-view" className={viewClass("ads")}>
          <h2 className="content-title">رزرو تبلیغ</h2>
          <AdsBookingSection />
        </section>
        {/* PROFILE */}
        <section id="profile-view" className={viewClass("profile")}>
          <h2 className="content-title">ویرایش پروفایل کاربری</h2>
          <ProfileSection />
        </section>
        {/* fallback / WIP */} {/* اگه صفحه ای در حال ساخت بود*/}
        <section id="fallback-view" className={viewClass("fallback")}>
          <h2 className="content-title">صفحه در حال ساخت</h2>
        </section>
      </main>
    </div>
  );
}
