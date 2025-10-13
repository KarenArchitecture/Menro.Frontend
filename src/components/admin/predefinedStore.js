// LocalStorage-backed shared predefined categories
const LS_KEY = "admin.shared.predefined.categories";
const EVT = "predefined:updated"; // custom event name for in-tab updates

const DEFAULTS = [
  { name: "کباب", iconKey: "kebab" },
  { name: "سالاد", iconKey: "salad" },
  { name: "غذای ایرانی", iconKey: "iranian-food" },
  { name: "فست فود", iconKey: "fast-food" },
  { name: "نوشیدنی های سرد", iconKey: "cold-drinks" },
  { name: "نوشیدنی های گرم", iconKey: "hot-drinks" },
  { name: "پیش غذا", iconKey: "appetizer" },
  { name: "کیک", iconKey: "cake" },
];

function slugify(name = "") {
  return name
    .trim()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/\s+/g, " ")
    .replace(/[^ء-ی0-9\s\-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function ensureIds(list) {
  return (list || []).map((x) => ({
    id: x.id || slugify(x.name || "item"),
    name: x.name,
    iconKey: x.iconKey,
  }));
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return ensureIds(parsed);
  } catch {
    return null;
  }
}

function saveRaw(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ensureIds(list)));
  } catch {}
}

/** READ: get predefined list (seed if empty) */
export function getPredefined() {
  const existing = loadRaw();
  if (existing) return existing;
  const seeded = ensureIds(DEFAULTS);
  saveRaw(seeded);
  return seeded;
}

/** WRITE: set predefined list + notify */
export function setPredefined(list) {
  saveRaw(list || []);
  window.dispatchEvent(new CustomEvent(EVT));
}

/** RESET: restore defaults + notify */
export function resetPredefined() {
  const seeded = ensureIds(DEFAULTS);
  saveRaw(seeded);
  window.dispatchEvent(new CustomEvent(EVT));
  return seeded;
}

/** SUBSCRIBE: listen for changes (same tab via EVT, other tabs via storage) */
export function onPredefinedChange(handler) {
  if (typeof handler !== "function") return () => {};

  const storageHandler = (e) => {
    if (e.key === LS_KEY) handler();
  };

  window.addEventListener(EVT, handler);
  window.addEventListener("storage", storageHandler);

  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}
