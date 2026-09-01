import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getHeaderMenu } from "../../api/SiteLink";
import "../../assets/css/app-header-styles.css";

/** آیتم برند/لوگو همیشه ثابت است و از بک‌اند نمی‌آید. */
const BRAND_LINK = {
  id: "brand",
  label: (
    <img
      src="/images/menro-header-logo.png"
      alt="منرو"
      className="brand-logo"
    />
  ),
  href: "/",
  active: true,
};

/** فال‌بک برای زمانی که API در دسترس نیست یا هنوز چیزی برایش تعریف نشده. */
const DEFAULT_LINKS = [
  BRAND_LINK,
  { id: "webapp", label: "وب‌اپ", href: "/home" },
  { id: "blog", label: "بلاگ", href: "/blog" },
  { id: "subscriptions", label: "اشتراک‌ها", href: "/subscriptions" },
];

/**
 * AppHeader – pill-shaped, reusable site header.
 *
 * Props:
 * - rightLinks: [{label, href, active}]    // اگر پاس داده شود، دیگر از API چیزی گرفته نمی‌شود (override دستی)
 * - leftIcons:  [{key, icon, badge}]       // profile/search/cart icons, etc.
 * - position: "fixed" | "sticky"           // default: "fixed" (follows scroll)
 * - top: number                            // CSS pixels (default: 12)
 * - maxWidth: number                       // pill max width (default: 1140)
 * - className: string                      // extra classes for the wrapper
 */
export default function AppHeader({
  rightLinks,
  leftIcons = [],
  position = "fixed",
  top = 12,
  maxWidth = 1140,
  className = "",
}) {
  const [links, setLinks] = useState(rightLinks ?? DEFAULT_LINKS);

  useEffect(() => {
    // اگر رابط والد رو منوی سفارشی داده، همان اولویت دارد و دیگر فچ نمی‌کنیم.
    if (rightLinks) {
      setLinks(rightLinks);
      return undefined;
    }

    let isMounted = true;

    async function fetchMenu() {
      try {
        const items = await getHeaderMenu();

        if (!isMounted) return;

        if (items.length === 0) {
          setLinks(DEFAULT_LINKS);
          return;
        }

        const mapped = items
          .filter((item) => item.isActive)
          .map((item) => ({
            id: item.id,
            label: item.title,
            href: item.url,
            children: (item.children ?? [])
              .filter((child) => child.isActive)
              .map((child) => ({
                id: child.id,
                label: child.title,
                href: child.url,
              })),
          }));

        setLinks([BRAND_LINK, ...mapped]);
      } catch (error) {
        console.error("خطا در دریافت منوی هدر:", error);
        if (isMounted) setLinks(DEFAULT_LINKS);
      }
    }

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, [rightLinks]);

  return (
    <header
      className={`app-header ${className}`}
      style={{
        position,
        top,
      }}
    >
      <div
        className="app-header__pill"
        style={{ maxWidth }}
        role="navigation"
        aria-label="Main"
      >
        <div className="app-header__nav">
          {/* RIGHT: Brand + links (RTL order) */}
          <ul className="app-header__right">
            {links.map((item, i) => {
              const hasChildren = item.children && item.children.length > 0;
              return (
                <li
                  key={item.id ?? `${i}`}
                  className={`app-header__item${hasChildren ? " has-dropdown" : ""}`}
                >
                  <a
                    href={item.href}
                    className={`app-header__link${
                      item.active ? " is-active" : ""
                    }`}
                  >
                    {item.label}
                  </a>
                  {hasChildren && (
                    <ul className="app-header__dropdown">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <a
                            href={child.href}
                            className="app-header__dropdown-link"
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {/* LEFT: circular icon buttons */}
          <ul className="app-header__left">
            {leftIcons.map((it) => {
              const button = (
                <button className="icon-btn" type="button" aria-label={it.key}>
                  {it.icon}
                </button>
              );

              return (
                <li key={it.key} className={`icon-wrap ${it.key}`}>
                  {it.key === "profile" ? (
                    <Link to="/login" className="icon-btn-link">
                      {button}
                    </Link>
                  ) : (
                    button
                  )}
                  {typeof it.badge === "number" && it.badge > 0 && (
                    <span className="badge">{it.badge}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </header>
  );
}
