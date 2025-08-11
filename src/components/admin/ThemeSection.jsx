import React, { useState } from "react";

const SWATCHES = [
  {
    id: "theme-orange",
    value: "orange",
    label: "تم نارنجی تیره",
    palette: ["#1e1e1e", "#f59e0b", "#ffffff"],
    checked: true,
  },
  {
    id: "theme-blue",
    value: "blue",
    label: "تم آبی تیره",
    palette: ["#1e293b", "#3b82f6", "#e2e8f0"],
  },
  {
    id: "theme-green",
    value: "green",
    label: "تم سبز روشن",
    palette: ["#14532d", "#22c55e", "#f0fdf4"],
  },
];

const TYPES = [
  { value: "modern", label: "مدرن" },
  { value: "traditional", label: "رستوران سنتی" },
  { value: "seafood", label: "دریایی" },
  { value: "asian", label: "چینی / آسیایی" },
  { value: "italian", label: "ایتالیایی" },
  { value: "cafe", label: "کافه رستوران" },
  { value: "fastfood", label: "فست فود" },
  { value: "garden", label: "باغ رستوران" },
];

export default function ThemeSection() {
  const [theme, setTheme] = useState("orange");
  const [restaurantType, setRestaurantType] = useState("modern");

  // API later
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Saved:", { theme, restaurantType });
  };

  return (
    <form className="panels-grid-single-column" onSubmit={handleSubmit}>
      <div className="panel">
        <h3>انتخاب تم رنگی آماده</h3>
        <p className="panel-subtitle">
          یک پالت رنگی برای صفحه رستوران خود انتخاب کنید تا رنگ پس‌زمینه،
          دکمه‌ها و متون تغییر کند.
        </p>

        <div className="theme-swatches">
          {SWATCHES.map((s) => (
            <div key={s.id} className="theme-swatch">
              <input
                type="radio"
                id={s.id}
                name="color_theme"
                value={s.value}
                checked={theme === s.value}
                onChange={() => setTheme(s.value)}
              />
              <label htmlFor={s.id}>
                <div className="palette">
                  {s.palette.map((c, i) => (
                    <span
                      key={i}
                      className="color-dot"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                {s.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>تصاویر رستوران</h3>
        <p className="panel-subtitle">
          تصویر پروفایل و بنر بالای صفحه رستوران خود را آپلود کنید.
        </p>

        <form
          className="image-upload-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="input-group">
            <label htmlFor="profile-upload">عکس پروفایل</label>
            <input
              type="file"
              id="profile-upload"
              className="file-input"
              accept="image/*"
            />
          </div>
          <div className="input-group">
            <label htmlFor="banner-upload">عکس بنر</label>
            <input
              type="file"
              id="banner-upload"
              className="file-input"
              accept="image/*"
            />
          </div>
        </form>
      </div>

      <div className="panel">
        <h3>نوع رستوران</h3>
        <p className="panel-subtitle">
          دسته بندی اصلی رستوران خود را مشخص کنید.
        </p>

        <div className="input-group">
          <label htmlFor="restaurant-type">انتخاب نوع</label>
          <select
            id="restaurant-type"
            name="restaurant_type"
            value={restaurantType}
            onChange={(e) => setRestaurantType(e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ maxWidth: 200, marginTop: 10 }}
      >
        ذخیره تغییرات قالب
      </button>
    </form>
  );
}
