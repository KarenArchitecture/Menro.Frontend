import React, { useState } from "react";
import NavItem from "./NavItem";

import HomeIcon from "../icons/HomeIcon";
import LocationIcon from "../icons/LocationIcon";
import CartIcon from "../icons/CartIcon";
import ProfileIcon from "../icons/ProfileIcon";

const navItemsData = [
  { name: "Home", text: "خانه", icon: <HomeIcon /> },
  { name: "Location", text: "نقشه", icon: <LocationIcon /> },
  { name: "Cart", text: "سبد خرید", icon: <CartIcon />, badge: 1 },
  { name: "Profile", text: "پروفایل", icon: <ProfileIcon /> },
];

function MobileNav() {
  const [activeItem, setActiveItem] = useState("Home");

  return (
    <nav className="mobile-nav" aria-label="Main navigation">
      <ul className="mobile-nav-list">
        {navItemsData.map((item) => (
          <NavItem
            key={item.name}
            text={item.text}
            icon={item.icon}
            badgeCount={item.badge}
            isActive={activeItem === item.name}
            onClick={() => setActiveItem(item.name)}
          />
        ))}
      </ul>
    </nav>
  );
}

export default MobileNav;
