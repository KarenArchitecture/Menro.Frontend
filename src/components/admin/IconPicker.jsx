import React, { useMemo, useState, useEffect } from "react";

/** ----- Library icons (JSX) ----- */
import KebabIcon from "../icons/AdminIcons/KababIcon.jsx";
import SaladIcon from "../icons/AdminIcons/SaladIcon.jsx";
import IranianFoodIcon from "../icons/AdminIcons/IranianFoodIcon.jsx";
import FastFoodIcon from "../icons/AdminIcons/FastFoodIcon.jsx";
import ColdDrinksIcon from "../icons/AdminIcons/ColdDrinksIcon.jsx";
import HotDrinksIcon from "../icons/AdminIcons/HotDrinksIcon.jsx";
import AppetizerIcon from "../icons/AdminIcons/AppetizerIcon.jsx";
import CakeIcon from "../icons/AdminIcons/CakeIcon.jsx";
import DonutIcon from "../icons/AdminIcons/DonutIcon.jsx";
import KababIcon2 from "../icons/AdminIcons/KababIcon2.jsx";
import TakeoutIcon from "../icons/AdminIcons/TakeoutIcon.jsx";
import ColaIcon from "../icons/AdminIcons/ColaIcon.jsx";
import SoupIcon from "../icons/AdminIcons/SoupIcon.jsx";
import BurgerIcon from "../icons/AdminIcons/BurgerIcon.jsx";
import WaterIcon from "../icons/AdminIcons/WaterIcon.jsx";
import PizzaSliceIcon from "../icons/AdminIcons/PizzaSliceIcon.jsx";
import PizzaFullIcon from "../icons/AdminIcons/PizzaFullIcon.jsx";
import IceCreamIcon from "../icons/AdminIcons/IceCreamIcon.jsx";
import MainCourseIcon from "../icons/AdminIcons/MainCourseIcon.jsx";
import RicePotIcon from "../icons/AdminIcons/RicePotIcon.jsx";
import PopsickleIcon from "../icons/AdminIcons/PopsickleIcon.jsx";
import IceIcon from "../icons/AdminIcons/IceIcon.jsx";
import MeatIcon from "../icons/AdminIcons/MeatIcon.jsx";
import IceCreamIcon2 from "../icons/AdminIcons/IceCreamIcon2.jsx";
import WaffleIcon from "../icons/AdminIcons/WaffleIcon.jsx";
import MeatIcon2 from "../icons/AdminIcons/MeatIcon2.jsx";
import TakeoutDrinkIcon from "../icons/AdminIcons/TakeoutDrinkIcon.jsx";
import ChocolateIcon from "../icons/AdminIcons/ChocolateIcon.jsx";
import CupcakeIcon from "../icons/AdminIcons/CupcakeIcon.jsx";
import BreadIcon from "../icons/AdminIcons/BreadIcon.jsx";
import CakeIcon2 from "../icons/AdminIcons/CakeIcon2.jsx";
import FishIcon from "../icons/AdminIcons/FishIcon.jsx";
import ChickenIcon from "../icons/AdminIcons/ChickenIcon.jsx";
import ChineseFoodIcon from "../icons/AdminIcons/ChineseFoodIcon.jsx";
import LasagnaIcon from "../icons/AdminIcons/LasagnaIcon.jsx";
import FrenchFriesIcon from "../icons/AdminIcons/FrenchFriesIcon.jsx";
import CandyIcon from "../icons/AdminIcons/CandyIcon.jsx";
import CupcakeIcon2 from "../icons/AdminIcons/CupcakeIcon2.jsx";
import SaladIcon2 from "../icons/AdminIcons/SaladIcon2.jsx";
import VegetablesIcon from "../icons/AdminIcons/VegetablesIcon.jsx";
import CarrotIcon from "../icons/AdminIcons/CarrotIcon.jsx";
import ChineseFoodIcon2 from "../icons/AdminIcons/ChineseFoodIcon2.jsx";
import RiceIcon from "../icons/AdminIcons/RiceIcon.jsx";
import SoupIcon2 from "../icons/AdminIcons/SoupIcon2.jsx";
import SeaFoodIcon from "../icons/AdminIcons/SeaFoodIcon.jsx";
import SeaFoodIcon2 from "../icons/AdminIcons/SeaFoodIcon2.jsx";
import EggIcon from "../icons/AdminIcons/EggIcon.jsx";
import SpaghettiIcon from "../icons/AdminIcons/SpaghettiIcon.jsx";
import SaladIcon3 from "../icons/AdminIcons/SaladIcon3.jsx";
import RiceIcon2 from "../icons/AdminIcons/RiceIcon2.jsx";
import PancakeIcon from "../icons/AdminIcons/PancakeIcon.jsx";

export const ICON_LIBRARY = [
  { key: "kebab", label: "کباب", Icon: KebabIcon },
  { key: "salad", label: "سالاد", Icon: SaladIcon },
  { key: "iranian-food", label: "غذای ایرانی", Icon: IranianFoodIcon },
  { key: "fast-food", label: "فست فود", Icon: FastFoodIcon },
  { key: "cold-drinks", label: "نوشیدنی‌های سرد", Icon: ColdDrinksIcon },
  { key: "hot-drinks", label: "نوشیدنی‌های گرم", Icon: HotDrinksIcon },
  { key: "appetizer", label: "پیش‌غذا", Icon: AppetizerIcon },
  { key: "cake", label: "کیک", Icon: CakeIcon },
  { key: "donut", label: "دونات", Icon: DonutIcon },
  { key: "kebab-2", label: "کباب", Icon: KababIcon2 },
  { key: "takeout", label: "غذای بیرون‌بر", Icon: TakeoutIcon },
  { key: "cola", label: "نوشابه", Icon: ColaIcon },
  { key: "soup", label: "سوپ", Icon: SoupIcon },
  { key: "burger", label: "برگر", Icon: BurgerIcon },
  { key: "water", label: "آب", Icon: WaterIcon },
  { key: "pizza-slice", label: "پیتزا (برش)", Icon: PizzaSliceIcon },
  { key: "pizza-full", label: "پیتزا کامل", Icon: PizzaFullIcon },
  { key: "ice-cream", label: "بستنی", Icon: IceCreamIcon },
  { key: "main-course", label: "غذای اصلی", Icon: MainCourseIcon },
  { key: "rice-pot", label: "برنج", Icon: RicePotIcon },
  { key: "popsickle", label: "آبنبات چوبی", Icon: PopsickleIcon },
  { key: "ice", label: "یخ", Icon: IceIcon },
  { key: "meat", label: "گوشت", Icon: MeatIcon },
  { key: "ice-cream-2", label: "بستنی", Icon: IceCreamIcon2 },
  { key: "waffle", label: "وافِل", Icon: WaffleIcon },
  { key: "meat-2", label: "گوشت", Icon: MeatIcon2 },
  { key: "takeout-drink", label: "نوشیدنی بیرون‌بر", Icon: TakeoutDrinkIcon },
  { key: "chocolate", label: "شکلات", Icon: ChocolateIcon },
  { key: "cupcake", label: "کاپ‌کیک", Icon: CupcakeIcon },
  { key: "bread", label: "نان", Icon: BreadIcon },
  { key: "cake-2", label: "کیک", Icon: CakeIcon2 },
  { key: "fish", label: "ماهی", Icon: FishIcon },
  { key: "chicken", label: "مرغ", Icon: ChickenIcon },
  { key: "chinese-food", label: "غذای چینی", Icon: ChineseFoodIcon },
  { key: "lasagna", label: "لازانیا", Icon: LasagnaIcon },
  { key: "french-fries", label: "سیب‌زمینی سرخ‌کرده", Icon: FrenchFriesIcon },
  { key: "candy", label: "آبنبات", Icon: CandyIcon },
  { key: "cupcake-2", label: "کاپ‌کیک", Icon: CupcakeIcon2 },
  { key: "salad-2", label: "سالاد", Icon: SaladIcon2 },
  { key: "vegetables", label: "سبزیجات", Icon: VegetablesIcon },
  { key: "carrot", label: "हویج", Icon: CarrotIcon },
  { key: "chinese-food-2", label: "غذای چینی", Icon: ChineseFoodIcon2 },
  { key: "rice", label: "برنج", Icon: RiceIcon },
  { key: "soup-2", label: "سوپ", Icon: SoupIcon2 },
  { key: "seafood", label: "غذاهای دریایی", Icon: SeaFoodIcon },
  { key: "seafood-2", label: "غذاهای دریایی", Icon: SeaFoodIcon2 },
  { key: "egg", label: "تخم‌مرغ", Icon: EggIcon },
  { key: "spaghetti", label: "اسپاگتی", Icon: SpaghettiIcon },
  { key: "salad-3", label: "سالاد", Icon: SaladIcon3 },
  { key: "rice-2", label: "برنج", Icon: RiceIcon2 },
  { key: "pancake", label: "پنکیک", Icon: PancakeIcon },
];

export const ICON_BY_KEY = ICON_LIBRARY.reduce((acc, i) => {
  acc[i.key] = i.Icon;
  return acc;
}, {});

/** ----- Custom SVG storage (shown in picker, uploaded elsewhere) ----- */
const CUSTOM_ICONS_KEY = "admin.custom.icons";
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

// ✅ NEW: expose list/remove for Settings UI
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

/** Called from Settings (outside modal) after upload */
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

/** Render by key (works for library + custom) */
export function renderIconByKey(key) {
  if (!key) return null;
  if (ICON_BY_KEY[key]) {
    const Lib = ICON_BY_KEY[key];
    return <Lib />;
  }
  if (key.startsWith(CUSTOM_PREFIX)) {
    const list = loadCustomIcons();
    const found = list.find((x) => x.key === key);
    if (found?.dataUrl) {
      return (
        <img
          src={found.dataUrl}
          alt={found.label || key}
          width={24}
          height={24}
          style={{ objectFit: "contain" }}
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

  const merged = useMemo(() => {
    const lib = ICON_LIBRARY.map((x) => ({ ...x, type: "library" }));
    const cus = customs.map((x) => ({ ...x, type: "custom" }));
    return [...lib, ...cus];
  }, [customs]);

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
                  {item.type === "custom" ? (
                    <img
                      src={item.dataUrl}
                      alt={item.label || item.key}
                      width={24}
                      height={24}
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <item.Icon />
                  )}
                </span>
                <span className="icon-cell__label">
                  {item.label || item.key}
                  {item.type === "custom" && (
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
