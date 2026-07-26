// src/components/admin/FoodModal.jsx
import { useState, useEffect, useRef } from "react";
import adminFoodAxios from "../../api/adminFoodAxios";
import "../../assets/css/admin/foodModal.css";

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

export default function FoodModal({
  isOpen,
  mode = "create",
  foodId,
  onClose,
  onSaved,
  onNavigateToCategories,
}) {
  const title = mode === "edit" ? "ویرایش غذا" : "افزودن غذای جدید";

  // برای ریست کردن فرم بعد بسته شدن
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [foodCategoryId, setFoodCategoryId] = useState("");
  const [price, setPrice] = useState("");

  // discount (%)
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(""); // digits-only string
  const [discountConfirmed, setDiscountConfirmed] = useState(false);

  // دسته‌بندی‌ها
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // عکس غذا
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageName, setExistingImageName] = useState(null);
  const fileInputRef = useRef(null);

  //  simple vs variants
  const [hasVariants, setHasVariants] = useState(false);

  const [variants, setVariants] = useState([
    {
      id: null,
      clientId: uid(),
      name: "",
      price: "",
      isDefault: true,
      addons: [],
    },
  ]);

  // show extra column if has variant/discount
  const showExtraColumn = hasVariants;

  // load categories on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      setLoadingCategories(true);

      try {
        const { data } = await adminFoodAxios.get("/categories");
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
    if (!isOpen || mode !== "edit" || !foodId) return;

    const fetchFood = async () => {
      try {
        const { data } = await adminFoodAxios.get(`/${foodId}`);
        setName(data.name || "");
        setIngredients(data.ingredients || "");
        setFoodCategoryId(data.foodCategoryId ?? "");
        setImagePreview(data.imageUrl);
        setExistingImageName(data.imageName);

        // load discount percentage
        const serverPctRaw = data.discount ?? 0;

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
              id: v.id ?? v.Id ?? null, // ✅ db id
              clientId: uid(), // ✅ ui id
              name: v.name || "",
              price: v.price?.toString() || "",
              isDefault: v.isDefault ?? index === 0,
              addons: (v.addons || []).map((a) => ({
                id: a.id ?? a.Id ?? null, // ✅ db id
                clientId: uid(), // ✅ ui id
                name: a.name || "",
                price: a.extraPrice?.toString() || "",
              })),
            })),
          );
        } else {
          setHasVariants(false);
          setPrice(data.price?.toString() || "");
        }
      } catch (err) {
        console.error("خطا در گرفتن اطلاعات غذا:", err);
      }
    };

    fetchFood();
  }, [isOpen, mode, foodId]);

  // hasCategory check for food
  useEffect(() => {
    if (!isOpen || mode !== "edit") return;
    if (loadingCategories) return;
    if (!foodCategoryId) return;

    const exists = categories.some(
      (c) => Number(c.id) === Number(foodCategoryId),
    );

    if (!exists) {
      console.warn("⚠ دسته‌بندی غذا حذف شده → foodCategoryId = ''");
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
        {
          id: null,
          clientId: uid(),
          name: "",
          price: "",
          isDefault: true,
          addons: [],
        },
      ]);
    }
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: null,
        clientId: uid(),
        name: "",
        price: "",
        isDefault: prev.length === 0,
        addons: [],
      },
    ]);
  };

  const removeVariant = (clientId) => {
    setVariants((prev) => {
      const next = prev.filter((v) => v.clientId !== clientId);
      if (!next.some((v) => v.isDefault) && next.length > 0)
        next[0].isDefault = true;
      return next;
    });
  };

  const updateVariant = (clientId, patch) => {
    setVariants((prev) =>
      prev.map((v) => (v.clientId === clientId ? { ...v, ...patch } : v)),
    );
  };

  const makeDefault = (clientId) => {
    setVariants((prev) =>
      prev.map((v) => ({ ...v, isDefault: v.clientId === clientId })),
    );
  };

  // ---- helpers: addons (per variant) ----
  const addAddon = (variantClientId) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.clientId === variantClientId
          ? {
              ...v,
              addons: [
                ...v.addons,
                { id: null, clientId: uid(), name: "", price: "" },
              ],
            }
          : v,
      ),
    );
  };

  const updateAddon = (variantClientId, addonClientId, patch) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.clientId === variantClientId
          ? {
              ...v,
              addons: v.addons.map((a) =>
                a.clientId === addonClientId ? { ...a, ...patch } : a,
              ),
            }
          : v,
      ),
    );
  };

  const removeAddon = (variantClientId, addonClientId) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.clientId === variantClientId
          ? {
              ...v,
              addons: v.addons.filter((a) => a.clientId !== addonClientId),
            }
          : v,
      ),
    );
  };

  // discount helpers
  const pctValue = clamp(toIntDigits(discountPercent), 0, 99);
  const basePriceValue = toIntDigits(price);

  const computedFinalBasePrice = (() => {
    if (!basePriceValue) return 0;
    if (!hasDiscount || !pctValue) return basePriceValue;
    const v = Math.round(basePriceValue * (1 - pctValue / 100));
    return Math.max(0, v);
  })();

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddCategoryClick = () => {
    onNavigateToCategories?.();
  };
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  // submit
  const onSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    let uploadedFileName = null;

    try {
      // -------------------- validation discount --------------------
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

      // -------------------- upload image --------------------
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await adminFoodAxios.post(
          "/upload-food-image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        uploadedFileName = uploadRes.data;
      }

      // -------------------- validation variants --------------------
      if (hasVariants) {
        if (variants.length === 0) return alert("حداقل یک نوع تعریف کنید.");

        const badVariant = variants.find((v) => !v.name || !v.price);
        if (badVariant) return alert("برای هر نوع، نام و قیمت را وارد کنید.");

        for (const v of variants) {
          for (const a of v.addons) {
            if (!a.name || !a.price) {
              return alert("لطفاً برای همه مخلفات نام و قیمت وارد کنید.");
            }
          }
        }
      } else {
        const basePrice = (price || "").trim();
        if (!basePrice) return alert("قیمت پایه را وارد کنید.");
      }

      // -------------------- payload --------------------
      const basePriceValuePayload = !hasVariants ? toIntDigits(price) : null;

      const payload = {
        id: foodId,
        name: name.trim(),
        ingredients: ingredients.trim() || null,
        foodCategoryId: Number(foodCategoryId || 0),
        price: basePriceValuePayload ?? 0,
        imageName:
          typeof uploadedFileName === "string"
            ? uploadedFileName
            : uploadedFileName?.fileName ||
              existingImageName?.fileName ||
              existingImageName ||
              null,
        hasVariants,

        discountPercent: hasDiscount
          ? clamp(toIntDigits(discountPercent), 1, 99)
          : null,

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

      // -------------------- API CALL (/add or /update) --------------------
      let response;

      if (mode === "create") {
        response = await adminFoodAxios.post("/add", payload);
      } else if (mode === "edit" && foodId) {
        response = await adminFoodAxios.put("/update", payload);
      } else {
        throw new Error("Invalid mode or missing foodId");
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error("SAVE ERROR:", err);

      if (err.response) {
        console.error("STATUS:", err.response.status);
        console.error("DATA:", err.response.data);
        console.error("HEADERS:", err.response.headers);

        alert(JSON.stringify(err.response.data, null, 2));
      } else {
        console.error("NO RESPONSE:", err);
      }

      alert("ذخیره غذا ناموفق بود");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="food-modal"
      className="modal-overlay"
      style={{ display: isOpen ? "flex" : "none" }}
      onClick={(e) => e.target.id === "food-modal" && onClose?.()}
    >
      <div
        className={`modal-content ${showExtraColumn ? "modal-content--wide" : ""}`}
      >
        {" "}
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button className="btn btn-icon" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="modal-body">
          <form
            id="food-form"
            className={`two-column-form ${showExtraColumn ? "two-column-form--three-col" : ""}`}
            onSubmit={onSubmit}
          >
            <div className="form-column">
              <div className="input-group">
                <label htmlFor="food-name">نام غذا</label>
                <input
                  type="text"
                  id="food-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <hr className="form-divider" />
              <div className="input-group">
                <label htmlFor="food-description">توضیح مختصر غذا</label>
                <textarea
                  id="food-description"
                  rows={4}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />
              </div>
              <hr className="form-divider" />
              <div className="input-group">
                <label htmlFor="food-category">دسته‌بندی</label>
                {!loadingCategories && categories.length === 0 ? (
                  <button
                    type="button"
                    className="food-modal__add-category-btn"
                    onClick={handleAddCategoryClick}
                  >
                    <i className="fas fa-plus" />
                    افزودن دسته‌بندی
                  </button>
                ) : (
                  <select
                    id="food-category"
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
                )}
              </div>
              <hr className="form-divider" />
              {/* discount toggle — همیشه دیده می‌شود، چه ساده چه با تنوع */}
              <div className="input-group">
                <label className="discount-toggle">
                  <input
                    type="checkbox"
                    checked={hasDiscount}
                    onChange={(e) => handleToggleDiscount(e.target.checked)}
                  />
                  این غذا تخفیف دارد؟
                </label>
              </div>

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
                    تا زمانی که «تأیید تخفیف» را نزنید، ذخیره انجام نمی‌شود.
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

                  {!hasVariants && basePriceValue > 0 && pctValue > 0 && (
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

            <div className="form-column">
              {/* image preview and input */}
              <div className="input-group">
                <label>پیش‌نمایش تصویر غذا</label>

                <div className="food-modal__image-frame">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="پیش‌نمایش عکس غذا"
                      className="food-modal__image-frame-img"
                    />
                  ) : (
                    <span className="food-modal__image-placeholder">
                      <i className="fas fa-image" />
                      عکسی انتخاب نشده
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="landing-mgmt__hero-image-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setImageFile(file);

                    const reader = new FileReader();
                    reader.onload = (ev) => setImagePreview(ev.target.result);
                    reader.readAsDataURL(file);
                  }}
                />

                <button
                  type="button"
                  className="landing-mgmt__hero-image-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="fas fa-cloud-arrow-up" />
                  <span>
                    {imagePreview ? "تغییر عکس غذا" : "آپلود عکس غذا"}
                  </span>
                </button>

                {imagePreview && (
                  <button
                    type="button"
                    className="landing-mgmt__hero-image-remove"
                    onClick={removeImage}
                  >
                    <i className="fas fa-trash" />
                    <span>حذف عکس</span>
                  </button>
                )}
              </div>
              <hr className="form-divider" />
              {/* Step 1: simple vs variants */}
              <div className="input-group">
                <label>آیا غذا تنوع دارد؟</label>
                <div className="radio-row">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="hasVariants"
                      value="no"
                      checked={!hasVariants}
                      onChange={() => onToggleHasVariants(false)}
                    />{" "}
                    خیر، غذا ساده است
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
              <hr className="form-divider" />
              {/* Base price only when simple */}
              {!hasVariants && (
                <div className="input-group">
                  <label htmlFor="food-price">قیمت پایه (برای غذای ساده)</label>
                  <input
                    type="text"
                    id="food-price"
                    placeholder="مثال: ۱۵۰۰۰۰"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value.replace(/[^\d]/g, ""))
                    }
                  />
                </div>
              )}
            </div>

            {showExtraColumn && (
              <div className="form-column form-column--extra">
                {hasVariants && (
                  <div className="input-group">
                    <label>انواع غذا (دارای تنوع)</label>

                    <div id="food-types-container">
                      {variants.map((v, index) => (
                        <div key={v.clientId} style={{ marginBottom: 10 }}>
                          <div className="food-type-item">
                            <input
                              type="text"
                              placeholder="نام نوع (مثال: ویژه)"
                              value={v.name}
                              onChange={(e) =>
                                updateVariant(v.clientId, {
                                  name: e.target.value,
                                })
                              }
                            />

                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="قیمت نوع"
                              value={v.price}
                              onChange={(e) => {
                                const raw = e.target.value.replace(
                                  /[^\d]/g,
                                  "",
                                );
                                updateVariant(v.clientId, { price: raw });
                              }}
                            />

                            <div className="food-type-item__default-row">
                              <label className="radio-label">
                                <input
                                  type="radio"
                                  name="default_type"
                                  checked={v.isDefault}
                                  onChange={() => makeDefault(v.clientId)}
                                />{" "}
                                پیش‌فرض
                              </label>

                              <button
                                type="button"
                                className="btn btn-icon btn-danger"
                                onClick={() => removeVariant(v.clientId)}
                                title="حذف نوع"
                                disabled={variants.length === 1}
                              >
                                <i className="fas fa-trash" />
                              </button>
                            </div>
                          </div>

                          <div className="addons-block">
                            <label className="addons-title">مخلفات</label>

                            {v.addons.length === 0 && (
                              <div className="addons-empty">
                                هیچ مخلفی اضافه نشده است
                              </div>
                            )}

                            {v.addons.map((a) => (
                              <div key={a.clientId} className="addon-item">
                                <input
                                  type="text"
                                  placeholder="نام مخلفات"
                                  value={a.name}
                                  onChange={(e) =>
                                    updateAddon(v.clientId, a.clientId, {
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
                                      "",
                                    );
                                    updateAddon(v.clientId, a.clientId, {
                                      price: raw,
                                    });
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-icon btn-danger"
                                  onClick={() =>
                                    removeAddon(v.clientId, a.clientId)
                                  }
                                  title="حذف مخلف"
                                >
                                  <i className="fas fa-trash" />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => addAddon(v.clientId)}
                            >
                              افزودن مخلفات
                            </button>
                          </div>
                          {index < variants.length - 1 && (
                            <hr className="form-divider" />
                          )}
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
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
        <div className="modal-footer">
          <button type="submit" form="food-form" className="btn btn-primary">
            ذخیره غذا
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
