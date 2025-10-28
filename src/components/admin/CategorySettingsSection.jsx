import React, { useState, useEffect } from "react";
import IconPicker from "./IconPicker";
import fileAxios from "../../api/fileAxios.js";
import iconAxios from "../../api/iconAxios.js";
import adminGlobalCategoryAxios from "../../api/adminGlobalCategoryAxios.js";

/** Placeholder for categories without icon */
function GenericCategoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function CategorySettingsSection() {
  const [categories, setCategories] = useState([]);
  const [pickerIndex, setPickerIndex] = useState(null);

  // ⬇️ Add-new form states
  const [newName, setNewName] = useState("");
  const [newIconId, setNewIconId] = useState(null);
  const [newIconFileName, setNewIconFileName] = useState("");
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  const [uploadMessage, setUploadMessage] = useState({
    text: "تنها فایل‌های SVG مجاز به آپلود هستند.",
    type: "info",
  });

  // ✅ Load global categories
  const fetchCategories = async () => {
    try {
      const res = await adminGlobalCategoryAxios.get("/read-all");
      const mapped = res.data.map((x) => ({
        id: x.id,
        name: x.name,
        iconId: x.icon?.id ?? null,
        svgIcon: x.icon?.fileName ?? null,
        iconUrl: x.icon?.url ?? null,
      }));
      setCategories(mapped);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔎 Render icon per item
  const iconForItem = (item) => {
    if (item.iconUrl) {
      return (
        <img
          src={item.iconUrl}
          alt={item.name}
          width={24}
          height={24}
          style={{ objectFit: "contain" }}
        />
      );
    }
    return <GenericCategoryIcon />;
  };

  // ===== Editing existing categories (icon change) =====
  const openPickerFor = (idx) => setPickerIndex(idx);
  const closePicker = () => setPickerIndex(null);

  const applyPicker = (selectedIconId, selectedFileName) => {
    setCategories((list) => {
      const next = [...list];
      next[pickerIndex] = {
        ...next[pickerIndex],
        iconId: selectedIconId,
        svgIcon: selectedFileName,
      };
      return next;
    });
    closePicker();
  };

  // ===== Save existing categories (bulk) =====
  const saveCategories = async () => {
    try {
      await adminGlobalCategoryAxios.put("/update-many", categories);
      alert("تغییرات با موفقیت ذخیره شد ✅");
      fetchCategories();
    } catch (err) {
      console.error("Error saving categories:", err);
      alert("ذخیره‌سازی با خطا مواجه شد!");
    }
  };

  // ===== Upload new SVG and register in DB (icons) =====
  const handleUploadSvg = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".svg")) {
      setUploadMessage({ text: "فقط فایل SVG مجاز است.", type: "error" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 1) upload raw file → returns { fileName }
      const res = await fileAxios.post("/upload-icon", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { fileName } = res.data;

      // 2) create Icon record → returns created icon (with id)
      const iconRes = await iconAxios.post("/add", {
        fileName,
        label: file.name.replace(/\.svg$/i, ""),
      });

      setUploadMessage({
        text: `آیکن "${fileName}" با موفقیت آپلود و ذخیره شد.`,
        type: "info",
      });

      // (Optional) if you want the new icon to be selectable immediately in the picker,
      // make sure your IconPicker reads icons from backend or a shared store refreshed here.
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadMessage({ text: "آپلود با خطا مواجه شد.", type: "error" });
    }
  };

  // ===== Add NEW global category (copied behavior) =====
  const submitCreateGlobalCategory = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      alert("نام دسته‌بندی را وارد کنید");
      return;
    }

    try {
      await adminGlobalCategoryAxios.post("/add", {
        name: trimmed,
        iconId: newIconId || null,
      });

      // refresh + clear
      await fetchCategories();
      setNewName("");
      setNewIconId(null);
      setNewIconFileName("");
    } catch (err) {
      console.error("Failed to create global category", err);
      alert(err.response?.data?.message ?? "خطا در افزودن دسته‌بندی");
    }
  };

  return (
    <div className="panels-grid-single-column" dir="rtl">
      {/* 🔹 Add NEW Global Category (this block is the copy you wanted) */}
      <div className="panel">
        <h3>افزودن دسته‌بندی عمومی جدید</h3>
        <p className="panel-subtitle">
          نام را وارد کنید و یک آیکن از لیست آیکن‌ها انتخاب کنید.
        </p>

        <div className="input-group-inline">
          <input
            type="text"
            placeholder="نام دسته‌بندی عمومی…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <button
            type="button"
            className="btn"
            onClick={() => setAddPickerOpen(true)}
            title="انتخاب آیکن"
          >
            {newIconFileName ? (
              <span className="icon-preview" title={newIconFileName}>
                {/* We don’t have a URL here; we only show its fileName */}
                <i className="fas fa-check-circle" style={{ opacity: 0.85 }} />
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

        {newIconFileName && (
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
            آیکن انتخاب‌شده: <b>{newIconFileName}</b>
          </div>
        )}
      </div>

      {/* 🔹 Edit existing GLOBAL categories */}
      <div className="panel">
        <h3>ویرایش دسته‌بندی‌های عمومی</h3>
        <p className="panel-subtitle">
          دسته‌بندی‌هایی که برای همه رستوران‌ها نمایش داده می‌شوند.
        </p>

        <div className="predef-table">
          {categories.map((it, idx) => (
            <div key={it.id} className="predef-row">
              <div className="predef-icon">
                <span className="icon-preview">{iconForItem(it)}</span>
                <button className="btn" onClick={() => openPickerFor(idx)}>
                  تغییر آیکن
                </button>
              </div>

              <div className="predef-name">
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    opacity: 0.8,
                    marginBottom: 4,
                  }}
                >
                  نام دسته
                </label>
                <input
                  type="text"
                  value={it.name}
                  onChange={(e) =>
                    setCategories((list) => {
                      const next = [...list];
                      next[idx] = { ...next[idx], name: e.target.value };
                      return next;
                    })
                  }
                />
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <p style={{ opacity: 0.7, marginTop: 8 }}>
              هیچ دسته‌بندی وجود ندارد.
            </p>
          )}
        </div>

        <div
          className="panel-actions"
          style={{ display: "flex", gap: 8, marginTop: 12 }}
        >
          <button className="btn btn-primary" onClick={saveCategories}>
            ذخیره تغییرات
          </button>
        </div>
      </div>

      {/* Icon picker for editing existing category rows */}
      <IconPicker
        open={pickerIndex !== null}
        onClose={closePicker}
        value={
          pickerIndex !== null ? categories[pickerIndex]?.iconId ?? "" : ""
        }
        onSelect={(selectedIconId, selectedFileName) => {
          applyPicker(selectedIconId, selectedFileName);
        }}
      />

      {/* Icon picker for ADD NEW category */}
      <IconPicker
        open={addPickerOpen}
        onClose={() => setAddPickerOpen(false)}
        value={newIconId}
        onSelect={(selectedIconId, selectedFileName) => {
          setNewIconId(selectedIconId);
          setNewIconFileName(selectedFileName || "");
          setAddPickerOpen(false);
        }}
      />

      {/* ---- Upload new icons ---- */}
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
              transition: "color 0.3s ease",
            }}
          >
            {uploadMessage.text}
          </span>
        </div>
      </div>
    </div>
  );
}
