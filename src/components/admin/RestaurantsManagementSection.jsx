// src/components/admin/RestaurantsManagementSection.jsx
import { useState } from "react";
import RestaurantsOverviewPane from "./RestaurantsOverviewPane";
import RestaurantRequestsPane from "./RestaurantRequestsPane";
import "../../assets/css/admin/admin.css";
import "../../assets/css/admin/restaurantsManagementSection.css";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const TABS = { overview: "overview", requests: "requests" };

export default function RestaurantsManagementSection() {
  useDocumentTitle("مدیریت رستوران‌ها");
  const [activeTab, setActiveTab] = useState(TABS.overview);

  return (
    <div id="restaurant-management-view">
      <div className="view-header">
        <h2 className="content-title">مدیریت رستوران‌ها</h2>
      </div>

      <div className="orders-tabs" style={{ marginBottom: 16 }}>
        <button
          className={`btn ${activeTab === TABS.overview ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab(TABS.overview)}
        >
          لیست رستوران‌ها
        </button>
        <button
          className={`btn ${activeTab === TABS.requests ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab(TABS.requests)}
        >
          درخواست‌های ثبت رستوران
        </button>
      </div>

      {activeTab === TABS.overview && <RestaurantsOverviewPane />}
      {activeTab === TABS.requests && <RestaurantRequestsPane />}
    </div>
  );
}
