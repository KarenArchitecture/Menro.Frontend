import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../Context/AuthContext";
import {
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  moveBlogCategory,
  getBlogCategoryAffectedPostsCount,
  deleteBlogCategory,
} from "../../../api/adminBlogs";
import { useGlobalUI } from "../../common/GlobalUI";
import { toPersianDigits, apiErrorMessage } from "./blogManagementShared.js";

/* ================================================================== */
/* DISPLAY CATEGORIES (the 8 colored cards under the hero)             */
/* ================================================================== */

function mapCategoryFromApi(c) {
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    color: c.colorHex,
    sortOrder: c.sortOrder,
  };
}

function mapCategoryToApi(draft) {
  return {
    title: draft.title,
    subtitle: draft.subtitle,
    colorHex: draft.color,
  };
}

function emptyDisplayCategory() {
  return { id: null, title: "", subtitle: "", color: "#5A302F" };
}

const CATEGORY_TITLE_MAX = 30;
const CATEGORY_SUBTITLE_MAX = 50;

export default function DisplayCategoriesPane() {
  const { user } = useAuth();
  const isEditorUp = (user?.roles || []).some((r) =>
    ["admin", "editor"].includes(r.toLowerCase()),
  );
  const { notify, confirmModal } = useGlobalUI();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCat, setModalCat] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const reloadCategories = useCallback(async () => {
    const data = await getBlogCategories();
    setCategories(data.map(mapCategoryFromApi));
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await reloadCategories();
      } catch (err) {
        if (!cancelled)
          notify({
            type: "error",
            message: apiErrorMessage(
              err,
              "بارگذاری دسته‌بندی‌ها با خطا مواجه شد.",
            ),
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadCategories]);

  const openNew = () => {
    setErrors({});
    setModalCat(emptyDisplayCategory());
  };
  const openEdit = (cat) => {
    setErrors({});
    setModalCat({ ...cat });
  };

  const save = async () => {
    const errs = {};
    const title = modalCat.title.trim();
    const subtitle = modalCat.subtitle.trim();
    if (!title) errs.title = "عنوان الزامی است.";
    else if (title.length > CATEGORY_TITLE_MAX)
      errs.title = `عنوان نباید بیشتر از ${toPersianDigits(CATEGORY_TITLE_MAX)} کاراکتر باشد.`;
    if (!subtitle) errs.subtitle = "زیرعنوان الزامی است.";
    else if (subtitle.length > CATEGORY_SUBTITLE_MAX)
      errs.subtitle = `زیرعنوان نباید بیشتر از ${toPersianDigits(CATEGORY_SUBTITLE_MAX)} کاراکتر باشد.`;
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      if (modalCat.id) {
        await updateBlogCategory(modalCat.id, mapCategoryToApi(modalCat));
      } else {
        await createBlogCategory(mapCategoryToApi(modalCat));
      }
      await reloadCategories();
      setModalCat(null);
      notify({ type: "success", message: "دسته‌بندی نمایشی ذخیره شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "ذخیره دسته‌بندی با خطا مواجه شد."),
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteBlogCategory(id);
      await reloadCategories();
      notify({ type: "success", message: "دسته‌بندی حذف شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "حذف دسته‌بندی با خطا مواجه شد."),
      });
    }
  };

  const handleDeleteClick = async (id) => {
    let affectedCount = 0;
    try {
      affectedCount = await getBlogCategoryAffectedPostsCount(id);
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(
          err,
          "دریافت اطلاعات دسته‌بندی با خطا مواجه شد.",
        ),
      });
      return;
    }

    const message =
      affectedCount > 0
        ? `این دسته‌بندی به ${toPersianDigits(affectedCount)} پست بلاگ متصل است. با حذف آن، دسته‌بندی این پست‌ها خالی می‌شود.`
        : "این دسته‌بندی از صفحه‌ی وبلاگ حذف می‌شود.";

    const ok = await confirmModal({
      title: "حذف دسته‌بندی",
      message,
      confirmText: "حذف شود",
      cancelText: "انصراف",
      danger: true,
    });
    if (!ok) return;
    await remove(id);
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    try {
      await moveBlogCategory(categories[index].id, dir < 0 ? "up" : "down");
      await reloadCategories();
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "تغییر ترتیب با خطا مواجه شد."),
      });
    }
  };

  return (
    <div className="panel">
      {isEditorUp && (
        <div className="panel-actions blog-mgmt__panel-actions--start">
          <button className="btn btn-primary" onClick={openNew}>
            <i className="fas fa-plus" /> دسته‌بندی نمایشی جدید
          </button>
        </div>
      )}

      {loading && <div className="empty-hint">در حال بارگذاری...</div>}

      <div className="custom-icons-list blog-mgmt__cat-list">
        {!loading &&
          categories.map((cat, index) => (
            <div key={cat.id} className="custom-icon-row blog-mgmt__cat-row">
              <span
                className="icon blog-mgmt__cat-swatch"
                style={{ "--cat-color": cat.color }}
              />
              <div className="name blog-mgmt__cat-name">
                <strong>{cat.title}</strong>
                <small className="blog-mgmt__cat-subtitle">
                  {cat.subtitle}
                </small>
              </div>
              {isEditorUp && (
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
                    disabled={index === categories.length - 1}
                    onClick={() => move(index, 1)}
                    title="پایین"
                  >
                    <i className="fas fa-chevron-down" />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => openEdit(cat)}
                    title="ویرایش"
                  >
                    <i className="fas fa-pen" />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDeleteClick(cat.id)}
                    title="حذف"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {modalCat && (
        <div
          className="admin-modal-overlay"
          onClick={() => !saving && setModalCat(null)}
        >
          <div
            className="admin-modal admin-modal--compact"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>
                <i className="fas fa-th-large" />
                {modalCat.id
                  ? "ویرایش دسته‌بندی نمایشی"
                  : "دسته‌بندی نمایشی جدید"}
              </h3>
              <button className="btn-icon" onClick={() => setModalCat(null)}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="admin-modal__body">
              <div className="form-vertical">
                <div className="input-group">
                  <div className="blog-mgmt__label-row">
                    <label>عنوان</label>
                    <span className="blog-mgmt__char-count">
                      {toPersianDigits(modalCat.title.length)}/
                      {toPersianDigits(CATEGORY_TITLE_MAX)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={modalCat.title}
                    maxLength={CATEGORY_TITLE_MAX}
                    onChange={(e) =>
                      setModalCat({ ...modalCat, title: e.target.value })
                    }
                  />
                  {errors.title && (
                    <span className="form-error">{errors.title}</span>
                  )}
                </div>
                <div className="input-group">
                  <div className="blog-mgmt__label-row">
                    <label>زیرعنوان</label>
                    <span className="blog-mgmt__char-count">
                      {toPersianDigits(modalCat.subtitle.length)}/
                      {toPersianDigits(CATEGORY_SUBTITLE_MAX)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={modalCat.subtitle}
                    maxLength={CATEGORY_SUBTITLE_MAX}
                    onChange={(e) =>
                      setModalCat({ ...modalCat, subtitle: e.target.value })
                    }
                  />
                  {errors.subtitle && (
                    <span className="form-error">{errors.subtitle}</span>
                  )}
                </div>
                <div className="input-group">
                  <label>رنگ کارت</label>
                  <div className="blog-mgmt__color-row">
                    <input
                      type="color"
                      value={modalCat.color}
                      onChange={(e) =>
                        setModalCat({ ...modalCat, color: e.target.value })
                      }
                      className="blog-mgmt__color-swatch"
                    />
                    <input
                      type="text"
                      value={modalCat.color}
                      onChange={(e) =>
                        setModalCat({ ...modalCat, color: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="panel-actions">
                <button
                  className="btn btn-secondary"
                  disabled={saving}
                  onClick={() => setModalCat(null)}
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
        </div>
      )}
    </div>
  );
}
