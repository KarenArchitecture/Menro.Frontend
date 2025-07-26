import React from "react";
import SearchBar from "./SearchBar";
import MobileNav from "./MobileNav";

function Header() {
  return (
    <header className="header">
      <MobileNav />
      <SearchBar />
    </header>
  );
}

export default Header;