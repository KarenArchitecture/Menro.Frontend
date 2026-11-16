// src/components/shop/CategoryIcon.jsx
// The built-in icons are already bundled with the frontend. Loading them from
// the backend with fetch() added unnecessary cross-origin SVG requests and
// made icons disappear when the response did not include CORS headers.
import React from "react";
import resolveFileUrl from "../../utils/resolveFileUrl";

const localIconModules = import.meta.glob(
  "../../assets/icons/AdminIcons/*.svg",
  { query: "?raw", import: "default", eager: true },
);

const localIconsByFilename = new Map(
  Object.entries(localIconModules).map(([path, svg]) => [
    path.split("/").pop().toLowerCase(),
    svg,
  ]),
);

function getBundledSvg(source) {
  if (!source || typeof source !== "string") return null;
  try {
    const url = new URL(source, window.location.origin);
    if (!url.pathname.toLowerCase().includes("/media/icons/")) return null;
    const filename = decodeURIComponent(url.pathname.split("/").pop() || "")
      .toLowerCase();
    return localIconsByFilename.get(filename) || null;
  } catch {
    return null;
  }
}

function recolorTrustedSvg(svg, color) {
  // These strings come ONLY from our local repository assets / the static
  // "all categories" icon. Never inline raw SVG returned by the API.
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : "#999FA8";
  return svg.replace(
    /\b(fill|stroke)=(["'])(#[a-fA-F0-9]{3,8}|white|black)\2/gi,
    (_match, attribute, quote) => `${attribute}=${quote}${safeColor}${quote}`,
  );
}

export default function CategoryIcon({
  source,
  inlineSvg,
  className = "category-icon",
  color = "#999FA8",
}) {
  const trustedSvg = inlineSvg || getBundledSvg(source);

  if (trustedSvg) {
    return (
      <span
        className={className}
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html: recolorTrustedSvg(trustedSvg, color),
        }}
      />
    );
  }

  // Uploaded / unknown icons are displayed as images. Unlike JS fetch of
  // their text, cross-origin <img> does not require ACAO for ordinary display.
  return (
    <span className={className} aria-hidden="true">
      {source && (
        <img
          src={resolveFileUrl(source)}
          alt=""
          loading="lazy"
          draggable={false}
        />
      )}
    </span>
  );
}
