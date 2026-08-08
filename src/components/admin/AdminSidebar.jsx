// src/components/admin/AdminSidebar.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../Context/AuthContext";
import { useGlobalUI } from "../common/GlobalUI";
import { getAdminComments } from "../../api/adminComments";
import { toPersianDigits } from "../../utils/persianFormat";

const DASHBOARD_ITEM = {
  key: "dashboard",
  label: "داشبورد",
  icon: "fas fa-tachometer-alt",
};

const NAV_GROUPS = [
  {
    key: "restaurant-mgmt",
    label: "مدیریت رستوران",
    items: [
      { key: "menu", label: "مدیریت منو", icon: "fas fa-utensils" },
      {
        key: "categories",
        label: "دسته‌بندی‌های رستوران",
        icon: "fas fa-tags",
      },
      { key: "comments", label: "مدیریت نظرات", icon: "fas fa-comments" },
      {
        key: "combos",
        label: "ترکیب‌های پیشنهادی",
        icon: "fas fa-layer-group",
      },
    ],
  },
  {
    key: "business",
    label: "کسب و کار",
    items: [
      { key: "orders", label: "مدیریت سفارش‌ها", icon: "fas fa-receipt" },
      { key: "financial", label: "مالی", icon: "fas fa-file-invoice-dollar" },
      { key: "ads", label: "رزرو تبلیغات", icon: "fas fa-bullhorn" },
    ],
  },
  {
    key: "platform-admin",
    label: "مدیریت پلتفرم",
    roles: ["Admin"],
    items: [
      {
        key: "user-roles",
        label: "مدیریت کاربران",
        icon: "fas fa-person",
      },
      {
        key: "restaurants",
        label: "مدیریت رستوران‌ها",
        icon: "fas fa-utensils",
      },
      {
        key: "category-settings",
        label: "دسته‌بندی‌های عمومی",
        icon: "fas fa-tags",
      },
      {
        key: "restaurant-category-settings",
        label: "دسته‌بندی انواع رستوران",
        icon: "fas fa-concierge-bell",
      },
    ],
  },
  {
    key: "content-ads-admin",
    label: "تبلیغات و محتوا",
    roles: ["Admin"],
    items: [
      {
        key: "ads-settings",
        label: "تنظیمات تبلیغات",
        icon: "fas fa-sliders-h",
      },
      {
        key: "ads-requests",
        label: "درخواست‌های تبلیغات",
        icon: "fas fa-clipboard-check",
      },
      { key: "blog", label: "مدیریت بلاگ", icon: "fas fa-blog" },
      { key: "landing", label: "مدیریت صفحه اصلی", icon: "fas fa-home" },
    ],
  },
  {
    key: "account",
    label: "حساب کاربری",
    items: [
      { key: "profile", label: "پروفایل کاربری", icon: "fas fa-user-circle" },
      {
        key: "restaurant-profile",
        label: "پروفایل رستوران",
        icon: "fas fa-store",
      },
      {
        key: "logout",
        label: "خروج از حساب",
        icon: "fas fa-sign-out-alt",
        isLogout: true,
      },
    ],
  },
];

export default function AdminSidebar({
  isOpen = false,
  onClose = () => {},
  activeTab,
  onSelect,
  hasNewRequest = false,
}) {
  const navigate = useNavigate();
  const { confirmModal } = useGlobalUI();
  const { user, logout } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes("admin");
  const [openGroups, setOpenGroups] = useState(
    () => new Set(NAV_GROUPS.map((g) => g.key)),
  );

  useEffect(() => {
    const owningGroup = NAV_GROUPS.find((g) =>
      g.items.some((i) => i.key === activeTab),
    );
    if (!owningGroup) return;
    setOpenGroups((prev) => {
      if (prev.has(owningGroup.key)) return prev;
      const next = new Set(prev);
      next.add(owningGroup.key);
      return next;
    });
  }, [activeTab]);

  const toggleGroup = (key) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSelect = (key) => {
    onSelect?.(key);
    onClose?.();
  };

  const handleLogout = async () => {
    const ok = await confirmModal({
      title: "خروج از حساب",
      message: "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟",
      confirmText: "خروج",
      cancelText: "انصراف",
      danger: true,
    });
    if (!ok) return;

    logout();
    navigate("/", { replace: false });
  };

  const renderItem = (item) => {
    if (item.isLogout) {
      return (
        <li key={item.key} className="nav-item">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            <i className={`nav-icon ${item.icon}`} />
            <span>{item.label}</span>
          </Link>
        </li>
      );
    }

    return (
      <li
        key={item.key}
        className={`nav-item ${activeTab === item.key ? "active" : ""}`}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleSelect(item.key);
          }}
        >
          <i className={`nav-icon ${item.icon}`} />

          <span>{item.label}</span>

          {item.key === "music" && hasNewRequest && (
            <span
              style={{
                background: "red",
                color: "white",
                marginRight: "8px",
                padding: "2px 6px",
                borderRadius: "6px",
              }}
            >
              NEW
            </span>
          )}
        </a>
      </li>
    );
  };

  return (
    <aside
      className={`sidebar ${isOpen ? "is-open" : ""}`}
      aria-hidden={isOpen ? "false" : "true"}
    >
      <div className="sidebar-header">
        <h1
          className="sidebar-logo"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          منرو
        </h1>
        <button
          type="button"
          className="sidebar-close"
          aria-label="بستن منو"
          onClick={onClose}
        >
          <i className="fas fa-times" />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="admin-sidebar__top-level">
          {renderItem(DASHBOARD_ITEM)}
        </ul>

        {NAV_GROUPS.map((group) => {
          if (group.roles && !isAdmin) return null;

          const isGroupOpen = openGroups.has(group.key);

          return (
            <div key={group.key} className="admin-sidebar__group">
              <button
                type="button"
                className={`nav-section-title admin-sidebar__group-toggle ${
                  isGroupOpen ? "open" : ""
                }`}
                onClick={() => toggleGroup(group.key)}
                aria-expanded={isGroupOpen}
              >
                <span>{group.label}</span>
                <i className="fas fa-chevron-down admin-sidebar__group-chevron" />
              </button>

              <div
                className={`admin-sidebar__group-collapse ${isGroupOpen ? "open" : ""}`}
              >
                <div className="admin-sidebar__group-collapse-inner">
                  <ul>{group.items.map(renderItem)}</ul>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}