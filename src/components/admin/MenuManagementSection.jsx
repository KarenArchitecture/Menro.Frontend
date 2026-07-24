// src/components/admin/FoodsSection.jsx
import React, { useMemo, useState, useEffect } from "react";
import FoodModal from "./FoodModal";
import adminFoodAxios from "../../api/adminFoodAxios";

function toIntDigits(v) {
  return Number(String(v || "0").replace(/[^\d]/g, ""));
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// NOTE: adjust this if the API returns the image under a different field
// name (e.g. `image`, `photoUrl`, `pictureUrl`, ...). It mirrors the same
// fallback pattern used elsewhere in this file for price/discount fields.
function getImageSrc(row) {
  return row.imageUrl || row.image || row.photoUrl || row.pictureUrl || "";
}

function SortIcon({ active, dir }) {
  if (!active) return <i className="fas fa-sort food-mgmt__sort-icon" />;
  return (
    <i
      className={`fas fa-sort-${dir === "asc" ? "up" : "down"} food-mgmt__sort-icon food-mgmt__sort-icon--active`}
    />
  );
}

export default function FoodsSection() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [selectedFoodId, setSelectedFoodId] = useState(null);

  // --- toolbar / local filtering & sorting state -----------------------
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [onlyActive, setOnlyActive] = useState(false);
  const [sortKey, setSortKey] = useState(null); // 'name' | 'price' | 'category'
  const [sortDir, setSortDir] = useState("asc");

  const fetchFoods = async () => {
    try {
      const { data } = await adminFoodAxios.get("/read-all");
      setFoods(data);
    } catch (err) {
      console.error("خطا در گرفتن لیست غذاها:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const openCreate = () => {
    setMode("create");
    setIsModalOpen(true);
  };

  const openEdit = (food) => {
    setMode("edit");
    setSelectedFoodId(food.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این غذا را حذف کنید؟"))
      return;

    try {
      await adminFoodAxios.delete(`/${foodId}`);
      alert("غذا با موفقیت حذف شد");
      fetchFoods();
    } catch (err) {
      console.error("خطا در حذف غذا:", err);
    }
  };

  // NOTE: endpoint name is a placeholder - point it at whatever route your
  // API exposes for flipping isAvailable (adjust the path if different).
  const handleToggleAvailability = async (food) => {
    // optimistic local update so the UI feels instant
    setFoods((prev) =>
      prev.map((p) =>
        p.id === food.id ? { ...p, isAvailable: !p.isAvailable } : p,
      ),
    );
    try {
      await adminFoodAxios.patch(`/toggle-status/${food.id}`);
    } catch (err) {
      console.error("خطا در تغییر وضعیت غذا:", err);
      // revert on failure
      setFoods((prev) =>
        prev.map((p) =>
          p.id === food.id ? { ...p, isAvailable: food.isAvailable } : p,
        ),
      );
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchDraft);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Pre-compute discount/final price once per food so the table,
  // the card list, filtering and sorting all read from the same numbers.
  const enrichedFoods = useMemo(() => {
    return foods.map((row) => {
      const basePrice = toIntDigits(row.price);
      const pctRaw =
        row.discountPercent ?? row.discountPercentage ?? row.discountPct ?? 0;
      const pct = clamp(toIntDigits(pctRaw), 0, 99);
      const hasDiscount = pct > 0;
      const finalPrice =
        basePrice > 0 && hasDiscount
          ? Math.max(0, Math.round(basePrice * (1 - pct / 100)))
          : basePrice;

      return {
        ...row,
        basePrice,
        pct,
        hasDiscount,
        finalPrice,
        imageSrc: getImageSrc(row),
      };
    });
  }, [foods]);

  // Category list for the filter dropdown, derived locally from the
  // already-loaded foods - no extra API call.
  const categoryOptions = useMemo(() => {
    const names = new Set(
      enrichedFoods.map((p) => p.foodCategoryName).filter(Boolean),
    );
    return Array.from(names).sort((a, b) => a.localeCompare(b, "fa"));
  }, [enrichedFoods]);

  const visibleFoods = useMemo(() => {
    const term = searchTerm.trim();

    let list = enrichedFoods.filter((row) => {
      if (onlyActive && !row.isAvailable) return false;
      if (categoryFilter !== "all" && row.foodCategoryName !== categoryFilter)
        return false;
      if (term && !String(row.name || "").includes(term)) return false;
      return true;
    });

    if (sortKey) {
      list = [...list].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "name") {
          cmp = String(a.name || "").localeCompare(String(b.name || ""), "fa");
        } else if (sortKey === "price") {
          cmp = a.finalPrice - b.finalPrice;
        } else if (sortKey === "category") {
          cmp = String(a.foodCategoryName || "").localeCompare(
            String(b.foodCategoryName || ""),
            "fa",
          );
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [enrichedFoods, searchTerm, categoryFilter, onlyActive, sortKey, sortDir]);

  if (loading) return <p>در حال بارگذاری...</p>;

  return (
    <>
      <div className="view-header">
        <h2 className="content-title">مدیریت غذاها</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="fas fa-plus" /> افزودن غذای جدید
        </button>
      </div>

      <div className="panel">
        <div className="food-mgmt__toolbar">
          <div className="food-mgmt__toolbar-group">
            <form
              className="food-mgmt__search-box"
              onSubmit={handleSearchSubmit}
            >
              <input
                type="text"
                className="mh-input"
                placeholder="جستجو در نام غذاها..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              <button
                type="submit"
                className="food-mgmt__search-submit"
                title="جستجو"
                aria-label="جستجو"
              >
                <i className="fas fa-search" />
              </button>
            </form>

            <label className="food-mgmt__active-toggle">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              />
              فقط غذاهای فعال
            </label>
          </div>

          <div className="blog-mgmt__posts-toolbar-group">
            <select
              className="food-mgmt__category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">همه دسته‌ها</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="foods-table">
            <thead>
              <tr>
                <th>تصویر</th>
                <th
                  className="food-mgmt__th-sortable"
                  onClick={() => handleSort("name")}
                >
                  نام غذا
                  <SortIcon active={sortKey === "name"} dir={sortDir} />
                </th>
                <th
                  className="food-mgmt__th-sortable"
                  onClick={() => handleSort("category")}
                >
                  دسته‌بندی
                  <SortIcon active={sortKey === "category"} dir={sortDir} />
                </th>
                <th
                  className="food-mgmt__th-sortable"
                  onClick={() => handleSort("price")}
                >
                  قیمت (نهایی)
                  <SortIcon active={sortKey === "price"} dir={sortDir} />
                </th>
                <th>تخفیف</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>

            <tbody>
              {visibleFoods.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-hint">
                      هیچ غذایی با این فیلتر پیدا نشد.
                    </div>
                  </td>
                </tr>
              )}

              {visibleFoods.map((row, i) => (
                <tr key={row.id || i}>
                  <td>
                    <div className="food-mgmt__thumb">
                      {row.imageSrc ? (
                        <img src={row.imageSrc} alt={row.name} />
                      ) : (
                        <i className="fas fa-image" />
                      )}
                    </div>
                  </td>

                  <td>
                    {row.name}
                    {row.hasDiscount && (
                      <span className="discount-chip">
                        {row.pct.toLocaleString("fa-IR")}٪ تخفیف
                      </span>
                    )}
                  </td>

                  <td>{row.foodCategoryName}</td>

                  <td>
                    {row.basePrice > 0 ? (
                      row.hasDiscount ? (
                        <div className="price-with-discount">
                          <div className="price-final">
                            {row.finalPrice.toLocaleString()} تومان
                          </div>
                          <div className="price-original">
                            {row.basePrice.toLocaleString()} تومان
                          </div>
                        </div>
                      ) : (
                        `${row.basePrice.toLocaleString()} تومان`
                      )
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    {row.hasDiscount
                      ? `${row.pct.toLocaleString("fa-IR")}٪`
                      : "-"}
                  </td>

                  <td>
                    <span
                      className={`status-chip ${
                        row.isAvailable ? "active" : "danger"
                      }`}
                      style={{ cursor: "pointer" }}
                      title="برای تغییر وضعیت کلیک کنید"
                      onClick={() => handleToggleAvailability(row)}
                    >
                      {row.isAvailable ? "فعال" : "غیرفعال"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn btn-icon"
                      title="ویرایش"
                      onClick={() => openEdit(row)}
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      className="btn btn-icon btn-danger"
                      title="حذف"
                      onClick={() => handleDelete(row.id)}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cards-list food-cards">
          {visibleFoods.length === 0 && (
            <div className="empty-hint">هیچ غذایی با این فیلتر پیدا نشد.</div>
          )}

          {visibleFoods.map((row, i) => (
            <article className="data-card" key={`card-${row.id || i}`}>
              <div className="row">
                <span className="label">تصویر</span>
                <span className="value">
                  <div className="food-mgmt__thumb food-mgmt__thumb--card">
                    {row.imageSrc ? (
                      <img src={row.imageSrc} alt={row.name} />
                    ) : (
                      <i className="fas fa-image" />
                    )}
                  </div>
                </span>
              </div>

              <div className="row">
                <span className="label">نام غذا</span>
                <span className="value">
                  {row.name}
                  {row.hasDiscount && (
                    <span className="discount-chip">
                      {row.pct.toLocaleString("fa-IR")}٪ تخفیف
                    </span>
                  )}
                </span>
              </div>

              <div className="row">
                <span className="label">دسته‌بندی</span>
                <span className="value">{row.foodCategoryName}</span>
              </div>

              <div className="row">
                <span className="label">قیمت (نهایی)</span>
                <span className="value">
                  {row.basePrice > 0 ? (
                    row.hasDiscount ? (
                      <span className="price-with-discount">
                        <span className="price-final">
                          {row.finalPrice.toLocaleString()} تومان
                        </span>
                        <span className="price-original">
                          {row.basePrice.toLocaleString()} تومان
                        </span>
                      </span>
                    ) : (
                      `${row.basePrice.toLocaleString()} تومان`
                    )
                  ) : (
                    "-"
                  )}
                </span>
              </div>

              <div className="row">
                <span className="label">تخفیف</span>
                <span className="value">
                  {row.hasDiscount ? `${row.pct}٪` : "-"}
                </span>
              </div>

              <div className="row" style={{ alignItems: "center" }}>
                <span className="label">وضعیت</span>
                <span
                  className={`status-chip ${
                    row.isAvailable ? "active" : "danger"
                  }`}
                  style={{ cursor: "pointer" }}
                  title="برای تغییر وضعیت کلیک کنید"
                  onClick={() => handleToggleAvailability(row)}
                >
                  {row.isAvailable ? "فعال" : "غیرفعال"}
                </span>
              </div>

              <div
                className="row"
                style={{ justifyContent: "flex-start", gap: 8 }}
              >
                <div className="label">عملیات</div>
                <div className="card-actions">
                  <button
                    className="btn btn-icon"
                    title="ویرایش"
                    onClick={() => openEdit(row)}
                  >
                    <i className="fas fa-edit" />
                  </button>
                  <button
                    className="btn btn-icon btn-danger"
                    title="حذف"
                    onClick={() => handleDelete(row.id)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <FoodModal
        isOpen={isModalOpen}
        mode={mode}
        foodId={selectedFoodId}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchFoods}
      />
    </>
  );
}
