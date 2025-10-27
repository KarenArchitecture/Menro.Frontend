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
  const [uploadMessage, setUploadMessage] = useState({
    text: "تنها فایل‌های SVG مجاز به آپلود هستند.",
    type: "info",
  });

  // ✅ خواندن لیست دسته‌بندی‌ها از بک‌اند
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminGlobalCategoryAxios.get("/read-all");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // نمایش آیکن هر دسته
  const iconForItem = (item) => {
    if (item.svgIcon)
      return (
        <img
          src={`/icons/${item.svgIcon}`}
          alt={item.name}
          width={24}
          height={24}
          style={{ objectFit: "contain" }}
        />
      );
    return <GenericCategoryIcon />;
  };

  const openPickerFor = (idx) => setPickerIndex(idx);
  const closePicker = () => setPickerIndex(null);

  // وقتی آیکن انتخاب میشه از IconPicker
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

  //ذخیره تغییرات در بک‌اند
  const saveCategories = async () => {
    try {
      await categoryAxios.put("/update-many", categories);
      alert("تغییرات با موفقیت ذخیره شد ✅");
    } catch (err) {
      console.error("Error saving categories:", err);
      alert("ذخیره‌سازی با خطا مواجه شد!");
    }
  };

  // ✅ آپلود فایل SVG جدید و ثبت در دیتابیس
  const handleUploadSvg = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".svg")) {
      setUploadMessage({ text: "فقط فایل SVG مجاز است.", type: "error" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      // مرحله ۱: آپلود فایل در بک‌اند (FileController)
      const res = await fileAxios.post("/upload-icon", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { fileName } = res.data;

      // مرحله ۲: ثبت در جدول Icon (IconController)
      await iconAxios.post("/add", {
        fileName,
        label: file.name.replace(/\.svg$/i, ""),
      });

      setUploadMessage({
        text: `آیکن "${fileName}" با موفقیت آپلود و ذخیره شد.`,
        type: "info",
      });
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadMessage({ text: "آپلود با خطا مواجه شد.", type: "error" });
    }
  };

  return (
    <div className="panels-grid-single-column" dir="rtl">
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

      {/* Icon picker modal */}
      <IconPicker
        open={pickerIndex !== null}
        onClose={closePicker}
        value={
          pickerIndex !== null ? categories[pickerIndex]?.iconId ?? "" : ""
        }
        onSelect={applyPicker}
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
