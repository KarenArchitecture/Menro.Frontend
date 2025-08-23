import React, { useEffect, useState, useCallback } from "react";
import usePageStyles from "../hooks/usePageStyles";
import adminAxios from "../api/adminDashboardAxios";
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

export default function AdminDashboardPage() {
  // اطلاعات ادمین (نام کامل ادمین به همراه نام رستوران)
  const [adminDetails, setAdminDetails] = useState({
    UserFullName: "",
    RestaurantName: "",
  });

  const cssReady = usePageStyles("/admin-dashboard.css");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [restaurantId, setRestaurantId] = useState(null);

  // داده‌های StatCard
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [newOrders, setNewOrders] = useState(0);

  // داده‌های نمودار فروش
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);

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

  // --- گرفتن آیدی رستوران ---
  useEffect(() => {
    const fetchRestaurantId = async () => {
      try {
        const res = await adminAxios.get("/restaurant-id");
        setRestaurantId(res.data.restaurantId);
      } catch (err) {
        console.error("خطا در دریافت آیدی رستوران", err);
      }
    };
    fetchRestaurantId();
  }, []);
  // --- گرفتن دیتای ادمین ---
  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const { data } = await adminAxios.get("/admin-details");
        setAdminDetails(data);
      } catch (err) {
        console.error("خطا در دریافت جزئیات ادمین", err);
      }
    };

    fetchAdminDetails();
  }, []);

  // --- لود TotalRevenue و NewOrders ---
  useEffect(() => {
    const loadStats = async () => {
      try {
        const revenueUrl =
          restaurantId != null
            ? `/total-revenue?restaurantId=${restaurantId}`
            : `/total-revenue`;

        const ordersUrl =
          restaurantId != null
            ? `/new-orders?restaurantId=${restaurantId}`
            : `/new-orders`;

        const [revRes, orderRes] = await Promise.all([
          adminAxios.get(revenueUrl),
          adminAxios.get(ordersUrl),
        ]);

        setTotalRevenue(revRes.data);
        setNewOrders(orderRes.data);
      } catch (err) {
        console.error("خطا در دریافت آمار", err);
      }
    };

    loadStats();
  }, [restaurantId]);

  // --- لود داده‌های نمودار ---
  useEffect(() => {
    const loadChart = async () => {
      try {
        const url =
          restaurantId != null
            ? `/monthly-sales?restaurantId=${restaurantId}`
            : `/monthly-sales`;

        const { data: json } = await adminAxios.get(url);

        setLabels(json.map((x) => monthFa[x.month - 1]));
        setData(json.map((x) => Number(x.totalSales)));
      } catch (err) {
        console.error("خطا در دریافت داده‌های فروش", err);
      }
    };

    loadChart();
  }, [restaurantId]);

  if (!cssReady) return null;

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
        <AdminHeader
          userName={adminDetails.UserFullName}
          restaurantName={adminDetails.RestaurantName}
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
              value={totalRevenue.toLocaleString("fa-IR") + " تومان"}
            />
            <StatCard
              iconClass="fas fa-receipt"
              color="#10b981"
              title="سفارشات جدید"
              value={newOrders.toLocaleString("fa-IR")}
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

        {/* دیگر تب‌ها */}
        <section id="products-view" className={viewClass("products")}>
          <ProductsSection />
        </section>
        <section id="categories-view" className={viewClass("categories")}>
          <h2 className="content-title">مدیریت دسته‌بندی‌ها</h2>
          <CategoriesSection />
        </section>
        <section id="theme-view" className={viewClass("theme")}>
          <h2 className="content-title">مدیریت قالب رستوران</h2>
          <ThemeSection />
        </section>
        <section id="music-view" className={viewClass("music")}>
          <h2 className="content-title">مدیریت موزیک پلیر</h2>
          <MusicSection />
        </section>
        <section id="financial-view" className={viewClass("financial")}>
          <h2 className="content-title">اطلاعات مالی</h2>
          <FinancialSection />
        </section>
        <section id="ads-view" className={viewClass("ads")}>
          <h2 className="content-title">رزرو تبلیغ</h2>
          <AdsBookingSection />
        </section>
        <section id="profile-view" className={viewClass("profile")}>
          <h2 className="content-title">ویرایش پروفایل کاربری</h2>
          <ProfileSection />
        </section>
        <section id="fallback-view" className={viewClass("fallback")}>
          <h2 className="content-title">صفحه در حال ساخت</h2>
        </section>
      </main>
    </div>
  );
}
