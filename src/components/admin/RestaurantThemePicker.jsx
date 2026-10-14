// RestaurantThemePicker.jsx
// Controlled picker: value = null | theme id | theme key | { id, ... }
// onChange(null | id)  — null means "no theme" (today's default look)

import {
  RESTAURANT_THEMES,
  DEFAULT_THEME_SWATCH,
} from "../../theme/restaurantThemes";
import "../../assets/css/admin/restaurant-theme.css";

function Chip({ main, second, details }) {
  return (
    <span className="rt-swatch__chip" aria-hidden="true">
      <span style={{ background: main }} />
      <span style={{ background: second }} />
      <span style={{ background: details }} />
    </span>
  );
}

export default function RestaurantThemePicker({ value, onChange }) {
  const current = value && typeof value === "object" ? value.id : value;
  const isDefault = current === null || current === undefined || current === "";

  const isChecked = (t) =>
    !isDefault && (String(current) === String(t.id) || current === t.key);

  return (
    <div className="rt-picker">
      <p className="rt-picker__hint">
        رنگ‌بندی فقط برای پنل مدیریت و صفحه رستوران شما اعمال می‌شود. با انتخاب
        هر تم، پیش‌نمایش آن همین‌جا دیده می‌شود.
      </p>

      <div
        className="rt-picker__grid"
        role="radiogroup"
        aria-label="تم رنگی رستوران"
      >
        <button
          type="button"
          role="radio"
          aria-checked={isDefault}
          className="rt-swatch"
          onClick={() => onChange(null)}
        >
          <Chip {...DEFAULT_THEME_SWATCH} />
          <span className="rt-swatch__name">پیش‌فرض</span>
        </button>

        {RESTAURANT_THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={isChecked(t)}
            className="rt-swatch"
            onClick={() => onChange(t.id)}
          >
            <Chip main={t.main} second={t.second} details={t.details} />
            <span className="rt-swatch__name">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}