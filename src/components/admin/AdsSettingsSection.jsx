// src/components/admin/AdsSettingsSection.jsx
import { useState } from "react";

export default function AdsSettingsSection() {
  const [dayError, setDayError] = useState("");
  const [clickError, setClickError] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error" | null
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSave = (event) => {
    event.preventDefault();
    const form = event.target;

    const minDays = Number(form.minDays.value);
    const maxDays = Number(form.maxDays.value);
    const minClicks = Number(form.minClicks.value);
    const maxClicks = Number(form.maxClicks.value);
    const pricePerDay = Number(form.pricePerDay.value);
    const pricePerClick = Number(form.pricePerClick.value);

    // reset messages
    setDayError("");
    setClickError("");
    setSubmitStatus(null);
    setSubmitMessage("");

    let hasError = false;

    // --- days validation ---
    const dayMessages = [];
    if (minDays < 1) {
      dayMessages.push("حداقل روز نمی‌تواند کمتر از ۱ باشد.");
    }
    if (minDays > maxDays) {
      dayMessages.push("حداقل روز نمی‌تواند از حداکثر روز بیشتر باشد.");
    }
    if (dayMessages.length > 0) {
      setDayError(dayMessages.join(" "));
      hasError = true;
    }

    // --- clicks validation ---
    const clickMessages = [];
    if (minClicks < 1000) {
      clickMessages.push("حداقل کلیک نمی‌تواند کمتر از ۱۰۰۰ باشد.");
    }
    if (minClicks > maxClicks) {
      clickMessages.push("حداقل کلیک نمی‌تواند از حداکثر کلیک بیشتر باشد.");
    }
    if (clickMessages.length > 0) {
      setClickError(clickMessages.join(" "));
      hasError = true;
    }

    if (hasError) {
      setSubmitStatus("error");
      setSubmitMessage("لطفاً خطاهای مشخص‌شده را برطرف کنید.");
      return;
    }

    const payload = {
      minDays,
      maxDays,
      minClicks,
      maxClicks,
      pricePerDay,
      pricePerClick,
    };

    console.log("Ads settings submitted:", payload);

    setSubmitStatus("success");
    setSubmitMessage("تنظیمات تبلیغات با موفقیت ثبت شد.");
  };

  return (
    <div id="ads-settings-view">
      <div className="panel">
        <h2 className="panel-title">تنظیمات قیمت‌گذاری تبلیغات</h2>

        <form onSubmit={handleSave}>
          {/* 1. days */}
          <div className="config-step">
            <h4>۱. حداقل و حداکثر رزرو بر اساس روز</h4>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="ad-settings-min-days">حداقل روز</label>
                <input
                  id="ad-settings-min-days"
                  name="minDays"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue="1"
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
                  defaultValue="30"
                />
              </div>
            </div>
            {dayError && (
              <p className="field-message field-error">{dayError}</p>
            )}
          </div>

          {/* 2. clicks */}
          <div className="config-step">
            <h4>۲. حداقل و حداکثر رزرو بر اساس کلیک</h4>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="ad-settings-min-clicks">حداقل کلیک</label>
                <input
                  id="ad-settings-min-clicks"
                  name="minClicks"
                  type="number"
                  min="0"
                  step="100"
                  defaultValue="1000"
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
                  defaultValue="50000"
                />
              </div>
            </div>
            {clickError && (
              <p className="field-message field-error">{clickError}</p>
            )}
          </div>

          {/* 3. prices */}
          <div className="config-step">
            <h4>۳. قیمت‌گذاری</h4>
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
                  defaultValue="150000"
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
                  defaultValue="10"
                />
              </div>
            </div>
          </div>

          {/* submit + global message */}
          <div className="config-step">
            {submitMessage && (
              <p
                className={`field-message ${
                  submitStatus === "success" ? "field-success" : "field-error"
                }`}
              >
                {submitMessage}
              </p>
            )}

            <button
              id="ad-settings-submit"
              className="btn btn-primary full-width"
              type="submit"
            >
              ذخیره تنظیمات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
