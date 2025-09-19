import React, { useState, useEffect } from "react";
import adminFoodAxios from "../../api/adminFoodAxios";

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2, 10);
}

export default function ProductModal({ isOpen, mode = "create", onClose }) {
  const title = mode === "edit" ? "ویرایش محصول" : "افزودن محصول جدید";

  // دسته‌بندی‌ها
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (!isOpen) return; // موقتاً اینو کامنت کن ببین کال میشه یا نه

    const fetchCategories = async () => {
      setLoadingCategories(true); // ✅ قبل از درخواست

      try {
        const { data } = await adminFoodAxios.get("/categories");
        console.log("categories fetched:", data);
        setCategories(data || []);
      } catch (err) {
        console.error("خطا در گرفتن دسته‌بندی‌ها", err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  //  simple vs variants
  const [hasVariants, setHasVariants] = useState(false);

  const [variants, setVariants] = useState([
    { id: uid(), name: "", price: "", isDefault: true, addons: [] },
  ]);

  // ---- helpers: variants ----
  const onToggleHasVariants = (flag) => {
    setHasVariants(flag);
    if (flag && variants.length === 0) {
      setVariants([
        { id: uid(), name: "", price: "", isDefault: true, addons: [] },
      ]);
    }
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: uid(),
        name: "",
        price: "",
        isDefault: prev.length === 0,
        addons: [],
      },
    ]);
  };

  const removeVariant = (id) => {
    setVariants((prev) => {
      const next = prev.filter((v) => v.id !== id);
      if (!next.some((v) => v.isDefault) && next.length > 0) {
        next[0].isDefault = true;
      }
      return next;
    });
  };

  const updateVariant = (id, patch) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...patch } : v))
    );
  };

  const makeDefault = (id) => {
    setVariants((prev) => prev.map((v) => ({ ...v, isDefault: v.id === id })));
  };

  // ---- helpers: addons (per variant) ----
  const addAddon = (variantId) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              addons: [...v.addons, { id: uid(), name: "", price: "" }],
            }
          : v
      )
    );
  };

  const updateAddon = (variantId, addonId, patch) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              addons: v.addons.map((a) =>
                a.id === addonId ? { ...a, ...patch } : a
              ),
            }
          : v
      )
    );
  };

  const removeAddon = (variantId, addonId) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, addons: v.addons.filter((a) => a.id !== addonId) }
          : v
      )
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (hasVariants) {
      if (variants.length === 0) {
        alert("حداقل یک نوع تعریف کنید.");
        return;
      }
      const badVariant = variants.find((v) => !v.name || !v.price);
      if (badVariant) {
        alert("برای هر نوع، نام و قیمت را وارد کنید.");
        return;
      }
      for (const v of variants) {
        for (const a of v.addons) {
          if (!a.name || !a.price) {
            alert("لطفاً برای همه مخلفات نام و قیمت وارد کنید.");
            return;
          }
        }
      }
    } else {
      const basePrice = (
        document.getElementById("product-price")?.value || ""
      ).trim();
      if (!basePrice) {
        alert("قیمت پایه را وارد کنید.");
        return;
      }
    }

    const basePriceValue = !hasVariants
      ? Number(
          (document.getElementById("product-price")?.value || "0").replace(
            /[^\d]/g,
            ""
          )
        )
      : null;

    const payload = {
      name: document.getElementById("product-name")?.value || "",
      ingredients: document.getElementById("product-description")?.value || "",
      foodCategoryId: Number(
        document.getElementById("product-category")?.value || "0"
      ),
      price: basePriceValue,
      imageUrl: "", // اینو بعداً باید با آپلود فایل پر کنی
      variants: hasVariants
        ? variants.map((v) => ({
            name: v.name.trim(),
            price: Number(String(v.price).replace(/[^\d]/g, "")),
            // توی بک‌اند فعلاً Addons نداری، اگه خواستی اضافه کنی باید DTO هم اصلاح بشه
          }))
        : [],
    };

    try {
      const { data } = await adminFoodAxios.post("/add", payload);
      console.log("محصول ذخیره شد:", data);
      alert("محصول با موفقیت ذخیره شد");
      onClose?.();
    } catch (err) {
      console.error("خطا در ذخیره محصول:", err);
      alert("ذخیره محصول ناموفق بود");
    }
  };

  return (
    <div
      id="product-modal"
      className="modal-overlay"
      style={{ display: isOpen ? "flex" : "none" }}
      onClick={(e) => e.target.id === "product-modal" && onClose?.()}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button className="btn btn-icon" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="modal-body">
          <form
            id="product-form"
            className="two-column-form"
            onSubmit={onSubmit}
          >
            <div className="form-column">
              <div className="input-group">
                <label htmlFor="product-name">نام محصول</label>
                <input type="text" id="product-name" required />
              </div>

              <div className="input-group">
                <label htmlFor="product-description">توضیح مختصر محصول</label>
                <textarea id="product-description" rows={4} />
              </div>

              {/* categories */}
              {/* <div className="input-group">
                <label htmlFor="product-category">دسته‌بندی</label>
                <select id="product-category" required>
                  <option value="kabab">کباب‌ها</option>
                  <option value="fastfood">فست فود</option>
                </select>
              </div> */}
              <div className="input-group">
                <label htmlFor="product-category">دسته‌بندی</label>
                <select id="product-category" required>
                  {loadingCategories ? (
                    <option>در حال بارگذاری...</option>
                  ) : categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>دسته‌ای یافت نشد</option>
                  )}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="product-combinations">ترکیب‌ها (اختیاری)</label>
                <select id="product-combinations" multiple>
                  <option value="combo1">ترکیب ویژه ۱</option>
                  <option value="combo2">ترکیب اقتصادی</option>
                </select>
                <small>برای انتخاب چند مورد، Ctrl/Cmd را نگه دارید.</small>
              </div>
            </div>

            <div className="form-column">
              <div className="input-group">
                <label>عکس محصول</label>
                <input type="file" id="product-image" className="file-input" />
              </div>
              <span className="input-alert">عکس محصول باید 1 * 1 باشد!</span>

              {/* Step 1: simple vs variants */}
              <div className="input-group">
                <label>آیا محصول تنوع دارد؟</label>
                <div className="radio-row" style={{ display: "flex", gap: 16 }}>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="hasVariants"
                      value="no"
                      checked={!hasVariants}
                      onChange={() => onToggleHasVariants(false)}
                    />{" "}
                    خیر، محصول ساده است
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="hasVariants"
                      value="yes"
                      checked={hasVariants}
                      onChange={() => onToggleHasVariants(true)}
                    />{" "}
                    بله، انواع دارد
                  </label>
                </div>
                <small>
                  اگر انواع دارد، قیمت پایه غیرفعال می‌شود و باید برای هر نوع
                  قیمت مشخص کنید.
                </small>
              </div>

              {/* Base price only when simple */}
              {!hasVariants && (
                <div className="input-group">
                  <label htmlFor="product-price">
                    قیمت پایه (برای محصول ساده)
                  </label>
                  <input
                    type="text"
                    id="product-price"
                    placeholder="مثال: ۱۵۰۰۰۰"
                  />
                </div>
              )}

              <hr className="form-divider" />

              {/* Steps 2 & 3: variants + per-variant addons */}
              {hasVariants && (
                <div className="input-group">
                  <label>انواع محصول (دارای تنوع)</label>

                  <div id="product-types-container">
                    {variants.map((v) => (
                      <div key={v.id} style={{ marginBottom: 10 }}>
                        {/* variant row */}
                        <div
                          className="product-type-item"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 140px auto auto",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          {/* name */}
                          <input
                            type="text"
                            placeholder="نام نوع (مثال: ویژه)"
                            value={v.name}
                            onChange={(e) =>
                              updateVariant(v.id, { name: e.target.value })
                            }
                          />

                          {/* price (digits only) */}
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="قیمت نوع"
                            value={v.price}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^\d]/g, "");
                              updateVariant(v.id, { price: raw });
                            }}
                          />

                          {/* default flag */}
                          <label
                            className="radio-label"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            <input
                              type="radio"
                              name="default_type"
                              checked={v.isDefault}
                              onChange={() => makeDefault(v.id)}
                            />{" "}
                            پیش‌فرض
                          </label>

                          {/* remove */}
                          <button
                            type="button"
                            className="btn btn-icon btn-danger"
                            onClick={() => removeVariant(v.id)}
                            title="حذف نوع"
                            disabled={variants.length === 1}
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </div>

                        {/* addons block */}
                        <div
                          className="addons-block"
                          style={{
                            gridColumn: "1 / -1",
                            marginTop: 8,
                            padding: "8px 12px",
                            border: "1px dashed rgba(255,255,255,0.2)",
                            borderRadius: 8,
                          }}
                        >
                          <label style={{ fontSize: 13, fontWeight: "bold" }}>
                            مخلفات
                          </label>

                          {v.addons.length === 0 && (
                            <div style={{ fontSize: 12, opacity: 0.7 }}>
                              هیچ مخلفی اضافه نشده است
                            </div>
                          )}

                          {v.addons.map((a) => (
                            <div
                              key={a.id}
                              className="addon-item"
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 120px auto",
                                gap: 8,
                                alignItems: "center",
                                marginTop: 6,
                              }}
                            >
                              <input
                                type="text"
                                placeholder="نام مخلفات"
                                value={a.name}
                                onChange={(e) =>
                                  updateAddon(v.id, a.id, {
                                    name: e.target.value,
                                  })
                                }
                              />
                              <input
                                type="text"
                                placeholder="قیمت"
                                inputMode="numeric"
                                value={a.price}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(
                                    /[^\d]/g,
                                    ""
                                  );
                                  updateAddon(v.id, a.id, { price: raw });
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-icon btn-danger"
                                onClick={() => removeAddon(v.id, a.id)}
                                title="حذف مخلف"
                              >
                                <i className="fas fa-trash" />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            style={{ marginTop: 6 }}
                            onClick={() => addAddon(v.id)}
                          >
                            افزودن مخلفات
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      id="add-type-btn"
                      className="btn btn-secondary full-width"
                      onClick={addVariant}
                    >
                      + افزودن نوع جدید
                    </button>
                  </div>

                  <small
                    style={{ display: "block", marginTop: 8, opacity: 0.8 }}
                  >
                    یکی از انواع باید «پیش‌فرض» باشد. قیمت نهایی بر اساس نوع
                    انتخاب‌شده و مجموع قیمت مخلفات تعیین می‌شود.
                  </small>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="submit" form="product-form" className="btn btn-primary">
            ذخیره محصول
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
