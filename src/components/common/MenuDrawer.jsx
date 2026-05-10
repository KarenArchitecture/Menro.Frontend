// src/components/common/MenuDrawer.jsx
import React, {
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

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

  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const lastFocusedElementRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    lastFocusedElementRef.current = document.activeElement;

    const scrollY = window.scrollY;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyLeft = document.body.style.left;
    const previousBodyRight = document.body.style.right;
    const previousBodyWidth = document.body.style.width;

    const appRoot =
      document.getElementById("root") || document.getElementById("app");

    const previousRootInert = appRoot?.inert;

    document.documentElement.style.overflow = "hidden";

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    if (appRoot && "inert" in appRoot) {
      appRoot.inert = true;
    }

    lastFocusedElementRef.current?.blur?.();

    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusableElements = Array.from(
        panel.querySelectorAll(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;

      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.left = previousBodyLeft;
      document.body.style.right = previousBodyRight;
      document.body.style.width = previousBodyWidth;

      if (appRoot && "inert" in appRoot) {
        appRoot.inert = previousRootInert;
      }

      window.removeEventListener("keydown", handleKeyDown);

      window.scrollTo(0, scrollY);

      window.requestAnimationFrame(() => {
        lastFocusedElementRef.current?.focus?.();
      });
    };
  }, [isOpen]);

  const closeDrawer = () => {
    setIsOpen(false);
  };

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
      closeDrawer();
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
        tabIndex={isOpen ? 0 : -1}
        onClick={closeDrawer}
      />

      <aside
        ref={panelRef}
        className="menu-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="منوی منرو"
        dir="rtl"
        tabIndex={-1}
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
                tabIndex={isOpen ? 0 : -1}
                onChange={(event) => setQuery(event.target.value)}
              />
            </form>
          )}

          <button
            ref={closeButtonRef}
            className="menu-drawer__close"
            type="button"
            aria-label="بستن منو"
            tabIndex={isOpen ? 0 : -1}
            onClick={closeDrawer}
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
              tabIndex={isOpen ? 0 : -1}
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
              tabIndex={isOpen ? 0 : -1}
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
              tabIndex={isOpen ? 0 : -1}
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
              tabIndex={isOpen ? 0 : -1}
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
              tabIndex={isOpen ? 0 : -1}
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
