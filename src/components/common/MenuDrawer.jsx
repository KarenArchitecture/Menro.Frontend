// src/components/common/MenuDrawer.jsx
import React, { cloneElement, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "../../assets/css/menu-drawer.css";

const DRAWER_ICON_PATH = "/images/drawer-menu";

const DEFAULT_ITEMS = [
  {
    label: "علاقه‌مندی ها",
    href: "/favorites",
    iconSrc: `${DRAWER_ICON_PATH}/heart.svg`,
  },
  {
    label: "پشتیبانی",
    href: "/support",
    iconSrc: `${DRAWER_ICON_PATH}/sms-tracking.svg`,
  },
  {
    label: "سوالات متداول",
    href: "#faq",
    iconSrc: `${DRAWER_ICON_PATH}/Circle_Help.svg`,
  },
  {
    label: "درباره ما",
    href: "#about",
    iconSrc: `${DRAWER_ICON_PATH}/lamp-on.svg`,
  },
];

function DrawerIcon({ src, alt = "" }) {
  return <img src={src} alt={alt} draggable="false" />;
}

export default function MenuDrawer({
  trigger,
  items = DEFAULT_ITEMS,
  searchPlaceholder = "جستجو رستوران، نوشیدنی، غذا...",
  showSearch = true,
  showSettings = true,
  onSearch,
  onItemClick,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [themeMode, setThemeMode] = useState("dark");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const triggerElement = useMemo(() => {
    const openMenu = (event) => {
      trigger?.props?.onClick?.(event);

      if (!event.defaultPrevented) {
        setIsOpen(true);
      }
    };

    if (React.isValidElement(trigger)) {
      return cloneElement(trigger, {
        onClick: openMenu,
        "aria-haspopup": "dialog",
        "aria-expanded": isOpen,
      });
    }

    return (
      <button
        className="menu-drawer__default-trigger"
        type="button"
        aria-label="منو"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={openMenu}
      >
        منو
      </button>
    );
  }, [trigger, isOpen]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearch?.(query.trim());
  };

  const handleItemClick = (item, event) => {
    onItemClick?.(item, event);

    if (!event.defaultPrevented) {
      setIsOpen(false);
    }
  };

  const drawer = (
    <div
      className={`menu-drawer ${isOpen ? "menu-drawer--open" : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        className="menu-drawer__backdrop"
        type="button"
        aria-label="بستن منو"
        onClick={() => setIsOpen(false)}
      />

      <aside
        className="menu-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="منوی منرو"
        dir="rtl"
      >
        <div className="menu-drawer__top">
          {showSearch && (
            <form className="menu-drawer__search" onSubmit={handleSearchSubmit}>
              <img
                src="/images/app-header-search.svg"
                alt=""
                draggable="false"
              />

              <input
                type="search"
                value={query}
                placeholder={searchPlaceholder}
                onChange={(event) => setQuery(event.target.value)}
              />
            </form>
          )}

          <button
            className="menu-drawer__close"
            type="button"
            aria-label="بستن منو"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className="menu-drawer__nav" aria-label="لینک‌های منو">
          {items.map((item) => (
            <a
              key={`${item.label}-${item.href}`}
              className="menu-drawer__item"
              href={item.href}
              onClick={(event) => handleItemClick(item, event)}
            >
              <span className="menu-drawer__item-icon">
                <DrawerIcon src={item.iconSrc} />
              </span>

              <span className="menu-drawer__item-label">{item.label}</span>
            </a>
          ))}
        </nav>

        {showSettings && (
          <div className="menu-drawer__settings" aria-label="تنظیمات سریع">
            <button
              className={`menu-drawer__setting ${
                themeMode === "light" ? "menu-drawer__setting--active" : ""
              }`}
              type="button"
              onClick={() => setThemeMode("light")}
            >
              <span className="menu-drawer__setting-switch" />
              <span className="menu-drawer__setting-value">روشن</span>
              <span className="menu-drawer__setting-title">تم منرو</span>
              <span className="menu-drawer__setting-icon">
                <DrawerIcon src={`${DRAWER_ICON_PATH}/moon.svg`} />
              </span>
            </button>

            <button
              className={`menu-drawer__setting ${
                themeMode === "dark" ? "menu-drawer__setting--active" : ""
              }`}
              type="button"
              onClick={() => setThemeMode("dark")}
            >
              <span className="menu-drawer__setting-switch" />
              <span className="menu-drawer__setting-value">تاریک</span>
              <span className="menu-drawer__setting-title">تم منرو</span>
              <span className="menu-drawer__setting-icon">
                <DrawerIcon src={`${DRAWER_ICON_PATH}/moon.svg`} />
              </span>
            </button>

            <button
              className={`menu-drawer__setting ${
                notificationsEnabled ? "menu-drawer__setting--active" : ""
              }`}
              type="button"
              onClick={() => setNotificationsEnabled(true)}
            >
              <span className="menu-drawer__setting-switch" />
              <span className="menu-drawer__setting-value">فعال</span>
              <span className="menu-drawer__setting-title">اعلانات</span>
              <span className="menu-drawer__setting-icon">
                <DrawerIcon src={`${DRAWER_ICON_PATH}/notification.svg`} />
              </span>
            </button>

            <button
              className={`menu-drawer__setting ${
                !notificationsEnabled ? "menu-drawer__setting--active" : ""
              }`}
              type="button"
              onClick={() => setNotificationsEnabled(false)}
            >
              <span className="menu-drawer__setting-switch" />
              <span className="menu-drawer__setting-value">غیرفعال</span>
              <span className="menu-drawer__setting-title">اعلانات</span>
              <span className="menu-drawer__setting-icon">
                <DrawerIcon src={`${DRAWER_ICON_PATH}/notification.svg`} />
              </span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );

  return (
    <>
      {triggerElement}
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
