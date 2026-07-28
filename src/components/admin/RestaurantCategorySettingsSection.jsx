import React, { useState, useEffect } from "react";
import adminRestaurantCategoryAxios from "../../api/adminRestaurantCategoryAxios";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";

function RestaurantTypeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path
        d="M8 6v5a2 2 0 0 0 2 2v5M8 6H6M8 8H6M16 6v12"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function RestaurantCategorySettingsSection() {
  useDocumentTitle("دسته‌بندی انواع رستوران");
  const { notify, confirmModal } = useGlobalUI();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // ==== Load restaurant categories ====
  const loadCategories = async () => {
    try {
      const res = await adminRestaurantCategoryAxios.get("/read-all");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load restaurant categories", err);
      notify({ type: "error", message: "خطا در دریافت دسته‌بندی‌ها" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ==== Add category ====
  const submitCreateCategory = async () => {
    const name = nameInput.trim();

    if (!name) {
      notify({ type: "warning", message: "نام دسته‌بندی را وارد کنید" });
      return;
    }

    try {
      setSubmitting(true);
      await adminRestaurantCategoryAxios.post("/add", { name });

      await loadCategories();
      setNameInput("");
      notify({ type: "success", message: "دسته‌بندی با موفقیت افزوده شد" });
    } catch (err) {
      console.error("Failed to create restaurant category", err);
      notify({
        type: "error",
        message: err.response?.data?.message ?? "خطا در افزودن دسته‌بندی",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ==== Delete ====
  const removeCategory = async (catId) => {
    const confirmed = await confirmModal({
      title: "حذف نوع رستوران",
      message: "آیا از حذف این دسته‌بندی مطمئن هستید؟",
      confirmText: "بله، حذف شود",
      cancelText: "انصراف",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await adminRestaurantCategoryAxios.delete(`/delete/${catId}`);
      await loadCategories();
      notify({ type: "success", message: "دسته‌بندی حذف شد" });
    } catch (err) {
      console.error("Failed to delete restaurant category", err);
      notify({
        type: "error",
        message: err.response?.data?.message ?? "خطا در حذف دسته‌بندی",
      });
    }
  };

  // ==== Get category for edit ====
  const getCategory = async (id) => {
    try {
      const res = await adminRestaurantCategoryAxios.get("/read", {
        params: { catId: id },
      });

      setEditingId(res.data.id);
      setEditName(res.data.name);
    } catch (err) {
      console.error("Failed to fetch restaurant category", err);
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
      setSavingEdit(true);
      await adminRestaurantCategoryAxios.put("/update", {
        id: editingId,
        name: newName,
      });

      await loadCategories();
      cancelEdit();
      notify({ type: "success", message: "تغییرات با موفقیت ذخیره شد" });
    } catch (err) {
      console.error("Failed to update restaurant category", err);
      notify({
        type: "error",
        message: err.response?.data?.message ?? "خطا در ذخیره تغییرات",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <div
      className="panels-grid-single-column"
      id="restaurant-categories-view"
      dir="rtl"
    >
      {/* Add new restaurant category */}
      <div className="panel">
        <h3>افزودن نوع رستوران جدید</h3>
        <p className="panel-subtitle">
          دسته‌بندی‌هایی مثل «کافه»، «فست‌فودی» یا «سنتی» که هنگام ثبت‌نام،
          صاحبان رستوران از بین آن‌ها انتخاب می‌کنند.
        </p>

        <div className="input-group-inline">
          <input
            type="text"
            id="restaurant-category-name"
            placeholder="نام نوع رستوران را وارد کنید..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitCreateCategory()}
          />

          <button
            className="btn btn-primary"
            onClick={submitCreateCategory}
            disabled={submitting}
          >
            {submitting ? "در حال افزودن…" : "افزودن"}
          </button>
        </div>

        <hr className="form-divider" />
      </div>

      {/* Existing restaurant categories */}
      <div className="panel">
        <h3>انواع رستوران فعلی</h3>
        <div className="category-list">
          {loading ? (
            <p>در حال بارگذاری...</p>
          ) : categories.length === 0 ? (
            <div className="category-item">
              <RestaurantTypeIcon />
              <span
                className="category-title"
                style={{ color: "var(--text-secondary)" }}
              >
                هنوز نوع رستورانی اضافه نشده است.
              </span>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="category-item">
                <div className="category-meta">
                  <RestaurantTypeIcon />
                  <span className="category-title">{cat.name}</span>
                </div>

                <div className="item-actions">
                  <button
                    className="btn btn-icon"
                    title="ویرایش"
                    onClick={() => getCategory(cat.id)}
                  >
                    <i className="fas fa-edit" />
                  </button>
                  <button
                    className="btn btn-icon btn-danger"
                    title="حذف"
                    onClick={() => removeCategory(cat.id)}
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
              <h4>ویرایش نوع رستوران</h4>
              <button
                className="btn btn-icon"
                onClick={cancelEdit}
                aria-label="بستن"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="form-vertical">
              <label htmlFor="edit-restaurant-category-name">نام</label>
              <input
                id="edit-restaurant-category-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              />
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={cancelEdit}>
                انصراف
              </button>
              <button
                className="btn btn-primary"
                onClick={saveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "در حال ذخیره…" : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
