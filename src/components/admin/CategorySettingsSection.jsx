import React, { useState, useEffect } from "react";
import IconPicker, { renderIconByKey } from "./IconPicker";
import fileAxios from "../../api/fileAxios.js";
import iconAxios from "../../api/iconAxios.js";
import adminGlobalCategoryAxios from "../../api/adminGlobalCategoryAxios.js";

function GenericCategoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function CategorySettingsSection() {
  const [globalCategories, setGlobalCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add new
  const [nameInput, setNameInput] = useState("");
  const [selectedIconKey, setSelectedIconKey] = useState(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIconKey, setEditIconKey] = useState(null);
  const [editPickerOpen, setEditPickerOpen] = useState(false);

  // Upload feedback
  const [uploadMessage, setUploadMessage] = useState({
    text: "تنها فایل‌های SVG مجاز به آپلود هستند.",
    type: "info",
  });

  // ==== Load global categories ====
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

  useEffect(() => {
    loadCategories();
  }, []);

  // ==== Add global category ====
  const submitCreateGlobalCategory = async () => {
    const name = nameInput.trim();
    if (!name) {
      alert("نام دسته‌بندی را وارد کنید");
      return;
    }

    try {
      const dto = {
        name: name,
        iconId: selectedIconKey || null,
      };

      await adminGlobalCategoryAxios.post("/add", dto);
      await loadCategories();

      setNameInput("");
      setSelectedIconKey(null);
    } catch (err) {
      console.error("Failed to create global category", err);
      alert(err.response?.data?.message ?? "خطا در افزودن دسته‌بندی");
    }
  };

  // ==== Delete ====
  const removeGlobalCategory = async (catId) => {
    try {
      await adminGlobalCategoryAxios.delete(`/delete/${catId}`);
      await loadCategories();
    } catch (err) {
      console.error("Failed to delete global category", err);
    }
  };

  // ==== Get category for edit ====
  const getGlobalCategory = async (id) => {
    try {
      const res = await adminGlobalCategoryAxios.get("/read", {
        params: { catId: id },
      });

      const cat = res.data;
      setEditingId(cat.id);
      setEditName(cat.name);
      setEditIconKey(cat.icon?.id || null);
    } catch (err) {
      console.error("Failed to fetch category", err);
      alert(err.response?.data?.message ?? "خطا در دریافت دسته‌بندی");
    }
  };

  // ==== Save edit ====
  const saveEdit = async () => {
    const newName = editName.trim();
    if (!newName) {
      alert("نام دسته‌بندی نمی‌تواند خالی باشد.");
      return;
    }

    try {
      const dto = {
        id: editingId,
        name: newName,
        iconId: editIconKey || null,
      };
      await adminGlobalCategoryAxios.put("/update", dto);
      await loadCategories();
      cancelEdit();
    } catch (err) {
      console.error("Failed to update category", err);
      alert(err.response?.data?.message ?? "خطا در ذخیره تغییرات");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditIconKey(null);
    setEditPickerOpen(false);
  };

  // ==== Upload SVG ====
  const handleUploadSvg = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".svg")) {
      setUploadMessage({ text: "فقط فایل SVG مجاز است.", type: "error" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fileAxios.post("/upload-icon", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { fileName } = res.data;

      await iconAxios.post("/add", {
        fileName,
        label: file.name.replace(/\.svg$/i, ""),
      });

      setUploadMessage({
        text: `آیکن "${fileName}" با موفقیت آپلود شد.`,
        type: "info",
      });
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadMessage({ text: "آپلود با خطا مواجه شد.", type: "error" });
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
          <input
            type="text"
            id="custom-category-name"
            placeholder="نام دسته‌بندی عمومی خود را وارد کنید..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />

          <button
            type="button"
            className="btn"
            onClick={() => setIconPickerOpen(true)}
            title="انتخاب آیکن"
          >
            {selectedIconKey ? (
              <span className="icon-preview">
                {renderIconByKey(selectedIconKey)}
              </span>
            ) : (
              <i className="fas fa-icons" />
            )}{" "}
            انتخاب آیکن
          </button>

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
                  {renderIconByKey(editIconKey)}
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

      {/* Pickers */}
      <IconPicker
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        value={selectedIconKey}
        onSelect={(key) => {
          setSelectedIconKey(key);
          setIconPickerOpen(false);
        }}
      />

      <IconPicker
        open={editPickerOpen}
        onClose={() => setEditPickerOpen(false)}
        value={editIconKey}
        onSelect={(key) => {
          setEditIconKey(key);
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
              color: uploadMessage.type === "error" ? "#ff4d4d" : "#ffffff",
              marginInlineStart: 12,
            }}
          >
            {uploadMessage.text}
          </span>
        </div>
      </div>
    </div>
  );
}
