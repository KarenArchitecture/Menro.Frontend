import { useEffect, useState } from "react";
import {
  getMenuItemsByLocation,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
} from "../../api/AdminSiteMenu";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import "../../assets/css/admin/siteMenuManagement.css";

/* ======================================================================
 * MenuManagementSection
 * ----------------------------------------------------------------------
 * Admin panel for MenuItem (Header / Footer / Hamburger). Wired up to
 * AdminMenuItemsController.cs via src/api/AdminMenu.js, following the
 * same fetch-on-mount / create-update-delete-move pattern as
 * LandingManagementSection.jsx.
 *
 * NOTE on Hamburger: that menu (per the mobile screenshot) carries icons
 * and standalone toggles (theme, notifications) that don't map onto the
 * plain MenuItem shape (Title/Url only). Left as a placeholder tab until
 * the entity grows an Icon field / a separate model is decided on.
 *
 * NOTE on ordering: MenuItem.Order is a single flat counter per location
 * (see MenuItemService.ReorderAsync — it rewrites Order for the whole
 * location from one OrderedIds list), not per-parent. So the list below
 * is one flat, order-sorted list; child items just carry a "زیرمجموعه‌ی"
 * badge pointing at their parent's title, they don't get visually nested
 * in the ordering itself.
 * ==================================================================== */

const LOCATIONS = [
  {
    key: "Header",
    label: "منوی هدر",
    icon: "fas fa-window-maximize",
    allowNesting: true,
  },
  {
    key: "Footer",
    label: "منوی فوتر",
    icon: "fas fa-shoe-prints",
    allowNesting: false,
  },
];

const MENU_TITLE_MAX = 40;
const MENU_URL_MAX = 200;

function toPersianDigits(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

export default function SiteMenuManagementSection() {
  useDocumentTitle("مدیریت منوها");
  const [activeTab, setActiveTab] = useState("Header");

  return (
    <div id="menu-management-view" className="menu-mgmt">
      <div className="view-header">
        <h2 className="content-title">مدیریت منوها</h2>
      </div>

      <nav className="content-tab-nav">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.key}
            type="button"
            className={`content-tab-link ${activeTab === loc.key ? "active" : ""}`}
            onClick={() => setActiveTab(loc.key)}
          >
            <i className={loc.icon} />
            <span>{loc.label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`content-tab-link ${activeTab === "Hamburger" ? "active" : ""}`}
          onClick={() => setActiveTab("Hamburger")}
        >
          <i className="fas fa-bars" />
          <span>همبرگر (موبایل)</span>
        </button>
      </nav>

      {LOCATIONS.map(
        (loc) =>
          activeTab === loc.key && (
            <div key={loc.key} className="content-tab-pane active">
              <MenuLocationPane
                location={loc.key}
                allowNesting={loc.allowNesting}
              />
            </div>
          ),
      )}

      {activeTab === "Hamburger" && (
        <div className="content-tab-pane active">
          <div className="panel">
            <div className="menu-mgmt__hamburger-notice">
              <i className="fas fa-circle-info" />
              <p>
                منوی همبرگر شامل آیکون اختصاصی برای هر آیتم و همچنین سوییچ‌های
                مستقل (تم منو، اعلانات) هست که با ساختار فعلی{" "}
                <code>MenuItem</code> (فقط عنوان/لینک) هم‌خوانی نداره. مدیریت
                این بخش بعد از تصمیم روی مدل داده (افزودن فیلد آیکون یا مدل جدا)
                اضافه می‌شود.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* MenuLocationPane — shared CRUD pane for one MenuLocation             */
/* ================================================================== */

function emptyMenuItem() {
  return { id: null, title: "", url: "", isActive: true, parentId: null };
}

function MenuLocationPane({ location, allowNesting }) {
  const { notify, confirmModal } = useGlobalUI();
  const [items, setItems] = useState([]);
  const [modalItem, setModalItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [movingId, setMovingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setLoadError("");
    getMenuItemsByLocation(location)
      .then((data) => !ignore && setItems(data))
      .catch(() => {
        if (!ignore)
          setLoadError("خطا در دریافت آیتم‌های منو. لطفاً دوباره تلاش کنید.");
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
    // location changes when switching tabs -> refetch; reloadKey for retry.
  }, [location, reloadKey]);

  const openNew = () => {
    setErrors({});
    setModalItem(emptyMenuItem());
  };
  const openEdit = (item) => {
    setErrors({});
    setModalItem({ ...item });
  };
  const closeModal = () => setModalItem(null);

  // Only top-level items (no parent of their own) are offered as parents,
  // to keep nesting at a single level. The item being edited is excluded.
  const parentOptions = allowNesting
    ? items.filter((i) => i.parentId == null && i.id !== modalItem?.id)
    : [];

  const save = async () => {
    const errs = {};
    const title = modalItem.title.trim();
    const url = modalItem.url.trim();
    if (!title) errs.title = "عنوان الزامی است.";
    else if (title.length > MENU_TITLE_MAX)
      errs.title = `عنوان نباید بیشتر از ${toPersianDigits(MENU_TITLE_MAX)} کاراکتر باشد.`;
    if (!url) errs.url = "لینک الزامی است.";
    else if (url.length > MENU_URL_MAX)
      errs.url = `لینک نباید بیشتر از ${toPersianDigits(MENU_URL_MAX)} کاراکتر باشد.`;
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      if (modalItem.id) {
        const updated = await updateMenuItem(modalItem.id, {
          title,
          url,
          isActive: modalItem.isActive,
          parentId: allowNesting ? modalItem.parentId : null,
        });
        setItems((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i)),
        );
      } else {
        const created = await createMenuItem({
          location,
          title,
          url,
          isActive: modalItem.isActive,
          parentId: allowNesting ? modalItem.parentId : null,
        });
        setItems((prev) => [...prev, created]);
      }
      closeModal();
      notify({ type: "success", message: "آیتم منو ذخیره شد" });
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

  const remove = async (item) => {
    const confirmed = await confirmModal({
      title: "حذف آیتم منو",
      message:
        item.parentId == null && items.some((i) => i.parentId === item.id)
          ? "این آیتم زیرمجموعه دارد؛ حذف آن باعث می‌شود زیرمجموعه‌ها بدون والد بمانند. ادامه می‌دهید؟"
          : "این آیتم از منو حذف می‌شود.",
      confirmText: "حذف شود",
      cancelText: "انصراف",
      danger: true,
    });
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      await deleteMenuItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      notify({ type: "success", message: "آیتم منو حذف شد" });
    } catch {
      notify({ type: "error", message: "حذف آیتم با خطا مواجه شد" });
    } finally {
      setDeletingId(null);
    }
  };

  // Order is flat per-location on the backend, so move() swaps the two
  // items in the full list and resubmits the whole ordered-id sequence.
  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    const item = items[index];
    setMovingId(item.id);
    try {
      await reorderMenuItems(
        location,
        next.map((i) => i.id),
      );
      setItems(next);
    } catch {
      notify({ type: "error", message: "جابجایی با خطا مواجه شد" });
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
      <div className="panel-actions menu-mgmt__panel-actions--start">
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus" /> آیتم جدید
        </button>
      </div>

      <div className="custom-icons-list menu-mgmt__item-list">
        {items.map((item, index) => {
          const parent = item.parentId
            ? items.find((i) => i.id === item.parentId)
            : null;
          return (
            <div
              key={item.id}
              className={`custom-icon-row menu-mgmt__item-row ${
                !item.isActive ? "menu-mgmt__item-row--inactive" : ""
              }`}
            >
              <span
                className={`menu-mgmt__status-dot ${
                  item.isActive
                    ? "menu-mgmt__status-dot--active"
                    : "menu-mgmt__status-dot--inactive"
                }`}
                title={item.isActive ? "فعال" : "غیرفعال"}
              />
              <div className="name menu-mgmt__item-main">
                <strong>{item.title}</strong>
                <small className="menu-mgmt__item-url">{item.url}</small>
                {parent && (
                  <span className="menu-mgmt__item-badge">
                    زیرمجموعه‌ی: {parent.title}
                  </span>
                )}
              </div>
              <div className="actions">
                <button
                  className="mh-reorder-btn btn-icon"
                  disabled={index === 0 || movingId === item.id}
                  onClick={() => move(index, -1)}
                  title="بالا"
                >
                  <i className="fas fa-chevron-up" />
                </button>
                <button
                  className="btn-icon"
                  disabled={index === items.length - 1 || movingId === item.id}
                  onClick={() => move(index, 1)}
                  title="پایین"
                >
                  <i className="fas fa-chevron-down" />
                </button>
                <button
                  className="btn-icon"
                  disabled={deletingId === item.id}
                  onClick={() => openEdit(item)}
                  title="ویرایش"
                >
                  <i className="fas fa-pen" />
                </button>
                <button
                  className="btn-icon btn-danger"
                  disabled={deletingId === item.id}
                  onClick={() => remove(item)}
                  title="حذف"
                >
                  {deletingId === item.id ? (
                    <span className="submit-spinner" aria-hidden="true" />
                  ) : (
                    <i className="fas fa-trash" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="empty-hint">هنوز آیتمی اضافه نشده.</div>
        )}
      </div>

      {modalItem && (
        <div className="modal-backdrop" onClick={() => !saving && closeModal()}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{modalItem.id ? "ویرایش آیتم منو" : "آیتم جدید"}</h4>
              <button
                className="btn-icon"
                onClick={closeModal}
                disabled={saving}
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="form-vertical">
              <div className="input-group">
                <div className="menu-mgmt__label-row">
                  <label>عنوان</label>
                  <span className="menu-mgmt__char-count">
                    {toPersianDigits(modalItem.title.length)}/
                    {toPersianDigits(MENU_TITLE_MAX)}
                  </span>
                </div>
                <input
                  type="text"
                  value={modalItem.title}
                  maxLength={MENU_TITLE_MAX}
                  onChange={(e) =>
                    setModalItem({ ...modalItem, title: e.target.value })
                  }
                />
                {errors.title && (
                  <span className="form-error">{errors.title}</span>
                )}
              </div>

              <div className="input-group">
                <div className="menu-mgmt__label-row">
                  <label>لینک</label>
                  <span className="menu-mgmt__char-count">
                    {toPersianDigits(modalItem.url.length)}/
                    {toPersianDigits(MENU_URL_MAX)}
                  </span>
                </div>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="/blog یا https://..."
                  value={modalItem.url}
                  maxLength={MENU_URL_MAX}
                  onChange={(e) =>
                    setModalItem({ ...modalItem, url: e.target.value })
                  }
                />
                {errors.url && <span className="form-error">{errors.url}</span>}
              </div>

              {allowNesting && (
                <div className="input-group">
                  <label>آیتم والد (اختیاری)</label>
                  <select
                    className="menu-mgmt__parent-select"
                    value={modalItem.parentId || ""}
                    onChange={(e) =>
                      setModalItem({
                        ...modalItem,
                        parentId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">بدون والد (سطح اول)</option>
                    {parentOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <p className="menu-mgmt__muted-text">
                    برای ساخت زیرمنو، والدش را از این لیست انتخاب کن. فقط
                    آیتم‌های سطح اول قابل انتخاب به‌عنوان والد هستند.
                  </p>
                </div>
              )}

              <label className="menu-mgmt__checkbox-row">
                <input
                  type="checkbox"
                  checked={modalItem.isActive}
                  onChange={(e) =>
                    setModalItem({ ...modalItem, isActive: e.target.checked })
                  }
                />
                <span>این آیتم در منو نمایش داده شود (فعال)</span>
              </label>
            </div>
            <div className="modal-footer">
              {errors.submit && (
                <span className="form-error">{errors.submit}</span>
              )}
              <button
                className="btn btn-secondary"
                disabled={saving}
                onClick={closeModal}
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
      )}
    </div>
  );
}
