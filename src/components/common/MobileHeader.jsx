import MenuDrawer from "./MenuDrawer";
import "../../assets/css/mobile-header.css";

export default function LandingMobileHeader() {
  return (
    <header className="mobile-header">
      <div className="mobile-header__pill">
        <a href="#" className="mobile-header__logo" aria-label="منرو">
          <img src="/images/menro-header-logo.png" alt="منرو" />
        </a>

        <div className="mobile-header__actions">
          <MenuDrawer
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

          <button
            className="mobile-header__icon-btn"
            type="button"
            aria-label="جستجو"
          >
            <img src="/images/app-header-search.svg" alt="" />
          </button>
        </div>
      </div>
    </header>
  );
}
