import React, { useMemo, useState, useEffect } from "react";
import iconAxios from "../../api/iconAxios.js";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useGlobalUI } from "../common/GlobalUI";
export const ICON_BY_KEY = {};

function DefaultIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function renderIconByKey(key) {
  const IconComponent = ICON_BY_KEY[key];
  return IconComponent ? <IconComponent /> : <DefaultIcon />;
}

export async function fetchAllIcons() {
  try {
    const res = await iconAxios.get("/read-all");
    return res.data;
  } catch (err) {
    console.error("Error fetching icons:", err);
    return [];
  }
}

export default function IconPicker({ open, onClose, value, onSelect }) {
  const { notify, confirmModal } = useGlobalUI();
  const [q, setQ] = useState("");
  const [backendIcons, setBackendIcons] = useState([]);
  const [uploading, setUploading] = useState(false);

  // role check
  const { user } = useAuth();
  const roles = user?.roles || []; // اگه کاربر نال باشه، آرایه خالی برمی‌گردونه
  const isAdmin = roles.includes("admin"); // بررسی نقش

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.(); // بستن مودال
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      fetchAllIcons().then((data) => setBackendIcons(data || []));
    }
  }, [open]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return backendIcons;
    return backendIcons.filter((i) => {
      const label = (i.label || "").toLowerCase();
      const fileName = (i.fileName || "").toLowerCase();
      return label.includes(query) || fileName.includes(query);
    });
  }, [q, backendIcons]);

  if (!open) return null;

  // 🔸 reload after mutation
  const reloadIcons = async () => {
    const data = await fetchAllIcons();
    setBackendIcons(data || []);
  };

  // 🔸 upload handler
  const handleUploadSvg = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".svg")) {
      notify({ type: "warning", message: "فقط فایل SVG مجاز است." });
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("Icon", file);
      formData.append("Label", file.name.replace(/\.svg$/i, ""));

      await iconAxios.post("/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await reloadIcons();
      notify({ type: "success", message: "آیکن با موفقیت آپلود شد." });
    } catch (err) {
      console.error("Upload failed:", err);
      notify({
        type: "error",
        message: err.response?.data?.message ?? "آپلود با خطا مواجه شد.",
      });
    } finally {
      setUploading(false);
    }
  };

  // 🔸 delete handler
  const handleDeleteIcon = async (id) => {
    const ok = await confirmModal({
      title: "حذف آیکن",
      message: "آیا از حذف این آیکن اطمینان دارید؟",
      confirmText: "حذف شود",
      cancelText: "انصراف",
      danger: true,
    });
    if (!ok) return;

    try {
      await iconAxios.delete(`/delete?id=${id}`);
      setBackendIcons((prev) => prev.filter((x) => x.id !== id));
      notify({ type: "success", message: "آیکن حذف شد" });
    } catch (err) {
      notify({
        type: "error",
        message: err.response?.data?.message ?? "خطا در حذف آیکن",
      });
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h4>انتخاب آیکن</h4>
          <button className="btn btn-icon" onClick={onClose} aria-label="بستن">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="icon-picker-search">
          <input
            type="text"
            placeholder="جستجوی آیکن…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {isAdmin && (
            <>
              <input
                id="icon-picker-upload-svg"
                type="file"
                accept=".svg"
                hidden
                onChange={(e) => {
                  handleUploadSvg(e.target.files?.[0]);
                  e.target.value = null;
                }}
              />
              <button
                type="button"
                className="btn"
                disabled={uploading}
                title="آپلود SVG و افزودن به لیست آیکن‌ها"
                onClick={() =>
                  document.getElementById("icon-picker-upload-svg").click()
                }
              >
                <i className="fas fa-upload" />{" "}
                {uploading ? "در حال آپلود…" : "آپلود آیکن جدید"}
              </button>
            </>
          )}
        </div>

        <div className="icon-grid" role="listbox" aria-label="Icon grid">
          {filtered.map((item) => {
            const selected = value === item.id;

            return (
              <div
                key={item.id}
                className={`icon-cell-wrapper ${selected ? "is-selected" : ""}`}
              >
                <button
                  className={`icon-cell ${selected ? "is-selected" : ""}`}
                  onClick={() => onSelect?.(item)}
                  title={item.label || item.fileName}
                  role="option"
                  aria-selected={selected}
                >
                  <span className="icon-cell__gfx">
                    <img
                      src={item.url}
                      alt={item.label || item.fileName}
                      width={24}
                      height={24}
                      style={{ objectFit: "contain" }}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="icon-cell__label">
                    {item.label || item.fileName}
                  </span>
                </button>

                {isAdmin && (
                  <button
                    className="delete-icon-btn"
                    title="حذف آیکن"
                    onClick={() => {
                      handleDeleteIcon(item.id);
                    }}
                  >
                    <i className="fas fa-trash" />
                  </button>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="empty-state">هیچ آیکنی مطابق جستجو پیدا نشد.</div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
