import React from "react";

function NavItem({ icon, text, isActive, badgeCount, onClick }) {
  const linkClassName = `nav-item ${isActive ? "active" : ""}`;

  return (
    <li>
      <a href="#" className={linkClassName} onClick={onClick}>
        <span className="mobile-menu-cart">
          {icon}
          {badgeCount > 0 && (
            <span className="badge">
              <span>{badgeCount}</span>
            </span>
          )}
        </span>
        <span className="text">{text}</span>
      </a>
    </li>
  );
}

export default NavItem;
