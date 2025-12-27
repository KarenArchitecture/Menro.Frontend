// src/components/admin/AdsBookingSection.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import adminRestaurantAdAxios from "../../api/adminRestaurantAdAxios";
import adSettingsAxios from "../../api/adSettingsAxios";

export default function AdsBookingSection() {
  const [adType, setAdType] = useState("slider"); // slider | banner
  const [bookingMethod, setBookingMethod] = useState("by_day"); // by_day | by_click

  // مقدارهای UI
  const [days, setDays] = useState(7); // for slider: days | for banner: views (units for billingType=1)
  const [clicks, setClicks] = useState(10000);
  const [link, setLink] = useState("");
  const [advertisementText, setAdvertisementText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // نرخ‌ها و محدودیت‌ها (از بک‌اند)
  const [pricing, setPricing] = useState({
    minDays: 1, // for banner: minViews (billingType=1)
    maxDays: 30, // for banner: maxViews (billingType=1)
    pricePerDay: 0, // for banner: pricePerView (billingType=1)

    minClicks: 1000,
    maxClicks: 50000,
    pricePerClick: 0,
  });

  const isBanner = adType === "banner";

  // Labels for billingType=1 based on placement
  const unit1Label = isBanner ? "بازدید" : "روز";
  const unit1MethodLabel = isBanner ? "بر حسب بازدید" : "بر حسب روز";
  const unit1SummaryLabel = isBanner ? "بر اساس بازدید" : "بر اساس روز";
  const unit1TitleLabel = isBanner
    ? "تعداد بازدید مورد نظر"
    : "مدت زمان نمایش (روز)";
  const unit1Icon = isBanner ? "fas fa-eye" : "fas fa-calendar-alt";

  // --- Load Pricing from API ---
  async function loadPricing(typeKey) {
    const placement = typeKey === "slider" ? 1 : 2;

    try {
      const res = await adSettingsAxios.get("", { params: { placement } });
      const list = res.data;

      const unit1BillingType = typeKey === "slider" ? 1 : 3; // slider=PerDay, banner=PerView
      const unit1 = list.find((x) => x.billingType === unit1BillingType);
      const perClick = list.find((x) => x.billingType === 2);

      setPricing({
        minDays: unit1?.minUnits ?? 1,
        maxDays: unit1?.maxUnits ?? 30,
        pricePerDay: unit1?.unitPrice ?? 0,

        minClicks: perClick?.minUnits ?? 1000,
        maxClicks: perClick?.maxUnits ?? 50000,
        pricePerClick: perClick?.unitPrice ?? 0,
      });

      // اسلایدرها را با حداقل مقدار تنظیم می‌کنیم
      setDays(perDay?.minUnits ?? 1);
      setClicks(perClick?.minUnits ?? 1000);
    } catch (err) {
      console.error("خطا در لود نرخ تبلیغات:", err);
    }
  }

  // Load pricing when adType changes
  useEffect(() => {
    loadPricing(adType);
  }, [adType]);

  // --- قیمت نهایی ---
  const totalCost = useMemo(() => {
    if (bookingMethod === "by_day") {
      // Slider: price per day * days
      // Banner: price per view * views (stored in days state)
      return pricing.pricePerDay * days;
    } else {
      return pricing.pricePerClick * clicks;
    }
  }, [pricing, bookingMethod, days, clicks]);

  // --- Validate URL ---
  const isValidUrl = (url) => {
    const pattern = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return pattern.test(url);
  };

  // --- Submit Handler ---
  const handleSubmit = async () => {
    if (!link.trim()) return alert("لینک نباید خالی باشد.");
    if (!isValidUrl(link)) return alert("لینک معتبر نیست.");
    if (!imageFile) return alert("لطفاً تصویر تبلیغ را آپلود کنید.");

    try {
      // 1) Upload Image
      const fd = new FormData();
      fd.append("file", imageFile);

      const uploadRes = await adminRestaurantAdAxios.post(
        "/upload-ad-image",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const fileName = uploadRes.data;

      // 2) Placement + Billing (NEW LOGIC)
      const placementType = adType === "slider" ? 1 : 2;

      const billingType =
        bookingMethod === "by_click"
          ? 2 // PerClick
          : placementType === 1
          ? 1 // Slider -> PerDay
          : 3; // Banner -> PerView

      const purchasedUnits = bookingMethod === "by_click" ? clicks : days;

      // 3) Create DTO
      const dto = {
        placementType,
        billingType,
        cost: totalCost,
        imageFileName: fileName,
        targetUrl: link,
        commercialText: advertisementText,
        purchasedUnits,
      };

      // 4) Submit Ad
      await adminRestaurantAdAxios.post("/addAd", dto);

      alert("تبلیغ با موفقیت ثبت شد!");

      // Reset Form
      setAdType("slider");
      setBookingMethod("by_day");
      setDays(pricing.minDays);
      setClicks(pricing.minClicks);
      setLink("");
      setAdvertisementText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      alert("خطایی رخ داد.");
    }
  };

  // ----------------- UI -----------------
  return (
    <div className="booking-layout">
      {/* Left Panel */}
      <div className="booking-config">
        {/* Step 1 */}
        <div className="config-step">
          <h4>۱. نوع تبلیغ را انتخاب کنید</h4>
          <div className="choice-grid">
            <label>
              <input
                type="radio"
                name="ad_type"
                value="slider"
                checked={adType === "slider"}
                onChange={() => setAdType("slider")}
              />
              <div className="choice-card">
                <i className="fas fa-images"></i>
                <span>اسلایدر صفحه اصلی</span>
              </div>
            </label>

            <label>
              <input
                type="radio"
                name="ad_type"
                value="banner"
                checked={adType === "banner"}
                onChange={() => setAdType("banner")}
              />
              <div className="choice-card">
                <i className="fas fa-ad"></i>
                <span>بنر تمام صفحه</span>
              </div>
            </label>
          </div>
        </div>

        {/* Step 2 */}
        <div className="config-step">
          <h4>۲. روش پرداخت را انتخاب کنید</h4>
          <div className="choice-grid">
            <label>
              <input
                type="radio"
                name="booking_method"
                value="by_day"
                checked={bookingMethod === "by_day"}
                onChange={() => setBookingMethod("by_day")}
              />
              <div className="choice-card">
                <i className={unit1Icon}></i>

                {/* ✅ New behavior: banner shows "بر حسب بازدید" */}
                <span>{unit1MethodLabel}</span>

                {/* ❌ Old (kept): always "بر حسب روز" */}
                {/*
                <span>بر حسب روز</span>
                */}
              </div>
            </label>

            <label>
              <input
                type="radio"
                name="booking_method"
                value="by_click"
                checked={bookingMethod === "by_click"}
                onChange={() => setBookingMethod("by_click")}
              />
              <div className="choice-card">
                <i className="fas fa-mouse-pointer"></i>
                <span>بر حسب کلیک</span>
              </div>
            </label>
          </div>
        </div>

        {/* Step 3 */}
        <div className="config-step">
          {bookingMethod === "by_day" ? (
            <div id="days-slider-group">
              {/* ✅ New: banner uses views */}
              <h4>۳. {unit1TitleLabel}</h4>

              {/* Old: always days */}
              {/*
              <h4>۳. مدت زمان نمایش (روز)</h4>
              */}

              <div className="range-slider-group">
                <input
                  type="range"
                  min={pricing.minDays}
                  max={pricing.maxDays}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  // ✅ New: banner views can step bigger (optional)
                  step={isBanner ? 1000 : 1}
                />
                {/* ✅ New: show fa-IR formatting, and works for both */}
                <output>{days.toLocaleString("fa-IR")}</output>

                {/* Old: plain output */}
                {/*
                <output>{days}</output>
                */}
              </div>
            </div>
          ) : (
            <div id="clicks-slider-group">
              <h4>۳. تعداد کلیک مورد نظر</h4>
              <div className="range-slider-group">
                <input
                  type="range"
                  min={pricing.minClicks}
                  max={pricing.maxClicks}
                  step="1000"
                  value={clicks}
                  onChange={(e) => setClicks(Number(e.target.value))}
                />
                <output>{clicks.toLocaleString("fa-IR")}</output>

                {/* Old: plain output */}
                {/*
                <output>{clicks}</output>
                */}
              </div>
            </div>
          )}
        </div>

        {/* Step 4 */}
        <div className="config-step">
          <h4>۴. لینک مرتبط را مشخص کنید</h4>
          <div className="input-group">
            <input
              type="text"
              placeholder="https://example.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <h4>متن نمایشی تبلیغاتی</h4>
          <div className="input-group">
            <input
              type="text"
              placeholder="مثال: رستوران ما بهترینه"
              value={advertisementText}
              onChange={(e) => setAdvertisementText(e.target.value)}
            />
          </div>
        </div>

        {/* Step 5 */}
        <div className="config-step">
          <h4>۵. تصویر تبلیغ را آپلود کنید</h4>
          <div className="input-group">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                setImageFile(file);

                const reader = new FileReader();
                reader.onload = (ev) => setImagePreview(ev.target.result);
                reader.readAsDataURL(file);
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="booking-summary">
        <div className="panel">
          <h3>پیش‌نمایش زنده</h3>

          <div
            className={`ad-preview ${
              adType === "slider" ? "slider-preview" : "banner-preview"
            }`}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span>تصویر تبلیغ شما در اینجا نمایش داده می‌شود</span>
            )}
          </div>
        </div>

        <div className="panel">
          <h3>خلاصه هزینه</h3>

          <div className="cost-summary-details">
            <div className="detail-item">
              <span>نوع تبلیغ:</span>
              <strong>{adType === "slider" ? "اسلایدر" : "بنر"}</strong>
            </div>

            <div className="detail-item">
              <span>روش پرداخت:</span>

              {/* ✅ New: banner shows based on views */}
              <strong>
                {bookingMethod === "by_day"
                  ? unit1SummaryLabel
                  : "بر اساس کلیک"}
              </strong>

              {/* Old: always day */}
              {/*
              <strong>
                {bookingMethod === "by_day" ? "بر اساس روز" : "بر اساس کلیک"}
              </strong>
              */}
            </div>

            {bookingMethod === "by_day" ? (
              <div className="detail-item">
                {/* ✅ New */}
                <span>{isBanner ? "تعداد بازدید:" : "مدت زمان:"}</span>
                <strong>
                  {days.toLocaleString("fa-IR")} {unit1Label}
                </strong>

                {/* Old */}
                {/*
                <span>مدت زمان:</span>
                <strong>{days} روز</strong>
                */}
              </div>
            ) : (
              <div className="detail-item">
                <span>تعداد کلیک:</span>
                <strong>{clicks.toLocaleString("fa-IR")} کلیک</strong>

                {/*Old */}
                {/*
                <strong>{clicks} کلیک</strong>
                */}
              </div>
            )}
          </div>

          <hr className="form-divider" />

          <div className="total-cost">
            <span>هزینه:</span>
            <strong>{totalCost.toLocaleString("fa-IR")} تومان</strong>
          </div>

          <button
            className="btn btn-primary full-width"
            style={{ marginTop: 20 }}
            onClick={handleSubmit}
          >
            ثبت و پرداخت
          </button>
        </div>
      </div>
    </div>
  );
}
// ----------------- END OF COMPONENT -----------------
