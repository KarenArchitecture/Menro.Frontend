// src/components/common/Header.jsx
import React, { useState } from "react";
import SearchBar from "./SearchBar";
import MenuDrawer from "./MenuDrawer";

function BackArrowIcon() {
  return (
    <svg
      width="11"
      height="22"
      viewBox="0 0 11 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.1001 20.1L4.48432 16.8767C7.5615 13.9458 9.1001 12.4804 9.1001 10.6C9.1001 8.71956 7.56151 7.25413 4.48432 4.32327L1.1001 1.09997"
        stroke="#FAFAF4"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Header({ onSearchSubmit, isSearchActive = false, onBack }) {
  // متن نوار جستجو اینجا نگه داشته می‌شود تا با زدن «برگشت» پاک شود
  const [searchText, setSearchText] = useState("");

  const handleBack = () => {
    setSearchText("");
    onBack?.();
  };

  // جستجو از داخل منوی کشویی هم متن را در نوار نشان بدهد
  const handleDrawerSearch = (query) => {
    setSearchText(query);
    onSearchSubmit?.(query);
  };

  return (
    <header className={`header ${isSearchActive ? "header--sticky" : ""}`}>
      <div className="header__bar">
        <SearchBar
          className="header__search"
          value={searchText}
          onChange={setSearchText}
          onSubmit={onSearchSubmit}
        />

        {isSearchActive ? (
          <button
            type="button"
            className="header__hamburger"
            aria-label="بازگشت"
            onClick={handleBack}
          >
            <BackArrowIcon />
          </button>
        ) : (
          <MenuDrawer
            onSearch={handleDrawerSearch}
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
        )}
      </div>
    </header>
  );
}

export default Header;