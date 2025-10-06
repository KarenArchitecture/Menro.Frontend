// components/categories/CategoriesSection.jsx
import React, { useMemo, useState, useEffect } from "react";
import IconPicker from "./IconPicker";

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

// Friendly note to backend:
// The server should store only `iconKey` (string), not SVGs.
// Category DTO we expect from API:
// { id: string, name: string, slug: string, iconKey: string, source: 'predefined'|'custom', locked: boolean, createdAt: number }

function GenericCategoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function normalizePersian(s = "") {
  return s.replace(/[ي]/g, "ی").replace(/[ك]/g, "ک");
}
function slugify(name = "") {
  const s = normalizePersian(name).trim().replace(/\s+/g, " ");
  return s
    .replace(/[^ء-ی0-9\s\-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Backend: these are the fixed, read-only suggestions. They come with a fixed icon.
// Please reject PATCH/PUT on any item with locked=true on the server too.
const PREDEFINED = [
  "کباب",
  "سالاد",
  "غذای ایرانی",
  "فست فود",
  "نوشیدنی های سرد",
  "نوشیدنی های گرم",
  "پیش غذا",
  "کیک",
];
const PREDEFINED_ICON_BY_NAME = {
  کباب: { key: "kebab", Icon: KebabIcon },
  سالاد: { key: "salad", Icon: SaladIcon },
  "غذای ایرانی": { key: "iranian-food", Icon: IranianFoodIcon },
  "فست فود": { key: "fast-food", Icon: FastFoodIcon },
  "نوشیدنی های سرد": { key: "cold-drinks", Icon: ColdDrinksIcon },
  "نوشیدنی های گرم": { key: "hot-drinks", Icon: HotDrinksIcon },
  "پیش غذا": { key: "appetizer", Icon: AppetizerIcon },
  کیک: { key: "cake", Icon: CakeIcon },
};

// Backend: this list is purely UI. We only send the `iconKey` to you.
const ICON_LIBRARY = [
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
  { key: "carrot", label: "هویج", Icon: CarrotIcon },
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

const ICON_BY_KEY = ICON_LIBRARY.reduce((acc, i) => {
  acc[i.key] = i.Icon;
  return acc;
}, {});

export default function CategoriesSection() {
  // Backend: on mount, call GET /categories and set the result here.
  // For now we use localStorage as a temporary cache.
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("admin.categories");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("admin.categories", JSON.stringify(categories));
    } catch {}
    // Backend: remove this effect once real API is wired.
  }, [categories]);

  // UI state for "add" form
  const [nameInput, setNameInput] = useState("");
  const [selectedIconKey, setSelectedIconKey] = useState(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [errors, setErrors] = useState({ name: "", icon: "", duplicate: "" });

  // UI state for "edit" modal
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIconKey, setEditIconKey] = useState(null);
  const [editPickerOpen, setEditPickerOpen] = useState(false);

  const existingSlugs = useMemo(
    () => categories.map((c) => c.slug),
    [categories]
  );

  function iconForKey(key) {
    const Icon = ICON_BY_KEY[key] || GenericCategoryIcon;
    return <Icon />;
  }
  function iconForPredefinedLabel(label) {
    const meta = PREDEFINED_ICON_BY_NAME[label];
    const Icon = meta?.Icon || GenericCategoryIcon;
    return <Icon />;
  }

  // Backend: convert this to POST /categories
  // Body we will send: { name, iconKey, source: 'custom' }
  // Server should return the created object (with id, slug, locked=false, createdAt).
  function addCustomCategory() {
    const rawName = nameInput.trim();
    const cleaned = rawName.replace(/\s+/g, " ");
    const slug = slugify(cleaned);

    let next = { name: "", icon: "", duplicate: "" };
    let hasErr = false;

    if (!cleaned) {
      next.name = "نام دسته‌بندی را وارد کنید.";
      hasErr = true;
    }
    if (!selectedIconKey) {
      next.icon = "لطفاً یک آیکن برای این دسته‌بندی انتخاب کنید.";
      hasErr = true;
    }
    if (!hasErr && existingSlugs.includes(slug)) {
      next.duplicate = "این نام قبلاً اضافه شده است.";
      hasErr = true;
    }

    setErrors(next);
    if (hasErr) return;

    // Replace this push with response from API
    setCategories((prev) => [
      ...prev,
      {
        id: uid(),
        name: cleaned,
        slug,
        iconKey: selectedIconKey,
        source: "custom",
        locked: false,
        createdAt: Date.now(),
      },
    ]);

    setNameInput("");
    setSelectedIconKey(null);
    setErrors({ name: "", icon: "", duplicate: "" });
  }

  // Backend: convert this to POST /categories for a predefined item
  // Body: { name: label, iconKey: fixed.key, source: 'predefined' }
  // Server should persist it as locked=true.
  function addPredefined(label) {
    const slug = slugify(label);
    if (existingSlugs.includes(slug)) return;
    const fixed = PREDEFINED_ICON_BY_NAME[label];
    setCategories((prev) => [
      ...prev,
      {
        id: uid(),
        name: label,
        slug,
        iconKey: fixed?.key || null,
        source: "predefined",
        locked: true,
        createdAt: Date.now(),
      },
    ]);
  }

  // Backend: convert this to DELETE /categories/:id
  function removeCategory(id) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  // Backend: convert this to PATCH /categories/:id
  // Allowed only for custom (locked=false). Body may include { name, iconKey }.
  function beginEdit(cat) {
    if (cat.locked) return;
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIconKey(cat.iconKey);
  }
  function saveEdit() {
    const newName = editName.trim().replace(/\s+/g, " ");
    const newSlug = slugify(newName);
    if (!newName) return;
    if (categories.some((c) => c.id !== editingId && c.slug === newSlug)) {
      return;
    }
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingId
          ? { ...c, name: newName, slug: newSlug, iconKey: editIconKey || null }
          : c
      )
    );
    setEditingId(null);
    setEditName("");
    setEditIconKey(null);
  }
  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditIconKey(null);
    setEditPickerOpen(false);
  }

  return (
    <div className="panels-grid-single-column" id="categories-view">
      <div className="panel">
        <h3>افزودن دسته‌بندی جدید</h3>
        <p className="panel-subtitle">
          یک دسته‌بندی سفارشی ایجاد کنید یا از لیست‌های آماده منرو انتخاب
          نمایید.
        </p>

        <div className="input-group-inline">
          <input
            type="text"
            id="custom-category-name"
            placeholder="نام دسته‌بندی سفارشی خود را وارد کنید..."
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (errors.name || errors.duplicate) {
                setErrors((prev) => ({ ...prev, name: "", duplicate: "" }));
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
          />

          <button
            type="button"
            className="btn"
            onClick={() => setIconPickerOpen(true)}
            title="انتخاب آیکن"
          >
            {selectedIconKey ? (
              <span className="icon-preview">
                {iconForKey(selectedIconKey)}
              </span>
            ) : (
              <i className="fas fa-icons" />
            )}{" "}
            انتخاب آیکن
          </button>

          <button className="btn btn-primary" onClick={addCustomCategory}>
            افزودن
          </button>
        </div>

        {(errors.name || errors.icon || errors.duplicate) && (
          <div className="form-errors">
            {errors.name && <div className="form-error">{errors.name}</div>}
            {errors.icon && <div className="form-error">{errors.icon}</div>}
            {errors.duplicate && (
              <div className="form-error">{errors.duplicate}</div>
            )}
          </div>
        )}

        <hr className="form-divider" />

        <label>پیشنهادهای آماده برای افزودن:</label>
        <div className="predefined-tags">
          {PREDEFINED.map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag"
              onClick={() => addPredefined(tag)}
              title="افزودن"
            >
              <i className="fas fa-plus" />
              <span className="tag-icon">{iconForPredefinedLabel(tag)}</span>
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>دسته‌بندی‌های فعلی رستوران</h3>
        <div className="category-list">
          {categories.length === 0 ? (
            <div className="category-item">
              <span
                className="category-title"
                style={{ color: "var(--text-secondary)" }}
              >
                هنوز دسته‌بندی‌ای اضافه نشده است.
              </span>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="category-item">
                <div className="category-meta">
                  <span className="cat-icon">{iconForKey(cat.iconKey)}</span>
                  <span className="category-title">{cat.name}</span>
                  {cat.locked && (
                    <span className="cat-lock" title="ثابت">
                      <i className="fas fa-lock" />
                    </span>
                  )}
                </div>

                <div className="item-actions">
                  {!cat.locked && (
                    <button
                      className="btn btn-icon"
                      title="ویرایش"
                      onClick={() => beginEdit(cat)}
                    >
                      <i className="fas fa-edit" />
                    </button>
                  )}
                  <button
                    className="btn btn-icon btn-danger"
                    title="حذف"
                    onClick={() => removeCategory(cat.id)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <IconPicker
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        icons={ICON_LIBRARY}
        value={selectedIconKey}
        onSelect={(key) => {
          setSelectedIconKey(key);
          setErrors((prev) => ({ ...prev, icon: "" }));
          setIconPickerOpen(false);
        }}
      />

      {editingId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h4>ویرایش دسته‌بندی</h4>
              <button
                className="btn btn-icon"
                onClick={cancelEdit}
                aria-label="بستن"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="form-vertical">
              <label htmlFor="edit-name">نام</label>
              <input
                id="edit-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <label>آیکن</label>
              <div className="input-group-inline">
                <div className="icon-preview">{iconForKey(editIconKey)}</div>
                <button className="btn" onClick={() => setEditPickerOpen(true)}>
                  تغییر آیکن
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={cancelEdit}>
                انصراف
              </button>
              <button className="btn btn-primary" onClick={saveEdit}>
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      <IconPicker
        open={editPickerOpen}
        onClose={() => setEditPickerOpen(false)}
        icons={ICON_LIBRARY}
        value={editIconKey}
        onSelect={(key) => {
          setEditIconKey(key);
          setEditPickerOpen(false);
        }}
      />
    </div>
  );
}
