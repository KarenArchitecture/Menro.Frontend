// src/components/admin/AdminSidebar.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const NAV = [
  { key: "dashboard", label: "داشبورد", icon: "fas fa-tachometer-alt" },

  { isDivider: true, label: "مدیریت رستوران" },
  { key: "products", label: "مدیریت محصولات", icon: "fas fa-utensils" },
  { key: "categories", label: "دسته‌بندی‌های رستوران", icon: "fas fa-tags" },
  { key: "music", label: "مدیریت موسیقی", icon: "fas fa-music" },

  { isDivider: true, label: "کسب و کار" },
  { key: "orders", label: "مدیریت سفارش‌ها", icon: "fas fa-receipt" },
  { key: "financial", label: "مالی", icon: "fas fa-file-invoice-dollar" },
  { key: "ads", label: "رزرو تبلیغات", icon: "fas fa-bullhorn" },

  // Ads Settings (per-restaurant config)
  {
    key: "ads-settings",
    label: "تنظیمات تبلیغات",
    icon: "fas fa-sliders-h",
  },

  // ✅ فقط برای Admin (منرو)
  { isDivider: true, label: "مدیریت منرو", roles: ["Admin"] },
  {
    key: "category-settings",
    label: "دسته‌بندی‌های عمومی",
    icon: "fas fa-tags",
    roles: ["Admin"],
  },
  {
    key: "restaurants",
    label: "مدیریت رستوران‌ها",
    icon: "fas fa-utensils",
    // roles: ["Admin"],
  },
  {
    key: "ads-requests",
    label: "درخواست‌های تبلیغات",
    icon: "fas fa-clipboard-check",
    // roles: ["Admin"],
  },

  { isDivider: true, label: "حساب کاربری" },
  { key: "theme", label: "مدیریت قالب", icon: "fas fa-palette" },
  { key: "profile", label: "پروفایل کاربری", icon: "fas fa-user-circle" },
  { key: "restaurant-profile", label: "پروفایل رستوران", icon: "fas fa-store" },
];

export default function AdminSidebar({
  isOpen = false,
  onClose = () => {},
  activeTab,
  onSelect,
}) {
  const navigate = useNavigate();

  // Close on ESC (useful when off-canvas is open on mobile)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSelect = (key) => {
    onSelect?.(key);
    onClose?.(); // auto-close on mobile
  };

  // admin role check
  const { user, logout } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes("admin");

  // logout handler
  const handleLogout = async () => {
    logout();
    navigate("/", { replace: false });
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
        {/* Close button shows on MD/SM only (CSS controls visibility) */}
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
        <ul>
          {NAV.map((item) => {
            // اگر نقش تعریف شده و نقش کاربر جزوش نیست → مخفی
            if (item.roles && !isAdmin) return null;

            return item.isDivider ? (
              <li key={item.label} className="nav-section-title">
                {item.label}
              </li>
            ) : (
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
                  <i className={`nav-icon ${item.icon}`} /> {item.label}
                </a>
              </li>
            );
          })}

          {/* Static logout link */}
          <li className="nav-item">
            <Link to="/" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt nav-icon" /> خروج از حساب
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
