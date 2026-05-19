import React from "react";

function NavItem({ icon, text, isActive, badgeCount, onClick }) {
  const linkClassName = `nav-item ${isActive ? "active" : ""}`;

  const badgeText =
    typeof badgeCount === "number" && badgeCount > 0
      ? badgeCount.toLocaleString("fa-IR", { useGrouping: false })
      : null;

  return (
    <li className="mobile-nav-list-item">
      <a
        href="#"
        className={linkClassName}
        onClick={(e) => {
          e.preventDefault();
          onClick?.();
        }}
      >
        <span className="mobile-menu-cart">
          {icon}

          {badgeText && (
            <span className="badge">
              <span lang="fa">{badgeText}</span>
            </span>
          )}
        </span>

        <span className="text">{text}</span>
      </a>
    </li>
  );
}

export default NavItem;