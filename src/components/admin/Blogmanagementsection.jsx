import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import PostsPane from "./BlogManagementSection/PostsPane";
import DisplayCategoriesPane from "./BlogManagementSection/DisplayCategoriesPane";
import SidebarTagsPane from "./BlogManagementSection/SidebarTagsPane";
import HeroPane from "./BlogManagementSection/HeroPane";
import "../../assets/css/admin/admin.css";
import "../../assets/css/admin/admin-modal.css";
import "../../assets/css/admin/blogManagementSection.css";

// "فیلترهای فید" tab intentionally removed - feed categories are now a fixed,
// non-editable list (see FEED_CATEGORIES in adminBlogs.js).
const SUB_TABS = [
  { key: "posts", label: "پست‌های وبلاگ", icon: "fas fa-newspaper" },
  {
    key: "display-categories",
    label: "دسته‌بندی‌های نمایشی",
    icon: "fas fa-th-large",
  },
  { key: "sidebar-tags", label: "برچسب‌های پیشنهادی", icon: "fas fa-hashtag" },
  { key: "hero", label: "هیرو و جستجو", icon: "fas fa-image" },
];

export default function BlogManagementSection() {
  useDocumentTitle("مدیریت بلاگ");
  const { user } = useAuth();
  const isEditorUp = (user?.roles || []).some((r) =>
    ["admin", "editor"].includes(r.toLowerCase()),
  );
  const visibleTabs = isEditorUp
    ? SUB_TABS
    : SUB_TABS.filter((t) => t.key !== "hero");
  const [activeSubTab, setActiveSubTab] = useState("posts");

  return (
    <div id="blog-management-view" className="blog-mgmt">
      <div className="view-header">
        <h2 className="content-title">مدیریت وبلاگ</h2>
      </div>

      <nav className="content-tab-nav">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`content-tab-link ${activeSubTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveSubTab(tab.key)}
          >
            <i className={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {activeSubTab === "posts" && (
        <div className="content-tab-pane active">
          <PostsPane />
        </div>
      )}

      {activeSubTab === "display-categories" && (
        <div className="content-tab-pane active">
          <DisplayCategoriesPane />
        </div>
      )}

      {activeSubTab === "sidebar-tags" && (
        <div className="content-tab-pane active">
          <SidebarTagsPane />
        </div>
      )}

      {activeSubTab === "hero" && (
        <div className="content-tab-pane active">
          <HeroPane />
        </div>
      )}
    </div>
  );
}
