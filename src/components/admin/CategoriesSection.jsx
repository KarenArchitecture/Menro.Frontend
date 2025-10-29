import React, { useMemo, useState, useEffect } from "react";
import IconPicker from "./IconPicker";
import adminGlobalCategoryAxios from "../../api/adminGlobalCategoryAxios.js";
import adminCustomCategoryAxios from "../../api/adminCustomCategoryAxios.js";

function GenericCategoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function CategoriesSection() {
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

  // states
  const [nameInput, setNameInput] = useState("");
  const [errors, setErrors] = useState({ name: "", icon: "", duplicate: "" });

  // icon (add)
  const [selectedIconId, setSelectedIconId] = useState(null);
  const [selectedIconUrl, setSelectedIconUrl] = useState(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // icon (edit)
  const [editIconId, setEditIconId] = useState(null);
  const [editIconUrl, setEditIconUrl] = useState(null);
  const [editPickerOpen, setEditPickerOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // global categories
  const [globalCategories, setGlobalCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await adminGlobalCategoryAxios.get("/read-all");
        setGlobalCategories(res.data);
      } catch (err) {
        console.error("Failed to load global categories", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // custom categories
  const [customCategories, setCustomCategories] = useState([]);
  const [loadingCustoms, setLoadingCustoms] = useState(true);

  const loadCustomCategories = async () => {
    try {
      const res = await adminCustomCategoryAxios.get("/read-all");
      setCustomCategories(res.data);
    } catch (err) {
      console.error("Failed to load custom categories", err);
    } finally {
      setLoadingCustoms(false);
    }
  };

  useEffect(() => {
    loadCustomCategories();
  }, []);

  // delete
  const removeCustomCategory = async (catId) => {
    try {
      const res = await adminCustomCategoryAxios.delete(`/delete/${catId}`);
      console.log("Deleted successfully:", res.data.message);
      await loadCustomCategories();
    } catch (err) {
      console.error("Failed to delete custom category", err);
    }
  };

  // get single category (for edit)
  const getCustomCategory = async (id) => {
    try {
      const res = await adminCustomCategoryAxios.get("/read", {
        params: { catId: id },
      });
      const cat = res.data;
      console.log("Fetched for edit:", cat);

      setEditingId(cat.id);
      setEditName(cat.name);
      setEditIconId(cat.icon?.id || null);
      setEditIconUrl(cat.icon?.url || null);
    } catch (err) {
      console.error("Failed to fetch category", err);
      alert(err.response?.data?.message ?? "خطا در دریافت دسته‌بندی");
    }
  };

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
        iconId: selectedIconId,
      };

      const res = await adminCustomCategoryAxios.post("/add", dto);

      console.log("✅ Added:", res.data);

      await loadCustomCategories();

      // reset
      setNameInput("");
      setSelectedIconId(null);
      setSelectedIconUrl(null);
    } catch (err) {
      console.error("Failed to create custom category", err);
      alert(err.response?.data?.message ?? "خطا در افزودن دسته‌بندی");
    }
  };

  // add from predefined (global)
  const addPredefined = async (globalCat) => {
    try {
      const res = await adminCustomCategoryAxios.post(
        "/add-from-global",
        null,
        { params: { globalCategoryId: globalCat.id } }
      );
      console.log("Added from global:", res.data.message);
      await loadCustomCategories();
    } catch (err) {
      console.error("Failed to add category from global", err);
    }
  };

  // edit category
  const saveEdit = async () => {
    const newName = editName.trim().replace(/\s+/g, " ");
    if (!newName) {
      alert("نام دسته‌بندی نمی‌تواند خالی باشد.");
      return;
    }

    try {
      const dto = {
        id: editingId,
        name: newName,
        iconId: editIconId ?? null,
      };

      const res = await adminCustomCategoryAxios.put("/update", dto);
      console.log("✅ Edit response:", res.data);
      await loadCustomCategories();
      cancelEdit();
    } catch (err) {
      console.error("❌ Failed to update category", err);
      alert(err.response?.data?.message ?? "خطا در ذخیره تغییرات");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditIconId(null);
    setEditIconUrl(null);
    setEditPickerOpen(false);
  };

  return (
    <div className="panels-grid-single-column" id="categories-view">
      {/* --- Add new category --- */}
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
            onKeyDown={(e) => e.key === "Enter" && submitCreateCustomCategory()}
          />

          <button
            type="button"
            className="btn"
            onClick={() => setIconPickerOpen(true)}
            title="انتخاب آیکن"
          >
            {selectedIconUrl ? (
              <span className="icon-preview">
                <img
                  src={selectedIconUrl}
                  width={24}
                  height={24}
                  alt="icon"
                  style={{ objectFit: "contain", verticalAlign: "middle" }}
                />
              </span>
            ) : (
              <i className="fas fa-icons" />
            )}{" "}
            انتخاب آیکن
          </button>

          <IconPicker
            open={iconPickerOpen}
            onClose={() => setIconPickerOpen(false)}
            value={selectedIconId}
            onSelect={(icon) => {
              setSelectedIconId(icon?.id ?? null);
              setSelectedIconUrl(icon?.url ?? null);
              setIconPickerOpen(false);
            }}
          />

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
                onClick={() => addPredefined(item)}
                title="افزودن به دسته‌بندی‌های من"
              >
                <i className="fas fa-plus" />
                {item.icon && item.icon.url ? (
                  <img
                    src={item.icon.url}
                    alt={item.name}
                    width={20}
                    height={20}
                    style={{
                      objectFit: "contain",
                      verticalAlign: "middle",
                      marginInlineEnd: 6,
                    }}
                  />
                ) : (
                  <GenericCategoryIcon />
                )}
                <span className="tag-name">{item.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* --- Custom categories list --- */}
      <div className="panel">
        <h3>دسته‌بندی‌های فعلی رستوران</h3>
        <div className="category-list">
          {loadingCustoms ? (
            <p>در حال بارگذاری...</p>
          ) : customCategories.length === 0 ? (
            <div className="category-item">
              <GenericCategoryIcon />
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
                <div
                  className="category-meta"
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  {cat.icon && cat.icon.url ? (
                    <img
                      src={cat.icon.url}
                      alt={cat.name}
                      width={22}
                      height={22}
                      style={{
                        objectFit: "contain",
                        verticalAlign: "middle",
                        opacity: 0.9,
                      }}
                    />
                  ) : (
                    <GenericCategoryIcon />
                  )}

                  <span className="category-title">{cat.name}</span>

                  {cat.globalCategoryId !== null && (
                    <span className="cat-lock" title="دسته‌بندی عمومی">
                      <i className="fas fa-lock" />
                    </span>
                  )}
                </div>

                <div className="item-actions">
                  {cat.globalCategoryId === null && (
                    <button
                      className="btn btn-icon"
                      title="ویرایش"
                      onClick={() => getCustomCategory(cat.id)}
                    >
                      <i className="fas fa-edit" />
                    </button>
                  )}
                  <button
                    className="btn btn-icon btn-danger"
                    title="حذف"
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

      {/* --- Edit modal --- */}
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
                <div className="icon-preview">
                  {editIconUrl ? (
                    <img
                      src={editIconUrl}
                      width={24}
                      height={24}
                      alt="icon"
                      style={{
                        objectFit: "contain",
                        verticalAlign: "middle",
                      }}
                    />
                  ) : (
                    <GenericCategoryIcon />
                  )}
                </div>
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

      {/* Icon picker for edit */}
      <IconPicker
        open={editPickerOpen}
        onClose={() => setEditPickerOpen(false)}
        value={editIconId}
        onSelect={(icon) => {
          console.log("✅ Icon selected (edit):", icon);
          setEditIconId(icon?.id ?? null);
          setEditIconUrl(icon?.url ?? null);
          setEditPickerOpen(false);
        }}
      />
    </div>
  );
}
