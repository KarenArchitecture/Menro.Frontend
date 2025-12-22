// src/components/admin/ProductModal.jsx
import { useState, useEffect, useRef } from "react";
import adminFoodAxios from "../../api/adminFoodAxios";

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2, 10);
}

function toIntDigits(v) {
  return Number(String(v || "0").replace(/[^\d]/g, ""));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function ProductModal({
  isOpen,
  mode = "create",
  productId,
  onClose,
  onSaved,
}) {
  const title = mode === "edit" ? "ویرایش محصول" : "افزودن محصول جدید";

  // برای ریست کردن فرم بعد بسته شدن
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [foodCategoryId, setFoodCategoryId] = useState("");
  const [price, setPrice] = useState("");

  // ✅ NEW: discount (%)
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(""); // digits-only string
  const [discountConfirmed, setDiscountConfirmed] = useState(false);

  // دسته‌بندی‌ها
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // عکس محصول
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageName, setExistingImageName] = useState(null);
  const fileInputRef = useRef(null);

  //  simple vs variants
  const [hasVariants, setHasVariants] = useState(false);

  const [variants, setVariants] = useState([
    { id: uid(), name: "", price: "", isDefault: true, addons: [] },
  ]);

  // load categories on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      setLoadingCategories(true);

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

  // UX
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // food details
  useEffect(() => {
    if (!isOpen || mode !== "edit" || !productId) return;

    const fetchProduct = async () => {
      try {
        const { data } = await adminFoodAxios.get(`/${productId}`);
        console.log("product fetched:", data);

        setName(data.name || "");
        setIngredients(data.ingredients || "");
        setFoodCategoryId(data.foodCategoryId ?? "");
        setImagePreview(data.imageUrl);
        setExistingImageName(data.imageName);

        // ✅ NEW: load discountPercent from server (support multiple field names)
        const serverPctRaw =
          data.discountPercent ??
          data.discountPercentage ??
          data.discountPct ??
          0;

        const serverPct = clamp(toIntDigits(serverPctRaw), 0, 99);
        if (serverPct > 0) {
          setHasDiscount(true);
          setDiscountPercent(String(serverPct));
          setDiscountConfirmed(true); // saved value = confirmed
        } else {
          setHasDiscount(false);
          setDiscountPercent("");
          setDiscountConfirmed(false);
        }

        if (data.hasVariants && data.variants) {
          setHasVariants(true);
          setVariants(
            data.variants.map((v, index) => ({
              id: uid(),
              name: v.name,
              price: v.price?.toString() || "",
              isDefault: v.isDefault ?? index === 0,
              addons: v.addons
                ? v.addons.map((a) => ({
                    id: uid(),
                    name: a.name,
                    price: a.extraPrice?.toString() || "",
                  }))
                : [],
            }))
          );
        } else {
          setHasVariants(false);
          setPrice(data.price?.toString() || "");
        }
      } catch (err) {
        console.error("خطا در گرفتن اطلاعات محصول:", err);
      }
    };

    fetchProduct();
  }, [isOpen, mode, productId]);

  // hasCategory check for food
  useEffect(() => {
    if (!isOpen || mode !== "edit") return;
    if (loadingCategories) return;
    if (!foodCategoryId) return;

    const exists = categories.some(
      (c) => Number(c.id) === Number(foodCategoryId)
    );

    if (!exists) {
      console.warn("⚠ دسته‌بندی محصول حذف شده → foodCategoryId = ''");
      setFoodCategoryId("");
    }
  }, [isOpen, mode, loadingCategories, categories, foodCategoryId]);

  // unselect category on create mode
  useEffect(() => {
    if (isOpen && mode === "create") setFoodCategoryId("");
  }, [isOpen, mode]);

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
          ? { ...v, addons: [...v.addons, { id: uid(), name: "", price: "" }] }
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

  // ✅ NEW: discount helpers
  const pctValue = clamp(toIntDigits(discountPercent), 0, 99);
  const basePriceValue = toIntDigits(price);

  const computedFinalBasePrice = (() => {
    if (!basePriceValue) return 0;
    if (!hasDiscount || !pctValue) return basePriceValue;
    const v = Math.round(basePriceValue * (1 - pctValue / 100));
    return Math.max(0, v);
  })();

  const handleToggleDiscount = (checked) => {
    setHasDiscount(checked);
    if (!checked) {
      setDiscountPercent("");
      setDiscountConfirmed(false);
    } else {
      setDiscountConfirmed(false);
    }
  };

  const confirmDiscount = () => {
    const v = clamp(toIntDigits(discountPercent), 0, 99);

    // ✅ anti abuse: no 0, no 100, no negative, no >99
    if (v <= 0) {
      alert("درصد تخفیف باید حداقل ۱٪ باشد.");
      return;
    }
    if (v >= 100) {
      alert("درصد تخفیف نمی‌تواند ۱۰۰٪ یا بیشتر باشد.");
      return;
    }

    setDiscountPercent(String(v));
    setDiscountConfirmed(true);
  };

  const resetForm = () => {
    setName("");
    setIngredients("");
    setFoodCategoryId(0);
    setPrice("");
    setHasVariants(false);

    // ✅ NEW: reset discount
    setHasDiscount(false);
    setDiscountPercent("");
    setDiscountConfirmed(false);

    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setVariants([
      { id: uid(), name: "", price: "", isDefault: true, addons: [] },
    ]);
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  // submit
  const onSubmit = async (e) => {
    e.preventDefault();
    let uploadedFileName = null;

    // ✅ validate discount (cannot abuse)
    if (hasDiscount) {
      const v = clamp(toIntDigits(discountPercent), 0, 99);
      if (v <= 0 || v >= 100) {
        alert("درصد تخفیف معتبر نیست (۱ تا ۹۹).");
        return;
      }
      if (!discountConfirmed) {
        alert("لطفاً تخفیف را تأیید کنید.");
        return;
      }
    }

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      try {
        const uploadRes = await adminFoodAxios.post(
          "/upload-food-image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        uploadedFileName = uploadRes.data;
      } catch (err) {
        console.error("خطا در آپلود تصویر:", err);
        alert("آپلود تصویر ناموفق بود");
        return;
      }
    }

    if (hasVariants) {
      if (variants.length === 0) return alert("حداقل یک نوع تعریف کنید.");

      const badVariant = variants.find((v) => !v.name || !v.price);
      if (badVariant) return alert("برای هر نوع، نام و قیمت را وارد کنید.");

      for (const v of variants) {
        for (const a of v.addons) {
          if (!a.name || !a.price)
            return alert("لطفاً برای همه مخلفات نام و قیمت وارد کنید.");
        }
      }
    } else {
      const basePrice = (price || "").trim();
      if (!basePrice) return alert("قیمت پایه را وارد کنید.");
    }

    const basePriceValuePayload = !hasVariants ? toIntDigits(price) : null;

    const payload = {
      id: productId,
      name: name.trim(),
      ingredients: ingredients.trim(),
      foodCategoryId: Number(foodCategoryId || 0),
      price: basePriceValuePayload ?? 0,
      imageName: uploadedFileName || existingImageName || null,
      hasVariants: hasVariants,

      // ✅ NEW: discountPercent
      discountPercent: hasDiscount
        ? clamp(toIntDigits(discountPercent), 1, 99)
        : 0,

      // ❌ OLD (kept)
      // discountAmount: 0,

      variants: hasVariants
        ? variants.map((v) => ({
            name: v.name.trim(),
            price: toIntDigits(v.price),
            isDefault: v.isDefault,
            addons: v.addons.map((a) => ({
              name: a.name.trim(),
              extraPrice: toIntDigits(a.price),
            })),
          }))
        : [],
    };

    try {
      if (mode === "create") {
        await adminFoodAxios.post("/add", payload);
      } else if (mode === "edit" && productId) {
        await adminFoodAxios.put("/update", payload);
      }

      onSaved?.();
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
                <input
                  type="text"
                  id="product-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="product-description">توضیح مختصر محصول</label>
                <textarea
                  id="product-description"
                  rows={4}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="product-category">دسته‌بندی</label>
                <select
                  id="product-category"
                  required
                  value={foodCategoryId}
                  onChange={(e) => setFoodCategoryId(e.target.value)}
                >
                  {mode === "edit" &&
                    foodCategoryId === "" &&
                    !loadingCategories &&
                    categories.length > 0 && (
                      <option value="" disabled>
                        دسته‌بندی پاک شده
                      </option>
                    )}

                  <option value="" disabled>
                    انتخاب دسته‌بندی
                  </option>

                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
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
              {/* image preview and input */}
              <div className="input-group">
                <label>پیش‌نمایش تصویر محصول</label>

                <div className="product-image-preview">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="product-image-preview__img"
                    />
                  ) : (
                    <span className="product-image-preview__placeholder">
                      عکس محصول نمایش داده می‌شود
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImageFile(file);

                    const reader = new FileReader();
                    reader.onload = (ev) => setImagePreview(ev.target.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </div>

              <span className="input-alert">عکس محصول باید 1 * 1 باشد!</span>

              {/* Step 1: simple vs variants */}
              <div className="input-group">
                <label>آیا محصول تنوع دارد؟</label>
                <div className="radio-row">
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
                <>
                  <div className="input-group">
                    <label htmlFor="product-price">
                      قیمت پایه (برای محصول ساده)
                    </label>
                    <input
                      type="text"
                      id="product-price"
                      placeholder="مثال: ۱۵۰۰۰۰"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value.replace(/[^\d]/g, ""))
                      }
                    />
                  </div>

                  {/* ✅ NEW: discount (below price) */}
                  <div className="input-group">
                    <label className="discount-toggle">
                      <input
                        type="checkbox"
                        checked={hasDiscount}
                        onChange={(e) => handleToggleDiscount(e.target.checked)}
                      />
                      این محصول تخفیف دارد؟
                    </label>

                    {hasDiscount && (
                      <div className="discount-box">
                        <div className="discount-row">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="درصد تخفیف (۱ تا ۹۹)"
                            value={discountPercent}
                            disabled={discountConfirmed}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^\d]/g, "");
                              const v = clamp(toIntDigits(raw), 0, 99);
                              setDiscountPercent(raw ? String(v) : "");
                              setDiscountConfirmed(false);
                            }}
                          />

                          {!discountConfirmed ? (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={confirmDiscount}
                            >
                              تأیید تخفیف
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setDiscountConfirmed(false)}
                            >
                              ویرایش
                            </button>
                          )}
                        </div>

                        <small className="discount-hint">
                          تا زمانی که «تأیید تخفیف» را نزنید، ذخیره انجام
                          نمی‌شود.
                        </small>

                        {pctValue > 0 && !discountConfirmed && (
                          <div className="discount-warning">
                            ⚠️ تخفیف وارد شده اما هنوز تأیید نشده است.
                          </div>
                        )}

                        {pctValue > 0 && discountConfirmed && (
                          <div className="discount-confirmed">
                            ✅ تخفیف ثبت شد: {pctValue.toLocaleString("fa-IR")}٪
                          </div>
                        )}

                        {/* optional price preview (safe + non-abusive) */}
                        {basePriceValue > 0 && pctValue > 0 && (
                          <div className="discount-preview">
                            قیمت نهایی:{" "}
                            <strong>
                              {computedFinalBasePrice.toLocaleString("fa-IR")}
                            </strong>{" "}
                            تومان
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              <hr className="form-divider" />

              {/* variants */}
              {hasVariants && (
                <div className="input-group">
                  <label>انواع محصول (دارای تنوع)</label>

                  <div id="product-types-container">
                    {variants.map((v) => (
                      <div key={v.id} style={{ marginBottom: 10 }}>
                        <div className="product-type-item">
                          <input
                            type="text"
                            placeholder="نام نوع (مثال: ویژه)"
                            value={v.name}
                            onChange={(e) =>
                              updateVariant(v.id, { name: e.target.value })
                            }
                          />

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

                          <label className="radio-label">
                            <input
                              type="radio"
                              name="default_type"
                              checked={v.isDefault}
                              onChange={() => makeDefault(v.id)}
                            />{" "}
                            پیش‌فرض
                          </label>

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

                        <div className="addons-block">
                          <label className="addons-title">مخلفات</label>

                          {v.addons.length === 0 && (
                            <div className="addons-empty">
                              هیچ مخلفی اضافه نشده است
                            </div>
                          )}

                          {v.addons.map((a) => (
                            <div key={a.id} className="addon-item">
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
                            onClick={() => addAddon(v.id)}
                          >
                            افزودن مخلفات
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    id="add-type-btn"
                    className="btn btn-secondary full-width"
                    onClick={addVariant}
                  >
                    + افزودن نوع جدید
                  </button>

                  <small className="variants-note">
                    یکی از انواع باید «پیش‌فرض» باشد.
                  </small>

                  {/* ✅ NEW: discount for variant-products too */}
                  <div className="input-group">
                    <label className="discount-toggle">
                      <input
                        type="checkbox"
                        checked={hasDiscount}
                        onChange={(e) => handleToggleDiscount(e.target.checked)}
                      />
                      این محصول تخفیف دارد؟
                    </label>

                    {hasDiscount && (
                      <div className="discount-box">
                        <div className="discount-row">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="درصد تخفیف (۱ تا ۹۹)"
                            value={discountPercent}
                            disabled={discountConfirmed}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^\d]/g, "");
                              const v = clamp(toIntDigits(raw), 0, 99);
                              setDiscountPercent(raw ? String(v) : "");
                              setDiscountConfirmed(false);
                            }}
                          />

                          {!discountConfirmed ? (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={confirmDiscount}
                            >
                              تأیید تخفیف
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setDiscountConfirmed(false)}
                            >
                              ویرایش
                            </button>
                          )}
                        </div>

                        <small className="discount-hint">
                          تا زمانی که «تأیید تخفیف» را نزنید، ذخیره انجام
                          نمی‌شود.
                        </small>

                        {pctValue > 0 && !discountConfirmed && (
                          <div className="discount-warning">
                            ⚠️ تخفیف وارد شده اما هنوز تأیید نشده است.
                          </div>
                        )}

                        {pctValue > 0 && discountConfirmed && (
                          <div className="discount-confirmed">
                            ✅ تخفیف ثبت شد: {pctValue.toLocaleString("fa-IR")}٪
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="submit" form="product-form" className="btn btn-primary">
            ذخیره محصول
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              resetForm();
              onClose?.();
            }}
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
