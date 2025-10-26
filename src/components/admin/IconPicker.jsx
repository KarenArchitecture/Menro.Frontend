import React, { useMemo, useState, useEffect } from "react";

/** ----- Library icons (SVG as URL strings) ----- */
import KebabIcon from "../../assets/AdminIcons/KababIcon.svg";
import SaladIcon from "../../assets/AdminIcons/SaladIcon.svg";
import IranianFoodIcon from "../../assets/AdminIcons/IranianFoodIcon.svg";
import FastFoodIcon from "../../assets/AdminIcons/FastFoodIcon.svg";
import ColdDrinksIcon from "../../assets/AdminIcons/ColdDrinksIcon.svg";
import HotDrinksIcon from "../../assets/AdminIcons/HotDrinksIcon.svg";
import AppetizerIcon from "../../assets/AdminIcons/AppetizerIcon.svg";
import CakeIcon from "../../assets/AdminIcons/CakeIcon.svg";
import DonutIcon from "../../assets/AdminIcons/DonutIcon.svg";
import KababIcon2 from "../../assets/AdminIcons/KababIcon2.svg";
import TakeoutIcon from "../../assets/AdminIcons/TakeoutIcon.svg";
import ColaIcon from "../../assets/AdminIcons/ColaIcon.svg";
import SoupIcon from "../../assets/AdminIcons/SoupIcon.svg";
import BurgerIcon from "../../assets/AdminIcons/BurgerIcon.svg";
import WaterIcon from "../../assets/AdminIcons/WaterIcon.svg";
import PizzaSliceIcon from "../../assets/AdminIcons/PizzaSliceIcon.svg";
import PizzaFullIcon from "../../assets/AdminIcons/PizzaFullIcon.svg";
import IceCreamIcon from "../../assets/AdminIcons/IceCreamIcon.svg";
import MainCourseIcon from "../../assets/AdminIcons/MainCourseIcon.svg";
import RicePotIcon from "../../assets/AdminIcons/RicePotIcon.svg";
import IceCreamIcon2 from "../../assets/AdminIcons/IceCreamIcon2.svg";
import IceIcon from "../../assets/AdminIcons/IceIcon.svg";
import MeatIcon from "../../assets/AdminIcons/MeatIcon.svg";
import WaffleIcon from "../../assets/AdminIcons/WaffleIcon.svg";
import MeatIcon2 from "../../assets/AdminIcons/MeatIcon2.svg";
import TakeoutDrinkIcon from "../../assets/AdminIcons/TakeoutDrinkIcon.svg";
import ChocolateIcon from "../../assets/AdminIcons/ChocolateIcon.svg";
import CupcakeIcon from "../../assets/AdminIcons/CupcakeIcon.svg";
import BreadIcon from "../../assets/AdminIcons/BreadIcon.svg";
import CakeIcon2 from "../../assets/AdminIcons/CakeIcon2.svg";
import FishIcon from "../../assets/AdminIcons/FishIcon.svg";
import ChickenIcon from "../../assets/AdminIcons/ChickenIcon.svg";
import ChineseFoodIcon from "../../assets/AdminIcons/ChineseFoodIcon.svg";
import LasagnaIcon from "../../assets/AdminIcons/LasagnaIcon.svg";
import FrenchFriesIcon from "../../assets/AdminIcons/FrenchFriesIcon.svg";
import CandyIcon from "../../assets/AdminIcons/CandyIcon.svg";
import CupcakeIcon2 from "../../assets/AdminIcons/CupcakeIcon2.svg";
import SaladIcon2 from "../../assets/AdminIcons/SaladIcon2.svg";
import VegetablesIcon from "../../assets/AdminIcons/VegetablesIcon.svg";
import CarrotIcon from "../../assets/AdminIcons/CarrotIcon.svg";
import ChineseFoodIcon2 from "../../assets/AdminIcons/ChineseFoodIcon2.svg";
import RiceIcon from "../../assets/AdminIcons/RiceIcon.svg";
import SoupIcon2 from "../../assets/AdminIcons/SoupIcon2.svg";
import SeaFoodIcon from "../../assets/AdminIcons/SeaFoodIcon.svg";
import SeaFoodIcon2 from "../../assets/AdminIcons/SeaFoodIcon2.svg";
import EggIcon from "../../assets/AdminIcons/EggIcon.svg";
import SpaghettiIcon from "../../assets/AdminIcons/SpaghettiIcon.svg";
import SaladIcon3 from "../../assets/AdminIcons/SaladIcon3.svg";
import PancakeIcon from "../../assets/AdminIcons/PancakeIcon.svg";
import PopsicleIcon from "../../assets/AdminIcons/PopsicleIcon.svg"; // ✅ new import

/**
 * We store library icons as { key, label, src }.
 * src is a URL string now, but later you can switch to a DB URL or data: URI.
 */
export const ICON_LIBRARY = [
  { key: "kebab", label: "کباب", src: KebabIcon },
  { key: "salad", label: "سالاد", src: SaladIcon },
  { key: "iranian-food", label: "غذای ایرانی", src: IranianFoodIcon },
  { key: "fast-food", label: "فست فود", src: FastFoodIcon },
  { key: "cold-drinks", label: "نوشیدنی‌های سرد", src: ColdDrinksIcon },
  { key: "hot-drinks", label: "نوشیدنی‌های گرم", src: HotDrinksIcon },
  { key: "appetizer", label: "پیش‌غذا", src: AppetizerIcon },
  { key: "cake", label: "کیک", src: CakeIcon },
  { key: "donut", label: "دونات", src: DonutIcon },
  { key: "kebab-2", label: "کباب", src: KababIcon2 },
  { key: "takeout", label: "بیرون‌بر", src: TakeoutIcon },
  { key: "cola", label: "نوشابه", src: ColaIcon },
  { key: "soup", label: "سوپ", src: SoupIcon },
  { key: "burger", label: "برگر", src: BurgerIcon },
  { key: "water", label: "آب", src: WaterIcon },
  { key: "pizza-slice", label: "پیتزا (برش)", src: PizzaSliceIcon },
  { key: "pizza-full", label: "پیتزا کامل", src: PizzaFullIcon },
  { key: "ice-cream", label: "بستنی", src: IceCreamIcon },
  { key: "main-course", label: "غذای اصلی", src: MainCourseIcon },
  { key: "rice-pot", label: "برنج", src: RicePotIcon },
  { key: "popsicle", label: "آب‌نبات", src: PopsicleIcon }, // ✅ fixed
  { key: "ice", label: "یخ", src: IceIcon },
  { key: "meat", label: "گوشت", src: MeatIcon },
  { key: "ice-cream-2", label: "بستنی", src: IceCreamIcon2 },
  { key: "waffle", label: "وافِل", src: WaffleIcon },
  { key: "meat-2", label: "گوشت", src: MeatIcon2 },
  { key: "takeout-drink", label: "نوشیدنی بیرون‌بر", src: TakeoutDrinkIcon },
  { key: "chocolate", label: "شکلات", src: ChocolateIcon },
  { key: "cupcake", label: "کاپ‌کیک", src: CupcakeIcon },
  { key: "bread", label: "نان", src: BreadIcon },
  { key: "cake-2", label: "کیک", src: CakeIcon2 },
  { key: "fish", label: "ماهی", src: FishIcon },
  { key: "chicken", label: "مرغ", src: ChickenIcon },
  { key: "chinese-food", label: "غذای چینی", src: ChineseFoodIcon },
  { key: "lasagna", label: "لازانیا", src: LasagnaIcon },
  { key: "french-fries", label: "سیب‌زمینی سرخ‌کرده", src: FrenchFriesIcon },
  { key: "candy", label: "آبنبات", src: CandyIcon },
  { key: "cupcake-2", label: "کاپ‌کیک", src: CupcakeIcon2 },
  { key: "salad-2", label: "سالاد", src: SaladIcon2 },
  { key: "vegetables", label: "سبزیجات", src: VegetablesIcon },
  { key: "carrot", label: "هویج", src: CarrotIcon }, // ✅ fixed script
  { key: "chinese-food-2", label: "غذای چینی", src: ChineseFoodIcon2 },
  { key: "rice", label: "برنج", src: RiceIcon },
  { key: "soup-2", label: "سوپ", src: SoupIcon2 },
  { key: "seafood", label: "غذاهای دریایی", src: SeaFoodIcon },
  { key: "seafood-2", label: "غذاهای دریایی", src: SeaFoodIcon2 },
  { key: "egg", label: "تخم‌مرغ", src: EggIcon },
  { key: "spaghetti", label: "اسپاگتی", src: SpaghettiIcon },
  { key: "salad-3", label: "سالاد", src: SaladIcon3 },
  { key: "pancake", label: "پنکیک", src: PancakeIcon },
];

export const ICON_BY_KEY = ICON_LIBRARY.reduce((acc, i) => {
  acc[i.key] = i.src; // map to URL string
  return acc;
}, {});

/** ----- Custom SVG storage (shown in picker, uploaded elsewhere) ----- */
const CUSTOM_ICONS_KEY = "admin.custom.icons"; // local cache of user-uploaded SVGs (data URLs)
const CUSTOM_PREFIX = "custom-";

function loadCustomIcons() {
  try {
    const raw = localStorage.getItem(CUSTOM_ICONS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Expose list/remove for a separate Settings UI
export function listCustomIcons() {
  return loadCustomIcons();
}
export function removeCustomIcon(key) {
  const list = loadCustomIcons().filter((x) => x.key !== key);
  saveCustomIcons(list);
}
function saveCustomIcons(list) {
  try {
    localStorage.setItem(CUSTOM_ICONS_KEY, JSON.stringify(list || []));
  } catch {}
}

function slugifyBase(name = "") {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-\u0600-\u06FF]/g, "")
    .toLowerCase();
}

/** Called from Settings (outside modal) after upload.
 * Store dataUrl now; later you can replace with server URL returned by your backend.
 */
export function registerCustomIcon({ label, dataUrl }) {
  const list = loadCustomIcons();
  const base = slugifyBase(label || "icon");
  let key = `${CUSTOM_PREFIX}${base}`;
  let i = 1;
  while (list.some((x) => x.key === key))
    key = `${CUSTOM_PREFIX}${base}-${i++}`;
  list.push({ key, label: label || key, dataUrl });
  saveCustomIcons(list);
  return key;
}

/** Render by key (library + custom) with <img>. */
export function renderIconByKey(key, { size = 24, alt } = {}) {
  if (!key) return null;

  // library (URL string)
  const libSrc = ICON_BY_KEY[key];
  if (libSrc) {
    return (
      <img
        src={libSrc}
        alt={alt || key}
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // custom (dataUrl or future server URL)
  if (key.startsWith(CUSTOM_PREFIX)) {
    const found = loadCustomIcons().find((x) => x.key === key);
    if (found?.dataUrl) {
      return (
        <img
          src={found.dataUrl}
          alt={alt || found.label || key}
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
          loading="lazy"
          decoding="async"
        />
      );
    }
  }

  return null;
}

/** ----- IconPicker (NO upload UI here) ----- */
export default function IconPicker({ open, onClose, value, onSelect }) {
  const [q, setQ] = useState("");
  const [customs, setCustoms] = useState([]);

  useEffect(() => {
    if (open) setCustoms(loadCustomIcons());
  }, [open]);

  // Merge library (static) + customs (user uploads)
  const merged = useMemo(() => {
    const lib = ICON_LIBRARY.map((x) => ({ ...x, type: "library" }));
    const cus = customs.map((x) => ({ ...x, type: "custom" }));
    return [...lib, ...cus];
  }, [customs]);

  // Simple search on key/label
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return merged;
    return merged.filter((i) => {
      const key = i.key?.toLowerCase() || "";
      const label = (i.label || "").toLowerCase();
      return key.includes(query) || label.includes(query);
    });
  }, [q, merged]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h4>انتخاب آیکن</h4>
          <button className="btn btn-icon" onClick={onClose} aria-label="بستن">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="icon-picker-search">
          <input
            type="text"
            placeholder="جستجوی آیکن…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="icon-grid" role="listbox" aria-label="Icon grid">
          {filtered.map((item) => {
            const selected = value === item.key;
            const isCustom = item.type === "custom";
            const src = isCustom ? item.dataUrl : item.src;

            return (
              <button
                key={item.key}
                className={`icon-cell ${selected ? "is-selected" : ""}`}
                onClick={() => onSelect?.(item.key)}
                title={item.label || item.key}
                role="option"
                aria-selected={selected}
              >
                <span className="icon-cell__gfx">
                  <img
                    src={src}
                    alt={item.label || item.key}
                    width={24}
                    height={24}
                    style={{ objectFit: "contain" }}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="icon-cell__label">
                  {item.label || item.key}
                  {isCustom && (
                    <span className="badge" style={{ marginInlineStart: 6 }}>
                      سفارشی
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="empty-state">هیچ آیکنی مطابق جستجو پیدا نشد.</div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
