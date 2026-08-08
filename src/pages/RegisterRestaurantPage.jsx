import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchRestaurantCategories,
  registerRestaurant,
} from "../api/restaurants";
import usePageStyles from "../hooks/usePageStyles";
import { useAuth } from "../Context/AuthContext";
import useDocumentTitle from "../hooks/useDocumentTitle";

//  HH:MM  ➔  HH:MM:SS
const normalizeTime = (t) => (t.length === 5 ? `${t}:00` : t);

const isTimeValid = (start, end) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em > sh * 60 + sm;
};

// keeps only digits, respecting a max length
const digitsOnly = (value, maxLength) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const NAME_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 500;
const NATIONAL_CODE_LENGTH = 10;
const PHONE_LENGTH = 11;

export default function RegisterRestaurantPage() {
  useDocumentTitle("ثبت رستوران");
  /* load CSS (/public) */
  usePageStyles("/register-rastaurant.css");
  const { refreshUser } = useAuth();

  const navigate = useNavigate();

  /* local state for form — field names mirror RegisterRestaurantDto */
  const [form, setForm] = useState({
    restaurantName: "",
    restaurantDescription: "",
    restaurantAddress: "",
    contactNumber: "",
    restaurantCategoryId: "",
    restaurantOpenTime: "",
    restaurantCloseTime: "",
    ownerNationalId: "",
    restaurantAccountNumber: "",
  });

  // field-level validation errors, shown right under each input
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ text: "", type: "" }); // success | error

  /* fetch restaurant categories */
  const categoriesQuery = useQuery({
    queryKey: ["restaurantCategories"],
    queryFn: fetchRestaurantCategories,
    staleTime: 5 * 60 * 1_000,
  });

  /* helpers */
  const updateField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateDigitsField = (field, maxLength) => (e) =>
    setForm((f) => ({ ...f, [field]: digitsOnly(e.target.value, maxLength) }));

  const clearError = (field) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  /* full client-side validation, mirrors the constraints on Restaurant.cs */
  const validate = () => {
    const next = {};

    if (!form.restaurantName.trim())
      next.restaurantName = "نام رستوران الزامی است";
    else if (form.restaurantName.trim().length > NAME_MAX_LENGTH)
      next.restaurantName = `نام رستوران نباید بیشتر از ${NAME_MAX_LENGTH} کاراکتر باشد`;

    if (!form.restaurantAddress.trim())
      next.restaurantAddress = "آدرس رستوران الزامی است";

    if (!form.contactNumber)
      next.contactNumber = "شماره تماس رستوران الزامی است";
    else if (!/^0\d{10}$/.test(form.contactNumber))
      next.contactNumber = "شماره تماس باید ۱۱ رقم و با صفر شروع شود";

    if (!form.restaurantCategoryId)
      next.restaurantCategoryId = "انتخاب نوع رستوران الزامی است";

    if (!form.restaurantOpenTime)
      next.restaurantOpenTime = "ساعت شروع فعالیت الزامی است";

    if (!form.restaurantCloseTime)
      next.restaurantCloseTime = "ساعت پایان فعالیت الزامی است";

    if (
      form.restaurantOpenTime &&
      form.restaurantCloseTime &&
      !isTimeValid(form.restaurantOpenTime, form.restaurantCloseTime)
    )
      next.restaurantCloseTime = "ساعت پایان باید بعد از ساعت شروع باشد";

    if (form.restaurantDescription.trim().length > DESCRIPTION_MAX_LENGTH)
      next.restaurantDescription = `توضیحات نباید بیشتر از ${DESCRIPTION_MAX_LENGTH} کاراکتر باشد`;

    if (!form.ownerNationalId) next.ownerNationalId = "کد ملی الزامی است";
    else if (form.ownerNationalId.length !== NATIONAL_CODE_LENGTH)
      next.ownerNationalId = `کد ملی باید ${NATIONAL_CODE_LENGTH} رقم باشد`;

    if (!form.restaurantAccountNumber.trim())
      next.restaurantAccountNumber = "شماره حساب الزامی است";

    return next;
  };

  /* submit mutation */
  const registerMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        restaurantOpenTime: normalizeTime(form.restaurantOpenTime),
        restaurantCloseTime: normalizeTime(form.restaurantCloseTime),
        restaurantCategoryId: Number(form.restaurantCategoryId),
      };

      return await registerRestaurant(payload);
    },
    onSuccess: async () => {
      await refreshUser(); // ✅ نقش جدید Owner را از سرور بگیر
      setMsg({ text: "رستوران با موفقیت ثبت شد", type: "success" });
      navigate("/admin", { replace: true });
    },
    onError: (err) => {
      const serverMessage =
        err?.response?.data?.title ||
        err?.response?.data ||
        err.message ||
        "ثبت رستوران با خطا مواجه شد";
      setMsg({ text: serverMessage, type: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setMsg({
        text: "لطفاً خطاهای مشخص‌شده در فرم را برطرف کنید",
        type: "error",
      });
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="restaurant-register-page">
      <div className="form-container">
        <form
          id="owner-form"
          className="profile-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="view-header">
            <h2>تکمیل اطلاعات صاحب رستوران</h2>
            <p>این اطلاعات برای راه‌اندازی پنل مدیریت شما استفاده خواهد شد.</p>
          </div>

          {/* ---------------- Restaurant info ---------------- */}
          <fieldset className="form-section">
            <legend>اطلاعات رستوران</legend>

            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="name">نام رستوران</label>
                <input
                  id="name"
                  value={form.restaurantName}
                  onChange={(e) => {
                    updateField("restaurantName")(e);
                    clearError("restaurantName");
                  }}
                  maxLength={NAME_MAX_LENGTH}
                  placeholder="مثال: رستوران سنتی باغ ایرانی"
                  aria-invalid={!!errors.restaurantName}
                  required
                />
                <div className="field-footer">
                  {errors.restaurantName && (
                    <span className="field-error">{errors.restaurantName}</span>
                  )}
                  <span className="char-counter">
                    {form.restaurantName.length}/{NAME_MAX_LENGTH}
                  </span>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="cat">نوع رستوران</label>

                <select
                  id="cat"
                  value={form.restaurantCategoryId}
                  onChange={(e) => {
                    updateField("restaurantCategoryId")(e);
                    clearError("restaurantCategoryId");
                  }}
                  disabled={categoriesQuery.isLoading}
                  aria-invalid={!!errors.restaurantCategoryId}
                  required
                >
                  <option value="">
                    {categoriesQuery.isLoading
                      ? "در حال بارگذاری..."
                      : "انتخاب دسته‌بندی"}
                  </option>

                  {categoriesQuery.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {categoriesQuery.isError && (
                  <span className="field-error">
                    خطا در دریافت دسته‌بندی‌های رستوران
                  </span>
                )}

                {errors.restaurantCategoryId && (
                  <span className="field-error">
                    {errors.restaurantCategoryId}
                  </span>
                )}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="addr">آدرس</label>
              <input
                id="addr"
                value={form.restaurantAddress}
                onChange={(e) => {
                  updateField("restaurantAddress")(e);
                  clearError("restaurantAddress");
                }}
                placeholder="آدرس کامل رستوران را وارد کنید"
                aria-invalid={!!errors.restaurantAddress}
                required
              />
              {errors.restaurantAddress && (
                <span className="field-error">{errors.restaurantAddress}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="phone">شماره تماس رستوران</label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={form.contactNumber}
                onChange={(e) => {
                  updateDigitsField("contactNumber", PHONE_LENGTH)(e);
                  clearError("contactNumber");
                }}
                placeholder="مثال: 09123456789"
                aria-invalid={!!errors.contactNumber}
                required
              />
              {errors.contactNumber && (
                <span className="field-error">{errors.contactNumber}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="desc">توضیحات رستوران</label>
              <textarea
                id="desc"
                rows="4"
                value={form.restaurantDescription}
                onChange={(e) => {
                  updateField("restaurantDescription")(e);
                  clearError("restaurantDescription");
                }}
                maxLength={DESCRIPTION_MAX_LENGTH}
                placeholder="مثلاً نوع فضا، سبک سرویس، مزیت رقابتی، معرفی کوتاه..."
                aria-invalid={!!errors.restaurantDescription}
              />
              <div className="field-footer">
                {errors.restaurantDescription && (
                  <span className="field-error">
                    {errors.restaurantDescription}
                  </span>
                )}
                <span className="char-counter">
                  {form.restaurantDescription.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
            </div>

            <div className="form-grid hours-row">
              <div className="input-group">
                <label htmlFor="open">ساعت شروع فعالیت</label>
                <input
                  id="open"
                  type="time"
                  value={form.restaurantOpenTime}
                  onChange={(e) => {
                    updateField("restaurantOpenTime")(e);
                    clearError("restaurantOpenTime");
                    clearError("restaurantCloseTime");
                  }}
                  aria-invalid={!!errors.restaurantOpenTime}
                  required
                />
                {errors.restaurantOpenTime && (
                  <span className="field-error">
                    {errors.restaurantOpenTime}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="close">ساعت پایان فعالیت</label>
                <input
                  id="close"
                  type="time"
                  value={form.restaurantCloseTime}
                  onChange={(e) => {
                    updateField("restaurantCloseTime")(e);
                    clearError("restaurantCloseTime");
                  }}
                  aria-invalid={!!errors.restaurantCloseTime}
                  required
                />
                {errors.restaurantCloseTime && (
                  <span className="field-error">
                    {errors.restaurantCloseTime}
                  </span>
                )}
              </div>
            </div>
          </fieldset>

          {/* ---------------- Owner info ---------------- */}
          <fieldset className="form-section">
            <legend>اطلاعات تکمیلی صاحب رستوران</legend>

            <div className="form-grid">
              <div className="input-group">
                <label htmlFor="nid">کد ملی</label>
                <input
                  id="nid"
                  type="text"
                  inputMode="numeric"
                  value={form.ownerNationalId}
                  onChange={(e) => {
                    updateDigitsField(
                      "ownerNationalId",
                      NATIONAL_CODE_LENGTH,
                    )(e);
                    clearError("ownerNationalId");
                  }}
                  placeholder="مثال: 0012345678"
                  aria-invalid={!!errors.ownerNationalId}
                  required
                />
                {errors.ownerNationalId && (
                  <span className="field-error">{errors.ownerNationalId}</span>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="acc">شماره حساب</label>
                <input
                  id="acc"
                  value={form.restaurantAccountNumber}
                  onChange={(e) => {
                    updateField("restaurantAccountNumber")(e);
                    clearError("restaurantAccountNumber");
                  }}
                  placeholder="مثال: شماره شبا یا حساب بانکی"
                  aria-invalid={!!errors.restaurantAccountNumber}
                  required
                />
                {errors.restaurantAccountNumber && (
                  <span className="field-error">
                    {errors.restaurantAccountNumber}
                  </span>
                )}
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={registerMutation.isLoading}
          >
            {registerMutation.isLoading ? "در حال ارسال…" : "ثبت و ایجاد پنل"}
          </button>

          {/* message */}
          {msg.text && <p className={`message ${msg.type}`}>{msg.text}</p>}
        </form>
      </div>

      {/* Self-contained responsive/UX styles so the page looks right
          even if register-rastaurant.css doesn't cover these elements yet. */}
      <style>{`
        .restaurant-register-page {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 24px 16px 48px;
          box-sizing: border-box;
        }

        .restaurant-register-page .form-container {
          width: 100%;
          max-width: 720px;
        }

        .restaurant-register-page .view-header {
          margin-bottom: 8px;
        }

        .restaurant-register-page .form-section {
          border: 1px solid #333;
          border-radius: 10px;
          padding: 16px 18px 6px;
          margin: 0 0 20px;
        }

        .restaurant-register-page .form-section legend {
          padding: 0 8px;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .restaurant-register-page .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 16px;
        }

        .restaurant-register-page .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .restaurant-register-page input,
        .restaurant-register-page select,
        .restaurant-register-page textarea {
          width: 100%;
          box-sizing: border-box;
        }

        .restaurant-register-page select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9'%3E%3Cpath d='M1 1L7 7L13 1' stroke='%23999' strokeWidth='1.6' fill='none' strokeLinecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 14px center;
          padding-left: 36px;
        }

        .restaurant-register-page input[aria-invalid="true"],
        .restaurant-register-page select[aria-invalid="true"],
        .restaurant-register-page textarea[aria-invalid="true"] {
          border-color: #ef4444;
        }

        .restaurant-register-page .field-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .restaurant-register-page .field-error {
          color: #ef4444;
          font-size: 0.8rem;
        }

        .restaurant-register-page .field-hint {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .restaurant-register-page .char-counter {
          font-size: 0.75rem;
          opacity: 0.6;
          white-space: nowrap;
        }

        .restaurant-register-page .btn.btn-primary {
          display: block;
          width: 100%;
          margin-top: 4px;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          color: #1a1a1a;
          background-color: #f5a623;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(245, 166, 35, 0.25);
          transition: background-color 0.15s ease, transform 0.05s ease,
            box-shadow 0.15s ease;
        }

        .restaurant-register-page .btn.btn-primary:hover:not(:disabled) {
          background-color: #ffb340;
          box-shadow: 0 4px 14px rgba(245, 166, 35, 0.35);
        }

        .restaurant-register-page .btn.btn-primary:active:not(:disabled) {
          transform: translateY(1px);
          box-shadow: 0 2px 8px rgba(245, 166, 35, 0.25);
        }

        .restaurant-register-page .btn.btn-primary:focus-visible {
          outline: 2px solid #ffb340;
          outline-offset: 2px;
        }

        .restaurant-register-page .btn.btn-primary:disabled {
          background-color: #6b5a3d;
          color: #cfcfcf;
          box-shadow: none;
          opacity: 0.7;
          cursor: not-allowed;
        }

        .restaurant-register-page .message {
          margin-top: 14px;
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
          .restaurant-register-page .form-grid,
          .restaurant-register-page .form-grid.hours-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
