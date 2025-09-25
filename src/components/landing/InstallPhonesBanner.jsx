// start code
import React from "react";

/**
 * Minimal, asset-driven layout.
 * Provide your own PNGs in /public or adjust paths via props.
 */
export default function InstallPhonesBanner({
  bgSrc = "/images/app/mesh-card.png",
  phoneFrontSrc = "/images/app/phone-front.png",
  phoneBackSrc = "/images/app/phone-back.png",
  altFront = "نمایش اپلیکیشن منرو روی گوشی",
  altBack = "",
  children,
}) {
  return (
    <section className="install-banner" aria-label="بخش نصب اپلیکیشن">
      <div className="install-banner__card">
        <img
          className="install-banner__card-img"
          src={bgSrc}
          alt=""
          loading="lazy"
          decoding="async"
        />
        {children && (
          <div className="install-banner__card-content">{children}</div>
        )}
      </div>
      <img
        className="install-banner__phone install-banner__phone--back"
        src={phoneBackSrc}
        alt={altBack}
        loading="lazy"
        decoding="async"
      />
      <img
        className="install-banner__phone install-banner__phone--front"
        src={phoneFrontSrc}
        alt={altFront}
        decoding="async"
      />
    </section>
  );
}
