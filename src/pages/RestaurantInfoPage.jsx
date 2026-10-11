// src/pages/RestaurantInfoPage.jsx
// Restaurant info page (opened from the "i" button in ShopBanner).
// STATIC VERSION: all data comes from STATIC_INFO below. In the next step the
// object is replaced by the API response of GET /api/public/restaurant/{slug}/info.
import { useNavigate, useParams } from "react-router-dom";
import "../assets/css/restaurant-info.css";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useImageWithFallback from "../hooks/useImageWithFallback";
import resolveFileUrl from "../utils/resolveFileUrl";
import { toPersianDigits } from "../utils/persianNumbers";
import { useCart } from "../components/shop/CartContext";
import BackIcon from "../components/icons/BackIcon";
import ShoppingBagIcon from "../components/icons/ShoppingBagIcon";
import StarIcon from "../components/icons/StarIcon";
import {
  ClockIcon,
  AddressIcon,
  AboutIcon,
  MapPinIcon,
  InstagramIcon,
  TelegramIcon,
  EitaaIcon,
  WhatsappIcon,
  BaleIcon,
} from "../components/icons/RestaurantInfoIcons";

/* ---------------- static data (temporary) ---------------- */
const STATIC_INFO = {
  name: "منرو",
  averageRating: 4.5,
  votersCount: 6879,
  openTime: "12:00",
  closeTime: "2:00",
  address: "خیابان فاطمی، کوچه 23 نبش بانک ملت",
  description:
    "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری",
  shopBannerImageUrl: null, // -> falls back to the default shop banner
  logoImageUrl: null, // -> empty circle
  mapImageUrl: null, // -> default map art
  socials: {
    instagram: "https://instagram.com/",
    telegram: "https://t.me/",
    eitaa: "https://eitaa.com/",
    whatsapp: "https://wa.me/",
    bale: "https://ble.ir/",
  },
};

// shown when the restaurant has no logo (file lives in public/images/restaurant/)
const LOGO_PLACEHOLDER = "/images/restaurant/logo-placeholder.png";

// order = visual order from right to left (page is RTL)
const SOCIAL_ITEMS = [
  { key: "instagram", label: "اینستاگرام", Icon: InstagramIcon },
  { key: "telegram", label: "تلگرام", Icon: TelegramIcon },
  { key: "eitaa", label: "ایتا", Icon: EitaaIcon },
  { key: "whatsapp", label: "واتساپ", Icon: WhatsappIcon },
  { key: "bale", label: "بله", Icon: BaleIcon },
];

/* ---------------- default map picture (used when there is no map image) ---------------- */
function DefaultMapArt() {
  return (
    <svg
      className="rinfo-map__art"
      viewBox="0 0 340 194"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="340" height="194" fill="#e6e9ec" />
      <g fill="#d9dee2">
        <rect x="8" y="10" width="52" height="34" rx="3" />
        <rect x="76" y="14" width="64" height="28" rx="3" />
        <rect x="158" y="8" width="50" height="40" rx="3" />
        <rect x="226" y="12" width="46" height="30" rx="3" />
        <rect x="290" y="6" width="44" height="38" rx="3" />
        <rect x="10" y="62" width="48" height="36" rx="3" />
        <rect x="80" y="66" width="60" height="30" rx="3" />
        <rect x="232" y="64" width="56" height="34" rx="3" />
        <rect x="14" y="118" width="46" height="30" rx="3" />
        <rect x="84" y="116" width="58" height="34" rx="3" />
        <rect x="160" y="120" width="50" height="28" rx="3" />
        <rect x="236" y="118" width="48" height="36" rx="3" />
      </g>
      <g stroke="#ffffff" strokeLinecap="round" fill="none">
        <path d="M-10 54 L350 54" strokeWidth="7" />
        <path d="M-10 106 L350 106" strokeWidth="9" />
        <path d="M-10 158 L350 158" strokeWidth="6" />
        <path d="M68 -10 L68 204" strokeWidth="6" />
        <path d="M148 -10 L148 204" strokeWidth="8" />
        <path d="M218 -10 L218 204" strokeWidth="6" />
        <path d="M296 -10 L296 204" strokeWidth="7" />
        <path d="M-10 190 L350 120" strokeWidth="5" />
      </g>
    </svg>
  );
}

function RestaurantInfoPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const cart = useCart();

  const info = STATIC_INFO;

  useDocumentTitle(`اطلاعات ${info.name}`);

  const bannerUrl = useImageWithFallback(
    resolveFileUrl(info.shopBannerImageUrl),
    "shop-banner",
  );
  const logoUrl = info.logoImageUrl
    ? resolveFileUrl(info.logoImageUrl)
    : LOGO_PLACEHOLDER;
  const mapImageUrl = info.mapImageUrl
    ? resolveFileUrl(info.mapImageUrl)
    : null;

  const socials = SOCIAL_ITEMS.filter(({ key }) => info.socials?.[key]);

  const hasHours = Boolean(info.openTime && info.closeTime);

  return (
    <div className="rinfo" dir="rtl">
      {/* ---------- hero (banner image + back / cart) ---------- */}
      <header
        className="rinfo-hero"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      >
        <nav className="rinfo-nav">
          <div className="rinfo-nav-box">
            <button
              type="button"
              className="rinfo-icon-btn"
              aria-label="Back"
              onClick={() => navigate(-1)}
            >
              <BackIcon />
            </button>
          </div>

          <div className="rinfo-nav-box">
            <button
              type="button"
              className="rinfo-icon-btn rinfo-cart-btn"
              aria-label="Cart"
              onClick={() => navigate("/checkout")}
            >
              <ShoppingBagIcon />
              {cart.count > 0 && (
                <span className="rinfo-cart-badge">
                  {toPersianDigits(cart.count)}
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      <main className="rinfo-body">
        {/* ---------- name card ---------- */}
        <section className="rinfo-card">
          <span className="rinfo-card__clip" aria-hidden="true" />

          <div className="rinfo-logo">
            <img
              src={logoUrl}
              alt={info.name}
              onError={(e) => {
                // broken logo url -> placeholder (guard prevents an endless loop)
                if (!e.currentTarget.src.endsWith(LOGO_PLACEHOLDER)) {
                  e.currentTarget.src = LOGO_PLACEHOLDER;
                }
              }}
            />
          </div>

          <div className="rinfo-title">
            <h1 className="rinfo-name">{info.name}</h1>

            <div className="rinfo-rating">
              <StarIcon />
              <span className="rinfo-rating__rate">
                {typeof info.averageRating === "number"
                  ? toPersianDigits(info.averageRating.toFixed(1))
                  : toPersianDigits("0.0")}
              </span>
              <span className="rinfo-rating__voters">
                ({toPersianDigits(info.votersCount ?? 0)})
              </span>
            </div>
          </div>

          {hasHours && (
            <div className="rinfo-hours">
              <ClockIcon />
              <span>
                ساعت کار: از ساعت {toPersianDigits(info.openTime)} تا{" "}
                {toPersianDigits(info.closeTime)}
              </span>
            </div>
          )}
        </section>

        {/* ---------- map ---------- */}
        <button
          type="button"
          className="rinfo-map"
          aria-label="نمایش روی نقشه"
          onClick={() => {
            /* TODO (next step): open the Neshan / Balad chooser */
          }}
        >
          {mapImageUrl ? (
            <img className="rinfo-map__img" src={mapImageUrl} alt="" />
          ) : (
            <DefaultMapArt />
          )}

          <MapPinIcon className="rinfo-map__pin" />

          {info.address && (
            <span className="rinfo-map__address">
              <AddressIcon />
              <span className="rinfo-map__address-text">
                آدرس: {info.address}
              </span>
            </span>
          )}
        </button>

        {/* ---------- about ---------- */}
        {info.description && (
          <p className="rinfo-about">
            <AboutIcon className="rinfo-about__icon" />
            درباره {info.name}: {info.description}
          </p>
        )}

        {/* ---------- socials ---------- */}
        {socials.length > 0 && (
          <ul className="rinfo-socials">
            {socials.map(({ key, label, Icon }) => (
              <li key={key} className="rinfo-socials__item">
                <a
                  className="rinfo-socials__link"
                  href={info.socials[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* ---------- bottom bar ---------- */}
      <footer className="rinfo-bar">
        <div className="rinfo-bar__inner">
          <button
            type="button"
            className="rinfo-enter"
            onClick={() => navigate(`/restaurant/${slug}`)}
          >
            ورود به رستوران
          </button>
        </div>
      </footer>
    </div>
  );
}

export default RestaurantInfoPage;