import React, { useEffect, useState } from "react";
import RubicaIcon from "../icons/RubicaIcon";
import TelegramIcon from "../icons/TelegramIcon";
import InstagramIcon from "../icons/InstagramIcon";
import WebIcon from "../icons/WebIcon";
import { getFooterMenu } from "../../api/SiteLink";

import "../../assets/css/glass-footer.css";

/** فال‌بک برای زمانی که API در دسترس نیست یا هنوز چیزی برایش تعریف نشده. */
const DEFAULT_FOOTER_LINKS = [
  { id: "home", title: "وب اپ", href: "/home" },
  { id: "subscriptions", title: "اشتراک‌ها", href: "/subscriptions" },
  { id: "blog", title: "بلاگ", href: "/blog" },
  { id: "restaurants", title: "رستوران ها", href: "/restaurants" },
];

/** سوشال‌ها فعلاً در مدل بک‌اند (SiteLink) وجود ندارند، پس ثابت می‌مانند. */
const SOCIALS = [
  { id: "rubica", href: "#", label: "Rubica", icon: <RubicaIcon /> },
  { id: "telegram", href: "#", label: "Telegram", icon: <TelegramIcon /> },
  { id: "instagram", href: "#", label: "Instagram", icon: <InstagramIcon /> },
  { id: "web", href: "#", label: "Website", icon: <WebIcon /> },
];

export default function GlassFooter() {
  const [links, setLinks] = useState(DEFAULT_FOOTER_LINKS);

  useEffect(() => {
    let isMounted = true;

    async function fetchFooterMenu() {
      try {
        const items = await getFooterMenu();

        if (!isMounted) return;

        if (items.length > 0) {
          setLinks(
            items
              .filter((item) => item.isActive)
              .map((item) => ({
                id: item.id,
                title: item.title,
                href: item.url,
              })),
          );
        }
      } catch (error) {
        console.error("خطا در دریافت منوی فوتر:", error);
        // در صورت خطا لیست پیش‌فرض (DEFAULT_FOOTER_LINKS) دست‌نخورده باقی می‌ماند.
      }
    }

    fetchFooterMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="footer-glass" role="contentinfo">
      <div className="footer-glass__inner">
        {/* Row 1: logo + nav */}
        <div className="footer-glass__top">
          <div className="footer-glass__brand">
            <img
              src="/images/menro-landing-footer-icon.svg"
              alt="منرو"
              className="footer-glass__brandImg"
            />
          </div>
          <nav className="footer-glass__nav" aria-label="لینک‌های فوتر">
            {links.map((link) => (
              <a key={link.id} href={link.href}>
                {link.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Row 2: socials + copy */}
        <div className="footer-glass__bottom">
          <p className="footer-glass__copy">
            تمامی حقوق این وبسایت متعلق به نکروتک می‌باشد
          </p>
          <div className="footer-glass__socials">
            {SOCIALS.map(({ id, href, label, icon }) => (
              <a
                key={id}
                href={href}
                aria-label={label}
                className="footer-glass__social-link"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Back to top pill */}
      <div className="footer-glass__button-wrapper">
        <button
          className="footer-glass__backtotop"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="بازگشت به بالا"
        >
          <span className="footer-glass__chevron" />
        </button>
      </div>
    </footer>
  );
}
