import React, { useMemo, useState } from "react";

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

export default function CategoriesSection() {
  const [inputValue, setInputValue] = useState("");
  const [categories, setCategories] = useState([
    "کباب‌ها",
    "فست فود",
    "نوشیدنی‌ها",
  ]);

  const normalized = useMemo(
    () => categories.map((c) => c.trim().replace(/\s+/g, " ")),
    [categories]
  );

  const addCategory = (name) => {
    const value = (name ?? inputValue).trim();
    if (!value) return;
    if (normalized.includes(value)) {
      setInputValue("");
      return;
    }
    setCategories((prev) => [...prev, value]);
    setInputValue("");
  };

  const removeCategory = (name) => {
    setCategories((prev) => prev.filter((c) => c !== name));
  };

  return (
    <div className="panels-grid-single-column">
      {/* Add new category */}
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
          />
          <button className="btn btn-primary" onClick={() => addCategory()}>
            افزودن
          </button>
        </div>

        <hr className="form-divider" />

        <label>پیشنهادهای آماده برای افزودن:</label>
        <div className="predefined-tags">
          {PREDEFINED.map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag"
              onClick={() => addCategory(tag)}
              title="افزودن"
            >
              <i className="fas fa-plus" /> {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Current categories */}
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
              <div key={cat} className="category-item">
                <span className="category-title">{cat}</span>
                <div className="item-actions">
                  <button
                    className="btn btn-icon"
                    title="ویرایش (به‌زودی)"
                    disabled
                  >
                    <i className="fas fa-edit" />
                  </button>
                  <button
                    className="btn btn-icon btn-danger"
                    title="حذف"
                    onClick={() => removeCategory(cat)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
