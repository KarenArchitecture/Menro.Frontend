import React from "react";

/**
 * AppHeader – pill-shaped, reusable site header.
 *
 * Props:
 * - rightLinks: [{label, href, active}]    // “منرو”, “خانه”, “نقشه”, “مقالات”, …
 * - leftIcons:  [{key, icon, badge}]       // profile/search/cart icons, etc.
 * - position: "fixed" | "sticky"           // default: "fixed" (follows scroll)
 * - top: number                            // CSS pixels (default: 12)
 * - maxWidth: number                       // pill max width (default: 1140)
 * - className: string                      // extra classes for the wrapper
 */
export default function AppHeader({
  rightLinks = [
    { label: "منرو", href: "#", active: true },
    { label: "خانه", href: "#" },
    { label: "نقشه", href: "#" },
    { label: "مقالات", href: "#" },
  ],
  leftIcons = [],
  position = "fixed",
  top = 12,
  maxWidth = 1140,
  className = "",
}) {
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
            {rightLinks.map((item, i) => (
              <li key={`${item.label}-${i}`}>
                <a
                  href={item.href}
                  className={`app-header__link${
                    item.active ? " is-active" : ""
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* LEFT: circular icon buttons */}
          <ul className="app-header__left">
            {leftIcons.map((it) => (
              <li key={it.key} className={`icon-wrap ${it.key}`}>
                <button className="icon-btn" type="button" aria-label={it.key}>
                  {it.icon}
                </button>
                {typeof it.badge === "number" && it.badge > 0 && (
                  <span className="badge">{it.badge}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
