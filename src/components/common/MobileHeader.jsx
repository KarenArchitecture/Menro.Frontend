import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuDrawer from "./MenuDrawer";
import SearchBar from "./SearchBar";
import "../../assets/css/mobile-header.css";

export default function LandingMobileHeader() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchPanelRef = useRef(null);

  // same behavior as the Home search: run the search on /home
  const runSearch = (term) => {
    if (!term) return;
    setSearchOpen(false);
    navigate(`/home?q=${encodeURIComponent(term)}`);
  };

  // focus the input on open; close on Escape or when tapping outside the panel
  useEffect(() => {
    if (!searchOpen) return undefined;

    searchPanelRef.current?.querySelector("input")?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    const onPointerDown = (event) => {
      if (!searchPanelRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [searchOpen]);

  return (
    <header className="mobile-header">
      <div className="mobile-header__pill">
        <a href="#" className="mobile-header__logo" aria-label="منرو">
          <img src="/images/menro-header-logo.png" alt="منرو" />
        </a>

        <div className="mobile-header__actions">
          <MenuDrawer
            onSearch={runSearch}
            trigger={
              <button
                className="mobile-header__icon-btn"
                type="button"
                aria-label="منو"
              >
                <img src="/images/ham_menu.svg" alt="" />
              </button>
            }
          />

          {/* hidden while the search panel is open, back when it closes */}
          {!searchOpen && (
            <button
              className="mobile-header__icon-btn"
              type="button"
              aria-label="جستجو"
              onClick={() => setSearchOpen(true)}
            >
              <img src="/images/app-header-search.svg" alt="" />
            </button>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="mobile-header__search" ref={searchPanelRef}>
          <SearchBar
            placeholder="جستجوی رستوران، نوشیدنی، غذا ..."
            onSubmit={runSearch}
          />
        </div>
      )}
    </header>
  );
}