import React, { useState, useEffect } from "react";
import IconPicker, { renderIconByKey } from "./IconPicker";
import fileAxios from "../../api/fileAxios.js";
import iconAxios from "../../api/iconAxios.js";
import adminGlobalCategoryAxios from "../../api/adminGlobalCategoryAxios.js";
import { useGlobalUI } from "../common/GlobalUI";

function GenericCategoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function CategorySettingsSection() {
  const { notify, confirmModal } = useGlobalUI();
  const [globalCategories, setGlobalCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add
  const [nameInput, setNameInput] = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [selectedIconId, setSelectedIconId] = useState(null);
  const [selectedIconUrl, setSelectedIconUrl] = useState(null);

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIconId, setEditIconId] = useState(null);
  const [editIconUrl, setEditIconUrl] = useState(null);
  const [editPickerOpen, setEditPickerOpen] = useState(false);

  // ==== Load global categories ====
  const loadCategories = async () => {
    try {
      const res = await adminGlobalCategoryAxios.get("/read-all");
      setGlobalCategories(res.data);
    } catch (err) {
      console.error("Failed to load global categories", err);
      notify({
        type: "error",
        message: "دریافت دسته‌بندی‌های عمومی با خطا مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ==== Add global category ====
  const submitCreateGlobalCategory = async () => {
    const name = nameInput.trim();

    if (!name) {
      notify({ type: "warning", message: "نام دسته‌بندی را وارد کنید" });
      return;
    }
    if (!selectedIconId) {
      notify({ type: "warning", message: "لطفاً آیکن را انتخاب کنید" });
      return;
    }

    try {
      const dto = { name, iconId: selectedIconId };
      await adminGlobalCategoryAxios.post("/add", dto);
      await loadCategories();

      setNameInput("");
      setSelectedIconId(null);
      setSelectedIconUrl(null);
      notify({ type: "success", message: "دسته‌بندی عمومی اضافه شد" });
    } catch (err) {
      console.error("Failed to create global category", err);
      notify({
        type: "error",
        message: err.response?.data?.message ?? "خطا در افزودن دسته‌بندی عمومی",
      });
    }
  };

  // ==== Delete ====
  const removeGlobalCategory = async (catId) => {
    const ok = await confirmModal({
      title: "حذف دسته‌بندی عمومی",
      message:
        "این دسته‌بندی از همه‌ی رستوران‌هایی که ازش استفاده می‌کنند حذف می‌شود.",
      confirmText: "حذف شود",
      cancelText: "انصراف",
      danger: true,
    });
    if (!ok) return;

    try {
      await adminGlobalCategoryAxios.delete(`/delete/${catId}`);
      await loadCategories();
      notify({ type: "success", message: "دسته‌بندی عمومی حذف شد" });
    } catch (err) {
      console.error("Failed to delete global category", err);
      notify({ type: "error", message: "حذف دسته‌بندی با خطا مواجه شد" });
    }
  };

  // ==== Get category for edit ====
  const getGlobalCategory = async (id) => {
    try {
      console.log("Sending GET request with id:", id);

      const res = await adminGlobalCategoryAxios.get("/read", {
        params: { catId: id },
      });

      const cat = res.data;

      setEditingId(cat.id);
      setEditName(cat.name);
      setEditIconId(cat.icon?.id ?? null);
      setEditIconUrl(cat.icon?.url ?? null);
    } catch (err) {
      console.error("❌ Failed to fetch global category", err);
      notify({
        type: "error",
        message:
          err.response?.data?.message ?? "خطا در دریافت اطلاعات دسته‌بندی",
      });
    }
  };

  // ==== Save edit ====
  const saveEdit = async () => {
    const newName = editName.trim();
    if (!newName) {
      notify({
        type: "warning",
        message: "نام دسته‌بندی نمی‌تواند خالی باشد.",
      });
      return;
    }

    try {
      const dto = { id: editingId, name: newName, iconId: editIconId ?? null };
      await adminGlobalCategoryAxios.put("/update", dto);
      await loadCategories();
      cancelEdit();
      notify({ type: "success", message: "تغییرات ذخیره شد" });
    } catch (err) {
      console.error("❌ Failed to update category", err);
      notify({
        type: "error",
        message: err.response?.data?.message ?? "خطا در ذخیره تغییرات",
      });
    }
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditIconId(null);
    setEditIconUrl(null);
    setEditPickerOpen(false);
  };

  // ==== Upload SVG ====
  const handleUploadSvg = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".svg")) {
      notify({ type: "warning", message: "فقط فایل SVG مجاز است." });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Icon", file);
      formData.append("Label", file.name.replace(/\.svg$/i, ""));

      await iconAxios.post("/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      notify({ type: "success", message: "آیکن با موفقیت آپلود شد." });
    } catch (err) {
      console.error("Upload failed:", err);
      notify({ type: "error", message: "آپلود با خطا مواجه شد." });
    }
  };

  return (
    <div className="panels-grid-single-column" id="categories-view" dir="rtl">
      {/* Add new global category */}
      <div className="panel">
        <h3>افزودن دسته‌بندی عمومی جدید</h3>
        <p className="panel-subtitle">
          یک دسته‌بندی عمومی برای همه رستوران‌ها ایجاد کنید.
        </p>

        <div className="input-group-inline">
          {/* 🔹 ورودی نام دسته‌بندی */}
          <input
            type="text"
            id="global-category-name"
            placeholder="نام دسته‌بندی عمومی خود را وارد کنید..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitCreateGlobalCategory()}
          />

          {/* 🔹 دکمه انتخاب آیکن */}
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
              console.log("✅ Icon selected (global):", icon);
              setSelectedIconId(icon?.id ?? null);
              setSelectedIconUrl(icon?.url ?? null);
              setIconPickerOpen(false);
            }}
          />
          <button
            className="btn btn-primary"
            onClick={submitCreateGlobalCategory}
          >
            افزودن
          </button>
        </div>

        <hr className="form-divider" />
      </div>

      {/* Existing global categories */}
      <div className="panel">
        <h3>دسته‌بندی‌های عمومی فعلی</h3>
        <div className="category-list">
          {loading ? (
            <p>در حال بارگذاری...</p>
          ) : globalCategories.length === 0 ? (
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
            globalCategories.map((cat) => (
              <div key={cat.id} className="category-item">
                <div className="category-meta">
                  {cat.icon?.url ? (
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
                </div>

                <div className="item-actions">
                  <button
                    className="btn btn-icon"
                    title="ویرایش"
                    onClick={() => getGlobalCategory(cat.id)}
                  >
                    <i className="fas fa-edit" />
                  </button>
                  <button
                    className="btn btn-icon btn-danger"
                    title="حذف"
                    onClick={() => removeGlobalCategory(cat.id)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editingId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h4>ویرایش دسته‌بندی عمومی</h4>
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
                      alt="icon"
                      width={24}
                      height={24}
                      style={{ objectFit: "contain", verticalAlign: "middle" }}
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

      {/* Icon picker for EDIT */}
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

      {/* Upload panel */}
      <div className="panel" style={{ marginTop: 24 }}>
        <h4>افزودن آیکن جدید</h4>
        <div
          className="input-group-inline"
          style={{ marginBottom: 12, gap: 8, alignItems: "center" }}
        >
          <input
            id="settings-upload-svg"
            type="file"
            accept=".svg"
            hidden
            onChange={(e) => handleUploadSvg(e.target.files?.[0])}
          />
          <button
            className="btn"
            title="آپلود SVG و افزودن به لیست آیکن‌ها"
            onClick={() =>
              document.getElementById("settings-upload-svg").click()
            }
          >
            <i className="fas fa-upload" /> آپلود SVG
          </button>
          <span
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginInlineStart: 12,
            }}
          >
            تنها فایل‌های SVG مجاز به آپلود هستند.
          </span>
        </div>
      </div>
    </div>
  );
}
