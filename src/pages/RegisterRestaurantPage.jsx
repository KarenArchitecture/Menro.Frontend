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
import "../assets/css/auth.css";

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

// standard Iranian national-code checksum (not just length)
const isValidNationalCode = (code) => {
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false; // rejects 0000000000, 1111111111, ...

  const check = Number(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(code[i]) * (10 - i);
  const remainder = sum % 11;

  return remainder < 2 ? check === remainder : check === 11 - remainder;
};

// mirrors Restaurant.cs field limits
const NAME_MAX_LENGTH = 50;
const ADDRESS_MAX_LENGTH = 250;
const DESCRIPTION_MAX_LENGTH = 500;
const NATIONAL_CODE_LENGTH = 10;
const PHONE_LENGTH = 11;
const BANK_ACCOUNT_MAX_LENGTH = 34;
const SHEBA_DIGITS_LENGTH = 24; // Restaurant.ShebaNumber is "IR" + 24 digits

/* small inline icons — generic line glyphs, no external asset needed */
const StoreIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9.5 4.5 4h15L21 9.5" />
    <path d="M3 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
    <path d="M5 11v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
    <path d="M9.5 20v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5" />
  </svg>
);

const IdCardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="11" r="1.75" />
    <path d="M5.5 16c.6-1.6 1.8-2.4 3-2.4s2.4.8 3 2.4" />
    <path d="M14 10h5M14 13.5h5" />
  </svg>
);

export default function RegisterRestaurantPage() {
  useDocumentTitle("ثبت رستوران");
  /* shared design system used across every auth-family page */
  usePageStyles("/auth.css");
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
    restaurantShebaNumber: "", // 24 digits, without the "IR" prefix
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
    else if (form.restaurantAddress.trim().length > ADDRESS_MAX_LENGTH)
      next.restaurantAddress = `آدرس نباید بیشتر از ${ADDRESS_MAX_LENGTH} کاراکتر باشد`;

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
    else if (!isValidNationalCode(form.ownerNationalId))
      next.ownerNationalId = "کد ملی وارد شده معتبر نیست";

    if (!form.restaurantAccountNumber.trim())
      next.restaurantAccountNumber = "شماره حساب الزامی است";
    else if (form.restaurantAccountNumber.length > BANK_ACCOUNT_MAX_LENGTH)
      next.restaurantAccountNumber = `شماره حساب نباید بیشتر از ${BANK_ACCOUNT_MAX_LENGTH} رقم باشد`;

    // ShebaNumber is optional on the entity (nullable), so only validate its
    // format when the owner actually typed something in.
    if (
      form.restaurantShebaNumber &&
      form.restaurantShebaNumber.length !== SHEBA_DIGITS_LENGTH
    )
      next.restaurantShebaNumber = `شماره شبا باید ${SHEBA_DIGITS_LENGTH} رقم باشد (بدون IR)`;

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
        // ShebaNumber on the entity is nullable and stored with its "IR" prefix
        restaurantShebaNumber: form.restaurantShebaNumber
          ? `IR${form.restaurantShebaNumber}`
          : null,
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
    <div className="rrf-page upf-page-wrapper">
      <div className="upf-panel rrf-panel">
        <div className="rrf-copy">
          <h2 className="auth-heading">
            تکمیل اطلاعات <span className="accent">صاحب رستوران</span>
          </h2>
          <p className="auth-subtitle">
            این اطلاعات برای راه‌اندازی پنل مدیریت شما استفاده خواهد شد.
          </p>
        </div>

        {msg.text && (
          <p
            className={`upf-alert ${
              msg.type === "success" ? "upf-alert-success" : "upf-alert-error"
            }`}
          >
            {msg.text}
          </p>
        )}

        <form
          id="owner-form"
          className="rrf-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* ---------------- Restaurant info ---------------- */}
          <section className="rrf-section">
            <h3 className="rrf-section-title">
              <span className="rrf-section-icon">
                <StoreIcon />
              </span>
              اطلاعات رستوران
            </h3>

            <div className="rrf-grid">
              <div className="upf-field">
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
                  className={errors.restaurantName ? "upf-input-invalid" : ""}
                  required
                />
                <div className="upf-field-footer">
                  {errors.restaurantName && (
                    <span className="upf-field-error">
                      {errors.restaurantName}
                    </span>
                  )}
                  <span className="upf-char-count">
                    {form.restaurantName.length}/{NAME_MAX_LENGTH}
                  </span>
                </div>
              </div>

              <div className="upf-field">
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
                  className={`rrf-select ${
                    errors.restaurantCategoryId ? "upf-input-invalid" : ""
                  }`}
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
                  <span className="upf-field-error">
                    خطا در دریافت دسته‌بندی‌های رستوران
                  </span>
                )}

                {errors.restaurantCategoryId && (
                  <span className="upf-field-error">
                    {errors.restaurantCategoryId}
                  </span>
                )}
              </div>
            </div>

            <div className="upf-field">
              <label htmlFor="addr">آدرس</label>
              <textarea
                id="addr"
                rows="2"
                value={form.restaurantAddress}
                onChange={(e) => {
                  updateField("restaurantAddress")(e);
                  clearError("restaurantAddress");
                }}
                maxLength={ADDRESS_MAX_LENGTH}
                placeholder="آدرس کامل رستوران را وارد کنید"
                aria-invalid={!!errors.restaurantAddress}
                className={`rrf-textarea ${
                  errors.restaurantAddress ? "upf-input-invalid" : ""
                }`}
                required
              />
              <div className="upf-field-footer">
                {errors.restaurantAddress && (
                  <span className="upf-field-error">
                    {errors.restaurantAddress}
                  </span>
                )}
                <span className="upf-char-count">
                  {form.restaurantAddress.length}/{ADDRESS_MAX_LENGTH}
                </span>
              </div>
            </div>

            <div className="upf-field">
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
                className={errors.contactNumber ? "upf-input-invalid" : ""}
                required
              />
              {errors.contactNumber && (
                <span className="upf-field-error">{errors.contactNumber}</span>
              )}
            </div>

            <div className="upf-field">
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
                className="rrf-textarea"
              />
              <div className="upf-field-footer">
                {errors.restaurantDescription && (
                  <span className="upf-field-error">
                    {errors.restaurantDescription}
                  </span>
                )}
                <span className="upf-char-count">
                  {form.restaurantDescription.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
            </div>

            <div className="rrf-grid rrf-grid--times">
              <div className="upf-field">
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
                  className={`rrf-time-input ${
                    errors.restaurantOpenTime ? "upf-input-invalid" : ""
                  }`}
                  required
                />
                {errors.restaurantOpenTime && (
                  <span className="upf-field-error">
                    {errors.restaurantOpenTime}
                  </span>
                )}
              </div>

              <div className="upf-field">
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
                  className={`rrf-time-input ${
                    errors.restaurantCloseTime ? "upf-input-invalid" : ""
                  }`}
                  required
                />
                {errors.restaurantCloseTime && (
                  <span className="upf-field-error">
                    {errors.restaurantCloseTime}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ---------------- Owner info ---------------- */}
          <section className="rrf-section">
            <h3 className="rrf-section-title">
              <span className="rrf-section-icon">
                <IdCardIcon />
              </span>
              اطلاعات تکمیلی صاحب رستوران
            </h3>

            <div className="rrf-grid">
              <div className="upf-field">
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
                  className={errors.ownerNationalId ? "upf-input-invalid" : ""}
                  required
                />
                {errors.ownerNationalId && (
                  <span className="upf-field-error">
                    {errors.ownerNationalId}
                  </span>
                )}
              </div>

              <div className="upf-field">
                <label htmlFor="acc">شماره حساب بانکی</label>
                <input
                  id="acc"
                  type="text"
                  inputMode="numeric"
                  value={form.restaurantAccountNumber}
                  onChange={(e) => {
                    updateDigitsField(
                      "restaurantAccountNumber",
                      BANK_ACCOUNT_MAX_LENGTH,
                    )(e);
                    clearError("restaurantAccountNumber");
                  }}
                  placeholder="شماره حساب بانکی خود را وارد کنید"
                  aria-invalid={!!errors.restaurantAccountNumber}
                  className={
                    errors.restaurantAccountNumber ? "upf-input-invalid" : ""
                  }
                  required
                />
                {errors.restaurantAccountNumber && (
                  <span className="upf-field-error">
                    {errors.restaurantAccountNumber}
                  </span>
                )}
              </div>

              <div className="upf-field rrf-span-2">
                <label htmlFor="sheba">
                  شماره شبا <span className="rrf-optional-tag">(اختیاری)</span>
                </label>
                <div className="rrf-sheba-wrap">
                  <span className="rrf-sheba-prefix">IR</span>
                  <input
                    id="sheba"
                    type="text"
                    inputMode="numeric"
                    value={form.restaurantShebaNumber}
                    onChange={(e) => {
                      updateDigitsField(
                        "restaurantShebaNumber",
                        SHEBA_DIGITS_LENGTH,
                      )(e);
                      clearError("restaurantShebaNumber");
                    }}
                    placeholder="24 رقم، بدون IR"
                    aria-invalid={!!errors.restaurantShebaNumber}
                    className={
                      errors.restaurantShebaNumber ? "upf-input-invalid" : ""
                    }
                  />
                </div>
                {errors.restaurantShebaNumber && (
                  <span className="upf-field-error">
                    {errors.restaurantShebaNumber}
                  </span>
                )}
              </div>
            </div>
          </section>

          <div className="rrf-submit-row">
            <button
              type="submit"
              className="auth-btn auth-btn-primary rrf-submit-btn"
              disabled={registerMutation.isLoading}
            >
              {registerMutation.isLoading && <span className="upf-spinner" />}
              {registerMutation.isLoading ? "در حال ارسال…" : "ثبت و ایجاد پنل"}
            </button>
          </div>
        </form>
      </div>

      {/* Page-specific extensions to the shared auth design system.
          Everything here is scoped under .rrf-page so it can never
          leak into other pages that also import auth.css. */}
      <style>{`
        .rrf-page {
          align-items: flex-start;
          padding-top: 40px;
          padding-bottom: 48px;
        }

        .rrf-panel {
          position: relative;
          max-width: 760px;
          overflow: hidden;
        }

        .rrf-panel::before {
          content: "";
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 320px;
          height: 200px;
          background: radial-gradient(
            circle,
            var(--auth-accent-soft) 0%,
            rgba(255, 104, 60, 0) 70%
          );
          pointer-events: none;
        }

        .rrf-copy {
          position: relative;
          text-align: center;
          margin-bottom: 22px;
        }

        .rrf-copy .auth-heading {
          font-size: 22px;
        }

        .rrf-form {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .rrf-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-top: 18px;
          border-top: 1px solid var(--auth-input-border);
        }

        .rrf-section:first-child {
          padding-top: 0;
          border-top: none;
        }

        .rrf-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: var(--auth-text);
        }

        .rrf-section-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: var(--auth-accent-soft);
          color: var(--auth-accent);
          flex-shrink: 0;
        }

        .rrf-section-icon svg {
          width: 16px;
          height: 16px;
        }

        .rrf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 16px;
        }

        .rrf-span-2 {
          grid-column: 1 / -1;
        }

        .upf-field select,
        .upf-field textarea {
          background: var(--auth-input-bg);
          border: 1px solid var(--auth-input-border);
          color: var(--auth-text);
          border-radius: var(--auth-radius-sm);
          padding: 11px 14px;
          font-size: 0.95rem;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.15s ease;
        }

        .upf-field select:focus,
        .upf-field textarea:focus {
          outline: none;
          border-color: var(--auth-accent);
        }

        .rrf-textarea {
          resize: vertical;
          min-height: 44px;
          line-height: 1.6;
        }

        .rrf-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9'%3E%3Cpath d='M1 1L7 7L13 1' stroke='%239aa3af' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 14px center;
          padding-left: 36px;
        }

        .rrf-select:disabled {
          color: var(--auth-muted);
          cursor: not-allowed;
        }

        .rrf-time-input {
          color-scheme: dark;
        }

        .rrf-optional-tag {
          color: var(--auth-muted-2);
          font-weight: 400;
        }

        .rrf-sheba-wrap {
          display: flex;
          align-items: stretch;
          border: 1px solid var(--auth-input-border);
          border-radius: var(--auth-radius-sm);
          overflow: hidden;
          transition: border-color 0.15s ease;
          background: var(--auth-input-bg);
        }

        .rrf-sheba-wrap:focus-within {
          border-color: var(--auth-accent);
        }

        .rrf-sheba-prefix {
          display: flex;
          align-items: center;
          padding: 0 12px;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--auth-muted);
          border-left: 1px solid var(--auth-input-border);
          background: rgba(255, 255, 255, 0.02);
        }

        .rrf-sheba-wrap input {
          flex: 1;
          min-width: 0;
          border: none;
          border-radius: 0;
          background: transparent;
          color: var(--auth-text);
          padding: 11px 14px;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
        }

        .rrf-sheba-wrap input::placeholder {
          color: var(--auth-muted-2);
        }

        .rrf-submit-row {
          margin-top: 4px;
        }

        .rrf-submit-btn {
          gap: 10px;
        }

        @media (max-width: 640px) {
          .rrf-grid,
          .rrf-grid--times {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .rrf-panel {
            padding: 22px 18px;
          }
        }
      `}</style>
    </div>
  );
}
