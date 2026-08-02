// src/components/admin/RestaurantsOverviewPane.jsx
import { useEffect, useState } from "react";
import {
  getRestaurantsOverview,
  apiErrorMessage,
} from "../../api/adminRestaurants";
import adminRestaurantCategoryAxios from "../../api/adminRestaurantCategoryAxios";
import RestaurantDetailsModal from "./RestaurantDetailsModal";

const PAGE_SIZE = 20;

function toPersianDigits(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

export default function RestaurantsOverviewPane() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedId, setSelectedId] = useState(null);

  // گرفتن لیست دسته‌بندی‌های رستوران برای پر کردن dropdown فیلتر
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminRestaurantCategoryAxios.get("/read-all");
        const list = Array.isArray(res.data) ? res.data : res.data.items || [];
        if (!cancelled) setCategories(list);
      } catch (err) {
        // خطای گرفتن دسته‌بندی‌ها رو silent می‌گیریم تا کل صفحه خراب نشه
        console.error("خطا در بارگذاری دسته‌بندی‌های رستوران:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setApiError("");
        const data = await getRestaurantsOverview({
          search: searchTerm.trim() || undefined,
          categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
          page,
          pageSize: PAGE_SIZE,
        });
        if (!cancelled) {
          setRestaurants(data.items);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        if (!cancelled)
          setApiError(
            apiErrorMessage(err, "بارگذاری رستوران‌ها با خطا مواجه شد."),
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchTerm, page, categoryFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchDraft);
  };

  return (
    <div className="restaurant-mgmt">
      <div className="panel">
        {apiError && <span className="form-error">{apiError}</span>}

        <div className="admin-toolbar">
          <div className="admin-toolbar-group">
            {!loading && totalPages > 1 && (
              <div className="admin-pagination">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  قبلی
                </button>
                <span className="admin-pagination-label">
                  صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}{" "}
                  ({toPersianDigits(totalCount)} رستوران)
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  بعدی
                </button>
              </div>
            )}

            <form className="admin-search-box" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="mh-input"
                placeholder="جستجو در نام یا شماره تماس رستوران..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              <button
                type="submit"
                className="admin-search-submit"
                title="جستجو"
                aria-label="جستجو"
              >
                <i className="fas fa-search" />
              </button>
            </form>
          </div>
          <div className="admin-toolbar-group">
            <select
              className="admin-toolbar-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">همه دسته‌ها</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container restaurant-mgmt__table-scroll">
          <table>
            <thead>
              <tr>
                <th>عکس</th>
                <th>نام رستوران</th>
                <th>شماره تماس</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-hint">در حال بارگذاری...</div>
                  </td>
                </tr>
              )}
              {!loading && restaurants.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-hint">
                      هیچ رستورانی با این فیلتر پیدا نشد.
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                restaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td>
                      <div className="restaurant-mgmt__avatar restaurant-mgmt__avatar--sm">
                        {restaurant.imageUrl ? (
                          <img
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                          />
                        ) : (
                          <i className="fas fa-utensils restaurant-mgmt__avatar-icon" />
                        )}
                      </div>
                    </td>
                    <td>{restaurant.name}</td>
                    <td className="restaurant-mgmt__phone">
                      {restaurant.phoneNumber || "—"}
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        title="مشاهده اطلاعات رستوران"
                        onClick={() => setSelectedId(restaurant.id)}
                      >
                        <i className="fas fa-eye" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <RestaurantDetailsModal
        restaurantId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
