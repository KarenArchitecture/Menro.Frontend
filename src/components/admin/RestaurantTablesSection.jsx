// src/components/admin/RestaurantTablesSection.jsx
//
// تب «میزهای رستوران» — مدیریت لیست میزها (افزودن، ویرایش برچسب، حذف).
// موجودیت سمت بک‌اند فقط دو فیلد دارد: Id و Label، پس UI هم عمداً ساده نگه
// داشته شده: یک گرید از کارت‌های میز + یک کارتِ «افزودن میز جدید» که با کلیک
// به یک فرم کوچک تبدیل می‌شود؛ ویرایش هم به‌صورت inline روی همان کارت انجام
// می‌شود (بدون مودال جداگانه، چون محتوا برای مودال زیادی سبک است).
//
// Endpoints (مطابق RestaurantTableController):
//   GET    /api/owner/restaurant/tables            -> RestaurantTablesDto[]
//   POST   /api/owner/restaurant/tables/add         body: { label }
//   PUT    /api/owner/restaurant/tables/update       body: { id, label }
//   DELETE /api/owner/restaurant/tables/delete/{id}

import React, { useEffect, useState, useCallback } from "react";
import ownerRestaurantTables from "../../api/ownerRestaurantTables";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../assets/css/admin/RestaurantTablesSection.css";

export default function RestaurantTablesSection() {
  useDocumentTitle("میزهای رستوران");

  const { notify, confirmModal } = useGlobalUI();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingEditId, setSavingEditId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ownerRestaurantTables.get("");
      setTables(res.data ?? []);
    } catch (err) {
      console.error("Error loading restaurant tables:", err);
      notify({
        type: "error",
        message: "دریافت لیست میزها با خطا مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  /* ---------- Add ---------- */
  const startAdding = () => {
    setIsAdding(true);
    setNewLabel("");
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewLabel("");
  };

  const submitAdd = async () => {
    const label = newLabel.trim();
    if (!label) {
      notify({ type: "warning", message: "برچسب میز نمی‌تواند خالی باشد." });
      return;
    }

    setSavingNew(true);
    try {
      await ownerRestaurantTables.post("/add", { label });
      notify({ type: "success", message: "میز با موفقیت اضافه شد." });
      setIsAdding(false);
      setNewLabel("");
      await loadTables();
    } catch (err) {
      console.error("Error adding table:", err);
      notify({
        type: "error",
        message: err?.response?.data?.message || "افزودن میز با خطا مواجه شد.",
      });
    } finally {
      setSavingNew(false);
    }
  };

  /* ---------- Edit ---------- */
  const startEditing = (table) => {
    setEditingId(table.id);
    setEditValue(table.label);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const submitEdit = async (id) => {
    const label = editValue.trim();
    if (!label) {
      notify({ type: "warning", message: "برچسب میز نمی‌تواند خالی باشد." });
      return;
    }

    setSavingEditId(id);
    try {
      await ownerRestaurantTables.put("/update", { id, label });
      notify({ type: "success", message: "میز با موفقیت ویرایش شد." });
      setEditingId(null);
      setEditValue("");
      await loadTables();
    } catch (err) {
      console.error("Error updating table:", err);
      notify({
        type: "error",
        message: err?.response?.data?.message || "ویرایش میز با خطا مواجه شد.",
      });
    } finally {
      setSavingEditId(null);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (table) => {
    const ok = await confirmModal({
      title: "حذف میز",
      message: `آیا از حذف «${table.label}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`,
      confirmText: "حذف میز",
      cancelText: "انصراف",
      danger: true,
    });
    if (!ok) return;

    setDeletingId(table.id);
    try {
      await ownerRestaurantTables.delete(`/delete/${table.id}`);
      notify({ type: "success", message: "میز حذف شد." });
      setTables((prev) => prev.filter((t) => t.id !== table.id));
    } catch (err) {
      console.error("Error deleting table:", err);
      notify({
        type: "error",
        message: err?.response?.data?.message || "حذف میز موفق نبود.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="panel rtab-panel">
      <div className="view-header rtab-header">
        <div>
          <h3>میزهای رستوران</h3>
          <p className="panel-subtitle rtab-subtitle">
            میزهای رستوران خود را اضافه، ویرایش یا حذف کنید
          </p>
        </div>
        <span className="rtab-count-badge">
          <i className="fa-solid fa-chair" />{" "}
          {tables.length.toLocaleString("fa-IR")} میز
        </span>
      </div>

      {loading ? (
        <div className="empty-hint">در حال بارگذاری میزها...</div>
      ) : (
        <div className="rtab-grid">
          {/* Add-new card */}
          {isAdding ? (
            <div className="rtab-card rtab-card--adding">
              <input
                type="text"
                autoFocus
                className="rtab-input"
                placeholder="مثلاً میز ۱ یا VIP"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitAdd();
                  if (e.key === "Escape") cancelAdding();
                }}
                disabled={savingNew}
              />
              <div className="rtab-card__actions">
                <button
                  className="btn-icon rtab-confirm-btn"
                  onClick={submitAdd}
                  disabled={savingNew}
                  aria-label="ذخیره"
                  title="ذخیره"
                >
                  <i
                    className={`fa-solid ${savingNew ? "fa-spinner fa-spin" : "fa-check"}`}
                  />
                </button>
                <button
                  className="btn-icon rtab-cancel-btn"
                  onClick={cancelAdding}
                  disabled={savingNew}
                  aria-label="انصراف"
                  title="انصراف"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>
          ) : (
            <button className="rtab-card rtab-card--add" onClick={startAdding}>
              <i className="fa-solid fa-plus" />
              <span>افزودن میز جدید</span>
            </button>
          )}

          {/* Existing tables */}
          {tables.map((table) => {
            const isEditing = editingId === table.id;
            const isSavingThis = savingEditId === table.id;
            const isDeletingThis = deletingId === table.id;

            return (
              <div
                key={table.id}
                className={`rtab-card ${isEditing ? "rtab-card--editing" : ""}`}
              >
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      autoFocus
                      className="rtab-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitEdit(table.id);
                        if (e.key === "Escape") cancelEditing();
                      }}
                      disabled={isSavingThis}
                    />
                    <div className="rtab-card__actions">
                      <button
                        className="btn-icon rtab-confirm-btn"
                        onClick={() => submitEdit(table.id)}
                        disabled={isSavingThis}
                        aria-label="ذخیره"
                        title="ذخیره"
                      >
                        <i
                          className={`fa-solid ${isSavingThis ? "fa-spinner fa-spin" : "fa-check"}`}
                        />
                      </button>
                      <button
                        className="btn-icon rtab-cancel-btn"
                        onClick={cancelEditing}
                        disabled={isSavingThis}
                        aria-label="انصراف"
                        title="انصراف"
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rtab-card__icon-slot">
                      <div className="rtab-card__icon">
                        <i className="fa-solid fa-chair" />
                      </div>

                      <div className="rtab-card__actions rtab-card__actions--hover">
                        <button
                          className="btn-icon"
                          onClick={() => startEditing(table)}
                          aria-label="ویرایش"
                          title="ویرایش"
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          className="btn-icon rtab-delete-btn"
                          onClick={() => handleDelete(table)}
                          disabled={isDeletingThis}
                          aria-label="حذف"
                          title="حذف"
                        >
                          <i
                            className={`fa-solid ${isDeletingThis ? "fa-spinner fa-spin" : "fa-trash"}`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="rtab-card__label" title={table.label}>
                      {table.label}
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {!isAdding && tables.length === 0 && (
            <div className="empty-hint rtab-empty">
              هنوز میزی ثبت نشده. با دکمه‌ی «افزودن میز جدید» اولین میز را اضافه
              کنید.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
