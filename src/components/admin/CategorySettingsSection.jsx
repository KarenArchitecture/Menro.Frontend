import React, { useState } from "react";
import IconPicker, {
  ICON_BY_KEY,
  renderIconByKey,
  registerCustomIcon,
  listCustomIcons,
  removeCustomIcon,
} from "./IconPicker";
import {
  getPredefined,
  setPredefined,
  resetPredefined,
} from "./predefinedStore";

/** Return the uploaded SVG's original filename and MIME type */
export function getSvgUploadMeta(file) {
  return {
    name: file?.name || "",
    type: file?.type || "image/svg+xml",
  };
}

function GenericCategoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function CategorySettingsSection() {
  const [predefList, setPredefList] = useState(() => getPredefined());
  const [pickerIndex, setPickerIndex] = useState(null);
  const [customIcons, setCustomIcons] = useState(() => listCustomIcons());
  const [uploadMessage, setUploadMessage] = useState({
    text: "تنها فایل‌های SVG مجاز به آپلود هستند.",
    type: "info", // info | error
  });

  const iconForKey = (key) =>
    renderIconByKey(key) ||
    (ICON_BY_KEY[key] ? (
      React.createElement(ICON_BY_KEY[key])
    ) : (
      <GenericCategoryIcon />
    ));

  const openPickerFor = (idx) => setPickerIndex(idx);
  const closePicker = () => setPickerIndex(null);
  const applyPicker = (key) => {
    setPredefList((list) => {
      const next = [...list];
      next[pickerIndex] = { ...next[pickerIndex], iconKey: key };
      return next;
    });
    closePicker();
  };

  const savePredefined = () => setPredefined(predefList);
  const restoreDefaults = () => setPredefList(resetPredefined());

  // ✅ Upload SVG -> log file info + register + show messages
  const handleUploadSvg = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".svg")) {
      setUploadMessage({
        text: "لطفا یک فایل SVG بارگذاری کنید.",
        type: "error",
      });
      return;
    }

    const meta = getSvgUploadMeta(file);
    console.log("Uploaded SVG Info →", meta.name, meta.type);
    setUploadMessage({
      text: `فایل "${meta.name}" با موفقیت بارگذاری شد.`,
      type: "info",
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const label = file.name.replace(/\.svg$/i, "");
      registerCustomIcon({ label, dataUrl: e.target.result });
      setCustomIcons(listCustomIcons());
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomIcon = (key) => {
    const inUse = predefList.some((p) => p.iconKey === key);
    if (inUse) {
      setUploadMessage({
        text: "این آیکن در حال استفاده است. ابتدا آیکن آن دسته را تغییر دهید.",
        type: "error",
      });
      return;
    }
    removeCustomIcon(key);
    setCustomIcons(listCustomIcons());
  };

  return (
    <div className="panels-grid-single-column" dir="rtl">
      {/* ---- Shared predefined editor ---- */}
      <div className="panel">
        <h3>ویرایش دسته‌های از پیش‌تعریف‌شده</h3>
        <p className="panel-subtitle">دسته بندی‌های پیش‌فرض رستوران‌ها</p>

        <div className="predef-table">
          {predefList.map((it, idx) => (
            <div key={it.id} className="predef-row">
              <div className="predef-icon">
                <span className="icon-preview">{iconForKey(it.iconKey)}</span>
                <button className="btn" onClick={() => openPickerFor(idx)}>
                  تغییر آیکن
                </button>
              </div>

              <div className="predef-name">
                <label style={{ display: "block", fontSize: 12, opacity: 0.8 }}>
                  نام
                </label>
                <input
                  type="text"
                  value={it.name}
                  onChange={(e) =>
                    setPredefList((list) => {
                      const next = [...list];
                      next[idx] = { ...next[idx], name: e.target.value };
                      return next;
                    })
                  }
                />
              </div>
            </div>
          ))}

          {predefList.length === 0 && (
            <p style={{ opacity: 0.7, marginTop: 8 }}>هیچ آیتمی وجود ندارد.</p>
          )}
        </div>

        <div
          className="panel-actions"
          style={{ display: "flex", gap: 8, marginTop: 12 }}
        >
          <button className="btn" onClick={restoreDefaults}>
            بازنشانی به پیش‌فرض
          </button>
          <button className="btn btn-primary" onClick={savePredefined}>
            ذخیره تغییرات
          </button>
        </div>
      </div>

      {/* Icon picker */}
      <IconPicker
        open={pickerIndex !== null}
        onClose={closePicker}
        value={pickerIndex !== null ? predefList[pickerIndex]?.iconKey : ""}
        onSelect={applyPicker}
      />

      {/* ---- Custom icon management ---- */}
      <div className="panel" style={{ marginTop: 24 }}>
        <h4>مدیریت آیکن‌های سفارشی</h4>

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

          {/* Instruction / status message */}
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

        {customIcons.length === 0 ? (
          <p style={{ opacity: 0.7 }}>هنوز آیکن سفارشی اضافه نشده است.</p>
        ) : (
          <div className="custom-icons-list">
            {customIcons.map((ic) => {
              const inUse = predefList.some((p) => p.iconKey === ic.key);
              return (
                <div key={ic.key} className="custom-icon-row">
                  <span className="icon">
                    <img
                      src={ic.dataUrl}
                      alt={ic.label || ic.key}
                      width={24}
                      height={24}
                      style={{ objectFit: "contain" }}
                    />
                  </span>
                  <span className="name">{ic.label || ic.key}</span>
                  <div className="actions">
                    <button
                      className="btn btn-icon btn-danger"
                      title={inUse ? "در حال استفاده" : "حذف آیکن"}
                      disabled={inUse}
                      onClick={() => handleRemoveCustomIcon(ic.key)}
                    >
                      <i className="fas fa-trash" />
                    </button>
                    {inUse && (
                      <span
                        className="badge badge-warning"
                        style={{ marginInlineStart: 8 }}
                      >
                        در حال استفاده
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
