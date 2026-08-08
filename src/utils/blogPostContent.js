/**
 * Parses the raw content HTML once: injects an id on every <h2>/<h3> so the
 * table of contents can link/scroll to them, and returns both the modified
 * HTML (to actually render) and the flat heading list (to render the TOC).
 */
export function processContentForHeadings(html) {
  if (!html) return { html: "", headings: [] };

  const container = document.createElement("div");
  container.innerHTML = html;

  const headings = [];
  container.querySelectorAll("h2, h3").forEach((h, i) => {
    const id = `section-${i}`;
    h.id = id;
    headings.push({
      id,
      text: h.textContent,
      level: h.tagName === "H2" ? 2 : 3,
    });
  });

  return { html: container.innerHTML, headings };
}

/**
 * The saved HTML for a restaurant block is just a bare
 * <div data-restaurant-card data-name="..." data-logo-url="..." ...> with no
 * visible children (the real card only exists as a React NodeView inside
 * the admin editor). On the public page there's no Tiptap/React mounted
 * over this HTML, so after it's injected via dangerouslySetInnerHTML we
 * walk the DOM once and build the visible card straight from the data-*
 * attributes already sitting on the element - no extra API round trip,
 * since everything needed was snapshotted at insert time.
 */
export function hydrateRestaurantCards(container) {
  if (!container) return;

  const nodes = container.querySelectorAll("[data-restaurant-card]");
  nodes.forEach((el) => {
    if (el.dataset.hydrated) return;
    el.dataset.hydrated = "true";

    const {
      name = "",
      logoUrl,
      bannerUrl,
      slug = "",
      categoryName,
      averageRating,
      votersCount,
    } = el.dataset;

    const voters = Number(votersCount) || 0;

    el.classList.add("bp-restaurant-card");
    el.innerHTML = `
      <a href="/restaurant/${slug}" class="bp-restaurant-card__link">
        <div class="bp-restaurant-card__banner">
          ${
            bannerUrl
              ? `<img src="${bannerUrl}" alt="${name}" class="bp-restaurant-card__banner-img" />`
              : `<div class="bp-restaurant-card__banner-fallback"><i class="fas fa-utensils"></i></div>`
          }
          <span class="bp-restaurant-card__label">رستوران معرفی‌شده</span>
          <span class="bp-restaurant-card__logo">
            ${
              logoUrl
                ? `<img src="${logoUrl}" alt="${name}" />`
                : `<i class="fas fa-utensils"></i>`
            }
          </span>
        </div>
        <div class="bp-restaurant-card__footer">
          ${
            voters > 0
              ? `<span class="bp-restaurant-card__rating"><i class="fas fa-star"></i> ${averageRating} <span class="bp-restaurant-card__voters">(${voters})</span></span>`
              : ""
          }
          <span class="bp-restaurant-card__titles">
            <span class="bp-restaurant-card__name">${name}</span>
            ${categoryName ? `<span class="bp-restaurant-card__category">${categoryName}</span>` : ""}
          </span>
        </div>
      </a>
    `;
  });
}
