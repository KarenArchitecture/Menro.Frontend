import { useRef, useState } from "react";

/* ======================================================================
 * LandingManagementSection
 * ----------------------------------------------------------------------
 * Design-only panel for managing the dynamic parts of the public landing
 * page. There is no backend yet, so every pane below works purely on
 * local React state (a "draft" that lives only in the browser tab).
 *
 * When the API is ready, each pane is built to be dropped in exactly like
 * BlogManagementSection.jsx's panes: replace the local seed arrays with a
 * `getLanding...` call in a useEffect, and replace `save()` /
 * `remove()` / `move()` with the matching `create/update/delete/move`
 * calls, following the same mapFromApi / mapToApi convention used in
 * adminBlogs.js.
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

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

      <div className="landing-mgmt__info-banner">
        <i className="fas fa-circle-info" />
        <span>
          آمار بالای صفحه (تعداد رستوران‌ها، محصولات و ...) به‌صورت خودکار و
          واقعی محاسبه می‌شود، پلن‌های اشتراک بعد از راه‌اندازی سیستم اشتراک از
          همین‌جا مدیریت خواهند شد و بخش بلاگ مستقیماً از تب «مدیریت وبلاگ»
          خوانده می‌شود؛ به همین دلیل این سه بخش در این تب وجود ندارند.
        </span>
      </div>

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
  // TODO(api): replace seed with `await getLandingGeneral()` in a useEffect,
  // and `save()` with `await updateLandingGeneral(draft)`.
  const [draft, setDraft] = useState({
    heroHighlight: "منرو",
    heroTitle: "بهترین همیار رستوران تو",
    spotlightTitle: "با منرو تو چشم باش",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // TODO(api): seed from `getLandingGeneral().heroImageUrl`. `heroImageFile`
  // only exists locally so the actual multipart upload (whenever the
  // backend endpoint exists) has the raw file to send; `heroImage` is just
  // the data URL used for the two previews below.
  const [heroImage, setHeroImage] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const heroImageInputRef = useRef(null);

  const handleHeroImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setHeroImage(reader.result);
    reader.readAsDataURL(file);
  };

  const removeHeroImage = () => {
    setHeroImage(null);
    setHeroImageFile(null);
    if (heroImageInputRef.current) heroImageInputRef.current.value = "";
  };

  const save = () => {
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
    // Simulated save — no backend yet.
    window.setTimeout(() => {
      setSaving(false);
      onSaved("متن‌های عمومی ذخیره شد");
    }, 300);
  };

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
          <span>{heroImage ? "تغییر عکس لندینگ" : "آپلود عکس لندینگ"}</span>
        </button>

        {heroImage && (
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
              {heroImage ? (
                <img src={heroImage} alt="پیش‌نمایش عکس لندینگ در لپ‌تاپ" />
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
              {heroImage ? (
                <img src={heroImage} alt="پیش‌نمایش عکس لندینگ در موبایل" />
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

const REASON_COLOR_PRESETS = [
  "#7C3AED",
  "#F97316",
  "#22C55E",
  "#3B82F6",
  "#EF4444",
  "#EAB308",
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

function seedReasons() {
  // TODO(api): replace with `await getLandingReasons()`.
  return [
    {
      id: makeId("reason"),
      icon: "fas fa-headphones-simple",
      color: "#7C3AED",
      title: "عنوان دلیل",
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.",
    },
    {
      id: makeId("reason"),
      icon: "fas fa-book-open",
      color: "#F97316",
      title: "عنوان دلیل",
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.",
    },
    {
      id: makeId("reason"),
      icon: "fas fa-heart",
      color: "#EF4444",
      title: "عنوان دلیل",
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.",
    },
    {
      id: makeId("reason"),
      icon: "fas fa-robot",
      color: "#22C55E",
      title: "عنوان دلیل",
      description:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.",
    },
  ];
}

function ReasonsPane({ onSaved }) {
  const [reasons, setReasons] = useState(seedReasons);
  const [modalReason, setModalReason] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setErrors({});
    setModalReason(emptyReason());
  };
  const openEdit = (reason) => {
    setErrors({});
    setModalReason({ ...reason });
  };

  const save = () => {
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
    // TODO(api): createLandingReason / updateLandingReason.
    window.setTimeout(() => {
      setReasons((prev) => {
        if (modalReason.id) {
          return prev.map((r) => (r.id === modalReason.id ? modalReason : r));
        }
        return [...prev, { ...modalReason, id: makeId("reason") }];
      });
      setSaving(false);
      setModalReason(null);
      onSaved("دلیل ذخیره شد");
    }, 250);
  };

  const remove = (id) => {
    // TODO(api): deleteLandingReason(id).
    setReasons((prev) => prev.filter((r) => r.id !== id));
    setConfirmDeleteId(null);
    onSaved("دلیل حذف شد");
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= reasons.length) return;
    // TODO(api): moveLandingReason(id, "up" | "down").
    setReasons((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div className="panel">
      <div className="panel-actions blog-mgmt__panel-actions--start">
        <button className="btn btn-primary" onClick={openNew}>
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
                disabled={index === 0}
                onClick={() => move(index, -1)}
                title="بالا"
              >
                <i className="fas fa-chevron-up" />
              </button>
              <button
                className="btn-icon"
                disabled={index === reasons.length - 1}
                onClick={() => move(index, 1)}
                title="پایین"
              >
                <i className="fas fa-chevron-down" />
              </button>
              <button
                className="btn-icon"
                onClick={() => openEdit(reason)}
                title="ویرایش"
              >
                <i className="fas fa-pen" />
              </button>
              <button
                className="btn-icon btn-danger"
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
          onClick={() => !saving && setModalReason(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{modalReason.id ? "ویرایش دلیل" : "دلیل جدید"}</h4>
              <button className="btn-icon" onClick={() => setModalReason(null)}>
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
                </div>
                <p className="blog-mgmt__muted-text">
                  مثال: fas fa-bolt، fas fa-heart، fas fa-headphones-simple
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
              <button
                className="btn btn-secondary"
                disabled={saving}
                onClick={() => setModalReason(null)}
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
          onClick={() => setConfirmDeleteId(null)}
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
                onClick={() => setConfirmDeleteId(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                onClick={() => remove(confirmDeleteId)}
              >
                حذف شود
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

const FAQ_QUESTION_MAX = 120;
const FAQ_ANSWER_MAX = 1200;

function emptyFaq() {
  return { id: null, question: "", answer: "" };
}

function seedFaqs() {
  // TODO(api): replace with `await getLandingFaqs()`.
  return [
    {
      id: makeId("faq"),
      question: "سوال اول با متنی طولانی‌تر؟",
      answer:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.",
    },
    {
      id: makeId("faq"),
      question: "سوال دوم با متنی بسیار طولانی‌تر؟",
      answer:
        "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.",
    },
    { id: makeId("faq"), question: "سوال سوم", answer: "پاسخ سوال سوم." },
    { id: makeId("faq"), question: "سوال چهارم", answer: "پاسخ سوال چهارم." },
    { id: makeId("faq"), question: "سوال پنجم", answer: "پاسخ سوال پنجم." },
  ];
}

function FaqPane({ onSaved }) {
  const [faqs, setFaqs] = useState(seedFaqs);
  const [modalFaq, setModalFaq] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const openNew = () => {
    setErrors({});
    setModalFaq(emptyFaq());
  };
  const openEdit = (faq) => {
    setErrors({});
    setModalFaq({ ...faq });
  };

  const save = () => {
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
    // TODO(api): createLandingFaq / updateLandingFaq.
    window.setTimeout(() => {
      setFaqs((prev) => {
        if (modalFaq.id) {
          return prev.map((f) => (f.id === modalFaq.id ? modalFaq : f));
        }
        return [...prev, { ...modalFaq, id: makeId("faq") }];
      });
      setSaving(false);
      setModalFaq(null);
      onSaved("سوال ذخیره شد");
    }, 250);
  };

  const remove = (id) => {
    // TODO(api): deleteLandingFaq(id).
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    setConfirmDeleteId(null);
    onSaved("سوال حذف شد");
  };

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= faqs.length) return;
    // TODO(api): moveLandingFaq(id, "up" | "down").
    setFaqs((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

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
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  title="بالا"
                >
                  <i className="fas fa-chevron-up" />
                </button>
                <button
                  className="btn-icon"
                  disabled={index === faqs.length - 1}
                  onClick={() => move(index, 1)}
                  title="پایین"
                >
                  <i className="fas fa-chevron-down" />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => openEdit(faq)}
                  title="ویرایش"
                >
                  <i className="fas fa-pen" />
                </button>
                <button
                  className="btn-icon btn-danger"
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
          onClick={() => setConfirmDeleteId(null)}
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
                onClick={() => setConfirmDeleteId(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                onClick={() => remove(confirmDeleteId)}
              >
                حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
