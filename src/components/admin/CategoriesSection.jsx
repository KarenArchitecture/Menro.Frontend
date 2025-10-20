import React, { useMemo, useState, useEffect } from "react";
import IconPicker, { ICON_BY_KEY, renderIconByKey } from "./IconPicker";
import { getPredefined, onPredefinedChange } from "../admin/predefinedStore";
import adminGlobalCategory from "../../api/adminGlobalCategory";
import adminCustomCategory from "../../api/adminCustomCategory";

function GenericCategoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function normalizePersian(s = "") {
  return s.replace(/[ي]/g, "ی").replace(/[ك]/g, "ک");
}
function slugify(name = "") {
  const s = normalizePersian(name).trim().replace(/\s+/g, " ");
  return s
    .replace(/[^ء-ی0-9\s\-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function useSharedPredefined() {
  const [predef, setPredef] = React.useState(() => getPredefined());

  React.useEffect(() => {
    const update = () => setPredef(getPredefined());
    // subscribe to store events (same tab) + storage (other tabs)
    const unsubscribe = onPredefinedChange(update);
    return unsubscribe;
  }, []);

  return predef;
}

const ICON_LIBRARY = Object.entries(ICON_BY_KEY).map(([key, Icon]) => ({
  key,
  label: key,
  Icon,
}));

export default function CategoriesSection() {
  // const PREDEFINED = useSharedPredefined();

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("admin.categories");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("admin.categories", JSON.stringify(categories));
    } catch {}
  }, [categories]);

  const [nameInput, setNameInput] = useState("");
  const [selectedIconKey, setSelectedIconKey] = useState(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [errors, setErrors] = useState({ name: "", icon: "", duplicate: "" });

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIconKey, setEditIconKey] = useState(null);
  const [editPickerOpen, setEditPickerOpen] = useState(false);
  // const [adding, setAdding] = useState(false);

  // load gCat list
  const [globalCategories, setGlobalCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await adminGlobalCategory.get("/read-all");
        setGlobalCategories(res.data);
      } catch (err) {
        console.error("Failed to load global categories", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // load cCat list
  const [customCategories, setCustomCategories] = useState([]);
  const [loadingCustoms, setLoadingCustoms] = useState(true);
  const loadCustomCategories = async () => {
    try {
      const res = await adminCustomCategory.get("/read-all");
      setCustomCategories(res.data);
    } catch (err) {
      console.error("Failed to load custom categories", err);
    } finally {
      setLoadingCustoms(false);
    }
  };
  useEffect(() => {
    const fetch = async () => {
      await loadCustomCategories();
    };
    fetch();
  }, []);

  // delete category
  const removeCustomCategory = async (catId) => {
    try {
      const res = await adminCustomCategory.delete(`/delete/${catId}`);
      console.log("Deleted successfully:", res.data.message);
      await loadCustomCategories(); // رفرش لیست بعد از حذف
    } catch (err) {
      console.error("Failed to delete custom category", err);
    }
  };

  const existingSlugs = useMemo(
    () => categories.map((c) => c.slug),
    [categories]
  );

  const iconForKey = (key) => {
    const el = renderIconByKey(key);
    if (el) return el;
    const C = ICON_BY_KEY[key];
    return C ? <C /> : <GenericCategoryIcon />;
  };

  function addCustomCategory() {
    const rawName = nameInput.trim();
    const cleaned = rawName.replace(/\s+/g, " ");
    const slug = slugify(cleaned);

    let next = { name: "", icon: "", duplicate: "" };
    let hasErr = false;

    if (!cleaned) {
      next.name = "نام دسته‌بندی را وارد کنید.";
      hasErr = true;
    }
    if (!selectedIconKey) {
      next.icon = "لطفاً یک آیکن برای این دسته‌بندی انتخاب کنید.";
      hasErr = true;
    }
    if (!hasErr && existingSlugs.includes(slug)) {
      next.duplicate = "این نام قبلاً اضافه شده است.";
      hasErr = true;
    }

    setErrors(next);
    if (hasErr) return;

    setCategories((prev) => [
      ...prev,
      {
        id: uid(),
        name: cleaned,
        slug,
        iconKey: selectedIconKey,
        source: "custom",
        locked: false,
        createdAt: Date.now(),
      },
    ]);

    setNameInput("");
    setSelectedIconKey(null);
    setErrors({ name: "", icon: "", duplicate: "" });
  }

  // add custom category
  const submitCreateCustomCategory = async () => {
    const name = nameInput.trim();

    if (!name) {
      alert("نام دسته‌بندی را وارد کنید");
      return;
    }

    try {
      const dto = {
        name: name,
        svgIcon: "", // temp empty
      };

      const res = await adminCustomCategory.post("/add", dto);

      await loadCustomCategories(); // رفرش لیست بعد از افزودن

      // پاک‌سازی فرم
      setNameInput("");
    } catch (err) {
      console.error("Failed to create custom category", err);
      alert(err.response?.data?.message ?? "خطا در افزودن دسته‌بندی");
    }
  };

  // use shared predefined items (name + iconKey)
  const addPredefined = async (globalCat) => {
    try {
      const res = await adminCustomCategory.post("/add-from-global", null, {
        params: { globalCategoryId: globalCat.id },
      });

      console.log("Added successfully:", res.data.message);
      await loadCustomCategories();
    } catch (err) {
      console.error("Failed to add category from global", err);
    }
  };

  // function removeCategory(id) {
  //   setCategories((prev) => prev.filter((c) => c.id !== id));
  // }

  // function beginEdit(cat) {
  //   if (cat.locked) return;
  //   setEditingId(cat.id);
  //   setEditName(cat.name);
  //   setEditIconKey(cat.iconKey);
  // }
  function saveEdit() {
    const newName = editName.trim().replace(/\s+/g, " ");
    const newSlug = slugify(newName);
    if (!newName) return;
    if (categories.some((c) => c.id !== editingId && c.slug === newSlug)) {
      return;
    }
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingId
          ? { ...c, name: newName, slug: newSlug, iconKey: editIconKey || null }
          : c
      )
    );
    setEditingId(null);
    setEditName("");
    setEditIconKey(null);
  }
  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditIconKey(null);
    setEditPickerOpen(false);
  }

  return (
    <div className="panels-grid-single-column" id="categories-view">
      <div className="panel">
        <h3>افزودن دسته‌بندی جدید</h3>
        <p className="panel-subtitle">
          یک دسته‌بندی سفارشی ایجاد کنید یا از لیست‌های آماده انتخاب نمایید.
        </p>
        <div className="input-group-inline">
          <input
            type="text"
            id="custom-category-name"
            placeholder="نام دسته‌بندی سفارشی خود را وارد کنید..."
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (errors.name || errors.duplicate) {
                setErrors((prev) => ({ ...prev, name: "", duplicate: "" }));
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
          />

          <button
            type="button"
            className="btn"
            onClick={() => setIconPickerOpen(true)}
            title="انتخاب آیکن"
          >
            {selectedIconKey ? (
              <span className="icon-preview">
                {iconForKey(selectedIconKey)}
              </span>
            ) : (
              <i className="fas fa-icons" />
            )}{" "}
            انتخاب آیکن
          </button>

          <button
            className="btn btn-primary"
            onClick={submitCreateCustomCategory}
          >
            افزودن
          </button>
        </div>
        {(errors.name || errors.icon || errors.duplicate) && (
          <div className="form-errors">
            {errors.name && <div className="form-error">{errors.name}</div>}
            {errors.icon && <div className="form-error">{errors.icon}</div>}
            {errors.duplicate && (
              <div className="form-error">{errors.duplicate}</div>
            )}
          </div>
        )}
        <hr className="form-divider" />

        <label>پیشنهادهای آماده برای افزودن:</label>
        <div className="predefined-tags">
          {loading ? (
            <p>در حال بارگذاری...</p>
          ) : globalCategories.length === 0 ? (
            <p>دسته‌بندی‌ای یافت نشد</p>
          ) : (
            globalCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                className="tag"
                onClick={() => addPredefined(item)} // کال شدن متد
                title="افزودن به دسته‌بندی‌های من"
              >
                <i className="fas fa-plus" />
                {/* آیکن SVG ذخیره‌شده در دیتابیس */}
                <span
                  className="tag-icon"
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                />
                <span className="tag-name">{item.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="panel">
        <h3>دسته‌بندی‌های فعلی رستوران</h3>
        <div className="category-list">
          {loadingCustoms ? (
            <p>در حال بارگذاری...</p>
          ) : customCategories.length === 0 ? (
            <div className="category-item">
              <span
                className="category-title"
                style={{ color: "var(--text-secondary)" }}
              >
                هنوز دسته‌بندی‌ای اضافه نشده است.
              </span>
            </div>
          ) : (
            customCategories.map((cat) => (
              <div key={cat.id} className="category-item">
                <div className="category-meta">
                  <span className="category-title">{cat.name}</span>
                  {cat.locked && (
                    <span className="cat-lock" title="ثابت">
                      <i className="fas fa-lock" />
                    </span>
                  )}
                </div>

                <div className="item-actions">
                  {!cat.locked && (
                    <button
                      className="btn btn-icon"
                      title="ویرایش"
                      onClick={() => console.log("edit custom:", cat)}
                    >
                      <i className="fas fa-edit" />
                    </button>
                  )}
                  <button
                    className="btn btn-icon btn-danger"
                    title="حذف"
                    // onClick={() => console.log("remove custom:", cat.id)}
                    onClick={() => removeCustomCategory(cat.id)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* pickers */}
      <IconPicker
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        value={selectedIconKey}
        onSelect={(key) => {
          setSelectedIconKey(key);
          setErrors((prev) => ({ ...prev, icon: "" }));
          setIconPickerOpen(false);
        }}
      />

      {editingId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h4>ویرایش دسته‌بندی</h4>
              <button
                className="btn btn-icon"
                onClick={cancelEdit}
                aria-label="بستن"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="form-vertical">
              <label htmlFor="edit-name">نام</label>
              <input
                id="edit-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <label>آیکن</label>
              <div className="input-group-inline">
                <div className="icon-preview">{iconForKey(editIconKey)}</div>
                <button className="btn" onClick={() => setEditPickerOpen(true)}>
                  تغییر آیکن
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={cancelEdit}>
                انصراف
              </button>
              <button className="btn btn-primary" onClick={saveEdit}>
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      <IconPicker
        open={editPickerOpen}
        onClose={() => setEditPickerOpen(false)}
        value={editIconKey}
        onSelect={(key) => {
          setEditIconKey(key);
          setEditPickerOpen(false);
        }}
      />
    </div>
  );
}
