// src/components/admin/AdsSettingsSection.jsx
import { useEffect, useState } from "react";
import adSettingsAxios from "../../api/adSettingsAxios";

const AD_TYPES = [
  { key: "slider", label: "اسلایدر صفحه اصلی", icon: "fas fa-images" },
  { key: "banner", label: "بنر تمام صفحه", icon: "fas fa-ad" },
];

// UI defaults
const DEFAULT_SETTINGS = {
  slider: {
    perDayId: null,
    perClickId: null,

    minDays: 1,
    maxDays: 30,
    minClicks: 1000,
    maxClicks: 50000,
    pricePerDay: 0,
    pricePerClick: 0,
  },

  banner: {
    perDayId: null,
    perClickId: null,

    minDays: 1,
    maxDays: 30,
    minClicks: 1000,
    maxClicks: 50000,
    pricePerDay: 0,
    pricePerClick: 0,
  },
};

export default function AdsSettingsSection() {
  const [adType, setAdType] = useState("slider");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [dayError, setDayError] = useState("");
  const [clickError, setClickError] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");

  const current = settings[adType];

  // fetch settings
  async function loadSettingsFromServer(typeKey) {
    const placement = typeKey === "slider" ? 1 : 2; // Enums

    try {
      const response = await adSettingsAxios.get("", { params: { placement } });
      const list = response.data;

      if (!Array.isArray(list) || list.length === 0) {
        console.warn("No settings found for this placement.");
        return;
      }

      const perDay = list.find((x) => x.billingType === 1);
      const perClick = list.find((x) => x.billingType === 2);

      setSettings((prev) => ({
        ...prev,
        [typeKey]: {
          perDayId: perDay?.id ?? null,
          perClickId: perClick?.id ?? null,

          minDays: perDay?.minUnits ?? 1,
          maxDays: perDay?.maxUnits ?? 30,

          minClicks: perClick?.minUnits ?? 1000,
          maxClicks: perClick?.maxUnits ?? 50000,

          pricePerDay: perDay?.unitPrice ?? 0,
          pricePerClick: perClick?.unitPrice ?? 0,
        },
      }));
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  }

  useEffect(() => {
    loadSettingsFromServer(adType);
  }, [adType]);

  // تبدیل UI → DTO برای POST
  function convertUiToDtos(adTypeKey, ui) {
    const placementType = adTypeKey === "slider" ? 1 : 2;

    return [
      {
        id: ui.perDayId || null,
        placementType,
        billingType: 1, // PerDay
        minUnits: ui.minDays,
        maxUnits: ui.maxDays,
        unitPrice: ui.pricePerDay,
        isActive: true,
      },
      {
        id: ui.perClickId || null,
        placementType,
        billingType: 2, // PerClick
        minUnits: ui.minClicks,
        maxUnits: ui.maxClicks,
        unitPrice: ui.pricePerClick,
        isActive: true,
      },
    ];
  }

  // تغییر فیلدهای فرم
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

  // Save
  async function handleSave(e) {
    e.preventDefault();
    setDayError("");
    setClickError("");
    setSubmitStatus(null);
    setSubmitMessage("");

    const { minDays, maxDays, minClicks, maxClicks } = current;
    let hasError = false;

    if (minDays < 1 || minDays > maxDays) {
      setDayError("حداقل روز باید معتبر باشد.");
      hasError = true;
    }
    if (minClicks < 1000 || minClicks > maxClicks) {
      setClickError("حداقل کلیک باید معتبر باشد.");
      hasError = true;
    }

    if (hasError) {
      setSubmitStatus("error");
      setSubmitMessage("لطفاً خطاهای مشخص‌شده را برطرف کنید.");
      return;
    }

    const dtos = convertUiToDtos(adType, current);

    try {
      await adSettingsAxios.post("", dtos);
      setSubmitStatus("success");
      setSubmitMessage("تنظیمات با موفقیت ذخیره شد");
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
      setSubmitMessage("خطا در ذخیره تنظیمات");
    }
  }

  const adTypeLabel =
    adType === "slider" ? "اسلایدر صفحه اصلی" : "بنر تمام صفحه";

  // UI — بدون تغییر ساختار
  return (
    <div id="ads-settings-view">
      <form className="booking-layout" onSubmit={handleSave}>
        {/* Left side */}
        <div className="booking-config">
          {/* Step 1 */}
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

          {/* Step 2: Days */}
          <div className="config-step">
            <h4>۲. حداقل و حداکثر رزرو بر اساس روز</h4>
            <div className="input-row">
              <div className="input-group">
                <label>حداقل روز</label>
                <input
                  type="number"
                  min="1"
                  value={current.minDays}
                  onChange={updateField("minDays")}
                />
              </div>
              <div className="input-group">
                <label>حداکثر روز</label>
                <input
                  type="number"
                  min="1"
                  value={current.maxDays}
                  onChange={updateField("maxDays")}
                />
              </div>
            </div>
            {dayError && (
              <p className="field-message field-error">{dayError}</p>
            )}
          </div>

          {/* Step 3: Clicks */}
          <div className="config-step">
            <h4>۳. حداقل و حداکثر رزرو بر اساس کلیک</h4>
            <div className="input-row">
              <div className="input-group">
                <label>حداقل کلیک</label>
                <input
                  type="number"
                  min="0"
                  value={current.minClicks}
                  onChange={updateField("minClicks")}
                />
              </div>
              <div className="input-group">
                <label>حداکثر کلیک</label>
                <input
                  type="number"
                  min="0"
                  value={current.maxClicks}
                  onChange={updateField("maxClicks")}
                />
              </div>
            </div>
            {clickError && (
              <p className="field-message field-error">{clickError}</p>
            )}
          </div>

          {/* Step 4: Prices */}
          <div className="config-step">
            <h4>۴. قیمت‌گذاری</h4>
            <div className="input-row">
              <div className="input-group">
                <label>قیمت هر روز (تومان)</label>
                <input
                  type="number"
                  min="0"
                  value={current.pricePerDay}
                  onChange={updateField("pricePerDay")}
                />
              </div>
              <div className="input-group">
                <label>قیمت هر کلیک (تومان)</label>
                <input
                  type="number"
                  min="0"
                  value={current.pricePerClick}
                  onChange={updateField("pricePerClick")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="booking-summary">
          <div className="panel">
            <h3>خلاصه تنظیمات</h3>
            <div className="cost-summary-details">
              <div className="detail-item">
                <span>نوع تبلیغ:</span>
                <strong>{adTypeLabel}</strong>
              </div>

              <div className="detail-item">
                <span>محدوده روز:</span>
                <strong>
                  {current.minDays} تا {current.maxDays} روز
                </strong>
              </div>

              <div className="detail-item">
                <span>محدوده کلیک:</span>
                <strong>
                  {current.minClicks.toLocaleString("fa-IR")} تا{" "}
                  {current.maxClicks.toLocaleString("fa-IR")} کلیک
                </strong>
              </div>

              <div className="detail-item">
                <span>قیمت هر روز:</span>
                <strong>
                  {current.pricePerDay.toLocaleString("fa-IR")} تومان
                </strong>
              </div>

              <div className="detail-item">
                <span>قیمت هر کلیک:</span>
                <strong>
                  {current.pricePerClick.toLocaleString("fa-IR")} تومان
                </strong>
              </div>
            </div>

            {submitMessage && (
              <p
                className={`field-message ${
                  submitStatus === "success" ? "field-success" : "field-error"
                }`}
              >
                {submitMessage}
              </p>
            )}

            <div className="total-cost">
              <span>قیمت پایه (روز / کلیک):</span>
              <strong>
                {current.pricePerDay.toLocaleString("fa-IR")} /{" "}
                {current.pricePerClick.toLocaleString("fa-IR")} تومان
              </strong>
            </div>

            <button className="btn btn-primary full-width" type="submit">
              ذخیره تنظیمات {adTypeLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
