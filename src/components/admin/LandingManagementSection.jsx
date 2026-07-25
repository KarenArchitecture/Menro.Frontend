import { useEffect, useRef, useState } from "react";
import {
  getLandingGeneral,
  updateLandingGeneral,
  uploadLandingHeroImage,
  extractFileNameFromUrl,
  getLandingReasons,
  createLandingReason,
  updateLandingReason,
  deleteLandingReason,
  moveLandingReason,
  getLandingFaqs,
  createLandingFaq,
  updateLandingFaq,
  deleteLandingFaq,
  moveLandingFaq,
} from "../../api/AdminLanding";
import "../../assets/css/admin/landingManagement.css";

/* ======================================================================
 * LandingManagementSection
 * ----------------------------------------------------------------------
 * Admin panel for managing the dynamic parts of the public landing page.
 * Wired up to AdminLandingController.cs via src/api/AdminLanding.js,
 * following the same fetch-on-mount / create-update-delete-move pattern
 * as BlogManagementSection.jsx + adminBlogs.js.
 *
 * Sections intentionally left OUT of this panel (per product decision):
 *   - Hero stats (رستوران ثبت‌شده / محصول فعال / ...) -> computed live
 *     from real data, not editable content.
 *   - Plan cards (سفارشی / منرو‌+ / پیشرفته / حرفه‌ای) -> wired up once
 *     the subscription system exists.
 *   - Blog cards on the landing page -> pulled directly from the Blog
 *     section, managed there.
 *   - Mobile app download block -> out of scope for now.
 * ==================================================================== */

const SUB_TABS = [
  { key: "general", label: "متن‌های عمومی", icon: "fas fa-align-right" },
  { key: "reasons", label: "چرا منرو؟", icon: "fas fa-star" },
  { key: "faq", label: "سوالات متداول", icon: "fas fa-circle-question" },
];

function toPersianDigits(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

export default function LandingManagementSection() {
  const [activeSubTab, setActiveSubTab] = useState("general");
  const [savedFlash, setSavedFlash] = useState("");

  const flashSaved = (label = "تغییرات ذخیره شد") => {
    setSavedFlash(label);
    window.clearTimeout(flashSaved._t);
    flashSaved._t = window.setTimeout(() => setSavedFlash(""), 2200);
  };

  return (
    <div id="landing-management-view" className="blog-mgmt landing-mgmt">
      <div className="view-header">
        <h2 className="content-title">مدیریت صفحه لندینگ</h2>
        {savedFlash && <span className="blog-mgmt__flash">{savedFlash}</span>}
      </div>

      {/* <div className="landing-mgmt__info-banner">
        <i className="fas fa-circle-info" />
        <span>
          آمار بالای صفحه (تعداد رستوران‌ها، محصولات و ...) به‌صورت خودکار و
          واقعی محاسبه می‌شود، پلن‌های اشتراک بعد از راه‌اندازی سیستم اشتراک از
          همین‌جا مدیریت خواهند شد و بخش بلاگ مستقیماً از تب «مدیریت وبلاگ»
          خوانده می‌شود؛ به همین دلیل این سه بخش در این تب وجود ندارند.
        </span>
      </div> */}

      <nav className="content-tab-nav">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`content-tab-link ${activeSubTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveSubTab(tab.key)}
          >
            <i className={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {activeSubTab === "general" && (
        <div className="content-tab-pane active">
          <GeneralTextsPane onSaved={flashSaved} />
        </div>
      )}

      {activeSubTab === "reasons" && (
        <div className="content-tab-pane active">
          <ReasonsPane onSaved={flashSaved} />
        </div>
      )}

      {activeSubTab === "faq" && (
        <div className="content-tab-pane active">
          <FaqPane onSaved={flashSaved} />
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 1) GENERAL TEXTS (main hero line + "با منرو تو چشم باش" heading)    */
/* ================================================================== */

const HERO_TITLE_MAX = 60;
const SPOTLIGHT_TITLE_MAX = 60;

function GeneralTextsPane({ onSaved }) {
  const [draft, setDraft] = useState({
    heroHighlight: "",
    heroTitle: "",
    spotlightTitle: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  // { type: "success" | "error", message } — cleared automatically after 5s,
  // rendered right next to the "ذخیره تغییرات" button.
  const [saveStatus, setSaveStatus] = useState(null);
  const saveStatusTimeoutRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const flashSaveStatus = (type, message) => {
    window.clearTimeout(saveStatusTimeoutRef.current);
    setSaveStatus({ type, message });
    saveStatusTimeoutRef.current = window.setTimeout(
      () => setSaveStatus(null),
      5000,
    );
  };

  useEffect(() => () => window.clearTimeout(saveStatusTimeoutRef.current), []);

  // heroImageUrl: last known-good URL from the server. heroImageFile /
  // heroImageDataUrl: a newly-picked file staged for upload (not sent until
  // "ذخیره تغییرات" is pressed). heroImageRemoved: user explicitly cleared
  // the image without picking a replacement.
  const [heroImageUrl, setHeroImageUrl] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImageDataUrl, setHeroImageDataUrl] = useState(null);
  const [heroImageRemoved, setHeroImageRemoved] = useState(false);
  const heroImageInputRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setLoadError("");
    getLandingGeneral()
      .then((data) => {
        if (ignore) return;
        setDraft({
          heroHighlight: data.heroHighlight || "",
          heroTitle: data.heroTitle || "",
          spotlightTitle: data.spotlightTitle || "",
        });
        setHeroImageUrl(data.heroImageUrl || null);
        setHeroImageFile(null);
        setHeroImageDataUrl(null);
        setHeroImageRemoved(false);
      })
      .catch(() => {
        if (!ignore)
          setLoadError("خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.");
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const heroImagePreview = heroImageDataUrl
    ? heroImageDataUrl
    : heroImageRemoved
      ? null
      : heroImageUrl;

  const handleHeroImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImageFile(file);
    setHeroImageRemoved(false);
    const reader = new FileReader();
    reader.onload = () => setHeroImageDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const removeHeroImage = () => {
    setHeroImageFile(null);
    setHeroImageDataUrl(null);
    setHeroImageRemoved(true);
    if (heroImageInputRef.current) heroImageInputRef.current.value = "";
  };

  const save = async () => {
    const errs = {};
    if (!draft.heroHighlight.trim())
      errs.heroHighlight = "این فیلد الزامی است.";
    if (!draft.heroTitle.trim()) errs.heroTitle = "این فیلد الزامی است.";
    if (!draft.spotlightTitle.trim())
      errs.spotlightTitle = "این فیلد الزامی است.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      let heroImageFileName = heroImageRemoved
        ? null
        : extractFileNameFromUrl(heroImageUrl);

      if (heroImageFile) {
        const uploaded = await uploadLandingHeroImage(
          heroImageFile,
          extractFileNameFromUrl(heroImageUrl),
        );
        heroImageFileName = uploaded.fileName;
      }

      const result = await updateLandingGeneral({
        heroHighlight: draft.heroHighlight.trim(),
        heroTitle: draft.heroTitle.trim(),
        spotlightTitle: draft.spotlightTitle.trim(),
        heroImageFileName,
      });

      setDraft({
        heroHighlight: result.heroHighlight,
        heroTitle: result.heroTitle,
        spotlightTitle: result.spotlightTitle,
      });
      setHeroImageUrl(result.heroImageUrl || null);
      setHeroImageFile(null);
      setHeroImageDataUrl(null);
      setHeroImageRemoved(false);
      if (heroImageInputRef.current) heroImageInputRef.current.value = "";
      onSaved("متن‌های عمومی ذخیره شد");
      flashSaveStatus("success", "تغییرات با موفقیت ذخیره شد");
    } catch {
      flashSaveStatus("error", "ذخیره تغییرات با خطا مواجه شد.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="panel landing-mgmt__panel">
        <div className="empty-hint">در حال بارگذاری...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="panel landing-mgmt__panel">
        <div className="empty-hint">{loadError}</div>
        <div className="panel-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel landing-mgmt__panel">
      <div className="form-vertical blog-mgmt__form--hero">
        <div className="landing-mgmt__field-title">عکس اصلی صفحه لندینگ</div>
        <p className="blog-mgmt__muted-text">
          این عکس به‌عنوان تصویر اول (هیرو) صفحه لندینگ نمایش داده می‌شود.
          پیشنهاد می‌شود عکسی با ابعاد ۱۹۲۰×۱۰۸۰ (افقی) آپلود شود تا در نمایش
          دسکتاپ کامل و بدون افت کیفیت جا بگیرد.
        </p>

        <input
          ref={heroImageInputRef}
          type="file"
          accept="image/*"
          className="landing-mgmt__hero-image-input"
          onChange={handleHeroImageSelect}
        />
        <button
          type="button"
          className="landing-mgmt__hero-image-upload-btn"
          onClick={() => heroImageInputRef.current?.click()}
        >
          <i className="fas fa-cloud-arrow-up" />
          <span>
            {heroImagePreview ? "تغییر عکس لندینگ" : "آپلود عکس لندینگ"}
          </span>
        </button>

        {heroImagePreview && (
          <button
            type="button"
            className="landing-mgmt__hero-image-remove"
            onClick={removeHeroImage}
          >
            <i className="fas fa-trash" />
            <span>حذف عکس</span>
          </button>
        )}

        <div className="landing-mgmt__hero-image-previews">
          <div className="landing-mgmt__hero-image-window landing-mgmt__hero-image-window--laptop">
            <span className="landing-mgmt__hero-image-window-label">
              <i className="fas fa-display" />
              نمای دسکتاپ
            </span>
            <div className="landing-mgmt__hero-image-frame">
              {heroImagePreview ? (
                <img
                  src={heroImagePreview}
                  alt="پیش‌نمایش عکس لندینگ در لپ‌تاپ"
                />
              ) : (
                <span className="landing-mgmt__hero-image-placeholder">
                  <i className="fas fa-image" />
                  عکسی انتخاب نشده
                </span>
              )}
            </div>
          </div>

          <div className="landing-mgmt__hero-image-window landing-mgmt__hero-image-window--mobile">
            <span className="landing-mgmt__hero-image-window-label">
              <i className="fas fa-mobile-screen-button" />
              نمای موبایل
            </span>
            <div className="landing-mgmt__hero-image-frame">
              {heroImagePreview ? (
                <img
                  src={heroImagePreview}
                  alt="پیش‌نمایش عکس لندینگ در موبایل"
                />
              ) : (
                <span className="landing-mgmt__hero-image-placeholder">
                  <i className="fas fa-image" />
                  عکسی انتخاب نشده
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-vertical blog-mgmt__form--hero landing-mgmt__section-spacer">
        <div className="landing-mgmt__field-title">هیرو اصلی صفحه</div>

        <div className="input-group">
          <div className="blog-mgmt__label-row">
            <label>کلمه هایلایت (نارنجی)</label>
            <span className="blog-mgmt__char-count">
              {toPersianDigits(draft.heroHighlight.length)}/
              {toPersianDigits(HERO_TITLE_MAX)}
            </span>
          </div>
          <input
            type="text"
            value={draft.heroHighlight}
            maxLength={HERO_TITLE_MAX}
            onChange={(e) =>
              setDraft({ ...draft, heroHighlight: e.target.value })
            }
          />
          {errors.heroHighlight && (
            <span className="form-error">{errors.heroHighlight}</span>
          )}
        </div>

        <div className="input-group">
          <div className="blog-mgmt__label-row">
            <label>ادامه متن هیرو</label>
            <span className="blog-mgmt__char-count">
              {toPersianDigits(draft.heroTitle.length)}/
              {toPersianDigits(HERO_TITLE_MAX)}
            </span>
          </div>
          <input
            type="text"
            value={draft.heroTitle}
            maxLength={HERO_TITLE_MAX}
            onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })}
          />
          {errors.heroTitle && (
            <span className="form-error">{errors.heroTitle}</span>
          )}
        </div>
      </div>

      <div className="landing-mgmt__hero-preview">
        <span className="highlight-text">{draft.heroHighlight}</span>{" "}
        <span>{draft.heroTitle}</span>
      </div>

      <div className="form-vertical blog-mgmt__form--hero landing-mgmt__section-spacer">
        <div className="landing-mgmt__field-title">
          عنوان بخش «با منرو تو چشم باش»
        </div>

        <div className="input-group">
          <div className="blog-mgmt__label-row">
            <label>متن عنوان</label>
            <span className="blog-mgmt__char-count">
              {toPersianDigits(draft.spotlightTitle.length)}/
              {toPersianDigits(SPOTLIGHT_TITLE_MAX)}
            </span>
          </div>
          <input
            type="text"
            value={draft.spotlightTitle}
            maxLength={SPOTLIGHT_TITLE_MAX}
            onChange={(e) =>
              setDraft({ ...draft, spotlightTitle: e.target.value })
            }
          />
          {errors.spotlightTitle && (
            <span className="form-error">{errors.spotlightTitle}</span>
          )}
        </div>
        <p className="blog-mgmt__muted-text">
          کادر زیر این عنوان (نمایش موکاپ اپلیکیشن) فعلاً ثابت است و از این پنل
          قابل ویرایش نیست.
        </p>
      </div>

      <div className="panel-actions">
        {saveStatus && (
          <span
            className={
              saveStatus.type === "success"
                ? "landing-mgmt__save-status landing-mgmt__save-status--success"
                : "landing-mgmt__save-status landing-mgmt__save-status--error"
            }
          >
            {saveStatus.message}
          </span>
        )}
        <button className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 2) REASONS ("چرا منرو؟" cards)                                      */
/* ================================================================== */

const REASON_TITLE_MAX = 30;
const REASON_DESC_MAX = 150;
// Must match LandingReasonService.MaxReasonsCount on the backend — enforced
// there too, this is just so the admin sees the limit before hitting save.
const REASONS_LIMIT = 4;

const REASON_COLOR_PRESETS = [
  "#7C3AED",
  "#F97316",
  "#22C55E",
  "#3B82F6",
  "#EF4444",
  "#EAB308",
];

// A curated set of frequently-useful Font Awesome solid icons for the
// "چرا منرو؟" cards, shown in the icon-picker modal so the admin can click
// one instead of remembering/typing FA class names by hand. The text input
// next to it still accepts any FA class directly for anything not listed
// here.
const REASON_ICON_OPTIONS = [
  "fas fa-bolt",
  "fas fa-star",
  "fas fa-heart",
  "fas fa-crown",
  "fas fa-fire",
  "fas fa-gem",
  "fas fa-headphones-simple",
  "fas fa-shield-halved",
  "fas fa-thumbs-up",
  "fas fa-utensils",
  "fas fa-truck-fast",
  "fas fa-clock",
  "fas fa-wallet",
  "fas fa-gift",
  "fas fa-rocket",
  "fas fa-lock",
  "fas fa-mobile-screen-button",
  "fas fa-comments",
  "fas fa-chart-line",
  "fas fa-handshake",
  "fas fa-award",
  "fas fa-leaf",
  "fas fa-percent",
  "fas fa-circle-check",
  "fas fa-users",
  "fas fa-robot",
];

function emptyReason() {
  return {
    id: null,
    icon: "fas fa-bolt",
    color: REASON_COLOR_PRESETS[0],
    title: "",
    description: "",
  };
}

function ReasonsPane({ onSaved }) {
  const [reasons, setReasons] = useState([]);
  const [modalReason, setModalReason] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setLoadError("");
    getLandingReasons()
      .then((data) => !ignore && setReasons(data))
      .catch(() => {
        if (!ignore)
          setLoadError("خطا در دریافت دلایل. لطفاً دوباره تلاش کنید.");
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const openNew = () => {
    if (reasons.length >= REASONS_LIMIT) return;
    setErrors({});
    setIconPickerOpen(false);
    setModalReason(emptyReason());
  };
  const openEdit = (reason) => {
    setErrors({});
    setIconPickerOpen(false);
    setModalReason({ ...reason });
  };
  const closeReasonModal = () => {
    setModalReason(null);
    setIconPickerOpen(false);
  };

  const save = async () => {
    const errs = {};
    const title = modalReason.title.trim();
    const description = modalReason.description.trim();
    if (!title) errs.title = "عنوان الزامی است.";
    else if (title.length > REASON_TITLE_MAX)
      errs.title = `عنوان نباید بیشتر از ${toPersianDigits(REASON_TITLE_MAX)} کاراکتر باشد.`;
    if (!description) errs.description = "متن الزامی است.";
    else if (description.length > REASON_DESC_MAX)
      errs.description = `متن نباید بیشتر از ${toPersianDigits(REASON_DESC_MAX)} کاراکتر باشد.`;
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const payload = { ...modalReason, title, description };
      if (modalReason.id) {
        const updated = await updateLandingReason(modalReason.id, payload);
        setReasons((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r)),
        );
      } else {
        const created = await createLandingReason(payload);
        setReasons((prev) => [...prev, created]);
      }
      closeReasonModal();
      onSaved("دلیل ذخیره شد");
    } catch (err) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "string" ? err.response.data : null);
      setErrors({
        submit: serverMessage || "ذخیره با خطا مواجه شد. دوباره تلاش کنید.",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setDeletingId(id);
    try {
      await deleteLandingReason(id);
      setReasons((prev) => prev.filter((r) => r.id !== id));
      onSaved("دلیل حذف شد");
    } catch {
      // keep the item in the list on failure so nothing looks silently lost
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= reasons.length) return;
    const item = reasons[index];
    const direction = dir === -1 ? "up" : "down";
    setMovingId(item.id);
    try {
      await moveLandingReason(item.id, direction);
      setReasons((prev) => {
        const next = [...prev];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
    } catch {
      // ignore — order stays as-is on failure
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <div className="empty-hint">در حال بارگذاری...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="panel">
        <div className="empty-hint">{loadError}</div>
        <div className="panel-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-actions blog-mgmt__panel-actions--start">
        {reasons.length >= REASONS_LIMIT && (
          <span className="landing-mgmt__limit-hint">
            حداکثر {toPersianDigits(REASONS_LIMIT)} دلیل قابل ثبت است. برای
            افزودن مورد جدید، ابتدا یکی از موارد فعلی را حذف کنید.
          </span>
        )}
        <button
          className="btn btn-primary"
          onClick={openNew}
          disabled={reasons.length >= REASONS_LIMIT}
          title={
            reasons.length >= REASONS_LIMIT
              ? `حداکثر ${toPersianDigits(REASONS_LIMIT)} دلیل قابل ثبت است`
              : undefined
          }
        >
          <i className="fas fa-plus" /> دلیل جدید
        </button>
      </div>

      {/* Only 4 reason cards exist by design, so they're stacked vertically
          (one full-width row each) instead of the tag-style wrapping grid —
          see .landing-mgmt__reason-list in admin-dashboard.css. */}
      <div className="custom-icons-list landing-mgmt__reason-list">
        {reasons.map((reason, index) => (
          <div
            key={reason.id}
            className="custom-icon-row landing-mgmt__reason-row"
          >
            <span
              className="icon landing-mgmt__reason-icon"
              style={{ "--reason-color": reason.color }}
            >
              <i className={reason.icon} />
            </span>
            <div className="name landing-mgmt__reason-name">
              <strong>{reason.title}</strong>
              <small className="blog-mgmt__cat-subtitle">
                {reason.description}
              </small>
            </div>
            <div className="actions">
              <button
                className="mh-reorder-btn btn-icon"
                disabled={index === 0 || movingId === reason.id}
                onClick={() => move(index, -1)}
                title="بالا"
              >
                <i className="fas fa-chevron-up" />
              </button>
              <button
                className="btn-icon"
                disabled={
                  index === reasons.length - 1 || movingId === reason.id
                }
                onClick={() => move(index, 1)}
                title="پایین"
              >
                <i className="fas fa-chevron-down" />
              </button>
              <button
                className="btn-icon"
                disabled={deletingId === reason.id}
                onClick={() => openEdit(reason)}
                title="ویرایش"
              >
                <i className="fas fa-pen" />
              </button>
              <button
                className="btn-icon btn-danger"
                disabled={deletingId === reason.id}
                onClick={() => setConfirmDeleteId(reason.id)}
                title="حذف"
              >
                <i className="fas fa-trash" />
              </button>
            </div>
          </div>
        ))}
        {reasons.length === 0 && (
          <div className="empty-hint">هنوز دلیلی اضافه نشده.</div>
        )}
      </div>

      {modalReason && (
        <div
          className="modal-backdrop"
          onClick={() => !saving && closeReasonModal()}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{modalReason.id ? "ویرایش دلیل" : "دلیل جدید"}</h4>
              <button className="btn-icon" onClick={closeReasonModal}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="form-vertical">
              <div className="input-group">
                <div className="blog-mgmt__label-row">
                  <label>عنوان</label>
                  <span className="blog-mgmt__char-count">
                    {toPersianDigits(modalReason.title.length)}/
                    {toPersianDigits(REASON_TITLE_MAX)}
                  </span>
                </div>
                <input
                  type="text"
                  value={modalReason.title}
                  maxLength={REASON_TITLE_MAX}
                  onChange={(e) =>
                    setModalReason({ ...modalReason, title: e.target.value })
                  }
                />
                {errors.title && (
                  <span className="form-error">{errors.title}</span>
                )}
              </div>

              <div className="input-group">
                <div className="blog-mgmt__label-row">
                  <label>توضیحات</label>
                  <span className="blog-mgmt__char-count">
                    {toPersianDigits(modalReason.description.length)}/
                    {toPersianDigits(REASON_DESC_MAX)}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={modalReason.description}
                  maxLength={REASON_DESC_MAX}
                  onChange={(e) =>
                    setModalReason({
                      ...modalReason,
                      description: e.target.value,
                    })
                  }
                />
                {errors.description && (
                  <span className="form-error">{errors.description}</span>
                )}
              </div>

              <div className="input-group">
                <label>آیکون (کلاس Font Awesome)</label>
                <div className="landing-mgmt__icon-row">
                  <span
                    className="landing-mgmt__icon-preview"
                    style={{ "--reason-color": modalReason.color }}
                  >
                    <i className={modalReason.icon || "fas fa-star"} />
                  </span>
                  <input
                    type="text"
                    placeholder="fas fa-bolt"
                    value={modalReason.icon}
                    onChange={(e) =>
                      setModalReason({ ...modalReason, icon: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-secondary landing-mgmt__icon-pick-btn"
                    onClick={() => setIconPickerOpen(true)}
                  >
                    <i className="fas fa-icons" />
                    انتخاب از لیست
                  </button>
                </div>
                <p className="blog-mgmt__muted-text">
                  کلاس آیکون را مستقیم بنویسید یا با دکمه «انتخاب از لیست» یکی
                  از آیکون‌های پراستفاده را انتخاب کنید.
                </p>
              </div>

              <div className="input-group">
                <label>رنگ آیکون</label>
                <div className="blog-mgmt__color-row">
                  <input
                    type="color"
                    value={modalReason.color}
                    onChange={(e) =>
                      setModalReason({ ...modalReason, color: e.target.value })
                    }
                    className="blog-mgmt__color-swatch"
                  />
                  <input
                    type="text"
                    value={modalReason.color}
                    onChange={(e) =>
                      setModalReason({ ...modalReason, color: e.target.value })
                    }
                  />
                </div>
                <div className="landing-mgmt__color-presets">
                  {REASON_COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="landing-mgmt__color-preset"
                      style={{ "--preset-color": c }}
                      onClick={() =>
                        setModalReason({ ...modalReason, color: c })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {errors.submit && (
                <span className="form-error">{errors.submit}</span>
              )}
              <button
                className="btn btn-secondary"
                disabled={saving}
                onClick={closeReasonModal}
              >
                انصراف
              </button>
              <button
                className="btn btn-primary"
                disabled={saving}
                onClick={save}
              >
                {saving ? "در حال ذخیره..." : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}

      {iconPickerOpen && modalReason && (
        <div
          className="modal-backdrop landing-mgmt__icon-picker-backdrop"
          onClick={() => setIconPickerOpen(false)}
        >
          <div
            className="modal landing-mgmt__icon-picker-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>انتخاب آیکون</h4>
              <button
                className="btn-icon"
                onClick={() => setIconPickerOpen(false)}
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="landing-mgmt__icon-picker-grid">
              {REASON_ICON_OPTIONS.map((iconClass) => (
                <button
                  key={iconClass}
                  type="button"
                  className={`landing-mgmt__icon-picker-item ${
                    modalReason.icon === iconClass ? "active" : ""
                  }`}
                  title={iconClass}
                  onClick={() => {
                    setModalReason({ ...modalReason, icon: iconClass });
                    setIconPickerOpen(false);
                  }}
                >
                  <i className={iconClass} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          className="modal-backdrop"
          onClick={() => deletingId === null && setConfirmDeleteId(null)}
        >
          <div
            className="modal blog-mgmt__modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>حذف دلیل</h4>
            </div>
            <p className="blog-mgmt__muted-text">
              این کارت از بخش «چرا منرو؟» صفحه لندینگ حذف می‌شود.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                disabled={deletingId !== null}
                onClick={() => setConfirmDeleteId(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                disabled={deletingId !== null}
                onClick={() => remove(confirmDeleteId)}
              >
                {deletingId !== null ? "در حال حذف..." : "حذف شود"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 3) FAQ ("سوالات متداول")                                            */
/* ================================================================== */

const FAQ_QUESTION_MAX = 150;
const FAQ_ANSWER_MAX = 600;

function emptyFaq() {
  return { id: null, question: "", answer: "" };
}

function FaqPane({ onSaved }) {
  const [faqs, setFaqs] = useState([]);
  const [modalFaq, setModalFaq] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setLoadError("");
    getLandingFaqs()
      .then((data) => !ignore && setFaqs(data))
      .catch(() => {
        if (!ignore)
          setLoadError("خطا در دریافت سوالات. لطفاً دوباره تلاش کنید.");
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const openNew = () => {
    setErrors({});
    setModalFaq(emptyFaq());
  };
  const openEdit = (faq) => {
    setErrors({});
    setModalFaq({ ...faq });
  };

  const save = async () => {
    const errs = {};
    const question = modalFaq.question.trim();
    const answer = modalFaq.answer.trim();
    if (!question) errs.question = "متن سوال الزامی است.";
    else if (question.length > FAQ_QUESTION_MAX)
      errs.question = `سوال نباید بیشتر از ${toPersianDigits(FAQ_QUESTION_MAX)} کاراکتر باشد.`;
    if (!answer) errs.answer = "متن پاسخ الزامی است.";
    else if (answer.length > FAQ_ANSWER_MAX)
      errs.answer = `پاسخ نباید بیشتر از ${toPersianDigits(FAQ_ANSWER_MAX)} کاراکتر باشد.`;
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const payload = { question, answer };
      if (modalFaq.id) {
        const updated = await updateLandingFaq(modalFaq.id, payload);
        setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      } else {
        const created = await createLandingFaq(payload);
        setFaqs((prev) => [...prev, created]);
      }
      setModalFaq(null);
      onSaved("سوال ذخیره شد");
    } catch {
      setErrors({ submit: "ذخیره با خطا مواجه شد. دوباره تلاش کنید." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setDeletingId(id);
    try {
      await deleteLandingFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      onSaved("سوال حذف شد");
    } catch {
      // keep the item in the list on failure so nothing looks silently lost
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= faqs.length) return;
    const item = faqs[index];
    const direction = dir === -1 ? "up" : "down";
    setMovingId(item.id);
    try {
      await moveLandingFaq(item.id, direction);
      setFaqs((prev) => {
        const next = [...prev];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
    } catch {
      // ignore — order stays as-is on failure
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <div className="empty-hint">در حال بارگذاری...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="panel">
        <div className="empty-hint">{loadError}</div>
        <div className="panel-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-actions blog-mgmt__panel-actions--start">
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus" /> سوال جدید
        </button>
      </div>

      <div className="landing-mgmt__faq-list">
        {faqs.map((faq, index) => {
          const expanded = expandedId === faq.id;
          return (
            <div key={faq.id} className="landing-mgmt__faq-row">
              <button
                type="button"
                className="landing-mgmt__faq-question"
                onClick={() => setExpandedId(expanded ? null : faq.id)}
              >
                <i
                  className={`fas fa-chevron-${expanded ? "up" : "down"} landing-mgmt__faq-chevron`}
                />
                <span>{faq.question}</span>
              </button>

              {expanded && (
                <p className="landing-mgmt__faq-answer">{faq.answer}</p>
              )}

              <div className="actions landing-mgmt__faq-actions">
                <button
                  className="mh-reorder-btn btn-icon"
                  disabled={index === 0 || movingId === faq.id}
                  onClick={() => move(index, -1)}
                  title="بالا"
                >
                  <i className="fas fa-chevron-up" />
                </button>
                <button
                  className="btn-icon"
                  disabled={index === faqs.length - 1 || movingId === faq.id}
                  onClick={() => move(index, 1)}
                  title="پایین"
                >
                  <i className="fas fa-chevron-down" />
                </button>
                <button
                  className="btn-icon"
                  disabled={deletingId === faq.id}
                  onClick={() => openEdit(faq)}
                  title="ویرایش"
                >
                  <i className="fas fa-pen" />
                </button>
                <button
                  className="btn-icon btn-danger"
                  disabled={deletingId === faq.id}
                  onClick={() => setConfirmDeleteId(faq.id)}
                  title="حذف"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          );
        })}
        {faqs.length === 0 && (
          <div className="empty-hint">هنوز سوالی اضافه نشده.</div>
        )}
      </div>

      {modalFaq && (
        <div
          className="modal-backdrop"
          onClick={() => !saving && setModalFaq(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{modalFaq.id ? "ویرایش سوال" : "سوال جدید"}</h4>
              <button className="btn-icon" onClick={() => setModalFaq(null)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="form-vertical">
              <div className="input-group">
                <div className="blog-mgmt__label-row">
                  <label>متن سوال</label>
                  <span className="blog-mgmt__char-count">
                    {toPersianDigits(modalFaq.question.length)}/
                    {toPersianDigits(FAQ_QUESTION_MAX)}
                  </span>
                </div>
                <input
                  type="text"
                  value={modalFaq.question}
                  maxLength={FAQ_QUESTION_MAX}
                  onChange={(e) =>
                    setModalFaq({ ...modalFaq, question: e.target.value })
                  }
                />
                {errors.question && (
                  <span className="form-error">{errors.question}</span>
                )}
              </div>

              <div className="input-group">
                <div className="blog-mgmt__label-row">
                  <label>متن پاسخ</label>
                  <span className="blog-mgmt__char-count">
                    {toPersianDigits(modalFaq.answer.length)}/
                    {toPersianDigits(FAQ_ANSWER_MAX)}
                  </span>
                </div>
                <textarea
                  rows={7}
                  className="landing-mgmt__faq-answer-input"
                  value={modalFaq.answer}
                  maxLength={FAQ_ANSWER_MAX}
                  onChange={(e) =>
                    setModalFaq({ ...modalFaq, answer: e.target.value })
                  }
                />
                {errors.answer && (
                  <span className="form-error">{errors.answer}</span>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {errors.submit && (
                <span className="form-error">{errors.submit}</span>
              )}
              <button
                className="btn btn-secondary"
                disabled={saving}
                onClick={() => setModalFaq(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-primary"
                disabled={saving}
                onClick={save}
              >
                {saving ? "در حال ذخیره..." : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          className="modal-backdrop"
          onClick={() => deletingId === null && setConfirmDeleteId(null)}
        >
          <div
            className="modal blog-mgmt__modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>حذف سوال</h4>
            </div>
            <p className="blog-mgmt__muted-text">
              این سوال از بخش «سوالات متداول» صفحه لندینگ حذف می‌شود.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                disabled={deletingId !== null}
                onClick={() => setConfirmDeleteId(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                disabled={deletingId !== null}
                onClick={() => remove(confirmDeleteId)}
              >
                {deletingId !== null ? "در حال حذف..." : "حذف شود"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
