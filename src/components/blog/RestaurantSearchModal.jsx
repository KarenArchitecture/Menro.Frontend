import { useEffect, useRef, useState } from "react";
import { searchBlogRestaurants } from "../../api/adminBlogs";
import "../../assets/css/admin/blogPostEditor_restaurantSearchModal.css";

function apiErrorMessage(err, fallback = "خطایی رخ داد. دوباره تلاش کنید.") {
  return err?.response?.data?.message || err?.response?.data?.title || fallback;
}

const SEARCH_DEBOUNCE_MS = 350;

export default function RestaurantSearchModal({ onSelect, onClose }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brokenThumbs, setBrokenThumbs] = useState(() => new Set());
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await searchBlogRestaurants(term.trim() || undefined);
        setResults(data);
      } catch (err) {
        setError(apiErrorMessage(err, "جست‌وجوی رستوران با خطا مواجه شد."));
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [term]);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal bpe__restaurant-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal__header">
          <h3>
            <i className="fas fa-utensils" /> افزودن رستوران
          </h3>
          <button className="btn-icon" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="admin-modal__body">
          <input
            type="text"
            className="bpe__input"
            placeholder="جست‌وجوی نام رستوران..."
            value={term}
            autoFocus
            onChange={(e) => setTerm(e.target.value)}
          />

          <div className="bpe__restaurant-results">
            {loading && <div className="empty-hint">در حال جست‌وجو...</div>}
            {!loading && error && <div className="bpe__error">{error}</div>}
            {!loading && !error && results.length === 0 && (
              <div className="empty-hint">رستورانی پیدا نشد.</div>
            )}
            {!loading &&
              !error &&
              results.map((r) => {
                const showImage = r.logoImageUrl && !brokenThumbs.has(r.id);
                return (
                  <button
                    type="button"
                    key={r.id}
                    className="bpe__restaurant-result"
                    onClick={() => onSelect(r)}
                  >
                    <span className="bpe__restaurant-result-thumb">
                      {showImage ? (
                        <img
                          src={r.logoImageUrl}
                          alt={r.name}
                          onError={() =>
                            setBrokenThumbs((prev) => new Set(prev).add(r.id))
                          }
                        />
                      ) : (
                        <i className="fas fa-utensils" />
                      )}
                    </span>
                    <span className="bpe__restaurant-result-info">
                      <span className="bpe__restaurant-result-name">
                        {r.name}
                      </span>
                      <span className="bpe__restaurant-result-meta">
                        <span className="bpe__restaurant-result-category">
                          {r.categoryName}
                        </span>
                        {r.votersCount > 0 && (
                          <span className="bpe__restaurant-result-rating">
                            <i className="fas fa-star" /> {r.averageRating}{" "}
                            <span className="bpe__restaurant-result-voters">
                              ({r.votersCount})
                            </span>
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
