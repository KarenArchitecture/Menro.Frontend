import React from "react";
import SearchBar from "./SearchBar";
import MobileNav from "./MobileNav";

function Header() {
  return (
    <header className="header">
      <MobileNav />
      <div className="header__bar">
        <SearchBar className="header__search" />
        <button
          type="button"
          className="header__hamburger"
          aria-label="menu"
          onClick={() => console.log("hamburger clicked")}
        >
          <img src="/images/menu.svg" alt="hamburger menu" />
        </button>
      </div>
    </header>
  );
}

export default Header;
