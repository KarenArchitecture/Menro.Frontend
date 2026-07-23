// src/components/admin/CombosSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import adminFoodAxios from "../../api/adminFoodAxios";
import { getCombosForFood, setCombosForFood, getComboCounts } from "../../api/adminCombos";
import ComboPickerModal from "./ComboPickerModal";
import resolveFileUrl from "../../utils/resolveFileUrl";
import { toPersianDigits } from "../../utils/persianFormat";
import { groupFoodsByCategory } from "../../utils/groupFoodsByCategory";

export default function CombosSection() {
    const [foods, setFoods] = useState([]);
    const [loadingFoods, setLoadingFoods] = useState(true);
    const [comboCounts, setComboCounts] = useState({}); // { foodId: count }

    const [query, setQuery] = useState("");
    const [selectedFoodId, setSelectedFoodId] = useState(null);
    const [openCats, setOpenCats] = useState(new Set()); // empty = everything closed by default

    const [comboIds, setComboIds] = useState([]);
    const [loadingCombos, setLoadingCombos] = useState(false);
    const [savingCombos, setSavingCombos] = useState(false);

    const [pickerOpen, setPickerOpen] = useState(false);

    const fetchFoods = async () => {
        setLoadingFoods(true);
        try {
        const { data } = await adminFoodAxios.get("/read-all");
        setFoods(data || []);
        } catch (err) {
        console.error("خطا در دریافت لیست غذاها:", err);
        } finally {
        setLoadingFoods(false);
        }
    };

    const fetchComboCounts = async () => {
        try {
        const counts = await getComboCounts();
        setComboCounts(counts || {});
        } catch (err) {
        console.error("خطا در دریافت تعداد ترکیب‌ها:", err);
        }
    };

    useEffect(() => {
        fetchFoods();
        fetchComboCounts();
    }, []);

    const groupedRail = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = q ? foods.filter((f) => f.name?.toLowerCase().includes(q)) : foods;
        return groupFoodsByCategory(filtered);
    }, [foods, query]);

    const isOpen = (cat) => openCats.has(cat);
    const toggleGroup = (cat) => {
        setOpenCats((prev) => {
        const next = new Set(prev);
        if (next.has(cat)) next.delete(cat);
        else next.add(cat);
        return next;
        });
    };

    const selectedFood = foods.find((f) => f.id === selectedFoodId) || null;

    const loadCombos = async (foodId) => {
        setLoadingCombos(true);
        try {
        const ids = await getCombosForFood(foodId);
        setComboIds(Array.isArray(ids) ? ids : []);
        } catch (err) {
        console.error("خطا در دریافت ترکیب‌های این غذا:", err);
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

    const groupedCombos = useMemo(() => groupFoodsByCategory(comboFoods), [comboFoods]);

    const candidateFoods = useMemo(
        () => foods.filter((f) => f.id !== selectedFoodId && !comboIds.includes(f.id)),
        [foods, selectedFoodId, comboIds],
    );

    const persistCombos = async (nextIds) => {
        if (!selectedFoodId) return;
        setSavingCombos(true);
        const prevIds = comboIds;
        setComboIds(nextIds);
        try {
        await setCombosForFood(selectedFoodId, nextIds);
        // keep the rail badge for THIS food in sync immediately, no full refetch needed
        setComboCounts((prev) => ({ ...prev, [selectedFoodId]: nextIds.length }));
        } catch (err) {
        console.error("خطا در ذخیره ترکیب‌ها:", err);
        setComboIds(prevIds);
        alert("ذخیره ترکیب‌ها ناموفق بود. دوباره تلاش کنید.");
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
        persistCombos(comboIds.filter((id) => id !== foodId));
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
            یک غذا را از لیست زیر انتخاب کنید تا غذاهای دیگری را به‌عنوان
            «ترکیب پیشنهادی» به آن اضافه کنید. این ترکیب‌ها در دکمه «ترکیب‌ها»ی
            همان غذا برای مشتری نمایش داده می‌شوند.
            </p>

            <div className="combos-mgmt__body">
            {/* LEFT: grouped food rail */}
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

                <div className="combos-mgmt__rail-scroll">
                {groupedRail.length === 0 && <div className="empty-hint">غذایی یافت نشد.</div>}

                {groupedRail.map((group) => (
                    <div key={group.categoryName} className="combos-mgmt__cat-group">
                    <button
                        type="button"
                        className={`combos-mgmt__cat-toggle ${isOpen(group.categoryName) ? "open" : ""}`}
                        onClick={() => toggleGroup(group.categoryName)}
                    >
                        <span>{group.categoryName}</span>
                        <span className="pill-count">{toPersianDigits(group.foods.length)}</span>
                        <i className="fas fa-chevron-down" />
                    </button>

                    {isOpen(group.categoryName) && (
                        <div className="combos-mgmt__rail-list">
                        {group.foods.map((f) => {
                            const count = comboCounts[f.id] || 0;
                            return (
                            <button
                                key={f.id}
                                type="button"
                                className={`combos-mgmt__rail-item ${selectedFoodId === f.id ? "is-active" : ""}`}
                                onClick={() => handleSelectFood(f.id)}
                            >
                                <img
                                src={resolveFileUrl(f.imageUrl, "/images/food/food-placeholder.png")}
                                alt={f.name}
                                className="combos-mgmt__rail-thumb"
                                />
                                <span className="combos-mgmt__rail-name">{f.name}</span>
                                {count > 0 && (
                                <span className="combos-mgmt__rail-badge" title={`${count} ترکیب`}>
                                    {toPersianDigits(count)}
                                </span>
                                )}
                            </button>
                            );
                        })}
                        </div>
                    )}
                    </div>
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
                    <img
                        src={resolveFileUrl(selectedFood.imageUrl, "/images/food/food-placeholder.png")}
                        alt={selectedFood.name}
                        className="combos-mgmt__editor-thumb"
                    />
                    <div>
                        <h3 style={{ margin: 0 }}>{selectedFood.name}</h3>
                        <span className="pill-count">{toPersianDigits(comboFoods.length)} ترکیب فعال</span>
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
                        هنوز ترکیبی برای این غذا اضافه نشده است. روی «افزودن ترکیب» بزنید تا شروع کنید.
                    </div>
                    ) : (
                    <div className="combos-mgmt__combo-scroll">
                        {groupedCombos.map((group) => (
                        <div key={group.categoryName} className="combos-mgmt__cat-group">
                            <div className="combos-mgmt__combo-cat-label">
                            {group.categoryName}
                            <span className="pill-count">{toPersianDigits(group.foods.length)}</span>
                            </div>

                            <div className="combos-mgmt__combo-grid">
                            {group.foods.map((cf) => (
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
                                <img
                                    src={resolveFileUrl(cf.imageUrl, "/images/food/food-placeholder.png")}
                                    alt={cf.name}
                                    className="combos-mgmt__combo-thumb"
                                />
                                <div className="combos-mgmt__combo-info">
                                    <span className="combos-mgmt__combo-name">{cf.name}</span>
                                    <span className="combos-mgmt__combo-price">{fmt(cf.price)} تومان</span>
                                </div>
                                </div>
                            ))}
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