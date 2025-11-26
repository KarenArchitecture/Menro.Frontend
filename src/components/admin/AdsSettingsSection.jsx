// src/components/admin/AdsSettingsSection.jsx
import { useState } from "react";

const AD_TYPES = [
  { key: "slider", label: "اسلایدر صفحه اصلی", icon: "fas fa-images" },
  { key: "banner", label: "بنر تمام صفحه", icon: "fas fa-ad" },
];

// پیش‌فرض‌ها برای هر نوع تبلیغ به صورت جداگانه
const DEFAULT_SETTINGS = {
  slider: {
    minDays: 1,
    maxDays: 30,
    minClicks: 1000,
    maxClicks: 50000,
    pricePerDay: 150000,
    pricePerClick: 10,
  },
  banner: {
    minDays: 1,
    maxDays: 30,
    minClicks: 1000,
    maxClicks: 50000,
    pricePerDay: 100000,
    pricePerClick: 8,
  },
};

export default function AdsSettingsSection() {
  const [adType, setAdType] = useState("slider");

  // تنظیمات جدا برای هر نوع
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [dayError, setDayError] = useState("");
  const [clickError, setClickError] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error" | null
  const [submitMessage, setSubmitMessage] = useState("");

  const current = settings[adType];

  const updateField = (field) => (e) => {
    const value = Number(e.target.value || 0);
    setSettings((prev) => ({
      ...prev,
      [adType]: {
        ...prev[adType],
        [field]: value,
      },
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    setDayError("");
    setClickError("");
    setSubmitStatus(null);
    setSubmitMessage("");

    const {
      minDays,
      maxDays,
      minClicks,
      maxClicks,
      pricePerDay,
      pricePerClick,
    } = current;

    let hasError = false;

    // days
    const dayMessages = [];
    if (minDays < 1) {
      dayMessages.push("حداقل روز نمی‌تواند کمتر از ۱ باشد.");
    }
    if (minDays > maxDays) {
      dayMessages.push("حداقل روز نمی‌تواند از حداکثر روز بیشتر باشد.");
    }
    if (dayMessages.length) {
      setDayError(dayMessages.join(" "));
      hasError = true;
    }

    // clicks
    const clickMessages = [];
    if (minClicks < 1000) {
      clickMessages.push("حداقل کلیک نمی‌تواند کمتر از ۱۰۰۰ باشد.");
    }
    if (minClicks > maxClicks) {
      clickMessages.push("حداقل کلیک نمی‌تواند از حداکثر کلیک بیشتر باشد.");
    }
    if (clickMessages.length) {
      setClickError(clickMessages.join(" "));
      hasError = true;
    }

    if (hasError) {
      setSubmitStatus("error");
      setSubmitMessage("لطفاً خطاهای مشخص‌شده را برطرف کنید.");
      return;
    }

    const payload = {
      adType,
      minDays,
      maxDays,
      minClicks,
      maxClicks,
      pricePerDay,
      pricePerClick,
    };

    // ✅ اینجا بک‌اند می‌تونه هوک بشه
    console.log("Ads settings submitted:", payload);
    console.log("All settings object:", settings);

    setSubmitStatus("success");
    setSubmitMessage("تنظیمات تبلیغات با موفقیت ثبت شد.");
  };

  const adTypeLabel =
    adType === "slider" ? "اسلایدر صفحه اصلی" : "بنر تمام صفحه";

  return (
    <div id="ads-settings-view">
      {/* همون ساختار صفحه رزرو: دو ستون، فرم کامل */}
      <form className="booking-layout" onSubmit={handleSave}>
        {/* Left: config (کپی استایل رزرو) */}
        <div className="booking-config">
          {/* Step 1: type */}
          <div className="config-step">
            <h4>۱. نوع تبلیغ را انتخاب کنید</h4>
            <div className="choice-grid">
              {AD_TYPES.map((t) => (
                <label key={t.key}>
                  <input
                    type="radio"
                    name="ad_type_settings"
                    value={t.key}
                    checked={adType === t.key}
                    onChange={() => setAdType(t.key)}
                  />
                  <div className="choice-card">
                    <i className={t.icon}></i>
                    <span>{t.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 2: days */}
          <div className="config-step">
            <h4>۲. حداقل و حداکثر رزرو بر اساس روز</h4>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="ad-settings-min-days">حداقل روز</label>
                <input
                  id="ad-settings-min-days"
                  name="minDays"
                  type="number"
                  min="1"
                  step="1"
                  value={current.minDays}
                  onChange={updateField("minDays")}
                />
              </div>
              <div className="input-group">
                <label htmlFor="ad-settings-max-days">حداکثر روز</label>
                <input
                  id="ad-settings-max-days"
                  name="maxDays"
                  type="number"
                  min="1"
                  step="1"
                  value={current.maxDays}
                  onChange={updateField("maxDays")}
                />
              </div>
            </div>
            {dayError && (
              <p className="field-message field-error">{dayError}</p>
            )}
          </div>

          {/* Step 3: clicks */}
          <div className="config-step">
            <h4>۳. حداقل و حداکثر رزرو بر اساس کلیک</h4>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="ad-settings-min-clicks">حداقل کلیک</label>
                <input
                  id="ad-settings-min-clicks"
                  name="minClicks"
                  type="number"
                  min="0"
                  step="100"
                  value={current.minClicks}
                  onChange={updateField("minClicks")}
                />
              </div>
              <div className="input-group">
                <label htmlFor="ad-settings-max-clicks">حداکثر کلیک</label>
                <input
                  id="ad-settings-max-clicks"
                  name="maxClicks"
                  type="number"
                  min="0"
                  step="100"
                  value={current.maxClicks}
                  onChange={updateField("maxClicks")}
                />
              </div>
            </div>
            {clickError && (
              <p className="field-message field-error">{clickError}</p>
            )}
          </div>

          {/* Step 4: prices */}
          <div className="config-step">
            <h4>۴. قیمت‌گذاری</h4>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="ad-settings-price-per-day">
                  قیمت هر روز (تومان)
                </label>
                <input
                  id="ad-settings-price-per-day"
                  name="pricePerDay"
                  type="number"
                  min="0"
                  step="1000"
                  value={current.pricePerDay}
                  onChange={updateField("pricePerDay")}
                />
              </div>
              <div className="input-group">
                <label htmlFor="ad-settings-price-per-click">
                  قیمت هر کلیک (تومان)
                </label>
                <input
                  id="ad-settings-price-per-click"
                  name="pricePerClick"
                  type="number"
                  min="0"
                  step="1"
                  value={current.pricePerClick}
                  onChange={updateField("pricePerClick")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: summary (کپی کانسپت پیش‌نمایش و خلاصه هزینه) */}
        <div className="booking-summary">
          <div className="panel">
            <h3>خلاصه تنظیمات</h3>
            <div className="cost-summary-details">
              <div className="detail-item">
                <span>نوع تبلیغ:</span>
                <strong id="summary-ad-type">{adTypeLabel}</strong>
              </div>

              <div className="detail-item">
                <span>محدوده روز:</span>
                <strong id="summary-days-range">
                  {current.minDays} تا {current.maxDays} روز
                </strong>
              </div>

              <div className="detail-item">
                <span>محدوده کلیک:</span>
                <strong id="summary-clicks-range">
                  {current.minClicks.toLocaleString("fa-IR")} تا{" "}
                  {current.maxClicks.toLocaleString("fa-IR")} کلیک
                </strong>
              </div>

              <div className="detail-item">
                <span>قیمت هر روز:</span>
                <strong id="summary-price-per-day">
                  {current.pricePerDay.toLocaleString("fa-IR")} تومان
                </strong>
              </div>

              <div className="detail-item">
                <span>قیمت هر کلیک:</span>
                <strong id="summary-price-per-click">
                  {current.pricePerClick.toLocaleString("fa-IR")} تومان
                </strong>
              </div>
            </div>

            {/* پیام کلی */}
            {submitMessage && (
              <p
                className={`field-message ${
                  submitStatus === "success" ? "field-success" : "field-error"
                }`}
                style={{ marginTop: 8 }}
              >
                {submitMessage}
              </p>
            )}

            {/* برای حفظ کانسپت، total-cost را برای نمایش خلاصه کل قیمت‌ها استفاده می‌کنیم */}
            <div className="total-cost" style={{ marginTop: 12 }}>
              <span>قیمت پایه (روز / کلیک):</span>
              <strong id="summary-total-cost">
                {current.pricePerDay.toLocaleString("fa-IR")} /{" "}
                {current.pricePerClick.toLocaleString("fa-IR")} تومان
              </strong>
            </div>

            <button
              id="ad-settings-submit"
              className="btn btn-primary full-width"
              type="submit"
              style={{ marginTop: 20 }}
            >
              ذخیره تنظیمات {adTypeLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
