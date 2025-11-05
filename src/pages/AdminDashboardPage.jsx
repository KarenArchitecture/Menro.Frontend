import React, { useEffect, useState, useCallback } from "react";
import usePageStyles from "../hooks/usePageStyles";
import adminAxios from "../api/adminDashboardAxios";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import Panel from "../components/admin/Panel";
import LineChart from "../components/admin/LineChart";
import ProductsSection from "../components/admin/ProductsSection";
import CategoriesSection from "../components/admin/CategoriesSection";
import ThemeSection from "../components/admin/ThemeSection";
import MusicSection from "../components/admin/MusicSection";
import FinancialSection from "../components/admin/FinancialSection";
import AdsBookingSection from "../components/admin/AdsBookingSection";
import ProfileSection from "../components/admin/ProfileSection";
import OrdersSection from "../components/admin/OrdersSection";
import CategorySettingsSection from "../components/admin/CategorySettingsSection";

// لیست ماه‌ها برای برچسب فارسی
const monthFa = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر",
];

export default function AdminDashboardPage() {
  /* ensure CSS loaded */
  const cssReady = usePageStyles("/admin-dashboard.css");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // dashboard dto
  const [dashboardData, setDashboardData] = useState(null);
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await adminAxios.get("/dashboard");
        setDashboardData(data);
      } catch (err) {
        console.error("خطا در دریافت داده داشبورد:", err);
      }
    };
    loadDashboard();
  }, []);

  // Monthly chart
  const labels =
    dashboardData?.monthlySales?.map((x) => monthFa[x.month - 1]) ?? [];

  const data =
    dashboardData?.monthlySales?.map((x) => Number(x.totalSales)) ?? [];

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  const handleSelectTab = useCallback(
    (tab) => {
      setActiveTab(tab);
      closeSidebar();
    },
    [closeSidebar]
  );

  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e) => e.key === "Escape" && closeSidebar();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sidebarOpen, closeSidebar]);

  const viewClass = (tab) =>
    `content-view ${activeTab === tab ? "active" : ""}`;

  if (!cssReady) return null;

  const formatTomans = (n) =>
    (Number(n) || 0).toLocaleString("fa-IR") + " تومان";

  // render
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
        <AdminHeader userName="کاربر ادمین" onHamburger={toggleSidebar} />

        {/* DASHBOARD */}
        <section id="dashboard-view" className={viewClass("dashboard")}>
          <h2 className="content-title">نمای کلی</h2>

          {/* Top row: درآمد کل + آمار امروز */}
          <div className="panels-section">
            <div className="top-panel">
              <Panel title="درآمد کل" className="summary-panel">
                <div
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <i
                    className="fas fa-dollar-sign"
                    style={{ color: "#f59e0b", fontSize: 22 }}
                  />
                  <div>
                    <div style={{ opacity: 0.85, fontSize: 14 }}>جمع درآمد</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>
                      {formatTomans(dashboardData?.totalRevenue)}
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel title="آمار امروز" className="today-panel">
                <div
                  className="today-stats-box"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div
                    className="today-stat"
                    style={{
                      background: "rgba(255,255,255,.04)",
                      border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: 12,
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <i
                      className="fas fa-shopping-basket"
                      style={{ color: "#10b981", fontSize: 22 }}
                    />
                    <div>
                      <div style={{ opacity: 0.8, fontSize: 14 }}>
                        تعداد سفارش‌های امروز
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 900 }}>
                        {dashboardData?.todayOrdersCount?.toLocaleString(
                          "fa-IR"
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className="today-stat"
                    style={{
                      background: "rgba(255,255,255,.04)",
                      border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: 12,
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <i
                      className="fas fa-coins"
                      style={{ color: "#f59e0b", fontSize: 22 }}
                    />
                    <div>
                      <div style={{ opacity: 0.8, fontSize: 14 }}>
                        درآمد امروز
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 900 }}>
                        {formatTomans(dashboardData?.todayRevenue)}
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
            {/* Chart: full width under the two panels */}
            <Panel
              title="نمودار فروش ماهانه"
              className="chart-panel"
              style={{ gridColumn: "1 / -1" }}
            >
              <div className="chart-container">
                <LineChart
                  labels={labels}
                  datasetLabel="فروش (تومان)"
                  data={data}
                  colorConfig={{
                    borderColor: "#F59E0B",
                    gradientStart: "rgba(245,158,11,0.4)",
                    gradientEnd: "rgba(245,158,11,0)",
                  }}
                />
              </div>
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

        {/* ORDERS */}
        <section id="orders-view" className={viewClass("orders")}>
          <h2 className="content-title">مدیریت سفارش‌ها</h2>
          <OrdersSection />
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

        {/* fallback / WIP */}
        <section id="fallback-view" className={viewClass("fallback")}>
          <h2 className="content-title">صفحه در حال ساخت</h2>
        </section>

        {/* CATEGORY SETTINGS */}
        <section
          id="category-settings-view"
          className={viewClass("category-settings")}
        >
          <h2 className="content-title">تنظیمات دسته‌های از پیش‌تعریف‌شده</h2>
          <CategorySettingsSection />
        </section>
      </main>
    </div>
  );
}
