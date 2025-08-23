// src/components/admin/AdminHeader.jsx
import React, { useEffect, useRef, useState } from "react";
import SearchBar from "../common/SearchBar";

export default function AdminHeader({ userName, restaurantName, onHamburger }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const inputRef = useRef(null);

  // Focus the input when the overlay opens; ESC to close
  useEffect(() => {
    if (mobileSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
    const onKey = (e) => e.key === "Escape" && setMobileSearchOpen(false);
    if (mobileSearchOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSearchOpen]);

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    const q = inputRef.current?.value?.trim();
    if (q) console.log("Searching for:", q);
    setMobileSearchOpen(false);
  };

  return (
    <header className="main-header">
      {/* Right side (RTL): hamburger */}
      <button
        className="admin-hamburger"
        onClick={onHamburger}
        aria-label="باز کردن منو"
      >
        <i className="fas fa-bars" />
      </button>

      {/* Desktop / tablet search (hidden on phones) */}
      <div className="search-bar-wrap">
        <SearchBar placeholder="جستجو..." />
      </div>

      {/* User info (greeting + restaurant + avatar) */}
      <div className="user-info">
        <div className="user-greeting">
          <span>خوش آمدید، {userName}</span>
          <span className="restaurant-name">{restaurantName}</span>
        </div>
        <img
          src="https://via.placeholder.com/40"
          alt="آواتار کاربر"
          className="user-avatar"
        />
        {/* Mobile search icon (shows only on phones) */}
        <button
          className="admin-search-icon"
          aria-label="جستجو"
          onClick={() => setMobileSearchOpen(true)}
        >
          <i className="fas fa-search" />
        </button>
      </div>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true">
          <div
            className="search-overlay-backdrop"
            onClick={() => setMobileSearchOpen(false)}
          />
          <form
            className="search-overlay-bar"
            onSubmit={handleMobileSearchSubmit}
          >
            <button
              type="button"
              className="search-overlay-close"
              aria-label="بستن"
              onClick={() => setMobileSearchOpen(false)}
            >
              <i className="fas fa-times" />
            </button>

            <input
              ref={inputRef}
              type="text"
              placeholder="جستجو..."
              className="search-overlay-input"
              dir="rtl"
            />

            <button
              type="submit"
              className="search-overlay-submit"
              aria-label="جستجو"
            >
              <i className="fas fa-search" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
