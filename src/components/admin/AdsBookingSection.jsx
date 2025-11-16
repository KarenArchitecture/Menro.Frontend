// src/components/admin/AdsBookingSection.jsx
import { useMemo, useState, useRef } from "react";
import adminRestaurantAdAxios from "../../api/adminRestaurantAdAxios";

export default function AdsBookingSection() {
  const [adType, setAdType] = useState("slider");
  const [bookingMethod, setBookingMethod] = useState("by_day");
  const [days, setDays] = useState(7);
  const [clicks, setClicks] = useState(10000);
  const [link, setLink] = useState("");
  const [advertisementText, setadvertisementText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const totalCost = useMemo(() => {
    let base = adType === "slider" ? 150_000 : 100_000;
    return bookingMethod === "by_day" ? base * days : base + clicks * 10;
  }, [adType, bookingMethod, days, clicks]);
  const isValidUrl = (url) => {
    const pattern = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return pattern.test(url);
  };

  const handleSubmit = async () => {
    if (!link.trim()) {
      alert("لینک مرتبط نباید خالی باشد.");
      return;
    }

    const isValidUrl = (url) => {
      const pattern = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
      return pattern.test(url);
    };

    if (!isValidUrl(link)) {
      alert("لینک وارد شده معتبر نیست.");
      return;
    }

    if (!imageFile) {
      alert("لطفاً تصویر تبلیغ را آپلود کنید.");
      return;
    }

    try {
      // upload ad image
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await adminRestaurantAdAxios.post(
        "/upload-ad-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const fileName = uploadRes.data;
      console.log({ fileName });

      // build dto and post
      const dto = {
        placementType: adType === "slider" ? 1 : 2,
        billingType: bookingMethod === "by_day" ? 1 : 2,
        cost: totalCost,
        imageFileName: fileName,
        targetUrl: link,
        purchasedUnits: bookingMethod === "by_day" ? days : clicks,
        commercialText: advertisementText,
      };

      await adminRestaurantAdAxios.post("/addAd", dto);

      alert("تبلیغ با موفقیت ثبت شد!");

      // form reset
      setAdType("slider");
      setBookingMethod("by_day");
      setDays(7);
      setClicks(10000);
      setLink("");
      setadvertisementText("");
      fileInputRef.current.value = "";
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error(error);
      alert("خطایی در ثبت تبلیغ رخ داد.");
    }
  };

  return (
    <div className="booking-layout">
      {/* Left: config */}
      <div className="booking-config">
        {/* Step 1: type */}
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

        {/* Step 2: method */}
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
                <i className="fas fa-calendar-alt"></i>
                <span>بر حسب روز</span>
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

        {/* Step 3: sliders */}
        <div className="config-step">
          {bookingMethod === "by_day" ? (
            <div id="days-slider-group">
              <h4>۳. مدت زمان نمایش (روز)</h4>
              <div className="range-slider-group">
                <input
                  type="range"
                  id="days-slider"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                />
                <output id="days-output">{days}</output>
              </div>
            </div>
          ) : (
            <div id="clicks-slider-group">
              <h4>۳. تعداد کلیک مورد نظر</h4>
              <div className="range-slider-group">
                <input
                  type="range"
                  id="clicks-slider"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={clicks}
                  onChange={(e) => setClicks(Number(e.target.value))}
                />
                <output id="clicks-output">{clicks}</output>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: link */}
        <div className="config-step">
          <h4>۴. لینک مرتبط را مشخص کنید</h4>
          <div className="input-group">
            <input
              type="text"
              id="ad-link"
              placeholder="https://example.com"
              value={link}
              required
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <h4>متن نمایشی تبلیغات خود را وارد کنید</h4>
          <div className="input-group">
            <input
              type="text"
              id="ad-link"
              placeholder="رستوران ما بهترینه"
              value={advertisementText}
              required
              onChange={(e) => setadvertisementText(e.target.value)}
            />
          </div>
        </div>
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

                // پیش‌نمایش
                const reader = new FileReader();
                reader.onload = (ev) => setImagePreview(ev.target.result);
                reader.readAsDataURL(file);
              }}
            />
          </div>
        </div>
      </div>

      {/* Right: preview + summary */}
      <div className="booking-summary">
        <div className="panel">
          <h3>پیش‌نمایش زنده</h3>
          <div
            id="ad-preview"
            className={`ad-preview ${
              adType === "slider" ? "slider-preview" : "banner-preview"
            }`}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
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
              <strong id="summary-ad-type">
                {adType === "slider" ? "اسلایدر" : "بنر"}
              </strong>
            </div>
            <div className="detail-item">
              <span>روش پرداخت:</span>
              <strong id="summary-booking-method">
                {bookingMethod === "by_day" ? "بر حسب روز" : "بر حسب کلیک"}
              </strong>
            </div>

            {bookingMethod === "by_day" ? (
              <div className="detail-item" id="summary-duration-row">
                <span>مدت زمان:</span>
                <strong id="summary-duration">{days} روز</strong>
              </div>
            ) : (
              <div className="detail-item" id="summary-clicks-row">
                <span>تعداد کلیک:</span>
                <strong id="summary-clicks">{clicks} کلیک</strong>
              </div>
            )}
          </div>

          <hr className="form-divider" />

          <div className="total-cost">
            <span>هزینه تخمینی:</span>
            <strong id="summary-total-cost">
              {totalCost.toLocaleString("fa-IR")} تومان
            </strong>
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
