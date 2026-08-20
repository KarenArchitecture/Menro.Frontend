import { useState, useEffect, useRef, useCallback } from "react";
import {
  getUserProfile,
  updateUserProfile,
  setUserPassword,
} from "../../api/user.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useLocation } from "react-router-dom";
import useRequireLogin from "../../hooks/useRequireLogin";
import ProtectedActionModal from "./ProtectedActionModal";
import "../../assets/css/auth.css";
import { useGlobalUI } from "../common/GlobalUI";

const MAX_NAME_LENGTH = 50; // matches User.FullName [MaxLength(50)]
const MAX_IMAGE_SIZE = 1_000_000; // 1MB, matches backend check
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MIN_PASSWORD_LENGTH = 6;

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.5 13.5 0 0 1-3.1 4.1M6.6 6.6C3.7 8.5 1.5 12 1.5 12s3.5 7 10.5 7a10.6 10.6 0 0 0 4.4-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export default function UserProfileForm() {
  const { notify, confirmModal } = useGlobalUI();
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname);
  const fileInputRef = useRef(null);
  const { requireLogin, open, closeModal, goToLogin, modalProps } =
    useRequireLogin();

  // fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);

  // password state — whether the account has one yet, and the inline
  // "set a password" fields used only when it doesn't
  const [hasPassword, setHasPassword] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  // ui state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // { type: "success" | "error", text }

  // gate: require an authenticated session before this form does anything
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      requireLogin({
        type: "profile",
        returnUrl: "/profile/edit",
        onAuthenticated: () => {
          // once login succeeds, `user` updates via context and the
          // profile-loading effect below runs automatically
        },
      });
    }
  }, [user]);

  // Pulled out of the loading effect so it can also be called after a
  // successful save (issue 3: refetch just this form instead of a full
  // page reload).
  const loadProfile = useCallback(async () => {
    try {
      const { data } = await getUserProfile();
      setFullName(data.fullName || "");
      setPhoneNumber(data.phoneNumber || "");
      setHasPassword(!!data.hasPassword);
      if (data.profileImageUrl) {
        setProfilePreview(data.profileImageUrl);
        setOriginalPreview(data.profileImageUrl);
      } else {
        setProfilePreview(null);
        setOriginalPreview(null);
      }
      return true;
    } catch (err) {
      console.error("خطا در دریافت پروفایل:", err);
      notify({
        type: "error",
        message:
          "دریافت اطلاعات پروفایل با خطا مواجه شد. لطفاً صفحه را رفرش کنید.",
      });
      return false;
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    setIsLoading(true);
    loadProfile().finally(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user, loadProfile]);

  // revoke object URLs created for local previews to avoid memory leaks
  useEffect(() => {
    return () => {
      if (profilePreview && profilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const validateName = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "نام و نام خانوادگی الزامی است";
    if (trimmed.length > MAX_NAME_LENGTH)
      return `نام و نام خانوادگی نباید بیش از ${MAX_NAME_LENGTH} کاراکتر باشد`;
    return null;
  };

  const validateNewPassword = (value) => {
    if (!value || value.length < MIN_PASSWORD_LENGTH)
      return `رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد`;
    return null;
  };

  const validateImage = (file) => {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (
      !ALLOWED_IMAGE_TYPES.includes(file.type) &&
      !ALLOWED_EXTENSIONS.includes(ext)
    ) {
      return "فرمت فایل مجاز نیست (jpg, png, webp)";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return "حجم فایل نباید بیش از ۱ مگابایت باشد";
    }
    return null;
  };

  const applyImageFile = (file) => {
    if (!file) return;
    const imageError = validateImage(file);
    if (imageError) {
      setErrors((prev) => ({ ...prev, image: imageError }));
      return;
    }
    setErrors((prev) => ({ ...prev, image: null }));
    setProfileImage(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    applyImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    applyImageFile(file);
  };

  const handleRemoveNewImage = () => {
    setProfileImage(null);
    setProfilePreview(originalPreview);
    setErrors((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfilePreview(null);
    setOriginalPreview(null);
    setErrors((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: validateName(value) }));
    }
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    if (passwordError) setPasswordError(validateNewPassword(value));
  };

  // Sets a password for an account that doesn't have one yet. Only ever
  // rendered/usable when hasPassword === false (see JSX below) — accounts
  // that already have a password go through /change-password instead,
  // which requires the current password.
  const handleSetPassword = async () => {
    const err = validateNewPassword(newPassword);
    if (err) {
      setPasswordError(err);
      return;
    }

    setPasswordError("");
    setStatus(null);
    setIsSettingPassword(true);
    try {
      await setUserPassword(newPassword);
      setNewPassword("");
      setShowNewPassword(false);
      setHasPassword(true);
      notify({ type: "success", message: "رمز عبور با موفقیت تنظیم شد" });
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      notify({
        type: "error",
        message:
          serverMessage || "تنظیم رمز عبور با خطا مواجه شد. دوباره تلاش کنید.",
      });
    } finally {
      setIsSettingPassword(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const nameError = validateName(fullName);
    if (nameError) {
      setErrors((prev) => ({ ...prev, fullName: nameError }));
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName.trim());

    if (profileImage) {
      formData.append("profileImage", profileImage);
    } else if (!profilePreview) {
      formData.append("removeProfileImage", "true");
    }

    setIsSubmitting(true);
    try {
      await updateUserProfile(formData);
      await refreshUser();
      // Issue 3: refetch just this form's data instead of reloading the
      // whole page (previously: navigate(0)).
      await loadProfile();
      notify({ type: "success", message: "تغییرات با موفقیت ذخیره شد" });
      setProfileImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      const serverMessage = err?.response?.data?.message || err?.response?.data;
      notify({
        type: "error",
        message:
          typeof serverMessage === "string" && serverMessage
            ? serverMessage
            : "ذخیره تغییرات با خطا مواجه شد. دوباره تلاش کنید.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <ProtectedActionModal
        open={open}
        onClose={closeModal}
        onLogin={goToLogin}
        icon={modalProps.icon}
        title={modalProps.title}
        description={modalProps.description}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="upf-page-wrapper">
        <div className="upf-panel">
          <div className="upf-skeleton-avatar" />
          <div className="upf-skeleton-line" style={{ width: "60%" }} />
          <div className="upf-skeleton-line" style={{ width: "40%" }} />
          <div className="upf-skeleton-line" style={{ width: "50%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="upf-page-wrapper">
      <div className="upf-panel">
        <form onSubmit={handleSubmit} noValidate>
          {status && (
            <div
              className={`upf-alert upf-alert-${status.type}`}
              role="status"
              aria-live="polite"
            >
              {status.text}
            </div>
          )}

          <div className="upf-grid">
            {/* Avatar column */}
            <div className="upf-avatar-col">
              <span className="upf-field-label">عکس پروفایل</span>
              <div
                className={`upf-avatar-drop ${isDragging ? "is-dragging" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                aria-label="بارگذاری عکس پروفایل"
              >
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="عکس پروفایل"
                    className="upf-avatar-img"
                    onError={(e) => {
                      e.currentTarget.src = "/images/profile-default.jpg";
                    }}
                  />
                ) : (
                  <div className="upf-avatar-placeholder">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
                    </svg>
                  </div>
                )}
                <div className="upf-avatar-overlay">
                  <span>تغییر عکس</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                id="user-avatar-upload"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                hidden
              />

              <div className="upf-avatar-actions">
                <button
                  type="button"
                  className="auth-chip-btn auth-chip-btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  انتخاب عکس جدید
                </button>
                {profileImage && (
                  <button
                    type="button"
                    className="auth-chip-btn auth-chip-btn-sm"
                    onClick={handleRemoveNewImage}
                  >
                    لغو انتخاب
                  </button>
                )}
                {profilePreview && !profileImage && (
                  <button
                    type="button"
                    className="auth-chip-btn auth-chip-btn-sm upf-avatar-remove-btn"
                    onClick={handleRemoveImage}
                  >
                    حذف عکس
                  </button>
                )}
              </div>
              <p className="upf-hint">JPG، PNG یا WEBP — حداکثر ۱ مگابایت</p>
              {errors.image && (
                <p className="upf-field-error">{errors.image}</p>
              )}
            </div>

            {/* Fields column */}
            <div className="upf-fields-col">
              <div className="upf-field">
                <label htmlFor="user-name">نام و نام خانوادگی</label>
                <input
                  type="text"
                  id="user-name"
                  value={fullName}
                  maxLength={MAX_NAME_LENGTH}
                  onChange={handleNameChange}
                  onBlur={() =>
                    setErrors((prev) => ({
                      ...prev,
                      fullName: validateName(fullName),
                    }))
                  }
                  className={errors.fullName ? "upf-input-invalid" : ""}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={
                    errors.fullName ? "user-name-error" : undefined
                  }
                />
                <div className="upf-field-footer">
                  {errors.fullName ? (
                    <span id="user-name-error" className="upf-field-error">
                      {errors.fullName}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="upf-char-count">
                    {fullName.trim().length}/{MAX_NAME_LENGTH}
                  </span>
                </div>
              </div>

              <div className="upf-field">
                <label htmlFor="user-phone">شماره تلفن</label>
                <div className="upf-input-with-action">
                  <input
                    type="tel"
                    id="user-phone"
                    value={phoneNumber}
                    readOnly
                  />
                  <Link
                    to={`/change-phone?returnUrl=${returnTo}`}
                    className="upf-btn upf-btn-secondary"
                  >
                    تغییر شماره
                  </Link>
                </div>
              </div>

              <div className="upf-field">
                <label>رمز عبور</label>

                {hasPassword ? (
                  // Account already has a password: keep the existing
                  // masked/disabled display, with the real change handled
                  // on its own page (needs the current password).
                  <div className="upf-input-with-action">
                    <input type="password" value="••••••••" readOnly disabled />
                    <Link
                      to={`/change-password?returnUrl=${returnTo}`}
                      className="upf-btn upf-btn-secondary"
                    >
                      تغییر رمز عبور
                    </Link>
                  </div>
                ) : (
                  // No password yet (e.g. OTP-only account): let the user
                  // type and save one directly here instead of sending
                  // them to a "change password" page that would need a
                  // current password that doesn't exist.
                  <>
                    <div className="upf-input-with-action">
                      <div className="upf-password-input-wrap">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          placeholder="رمز عبور جدید را وارد کنید"
                          minLength={MIN_PASSWORD_LENGTH}
                          onChange={handleNewPasswordChange}
                          className={passwordError ? "upf-input-invalid" : ""}
                          aria-invalid={!!passwordError}
                        />
                        <button
                          type="button"
                          className="upf-password-eye-btn"
                          onClick={() => setShowNewPassword((v) => !v)}
                          aria-label={
                            showNewPassword
                              ? "مخفی کردن رمز عبور"
                              : "نمایش رمز عبور"
                          }
                        >
                          {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      <button
                        type="button"
                        className="upf-btn upf-btn-secondary"
                        onClick={handleSetPassword}
                        disabled={isSettingPassword}
                      >
                        {isSettingPassword ? "در حال ذخیره..." : "ثبت رمز عبور"}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="upf-field-error">{passwordError}</p>
                    )}
                    <p className="upf-hint">
                      شما هنوز رمز عبوری تنظیم نکرده‌اید؛ با ثبت رمز، امکان ورود
                      با رمز عبور علاوه بر کد تأیید فعال می‌شود.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="upf-actions">
            <button
              type="submit"
              className="upf-btn upf-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="upf-spinner" aria-hidden="true" />
                  در حال ذخیره...
                </>
              ) : (
                "ذخیره تغییرات"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
