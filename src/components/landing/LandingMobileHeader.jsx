import MenuDrawer from "../common/MenuDrawer";

export default function LandingMobileHeader() {
  return (
    <header className="landing-mobile-header">
      <div className="landing-mobile-header__pill">
        <a href="#" className="landing-mobile-header__logo" aria-label="منرو">
          <img src="/images/menro-header-logo.png" alt="منرو" />
        </a>

        <div className="landing-mobile-header__actions">
          <MenuDrawer
            trigger={
              <button
                className="landing-mobile-header__icon-btn"
                type="button"
                aria-label="منو"
              >
                <img src="/images/ham_menu.svg" alt="" />
              </button>
            }
          />

          <button
            className="landing-mobile-header__icon-btn"
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
