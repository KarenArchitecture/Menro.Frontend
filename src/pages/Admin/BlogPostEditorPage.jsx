import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBlogPost,
  updateBlogPost,
  getBlogCategories,
} from "../../api/adminBlogs";
import { useGlobalUI } from "../../components/common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../assets/css/admin/admin.css";
import "../../assets/css/admin/blogPostEditor.css";

function apiErrorMessage(err, fallback = "خطایی رخ داد. دوباره تلاش کنید.") {
  return err?.response?.data?.message || err?.response?.data?.title || fallback;
}

function draftFromApi(p) {
  return {
    title: p.title,
    coverFile: null,
    coverSrc: p.coverImageUrl || "",
    removeImage: false,
    readingMins: p.readingMinutes,
    categoryId: p.categoryId || "", // "" یعنی بدون دسته‌بندی
    published: p.isPublished,
  };
}

function draftToFormData(draft) {
  const fd = new FormData();
  fd.append("Title", draft.title);
  fd.append("ReadingMinutes", String(Number(draft.readingMins)));
  if (draft.categoryId) fd.append("CategoryId", draft.categoryId);
  fd.append("IsPublished", String(!!draft.published));
  if (draft.coverFile) fd.append("CoverImage", draft.coverFile);
  if (draft.removeImage) fd.append("RemoveImage", "true");
  return fd;
}

export default function BlogPostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useGlobalUI();
  useDocumentTitle("ویرایش پست وبلاگ");

  const [draft, setDraft] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [post, cats] = await Promise.all([
          getBlogPost(id),
          getBlogCategories(),
        ]);
        if (!cancelled) {
          setDraft(draftFromApi(post));
          setCategories(cats);
        }
      } catch (err) {
        if (!cancelled) {
          notify({
            type: "error",
            message: apiErrorMessage(err, "بارگذاری پست با خطا مواجه شد."),
          });
          navigate(-1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({
        ...prev,
        coverFile: file,
        coverSrc: reader.result,
        removeImage: false,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = (e) => {
    e.stopPropagation();
    setDraft((prev) => ({
      ...prev,
      coverFile: null,
      coverSrc: "",
      removeImage: true,
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!draft.title.trim()) errs.title = "عنوان پست الزامی است.";
    if (!draft.readingMins || draft.readingMins <= 0)
      errs.readingMins = "زمان مطالعه باید بزرگ‌تر از صفر باشد.";
    return errs;
  };

  const save = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const updated = await updateBlogPost(id, draftToFormData(draft));
      setDraft(draftFromApi(updated));
      notify({ type: "success", message: "پست ذخیره شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "ذخیره پست با خطا مواجه شد."),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !draft) {
    return (
      <div className="bpe">
        <div className="bpe__loading">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="bpe">
      <div className="bpe__header">
        <div className="bpe__header-titles">
          <div>
            <span className="bpe__eyebrow">ویرایش پست وبلاگ</span>
            <h2 className="bpe__title">{draft.title || "بدون عنوان"}</h2>
          </div>
          <span
            className={`bpe__status ${draft.published ? "bpe__status--published" : "bpe__status--draft"}`}
          >
            {draft.published ? "منتشر شده" : "پیش‌نویس"}
          </span>
        </div>
        <button className="bpe__back" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-right" /> بازگشت
        </button>
      </div>

      <div className="bpe__layout">
        {/* Main column */}
        <div>
          <div className="bpe__card">
            <h3 className="bpe__card-title">
              <i className="fas fa-heading" /> عنوان و تصویر کاور
            </h3>

            <div className="bpe__field">
              <label className="bpe__label">عنوان پست</label>
              <input
                type="text"
                className="bpe__input bpe__title-input"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
              {errors.title && (
                <span className="bpe__error">{errors.title}</span>
              )}
            </div>

            <div className="bpe__field">
              <label className="bpe__label">تصویر کاور</label>
              <div
                className="bpe__cover"
                onClick={() => fileInputRef.current?.click()}
              >
                {draft.coverSrc ? (
                  <>
                    <img src={draft.coverSrc} alt={draft.title} />
                    <div className="bpe__cover-overlay">
                      <button
                        type="button"
                        className="bpe__cover-btn bpe__cover-btn--change"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <i className="fas fa-cloud-arrow-up" /> تغییر عکس
                      </button>
                      <button
                        type="button"
                        className="bpe__cover-btn bpe__cover-btn--remove"
                        onClick={handleRemoveCoverImage}
                      >
                        <i className="fas fa-trash" /> حذف
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bpe__cover-empty">
                    <i className="fas fa-cloud-arrow-up" />
                    <span>برای آپلود عکس کاور کلیک کنید</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="bpe__cover-input"
                onChange={handleCoverImageChange}
              />
            </div>
          </div>

          <div className="bpe__card">
            <h3 className="bpe__card-title">
              <i className="fas fa-file-lines" /> محتوای پست
            </h3>
            <div className="bpe__content-placeholder">
              <i className="fas fa-pen-to-square" />
              ادیتور محتوا (Tiptap) در قدم بعدی همین‌جا اضافه می‌شود
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bpe__sidebar">
          <div className="bpe__card">
            <h3 className="bpe__card-title">
              <i className="fas fa-sliders" /> تنظیمات انتشار
            </h3>

            <div className="bpe__field">
              <label className="bpe__label">دسته‌بندی</label>
              <select
                className="bpe__select"
                value={draft.categoryId}
                onChange={(e) =>
                  setDraft({ ...draft, categoryId: e.target.value })
                }
              >
                <option value="">بدون دسته‌بندی</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="bpe__field">
              <label className="bpe__label">زمان مطالعه (دقیقه)</label>
              <input
                type="number"
                min={1}
                className="bpe__input"
                value={draft.readingMins}
                onChange={(e) =>
                  setDraft({ ...draft, readingMins: Number(e.target.value) })
                }
              />
              {errors.readingMins && (
                <span className="bpe__error">{errors.readingMins}</span>
              )}
            </div>

            <div className="bpe__field bpe__switch-row">
              <label className="bpe__label">منتشر شود</label>
              <label className="bpe__switch">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) =>
                    setDraft({ ...draft, published: e.target.checked })
                  }
                />
                <span className="bpe__switch-track">
                  <span className="bpe__switch-thumb" />
                </span>
              </label>
            </div>

            <button
              className="btn btn-primary bpe__save"
              disabled={saving}
              onClick={save}
            >
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
