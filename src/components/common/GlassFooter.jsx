import React from "react";
import RubicaIcon from "../icons/RubicaIcon";
import TelegramIcon from "../icons/TelegramIcon";
import InstagramIcon from "../icons/InstagramIcon";
import WebIcon from "../icons/WebIcon";

export default function GlassFooter() {
  const socials = [
    { id: "rubica", href: "#", label: "Rubica", icon: <RubicaIcon /> },
    { id: "telegram", href: "#", label: "Telegram", icon: <TelegramIcon /> },
    { id: "instagram", href: "#", label: "Instagram", icon: <InstagramIcon /> },
    { id: "web", href: "#", label: "Website", icon: <WebIcon /> },
  ];

  return (
    <footer className="footer-glass" role="contentinfo">
      <div className="footer-glass__inner">
        {/* Row 1: logo + nav */}
        <div className="footer-glass__top">
          <span className="footer-glass__brand">منرو</span>
          <nav className="footer-glass__nav" aria-label="لینک‌های فوتر">
            <a href="#">وب اپ</a>
            <a href="#">درباره ما</a>
            <a href="#">اشتراک‌ها</a>
            <a href="#">مقالات</a>
            <a href="#">سوالات متداول</a>
            <a href="#">رستوران ها</a>
            <a href="#">نقشه</a>
          </nav>
        </div>

        {/* Row 2: socials + copy */}
        <div className="footer-glass__bottom">
          <p className="footer-glass__copy">
            تمامی حقوق این وبسایت متعلق به منرو می‌باشد
          </p>
          <div className="footer-glass__socials">
            {socials.map(({ id, href, label, icon }) => (
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
      <button
        className="footer-glass__backtotop"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="بازگشت به بالا"
      >
        <span className="footer-glass__chevron" />
      </button>
    </footer>
  );
}
