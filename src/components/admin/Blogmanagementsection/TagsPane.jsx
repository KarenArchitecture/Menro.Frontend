import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import {
  getBlogTags,
  createBlogTag,
  updateBlogTag,
  toggleBlogTagSuggested,
  deleteBlogTag,
} from "../../../api/adminBlogs.js";
import {
  normalizeTagNameLive,
  normalizeTagNameFinal,
} from "../../../utils/tagName.js";
import { useGlobalUI } from "../../common/GlobalUI/index.js";
import { toPersianDigits, apiErrorMessage } from "./blogManagementShared.js";

/* ================================================================== */
/* SIDEBAR "SUGGESTED TAGS" (name + article count)                     */
/* ================================================================== */

function mapTagFromApi(t) {
  return {
    id: t.id,
    name: t.name,
    count: `${toPersianDigits(t.articleCount)} مقاله`,
    suggested: !!t.suggested,
  };
}

function emptySidebarTag() {
  return { id: null, name: "", suggested: false };
}

// Sidebar block on the public blog is small - keep the number of tags an
// admin can mark "suggested" capped so the block never grows unbounded.
const MAX_SUGGESTED_TAGS = 10;

export default function TagsPane() {
  const { user } = useAuth();
  const isEditorUp = (user?.roles || []).some((r) =>
    ["admin", "editor"].includes(r.toLowerCase()),
  );
  const { notify, confirmModal } = useGlobalUI();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalTag, setModalTag] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  // Local-only, no API calls involved: free-text filter and a "suggested
  // only" switch that just narrow down what's already loaded in `tags`.
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlySuggested, setShowOnlySuggested] = useState(false);
  // Shown next to "برچسب جدید" in red when a toggle is rejected for hitting
  // the MAX_SUGGESTED_TAGS limit (separate from the generic apiError banner).
  const [limitError, setLimitError] = useState("");

  const reloadTags = useCallback(async () => {
    const data = await getBlogTags();
    setTags(data.map(mapTagFromApi));
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await reloadTags();
      } catch (err) {
        if (!cancelled)
          notify({
            type: "error",
            message: apiErrorMessage(err, "بارگذاری برچسب‌ها با خطا مواجه شد."),
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadTags]);

  // Count of currently-suggested tags, shown as the x/10 counter.
  const suggestedCount = useMemo(
    () => tags.filter((t) => t.suggested).length,
    [tags],
  );

  // Local-only filtering: text search over the name, optionally narrowed to
  // suggested-only tags. No API call - just derived from `tags` in memory.
  const filteredTags = useMemo(() => {
    const term = searchTerm.trim();
    return tags.filter((tag) => {
      if (showOnlySuggested && !tag.suggested) return false;
      if (term && !tag.name.includes(term)) return false;
      return true;
    });
  }, [tags, searchTerm, showOnlySuggested]);

  const openNew = () => {
    setError("");
    setLimitError("");
    setModalTag(emptySidebarTag());
  };
  const openEdit = (tag) => {
    setError("");
    setLimitError("");
    setModalTag({ ...tag });
  };

  const save = async () => {
    const name = normalizeTagNameFinal(modalTag.name);
    if (!name) {
      setError("نام برچسب الزامی است.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      if (modalTag.id) {
        await updateBlogTag(modalTag.id, name, modalTag.suggested);
      } else {
        await createBlogTag(name, modalTag.suggested);
      }
      await reloadTags();
      setModalTag(null);
      notify({ type: "success", message: "برچسب پیشنهادی ذخیره شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "ذخیره برچسب با خطا مواجه شد."),
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSuggested = async (tag) => {
    setLimitError("");
    try {
      await toggleBlogTagSuggested(tag.id);
      await reloadTags();
      notify({
        type: "success",
        message: tag.suggested
          ? "تگ از حالت پیشنهادی خارج شد"
          : "تگ پیشنهادی شد",
      });
    } catch (err) {
      if (err?.response?.status === 409) {
        setLimitError(
          apiErrorMessage(
            err,
            `حداکثر تعداد برچسب‌های پیشنهادی (${toPersianDigits(MAX_SUGGESTED_TAGS)} عدد) است.`,
          ),
        );
        window.clearTimeout(toggleSuggested._t);
        toggleSuggested._t = window.setTimeout(() => setLimitError(""), 5000);
      } else {
        notify({
          type: "error",
          message: apiErrorMessage(err, "تغییر وضعیت تگ با خطا مواجه شد."),
        });
      }
    }
  };

  const remove = async (id) => {
    try {
      await deleteBlogTag(id);
      await reloadTags();
      notify({ type: "success", message: "برچسب حذف شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "حذف برچسب با خطا مواجه شد."),
      });
    }
  };

  const handleDeleteClick = async (id) => {
    const ok = await confirmModal({
      title: "حذف برچسب",
      message: "آیا از حذف این برچسب مطمئن هستید؟",
      confirmText: "حذف شود",
      cancelText: "انصراف",
      danger: true,
    });
    if (!ok) return;
    await remove(id);
  };

  return (
    <div className="panel">
      <div className="admin-toolbar">
        <div className="admin-toolbar-group">
          <div className="admin-search-box">
            <input
              type="text"
              className="mh-input"
              placeholder="جستجو در برچسب‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <label className="blog-mgmt__suggested-toggle">
            <input
              type="checkbox"
              checked={showOnlySuggested}
              onChange={(e) => setShowOnlySuggested(e.target.checked)}
            />
            برچسب‌های پیشنهادی
          </label>
        </div>

        <div className="admin-toolbar-group">
          {limitError && (
            <span className="blog-mgmt__tag-limit-error">{limitError}</span>
          )}
          <span className="blog-mgmt__tag-counter">
            تگ‌های پیشنهادی سایدبار: {toPersianDigits(suggestedCount)}/
            {toPersianDigits(MAX_SUGGESTED_TAGS)}
          </span>
          {isEditorUp && (
            <button className="btn btn-primary" onClick={openNew}>
              <i className="fas fa-plus" /> برچسب جدید
            </button>
          )}
        </div>
      </div>

      {loading && <div className="empty-hint">در حال بارگذاری...</div>}

      <ul className="blog-mgmt__admin-tags-list blog-mgmt__tags-scroll">
        {!loading &&
          filteredTags.map((tag) => (
            <li key={tag.id} className="blog-mgmt__admin-tag-item">
              <div className="blog-mgmt__admin-tag-right">
                <span className="mobile-blog-tags__hash blog-mgmt__tag-hash">
                  #
                </span>
                <span className="blog-mgmt__admin-tag-name">{tag.name}</span>
              </div>
              <label
                className="blog-mgmt__suggested-toggle"
                title="نمایش این تگ در سایدبار عمومی وبلاگ"
              >
                <input
                  type="checkbox"
                  checked={tag.suggested}
                  onChange={() => toggleSuggested(tag)}
                />
                تگ پیشنهادی
              </label>
              {isEditorUp && (
                <div className="blog-mgmt__tag-actions">
                  <span className="blog-mgmt__admin-tag-count">
                    {tag.count}
                  </span>
                  <button
                    className="btn-icon"
                    onClick={() => openEdit(tag)}
                    title="ویرایش"
                  >
                    <i className="fas fa-pen" />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDeleteClick(tag.id)}
                    title="حذف"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              )}
            </li>
          ))}
        {!loading && tags.length === 0 && (
          <div className="empty-hint">هنوز برچسبی اضافه نشده.</div>
        )}
        {!loading && tags.length > 0 && filteredTags.length === 0 && (
          <div className="empty-hint">برچسبی مطابق فیلتر پیدا نشد.</div>
        )}
      </ul>

      {modalTag && (
        <div
          className="admin-modal-overlay"
          onClick={() => !saving && setModalTag(null)}
        >
          <div
            className="admin-modal admin-modal--compact"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>
                <i className="fas fa-hashtag" />
                {modalTag.id ? "ویرایش برچسب" : "برچسب جدید"}
              </h3>
              <button
                className="btn-icon"
                onClick={() => setModalTag(null)}
                disabled={saving}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="admin-modal__body">
              <div className="form-vertical">
                <div className="input-group">
                  <label>نام برچسب</label>
                  <input
                    type="text"
                    value={modalTag.name}
                    onChange={(e) =>
                      setModalTag({
                        ...modalTag,
                        name: normalizeTagNameLive(e.target.value),
                      })
                    }
                  />
                  {error && <span className="form-error">{error}</span>}
                </div>

                <label className="radio-label">
                  <input
                    disabled={!isEditorUp}
                    type="checkbox"
                    checked={modalTag.suggested}
                    onChange={(e) =>
                      setModalTag({
                        ...modalTag,
                        suggested: e.target.checked,
                      })
                    }
                  />
                  تگ پیشنهادی
                </label>
              </div>

              <div className="panel-actions">
                <button
                  className="btn btn-secondary"
                  disabled={saving}
                  onClick={() => setModalTag(null)}
                >
                  انصراف
                </button>
                <button
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={save}
                >
                  {saving ? (
                    <>
                      <span className="submit-spinner" aria-hidden="true" />
                      در حال ذخیره...
                    </>
                  ) : (
                    "ذخیره"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
