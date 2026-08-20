// src/components/common/MenuDrawer.jsx
import React, { cloneElement, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDrawerState } from "../../context/DrawerStateContext";
import "../../assets/css/menu-drawer.css";

// --- Imported SVGs as Module URLs ---
// These imports will be processed by your build tool (Webpack/Vite)
// and resolve to accessible URLs when the app is built.

// Menu items icons
import heartSvg from "../../assets/icons/drawer-menu/heart.svg";
import smsSvg from "../../assets/icons/drawer-menu/sms-tracking.svg";
import helpSvg from "../../assets/icons/drawer-menu/Circle_Help.svg";
import lampSvg from "../../assets/icons/drawer-menu/lamp-on.svg";

// Setting icons
import themeSvg from "../../assets/icons/drawer-menu/theme.svg";
import notificationSvg from "../../assets/icons/drawer-menu/notification.svg";
import sunSvg from "../../assets/icons/drawer-menu/sun.svg";
import moonSvg from "../../assets/icons/drawer-menu/moon.svg";
import notificationOnSvg from "../../assets/icons/drawer-menu/notification-on.svg";
import notificationOffSvg from "../../assets/icons/drawer-menu/notification-off.svg";
// --- End of Imports ---

// Helper component to render an image from a given src prop
function DrawerIcon({ src, alt = "", className = "" }) {
  return <img className={className} src={src} alt={alt} draggable="false" />;
}

// Settings Row Component
function SettingRow({
  title,
  value,
  iconSrc, // This now expects a URL from the import
  activeIconSrc, // This now expects a URL from the import
  inactiveIconSrc, // This now expects a URL from the import
  isActive,
  onClick,
  ariaPressed,
}) {
  // You can define stroke and strokeWidth here if needed, but since you manually edited SVGs,
  // they should render correctly without these props on the DrawerIcon component.
  // If you need to override them, you'd apply them to DrawerIcon.
  return (
    <button
      className={`menu-drawer__setting ${
        isActive
          ? "menu-drawer__setting--active"
          : "menu-drawer__setting--inactive"
      }`}
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed}
    >
      <span className="menu-drawer__setting-main">
        <span className="menu-drawer__setting-icon">
          <DrawerIcon src={iconSrc} />
        </span>

        <span className="menu-drawer__setting-title">{title}</span>
      </span>

      <span className="menu-drawer__setting-control">
        <span className="menu-drawer__setting-value">
          <span key={value} className="menu-drawer__setting-value-text">
            {value}
          </span>
        </span>

        <span className="menu-drawer__setting-switch" aria-hidden="true">
          <DrawerIcon
            src={activeIconSrc}
            className="menu-drawer__setting-switch-icon menu-drawer__setting-switch-icon--active"
          />

          <DrawerIcon
            src={inactiveIconSrc}
            className="menu-drawer__setting-switch-icon menu-drawer__setting-switch-icon--inactive"
          />
        </span>
      </span>
    </button>
  );
}

// Main MenuDrawer Component
export default function MenuDrawer({
  trigger,
  items = [], // Default to empty array, will be populated by DEFAULT_ITEMS if not provided
  searchPlaceholder = "جستجو رستوران، نوشیدنی، غذا...",
  showSearch = true,
  showSettings = true,
  onSearch,
  onItemClick,
}) {
  const { isDrawerOpen, setDrawerOpen } = useDrawerState();
  const isOpen = isDrawerOpen;
  const [query, setQuery] = useState("");
  const [themeMode, setThemeMode] = useState("dark"); // 'dark' or 'light'
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false); // Used to prevent SSR issues with createPortal

  // Define default items using the imported SVGs
  const DEFAULT_MENU_ITEMS = useMemo(
    () => [
      { label: "علاقه‌مندی ها", href: "/favorites", iconSrc: heartSvg },
      { label: "پشتیبانی", href: "/support", iconSrc: smsSvg },
      { label: "سوالات متداول", href: "#faq", iconSrc: helpSvg },
      { label: "درباره ما", href: "#about", iconSrc: lampSvg },
    ],
    [],
  );

  // Use provided items or default if none are passed
  const menuItems = items.length > 0 ? items : DEFAULT_MENU_ITEMS;

  const isLightMode = themeMode === "light";

  // Effect for managing body overflow and escape key listener
  useEffect(() => {
    setMounted(true); // Mark as mounted for portal
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // Prevent background scrolling

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDrawerOpen(false); // Close drawer on Escape key
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      document.body.style.overflow = previousOverflow; // Restore original overflow
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]); // Rerun effect when isOpen changes

  // Memoize the trigger element to avoid unnecessary re-renders
  const triggerElement = useMemo(() => {
    const openMenu = (event) => {
      // Call the original onClick if provided by the trigger element
      trigger?.props?.onClick?.(event);

      // Only open the drawer if the event was not default-prevented
      if (!event.defaultPrevented) {
        setDrawerOpen(true);
      }
    };

    if (React.isValidElement(trigger)) {
      // If a valid React element is passed as trigger, clone it and add necessary props
      return cloneElement(trigger, {
        onClick: openMenu,
        "aria-haspopup": "dialog", // Accessibility: indicates it's a dialog
        "aria-expanded": isOpen, // Accessibility: indicates if the controlled element is expanded
      });
    }

    // If no trigger element is provided, render a default button
    return (
      <button
        className="menu-drawer__default-trigger"
        type="button"
        aria-label="منو"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={openMenu}
      >
        <svg
          width="37"
          height="38"
          viewBox="0 0 37 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.0416 8.3125C19.403 8.3125 18.8853 8.84416 18.8853 9.5C18.8853 10.1558 19.403 10.6875 20.0416 10.6875L29.2916 10.6875C29.9302 10.6875 30.4478 10.1558 30.4478 9.5C30.4478 8.84416 29.9302 8.3125 29.2916 8.3125H20.0416Z"
            fill="#F0F0F0"
          />
          <path
            d="M7.70825 17.8125C7.06967 17.8125 6.552 18.3442 6.552 19C6.552 19.6558 7.06967 20.1875 7.70825 20.1875H29.2916C29.9302 20.1875 30.4478 19.6558 30.4478 19C30.4478 18.3442 29.9302 17.8125 29.2916 17.8125H7.70825Z"
            fill="#F0F0F0"
          />
          <path
            d="M13.8749 27.3125C13.2363 27.3125 12.7187 27.8442 12.7187 28.5C12.7187 29.1558 13.2363 29.6875 13.8749 29.6875L29.2916 29.6875C29.9302 29.6875 30.4478 29.1558 30.4478 28.5C30.4478 27.8442 29.9302 27.3125 29.2916 27.3125L13.8749 27.3125Z"
            fill="#F0F0F0"
          />
        </svg>
      </button>
    );
  }, [trigger, isOpen]); // Dependencies: trigger element and open state

  // Handler for search form submission
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      onSearch?.(trimmedQuery); // Call the search handler with the query
    }
    setDrawerOpen(false); // Close drawer after search
  };

  // Handler for menu item clicks
  const handleItemClick = (item, event) => {
    onItemClick?.(item, event); // Call the item click handler
    if (!event.defaultPrevented) {
      setDrawerOpen(false); // Close drawer if event was not prevented
    }
  };

  // Toggle function for theme mode
  const toggleThemeMode = () => {
    setThemeMode((current) => (current === "light" ? "dark" : "light"));
  };

  // Toggle function for notifications
  const toggleNotifications = () => {
    setNotificationsEnabled((current) => !current);
  };

  // The actual drawer UI structure
  const drawer = (
    <div className={`menu-drawer ${isOpen ? "menu-drawer--open" : ""}`}>
      <button
        className="menu-drawer__backdrop"
        type="button"
        aria-label="بستن منو"
        tabIndex={isOpen ? 0 : -1} // Only focusable when open
        onClick={() => setDrawerOpen(false)} // Close on backdrop click
      />

      <aside
        className="menu-drawer__panel"
        role="dialog"
        aria-modal="true" // Important for accessibility: this is a modal dialog
        aria-label="منوی منرو"
        dir="rtl" // Set text direction to RTL
      >
        <div className="menu-drawer__top">
          {/* Search Form */}
          {showSearch && (
            <form className="menu-drawer__search" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                value={query}
                placeholder={searchPlaceholder}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="جستجو"
              />
              {/* Search icon - assuming this is a static asset in public */}
              <DrawerIcon src="/images/app-header-search.svg" alt="جستجو" />
            </form>
          )}

          {/* Close Button */}
          <button
            className="menu-drawer__close"
            type="button"
            aria-label="بستن منو"
            onClick={() => setDrawerOpen(false)}
          >
            {/* Close Icon SVG */}
            <svg
              width="19"
              height="19"
              viewBox="0 0 19 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.34998 1.34998L9.34998 9.34998L17.35 1.34998"
                stroke="#F0F0F0" // White-like color
                strokeWidth="2.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.35 17.35L9.34998 9.34998L1.34997 17.35"
                stroke="#F0F0F0" // White-like color
                strokeWidth="2.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Menu Items */}
        <nav className="menu-drawer__nav" aria-label="لینک‌های منو">
          {menuItems.map((item) => (
            <a
              key={`${item.label}-${item.href}`} // Unique key for each item
              className="menu-drawer__item"
              href={item.href}
              onClick={(event) => handleItemClick(item, event)}
            >
              <span className="menu-drawer__item-label">{item.label}</span>
              <span className="menu-drawer__item-icon">
                <DrawerIcon src={item.iconSrc} alt={`${item.label} icon`} />
              </span>
            </a>
          ))}
        </nav>

        {/* Settings Section */}
        {showSettings && (
          <div className="menu-drawer__settings" aria-label="تنظیمات سریع">
            {/* Theme Setting Row */}
            <SettingRow
              title="تم منرو"
              value={isLightMode ? "روشن" : "تاریک"}
              iconSrc={themeSvg} // Imported URL
              activeIconSrc={sunSvg} // Imported URL
              inactiveIconSrc={moonSvg} // Imported URL
              isActive={isLightMode}
              onClick={toggleThemeMode}
              ariaPressed={isLightMode}
            />

            {/* Notifications Setting Row */}
            <SettingRow
              title="اعلانات"
              value={notificationsEnabled ? "فعال" : "غیرفعال"}
              iconSrc={notificationSvg} // Imported URL
              activeIconSrc={notificationOnSvg} // Imported URL
              inactiveIconSrc={notificationOffSvg} // Imported URL
              isActive={notificationsEnabled}
              onClick={toggleNotifications}
              ariaPressed={notificationsEnabled}
            />
          </div>
        )}
      </aside>
    </div>
  );

  // Render the trigger and the drawer portal
  return (
    <>
      {triggerElement}
      {/* Use createPortal to render the drawer outside of its parent's DOM hierarchy */}
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
