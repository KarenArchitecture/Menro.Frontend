import React, { useEffect, useState, useCallback } from "react";
import usePageStyles from "../hooks/usePageStyles";
import adminAxios from "../api/adminDashboardAxios";
import restaurantAxios from "../api/restaurantAxios";
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

/* component */
export default function AdminDashboardPage() {
  /* wait until CSS is fetched */
  const cssReady = usePageStyles("/admin-dashboard.css");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // داده‌های نمودار فروش
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);

  const restaurantId = null; // برای ادمین null بگذار؛ برای صاحب رستوران مقدار بده

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

  // گرفتن آیدی رستوران اگه کاربر صاحب رستوران بود، اگه null برگشت یعنی ادمین سایت وارد شده
  useEffect(() => {
    const fetchRestaurantId = async () => {
      const res = await adminAxios.get("/restaurant-id");
      setRestaurantId(res.data.restaurantId);
    };
    fetchRestaurantId();
  }, []);
  // لود داده‌های نمودار از API
  useEffect(() => {
    const load = async () => {
      try {
        const url =
          restaurantId != null
            ? `/monthly-sales?restaurantId=${restaurantId}`
            : `/monthly-sales`;

        const { data: json } = await adminAxios.get(url);
        // داده‌ای که API برمی‌گردونه مثل: [{month:1,totalSales:12345}, ...]

        setLabels(json.map((x) => monthFa[x.month - 1]));
        setData(json.map((x) => Number(x.totalSales)));
      } catch (err) {
        console.error("خطا در دریافت داده‌های فروش", err);
      }
    };

    load();
  }, [restaurantId]);

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
        <AdminHeader userName="کاربر ادمین" onHamburger={toggleSidebar} />
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
        {/* fallback / WIP */}
        <section id="fallback-view" className={viewClass("fallback")}>
          <h2 className="content-title">صفحه در حال ساخت</h2>
        </section>
      </main>
    </div>
  );
}
