// src/components/common/Header.jsx
import React from "react";
import SearchBar from "./SearchBar";
// Delete the MobileNav import
import MenuDrawer from "./MenuDrawer";

function Header({ onSearchSubmit }) {
  return (
    <header className="header">
      {/* REMOVE <MobileNav /> FROM HERE */}

      <div className="header__bar">
        <SearchBar
          className="header__search"
          onSubmit={onSearchSubmit}
        />

        <MenuDrawer
          onSearch={onSearchSubmit}
          trigger={
            <button
              type="button"
              className="header__hamburger"
              aria-label="منو"
            >
              <img src="/images/menu.svg" alt="" />
            </button>
          }
        />
      </div>
    </header>
  );
}

export default Header;
