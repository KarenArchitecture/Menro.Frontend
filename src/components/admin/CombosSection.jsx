// src/components/admin/CombosSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import adminFoodAxios from "../../api/adminFoodAxios";
import { getCombosForFood, setCombosForFood } from "../../api/adminCombos";
import ComboPickerModal from "./ComboPickerModal";
import resolveFileUrl from "../../utils/resolveFileUrl";
import { toPersianDigits } from "../../utils/persianFormat";
import { useGlobalUI } from "../common/GlobalUI";

export default function CombosSection() {
  const { notify, confirmModal } = useGlobalUI();
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);

  const [query, setQuery] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState(null);

  const [comboIds, setComboIds] = useState([]); // ids currently linked to selectedFoodId
  const [loadingCombos, setLoadingCombos] = useState(false);
  const [savingCombos, setSavingCombos] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);

  const fetchFoods = async () => {
    setLoadingFoods(true);
    try {
      const { data } = await adminFoodAxios.get("/read-all");
      setFoods(data || []);
    } catch (err) {
      notify({ type: "error", message: "خطا در دریافت لیست غذاها" });
    } finally {
      setLoadingFoods(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((f) => f.name?.toLowerCase().includes(q));
  }, [foods, query]);

  const selectedFood = foods.find((f) => f.id === selectedFoodId) || null;

  const loadCombos = async (foodId) => {
    setLoadingCombos(true);
    try {
      const ids = await getCombosForFood(foodId);
      setComboIds(Array.isArray(ids) ? ids : []);
    } catch (err) {
      console.error("خطا در دریافت ترکیب‌های این غذا:", err);
      notify({ type: "error", message: "خطا در دریافت ترکیب‌های این غذا" });
      setComboIds([]);
    } finally {
      setLoadingCombos(false);
    }
  };

  const handleSelectFood = (foodId) => {
    setSelectedFoodId(foodId);
    loadCombos(foodId);
  };

  const comboFoods = useMemo(
    () => foods.filter((f) => comboIds.includes(f.id)),
    [foods, comboIds],
  );

  const candidateFoods = useMemo(
    () =>
      foods.filter((f) => f.id !== selectedFoodId && !comboIds.includes(f.id)),
    [foods, selectedFoodId, comboIds],
  );

  const persistCombos = async (nextIds) => {
    if (!selectedFoodId) return;
    setSavingCombos(true);
    const prevIds = comboIds;
    setComboIds(nextIds); // optimistic update
    try {
      await setCombosForFood(selectedFoodId, nextIds);
      notify({ type: "success", message: "ترکیب‌ها با موفقیت ذخیره شد" });
    } catch (err) {
      console.error("خطا در ذخیره ترکیب‌ها:", err);
      setComboIds(prevIds);
      notify({
        type: "error",
        message: "ذخیره ترکیب‌ها ناموفق بود. دوباره تلاش کنید.",
      });
    } finally {
      setSavingCombos(false);
    }
  };

  const handleAddCombos = (newIds) => {
    const merged = Array.from(new Set([...comboIds, ...newIds]));
    setPickerOpen(false);
    persistCombos(merged);
  };

  const handleRemoveCombo = (foodId) => {
    const next = comboIds.filter((id) => id !== foodId);
    persistCombos(next);
  };

  const fmt = (n) => (Number(n) || 0).toLocaleString("fa-IR");

  if (loadingFoods) return <p>در حال بارگذاری...</p>;

  return (
    <>
      <div className="view-header">
        <h2 className="content-title">ترکیب‌های پیشنهادی</h2>
      </div>

      <div className="panel combos-mgmt__panel">
        <p className="panel-subtitle" style={{ textAlign: "right" }}>
          یک غذا را از لیست زیر انتخاب کنید تا غذاهای دیگری را به‌عنوان «ترکیب
          پیشنهادی» به آن اضافه کنید. این ترکیب‌ها در دکمه «ترکیب‌ها»ی همان غذا
          برای مشتری نمایش داده می‌شوند.
        </p>

        <div className="combos-mgmt__body">
          {/* LEFT: food list / picker */}
          <div className="combos-mgmt__rail">
            <div className="blog-mgmt__search-box" style={{ marginBottom: 12 }}>
              <input
                type="text"
                className="mh-input"
                placeholder="جستجوی غذا..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="combos-mgmt__rail-list">
              {filteredFoods.length === 0 && (
                <div className="empty-hint">غذایی یافت نشد.</div>
              )}

              {filteredFoods.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`combos-mgmt__rail-item ${
                    selectedFoodId === f.id ? "is-active" : ""
                  }`}
                  onClick={() => handleSelectFood(f.id)}
                >
                  <div className="combos-mgmt__rail-thumb-wrap">
                    {f.imageUrl ? (
                      <img
                        src={resolveFileUrl(f.imageUrl)}
                        alt={f.name}
                        className="combos-mgmt__rail-thumb"
                      />
                    ) : (
                      <i className="fas fa-utensils" />
                    )}
                  </div>
                  <span className="combos-mgmt__rail-name">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: combo editor for selected food */}
          <div className="combos-mgmt__editor">
            {!selectedFood ? (
              <div className="combos-mgmt__editor-empty">
                <i className="fas fa-layer-group" />
                <p>یک غذا را از لیست سمت راست انتخاب کنید.</p>
              </div>
            ) : (
              <>
                <div className="combos-mgmt__editor-header">
                  <div className="combos-mgmt__editor-thumb-wrap">
                    {selectedFood.imageUrl ? (
                      <img
                        src={resolveFileUrl(selectedFood.imageUrl)}
                        alt={selectedFood.name}
                        className="combos-mgmt__editor-thumb"
                      />
                    ) : (
                      <i className="fas fa-utensils" />
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{selectedFood.name}</h3>
                    <span className="pill-count">
                      {toPersianDigits(comboFoods.length)} ترکیب فعال
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ marginRight: "auto" }}
                    onClick={() => setPickerOpen(true)}
                    disabled={loadingCombos || savingCombos}
                  >
                    <i className="fas fa-plus" /> افزودن ترکیب
                  </button>
                </div>

                {loadingCombos ? (
                  <p>در حال بارگذاری ترکیب‌ها...</p>
                ) : comboFoods.length === 0 ? (
                  <div className="empty-hint">
                    هنوز ترکیبی برای این غذا اضافه نشده است. روی «افزودن ترکیب»
                    بزنید تا شروع کنید.
                  </div>
                ) : (
                  <div className="combos-mgmt__combo-grid">
                    {comboFoods.map((cf) => (
                      <div key={cf.id} className="combos-mgmt__combo-card">
                        <button
                          type="button"
                          className="combos-mgmt__combo-remove"
                          onClick={() => handleRemoveCombo(cf.id)}
                          disabled={savingCombos}
                          title="حذف از ترکیب‌ها"
                        >
                          <i className="fas fa-times" />
                        </button>
                        <div className="combos-mgmt__combo-thumb-wrap">
                          {cf.imageUrl ? (
                            <img
                              src={resolveFileUrl(cf.imageUrl)}
                              alt={cf.name}
                              className="combos-mgmt__combo-thumb"
                            />
                          ) : (
                            <i className="fas fa-utensils" />
                          )}
                        </div>
                        <div className="combos-mgmt__combo-info">
                          <span className="combos-mgmt__combo-name">
                            {cf.name}
                          </span>
                          <span className="combos-mgmt__combo-price">
                            {fmt(cf.price)} تومان
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ComboPickerModal
        open={pickerOpen}
        candidateFoods={candidateFoods}
        onClose={() => setPickerOpen(false)}
        onConfirm={handleAddCombos}
      />
    </>
  );
}
