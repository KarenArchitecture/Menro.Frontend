// src/components/admin/AdminSidebar.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../Context/AuthContext";
import { getAdminComments } from "../../api/adminComments";
import { useToast } from "../../context/ToastContext";
import { toPersianDigits } from "../../utils/persianFormat";

const NAV = [
  { key: "dashboard", label: "داشبورد", icon: "fas fa-tachometer-alt" },

  { isDivider: true, label: "مدیریت رستوران" },
  { key: "products", label: "مدیریت محصولات", icon: "fas fa-utensils" },
  { key: "categories", label: "دسته‌بندی‌های رستوران", icon: "fas fa-tags" },
  { key: "comments", label: "مدیریت نظرات", icon: "fas fa-comments" },

  { isDivider: true, label: "کسب و کار" },
  { key: "orders", label: "مدیریت سفارش‌ها", icon: "fas fa-receipt" },
  { key: "ads", label: "رزرو تبلیغات", icon: "fas fa-bullhorn" },

  { isDivider: true, label: "مدیریت منرو", roles: ["Admin"] },
  { key: "restaurants", label: "مدیریت رستوران‌ها", icon: "fas fa-utensils" },
  { key: "category-settings", label: "دسته‌بندی‌های عمومی", icon: "fas fa-tags", roles: ["Admin"] },
  { key: "ads-settings", label: "تنظیمات تبلیغات", icon: "fas fa-sliders-h" },
  { key: "ads-requests", label: "درخواست‌های تبلیغات", icon: "fas fa-clipboard-check" },

  { isDivider: true, label: "حساب کاربری" },
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
  const { showToast } = useToast();

  const { data: pendingComments = [] } = useQuery({
    queryKey: ["admin-comments", "pending"],
    queryFn: () => getAdminComments("pending"),
    refetchInterval: 30000, // poll every 30s so the badge stays fresh
    refetchOnWindowFocus: true,
  });
  const pendingCount = pendingComments.length;

  // Fire a toast only when the count goes UP (a genuinely new comment arrived),
  // not on first load and not when it drops after the admin replies.
  const prevCountRef = useRef(null);
  useEffect(() => {
    if (prevCountRef.current !== null && pendingCount > prevCountRef.current) {
      showToast({
        type: "success",
        message: "نظر جدیدی برای بررسی ثبت شد.",
      });
    }
    prevCountRef.current = pendingCount;
  }, [pendingCount, showToast]);

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

  const { user, logout } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes("admin");

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
            if (item.roles && !isAdmin) return null;

            if (item.isDivider) {
              return (
                <li key={item.label} className="nav-section-title">
                  {item.label}
                </li>
              );
            }

            const showBadge = item.key === "comments" && pendingCount > 0;

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
                  {item.label}

                  {showBadge && (
                    <span
                      className="nav-badge"
                      aria-label={`${pendingCount} نظر در انتظار`}
                    >
                      {toPersianDigits(pendingCount)}
                    </span>
                  )}
                </a>
              </li>
            );
          })}

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