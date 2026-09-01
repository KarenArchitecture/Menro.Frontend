// src/api/PublicSiteMenuAxios.js
import siteLinkAxios from "./siteLinkAxios";

/** مقادیر باید دقیقاً با enum بک‌اند (MenuLocation) هم‌نام باشند. */
export const MenuLocation = {
  Header: "Header",
  Footer: "Footer",
};

/**
 * دریافت خام لینک‌های یک بخش (GET /site-content/links/{location}).
 * @param {string} location - مقدار MenuLocation ("Header" | "Footer")
 * @returns {Promise<Array>}
 */
export async function getSiteMenu(location) {
  const { data } = await siteLinkAxios.get(`/${location}`);
  return Array.isArray(data) ? data : [];
}

/**
 * تبدیل لیست تخت لینک‌ها (با ParentId) به درخت (برای dropdown های هدر).
 * فوتر فعلاً ParentId ندارد، پس همیشه یک آرایه تخت با children خالی برمی‌گردد.
 * @param {Array} items
 * @returns {Array}
 */
export function buildMenuTree(items = []) {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const map = new Map();

  sorted.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  const roots = [];
  map.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
}

/** منوی هدر به‌صورت درخت (والد + children برای dropdown). */
export async function getHeaderMenu() {
  const items = await getSiteMenu(MenuLocation.Header);
  return buildMenuTree(items);
}

/** منوی فوتر به‌صورت لیست تخت (فعلاً nested ندارد). */
export async function getFooterMenu() {
  const items = await getSiteMenu(MenuLocation.Footer);
  return buildMenuTree(items);
}
