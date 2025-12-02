//RestaurantProfileSection.jsx
import { useState, useEffect } from "react";
import {
  getRestaurantProfile,
  updateRestaurantProfile,
} from "../../api/ownerRestaurant";
import restaurantAxios from "../../api/restaurantAxios";
export default function RestaurantProfileSection() {
  // basic fields
  const [name, setName] = useState("");
  const [type, setType] = useState(""); // select
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [bankAccount, setBankAccount] = useState("");
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

  // fake subscription info (backend can replace these)
  const subscriptionType = "طلایی"; // e.g. طلایی / نقره‌ای / برنزی
  const subscriptionDaysLeft = 23; // e.g. 23 days left

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
        setType(String(d.restaurantCategoryId)); // important
        setAddress(d.address);
        setPhone(d.phoneNumber);
        setBankAccount(d.bankAccountNumber);
        setDescription(d.description);
        setOpenTime(d.openTime);
        setCloseTime(d.closeTime);

        // images
        if (d.bannerImageUrl) setHomeBannerPreview(d.bannerImageUrl);

        if (d.shopBannerImageUrl) setShopBannerPreview(d.shopBannerImageUrl);

        if (d.logoImageUrl) setLogoPreview(d.logoImageUrl);

        // subscription
        setSubscriptionType(d.subscriptionType || "نامشخص");
        setSubscriptionDaysLeft(d.subscriptionDaysLeft);
      } catch (err) {
        console.error("Failed to load profile or categories", err);
      }
    }

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // required text fields
      formData.append("Name", name);
      formData.append("RestaurantCategoryId", type);
      formData.append("Address", address);
      formData.append("Description", description);
      formData.append("PhoneNumber", phone);
      formData.append("BankAccountNumber", bankAccount);
      formData.append("OpenTime", openTime);
      formData.append("CloseTime", closeTime);

      // files (optional)
      if (homeBannerFile) {
        formData.append("HomeBanner", homeBannerFile);
      }
      if (shopBannerFile) {
        formData.append("ShopBanner", shopBannerFile);
      }
      if (logoFile) {
        formData.append("Logo", logoFile);
      }

      // send to backend
      const res = await updateRestaurantProfile(formData);

      console.log("Updated:", res.data);
      alert("پروفایل با موفقیت بروزرسانی شد");
    } catch (err) {
      console.error("Update failed:", err);
      alert("خطا در بروزرسانی پروفایل رستوران");
    }
  };

  return (
    <div className="panel restaurant-profile-panel">
      <div className="view-header">
        <h3>مدیریت رستوران</h3>
      </div>

      {/* Subscription box */}
      <div className="subscription-box">
        <div className="subscription-box__title">اشتراک رستوران</div>
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
          {/* Name */}
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

          {/* Type */}
          <div className="input-group">
            <label htmlFor="restaurant-type">نوع رستوران</label>

            <select
              id="restaurant-type"
              name="restaurantType"
              value={type} // category id as string
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

        {/* Phone + Bank account */}
        <div className="form-grid">
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

          <div className="input-group">
            <label htmlFor="restaurant-bank-account">
              شماره حساب صاحب رستوران
            </label>
            <input
              id="restaurant-bank-account"
              name="restaurantBankAccount"
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="مثال: شماره شبا یا حساب"
              required
            />
          </div>
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

        {/* Images */}
        <div className="images-grid">
          {/* Home banner */}
          <div className="image-field">
            <label htmlFor="restaurant-home-banner">
              عکس بنر صفحه خانه رستوران
            </label>
            <div className="image-preview">
              {homeBannerPreview ? (
                <img
                  src={homeBannerPreview}
                  alt="بنر صفحه خانه رستوران"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder-banner.png";
                  }}
                />
              ) : (
                <span className="image-placeholder">
                  هنوز عکسی انتخاب نشده است
                </span>
              )}
            </div>
            <input
              id="restaurant-home-banner"
              name="restaurantHomeBanner"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setHomeBannerFile(file || null);
                if (file) setHomeBannerPreview(URL.createObjectURL(file));
                else setHomeBannerPreview(null);
              }}
            />
          </div>

          {/* Shop banner */}
          <div className="image-field">
            <label htmlFor="restaurant-shop-banner">
              عکس بنر صفحه فروشگاه رستوران
            </label>
            <div className="image-preview">
              {shopBannerPreview ? (
                <img
                  src={shopBannerPreview}
                  alt="بنر صفحه فروشگاه رستوران"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder-banner.png";
                  }}
                />
              ) : (
                <span className="image-placeholder">
                  هنوز عکسی انتخاب نشده است
                </span>
              )}
            </div>
            <input
              id="restaurant-shop-banner"
              name="restaurantShopBanner"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setShopBannerFile(file || null);
                if (file) setShopBannerPreview(URL.createObjectURL(file));
                else setShopBannerPreview(null);
              }}
            />
          </div>

          {/* Logo */}
          <div className="image-field">
            <label htmlFor="restaurant-logo">عکس لوگو رستوران</label>
            <div className="image-preview image-preview--logo">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="لوگو رستوران"
                  onError={(e) => {
                    e.currentTarget.src = "/images/profile-default.jpg";
                  }}
                />
              ) : (
                <span className="image-placeholder">
                  هنوز لوگو انتخاب نشده است
                </span>
              )}
            </div>
            <input
              id="restaurant-logo"
              name="restaurantLogo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setLogoFile(file || null);
                if (file) setLogoPreview(URL.createObjectURL(file));
                else setLogoPreview(null);
              }}
            />
          </div>
        </div>

        <hr style={{ border: "1px solid #444", margin: "20px 0" }} />

        <button type="submit" className="btn btn-primary">
          ذخیره تغییرات رستوران
        </button>
      </form>
    </div>
  );
}
