//RestaurantProfileSection.jsx
import { useState, useEffect, useRef } from "react";
import {
  getRestaurantProfile,
  updateRestaurantProfile,
  checkSlugAvailability,
} from "../../api/ownerRestaurant";
import restaurantAxios from "../../api/restaurantAxios";
import "../../assets/css/admin/restaurantProfileSection.css";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function RestaurantProfileSection() {
  useDocumentTitle("پروفایل رستوران");
  const { notify } = useGlobalUI();
  const [submitting, setSubmitting] = useState(false);
  // basic fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState(null); // null | true | false
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [type, setType] = useState(""); // select
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [shebaNumber, setShebaNumber] = useState("");
  const [description, setDescription] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

  // categories list
  const [categories, setCategories] = useState([]);
  const getRestaurantCategories = () => restaurantAxios.get("/categories");

  // images + previews
  const [homeBannerFile, setHomeBannerFile] = useState(null);
  const [homeBannerPreview, setHomeBannerPreview] = useState(null);

  const [shopBannerFile, setShopBannerFile] = useState(null);
  const [shopBannerPreview, setShopBannerPreview] = useState(null);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const homeBannerInputRef = useRef(null);
  const shopBannerInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // subscription info (اکنون واقعاً state، نه مقدار ثابت)
  const [subscriptionType, setSubscriptionType] = useState("نامشخص");
  const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState(0);

  // restaurant approval status (فقط نمایشی؛ توسط ادمین تغییر می‌کند)
  const [restaurantStatus, setRestaurantStatus] = useState(null);
  const [rejectReason, setRejectReason] = useState(null);

  // --------------------------------------------
  // Load categories + restaurant profile together
  // --------------------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        // load categories
        const catRes = await getRestaurantCategories();
        setCategories(catRes.data);

        // load profile
        const profileRes = await getRestaurantProfile();
        const d = profileRes.data;

        // fill basic fields
        setName(d.name);
        setSlug(d.slug || "");
        setOriginalSlug(d.slug || "");
        setType(String(d.restaurantCategoryId)); // important
        setAddress(d.address);
        setPhone(d.phoneNumber);
        setBankAccount(d.bankAccountNumber);
        setNationalCode(d.nationalCode || "");
        setShebaNumber(d.shebaNumber || "");
        setDescription(d.description);
        setOpenTime(d.openTime);
        setCloseTime(d.closeTime);

        // images (بک‌اند حالا URL کامل برمی‌گردونه)
        if (d.bannerImageUrl) setHomeBannerPreview(d.bannerImageUrl);
        if (d.shopBannerImageUrl) setShopBannerPreview(d.shopBannerImageUrl);
        if (d.logoImageUrl) setLogoPreview(d.logoImageUrl);

        // subscription
        setSubscriptionType(d.subscriptionType || "نامشخص");
        setSubscriptionDaysLeft(d.subscriptionDaysLeft ?? 0);

        // approval status (اختیاری؛ اگر بک‌اند نفرستد چیزی نمایش داده نمی‌شود)
        setRestaurantStatus(d.status || null);
        setRejectReason(d.rejectReason || null);
      } catch (err) {
        console.error("Failed to load profile or categories", err);
        notify({
          type: "error",
          message: "دریافت اطلاعات رستوران با خطا مواجه شد",
        });
      }
    }

    loadData();
  }, []);
  // handling remove restaurant images
  const handleRemoveHomeBanner = () => {
    setHomeBannerFile(null);
    setHomeBannerPreview(null);
    if (homeBannerInputRef.current) homeBannerInputRef.current.value = "";
  };

  const handleRemoveShopBanner = () => {
    setShopBannerFile(null);
    setShopBannerPreview(null);
    if (shopBannerInputRef.current) shopBannerInputRef.current.value = "";
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // --------------------------------------------
  // Slug handling
  // --------------------------------------------
  const sanitizeSlug = (value) =>
    value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

  const handleSlugChange = (e) => {
    setSlug(sanitizeSlug(e.target.value));
    setSlugAvailable(null); // با هر تغییر، نتیجه‌ی چک قبلی دیگر معتبر نیست
  };

  const handleCheckSlug = async () => {
    const trimmed = slug.trim();
    if (!trimmed) {
      notify({ type: "warning", message: "ابتدا یک اسلاگ وارد کنید." });
      return;
    }

    // اگر همون اسلاگ فعلی رستوران هست، نیازی به چک نیست
    if (trimmed === originalSlug) {
      setSlugAvailable(true);
      return;
    }

    setCheckingSlug(true);
    try {
      const res = await checkSlugAvailability(trimmed);
      setSlugAvailable(Boolean(res.data?.available));
    } catch (err) {
      console.error("Slug check failed:", err);
      notify({
        type: "error",
        message: "بررسی در دسترس بودن اسلاگ با خطا مواجه شد",
      });
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedSlug = slug.trim();

    // بررسی خاموش اسلاگ - فقط در صورت تکراری بودن state تغییر می‌کند
    if (trimmedSlug && trimmedSlug !== originalSlug) {
      setSubmitting(true);
      try {
        const slugRes = await checkSlugAvailability(trimmedSlug);
        const available = Boolean(slugRes.data?.available);
        if (!available) {
          setSlugAvailable(false); // فقط در خطا نمایش داده شود
          setSubmitting(false);
          return;
        }
        // available === true → عمداً setSlugAvailable صدا زده نمی‌شود تا فلش نزند
      } catch (err) {
        console.error("Slug check failed:", err);
        setSubmitting(false);
        notify({
          type: "error",
          message: "بررسی در دسترس بودن اسلاگ با خطا مواجه شد",
        });
        return;
      }
    }

    try {
      const formData = new FormData();

      // required text fields
      formData.append("Name", name);
      formData.append("Slug", trimmedSlug);
      formData.append("RestaurantCategoryId", type);
      formData.append("Address", address);
      formData.append("Description", description);
      formData.append("PhoneNumber", phone);
      formData.append("BankAccountNumber", bankAccount);
      formData.append("NationalCode", nationalCode);
      formData.append("ShebaNumber", shebaNumber);
      formData.append("OpenTime", openTime);
      formData.append("CloseTime", closeTime);

      // files (optional)
      if (homeBannerFile) {
        formData.append("HomeBanner", homeBannerFile);
      } else if (!homeBannerPreview) {
        formData.append("RemoveHomeBanner", "true");
      }

      if (shopBannerFile) {
        formData.append("ShopBanner", shopBannerFile);
      } else if (!shopBannerPreview) {
        formData.append("RemoveShopBanner", "true");
      }

      if (logoFile) {
        formData.append("Logo", logoFile);
      } else if (!logoPreview) {
        formData.append("RemoveLogo", "true");
      }

      const res = await updateRestaurantProfile(formData);

      console.log("Updated:", res.data);
      if (trimmedSlug) {
        setOriginalSlug(trimmedSlug);
        // اینجا هم دیگه لازم نیست setSlugAvailable(true) کنیم، چون فیلد دیگه دِرتی نیست
        // (slug === originalSlug شده و اون پیام‌ها اصلاً رندر نمی‌شن)
      }
      notify({ type: "success", message: "پروفایل با موفقیت بروزرسانی شد" });
    } catch (err) {
      console.error("Update failed:", err);
      notify({ type: "error", message: "خطا در بروزرسانی پروفایل رستوران" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel restaurant-profile-panel">
      <div className="view-header">
        <h3>
          <i className="fa-solid fa-store" /> مدیریت رستوران
        </h3>

        {restaurantStatus && (
          <span
            className={`status-pill restaurant-status-pill restaurant-status-pill--${restaurantStatus.toLowerCase()}`}
          >
            {restaurantStatus === "Approved" && "تایید شده"}
            {restaurantStatus === "Pending" && "در انتظار تایید"}
            {restaurantStatus === "Rejected" && "رد شده"}
            {!["Approved", "Pending", "Rejected"].includes(restaurantStatus) &&
              restaurantStatus}
          </span>
        )}
      </div>

      {restaurantStatus === "Rejected" && rejectReason && (
        <div className="restaurant-reject-banner">
          <i className="fa-solid fa-circle-info" /> دلیل رد رستوران:{" "}
          {rejectReason}
        </div>
      )}

      {/* Subscription box */}
      <div className="subscription-box">
        <div className="subscription-box__title">
          <i className="fa-solid fa-crown" /> اشتراک رستوران
        </div>
        <div className="subscription-box__row">
          <span>نوع اشتراک:</span>
          <strong id="restaurant-subscription-type">
            {subscriptionType || "نامشخص"}
          </strong>
        </div>
        <div className="subscription-box__row">
          <span>روز باقی‌مانده:</span>
          <strong id="restaurant-subscription-days-left">
            {subscriptionDaysLeft} روز
          </strong>
        </div>
        <div className="subscription-box__hint">
          برای تمدید یا ارتقای اشتراک، به بخش مالی یا پشتیبانی منرو مراجعه کنید.
        </div>
      </div>

      <form
        id="restaurant-profile-form"
        className="restaurant-profile-form"
        onSubmit={handleSubmit}
      >
        {/* Restaurant basic info */}
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="restaurant-name">نام رستوران</label>
            <input
              id="restaurant-name"
              name="restaurantName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="restaurant-type">نوع رستوران</label>
            <select
              id="restaurant-type"
              name="restaurantType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">انتخاب کنید...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Slug */}
        <div className="input-group">
          <label htmlFor="restaurant-slug">
            آدرس اختصاصی (Slug)
            <span className="slug-label-hint">
              — اختیاری، اگر خالی بماند اسلاگ فعلی حفظ می‌شود
            </span>
          </label>
          <div className="slug-input-group">
            <span className="slug-prefix">menro.ir/restaurant/</span>
            <input
              id="restaurant-slug"
              name="restaurantSlug"
              type="text"
              dir="ltr"
              value={slug}
              onChange={handleSlugChange}
              placeholder={originalSlug || "my-restaurant"}
              className="slug-input"
            />
            <button
              type="button"
              className="slug-check-btn"
              onClick={handleCheckSlug}
              disabled={checkingSlug || !slug.trim()}
            >
              {checkingSlug ? (
                <i className="fa-solid fa-spinner fa-spin" />
              ) : (
                "بررسی"
              )}
            </button>
          </div>

          {slugAvailable === true && slug.trim() !== originalSlug && (
            <div className="slug-status slug-status--ok">
              <i className="fa-solid fa-circle-check" /> این اسلاگ در دسترس است
            </div>
          )}
          {slugAvailable === false && (
            <div className="slug-status slug-status--taken">
              <i className="fa-solid fa-circle-xmark" /> این اسلاگ قبلاً استفاده
              شده است
            </div>
          )}
        </div>

        {/* Address */}
        <div className="input-group">
          <label htmlFor="restaurant-address">آدرس</label>
          <input
            id="restaurant-address"
            name="restaurantAddress"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        {/* Phone */}
        <div className="input-group">
          <label htmlFor="restaurant-phone">شماره تماس رستوران</label>
          <input
            id="restaurant-phone"
            name="restaurantPhone"
            type="tel"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="مثال: 09123456789"
            required
          />
        </div>

        {/* Description */}
        <div className="input-group">
          <label htmlFor="restaurant-description">توضیحات رستوران</label>
          <textarea
            id="restaurant-description"
            name="restaurantDescription"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثلاً نوع فضا، سبک سرویس، مزیت رقابتی، معرفی کوتاه..."
          />
        </div>

        {/* Working hours */}
        <div className="form-grid hours-row">
          <div className="input-group">
            <label htmlFor="restaurant-open-time">ساعت آغاز فعالیت</label>
            <input
              id="restaurant-open-time"
              name="restaurantOpenTime"
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="restaurant-close-time">ساعت پایان فعالیت</label>
            <input
              id="restaurant-close-time"
              name="restaurantCloseTime"
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              required
            />
          </div>
        </div>

        <hr style={{ border: "1px solid #444", margin: "20px 0" }} />

        {/* Owner financial info */}
        <div className="owner-details-heading">
          <i className="fa-solid fa-id-card" />
          <span>اطلاعات تکمیلی صاحب رستوران</span>
        </div>

        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="restaurant-national-code">کد ملی</label>
            <input
              id="restaurant-national-code"
              name="restaurantNationalCode"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={nationalCode}
              onChange={(e) =>
                setNationalCode(e.target.value.replace(/\D/g, ""))
              }
              placeholder="مثال: 0012345678"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="restaurant-bank-account">شماره حساب بانکی</label>
            <input
              id="restaurant-bank-account"
              name="restaurantBankAccount"
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="شماره حساب بانکی خود را وارد کنید"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="restaurant-sheba">شماره شبا (اختیاری)</label>
          <div className="sheba-input-group">
            <input
              id="restaurant-sheba"
              name="restaurantSheba"
              type="text"
              inputMode="numeric"
              maxLength={24}
              value={shebaNumber}
              onChange={(e) =>
                setShebaNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder="۲۴ رقم، بدون IR"
              className="sheba-input"
            />
            <span className="sheba-prefix">IR</span>
          </div>
        </div>

        <hr style={{ border: "1px solid #444", margin: "20px 0" }} />

        {/* Images */}
        <div className="images-grid">
          {/* Home banner */}
          <div className="image-field">
            <label>عکس بنر صفحه خانه رستوران</label>

            <div className="restaurant-profile-image-frame">
              {homeBannerPreview ? (
                <img
                  src={homeBannerPreview}
                  alt="بنر صفحه خانه رستوران"
                  className="restaurant-profile-image-frame__img"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder-banner.png";
                  }}
                />
              ) : (
                <span className="restaurant-profile-image-placeholder">
                  <i className="fas fa-image" />
                  عکسی انتخاب نشده
                </span>
              )}
            </div>

            <input
              ref={homeBannerInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                setHomeBannerFile(file || null);
                if (file) setHomeBannerPreview(URL.createObjectURL(file));
                else setHomeBannerPreview(null);
              }}
            />

            <button
              type="button"
              className="restaurant-profile-upload-btn"
              onClick={() => homeBannerInputRef.current?.click()}
            >
              <i className="fas fa-cloud-arrow-up" />
              <span>{homeBannerPreview ? "تغییر عکس" : "آپلود عکس"}</span>
            </button>

            {homeBannerPreview && (
              <button
                type="button"
                className="restaurant-profile-remove-btn"
                onClick={handleRemoveHomeBanner}
              >
                <i className="fas fa-trash" />
                <span>حذف عکس</span>
              </button>
            )}
          </div>

          {/* Shop banner */}
          <div className="image-field">
            <label>عکس بنر صفحه فروشگاه رستوران</label>

            <div className="restaurant-profile-image-frame">
              {shopBannerPreview ? (
                <img
                  src={shopBannerPreview}
                  alt="بنر صفحه فروشگاه رستوران"
                  className="restaurant-profile-image-frame__img"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder-banner.png";
                  }}
                />
              ) : (
                <span className="restaurant-profile-image-placeholder">
                  <i className="fas fa-image" />
                  عکسی انتخاب نشده
                </span>
              )}
            </div>

            <input
              ref={shopBannerInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                setShopBannerFile(file || null);
                if (file) setShopBannerPreview(URL.createObjectURL(file));
                else setShopBannerPreview(null);
              }}
            />

            <button
              type="button"
              className="restaurant-profile-upload-btn"
              onClick={() => shopBannerInputRef.current?.click()}
            >
              <i className="fas fa-cloud-arrow-up" />
              <span>{shopBannerPreview ? "تغییر عکس" : "آپلود عکس"}</span>
            </button>

            {shopBannerPreview && (
              <button
                type="button"
                className="restaurant-profile-remove-btn"
                onClick={handleRemoveShopBanner}
              >
                <i className="fas fa-trash" />
                <span>حذف عکس</span>
              </button>
            )}
          </div>

          {/* Logo */}
          <div className="image-field">
            <label>عکس لوگو رستوران</label>

            <div className="restaurant-profile-image-frame restaurant-profile-image-frame--circle">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="لوگو رستوران"
                  className="restaurant-profile-image-frame__img"
                  onError={(e) => {
                    e.currentTarget.src = "/images/profile-default.jpg";
                  }}
                />
              ) : (
                <span className="restaurant-profile-image-placeholder">
                  <i className="fas fa-image" />
                  لوگویی انتخاب نشده
                </span>
              )}
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                setLogoFile(file || null);
                if (file) setLogoPreview(URL.createObjectURL(file));
                else setLogoPreview(null);
              }}
            />

            <button
              type="button"
              className="restaurant-profile-upload-btn"
              onClick={() => logoInputRef.current?.click()}
            >
              <i className="fas fa-cloud-arrow-up" />
              <span>{logoPreview ? "تغییر لوگو" : "آپلود لوگو"}</span>
            </button>

            {logoPreview && (
              <button
                type="button"
                className="restaurant-profile-remove-btn"
                onClick={handleRemoveLogo}
              >
                <i className="fas fa-trash" />
                <span>حذف لوگو</span>
              </button>
            )}
          </div>
        </div>

        <hr style={{ border: "1px solid #444", margin: "20px 0" }} />

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "در حال ذخیره..." : "ذخیره تغییرات رستوران"}
        </button>
      </form>
    </div>
  );
}
