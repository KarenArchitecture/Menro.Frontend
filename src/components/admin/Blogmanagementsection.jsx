import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getBlogPosts,
  uploadBlogPostCoverImage,
  createBlogPost,
  updateBlogPost,
  toggleBlogPostPublish,
  deleteBlogPost,
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  moveBlogCategory,
  deleteBlogCategory,
  getBlogTags,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
  getBlogHero,
  updateBlogHero,
} from "../../api/adminBlogs";

// Kept as-is for now - "چیدمان موبایل" tab is not wired to the backend yet.
const PAIR_TYPE_LABELS = {
  blogTags: "دو کارت وبلاگ + برچسب‌ها",
  blogBanner: "دو کارت وبلاگ + بنر تبلیغاتی",
  blogTagsBanner: "دو کارت وبلاگ + بنر (نسخه‌ی برچسب)",
  bannerTags: "بنر تبلیغاتی + برچسب‌ها",
};

const initialMobileSettings = {
  randomBlockRounds: 3,
  enabledPairTypes: {
    blogTags: true,
    blogBanner: true,
    blogTagsBanner: true,
    bannerTags: true,
  },
  feedRows: 3,
  feedPerRow: 2,
  finalBlock: {
    forcedPairType: "bannerTags",
    showButton: true,
    buttonLabel: "نمایش بیشتر...",
  },
};

// "فیلترهای فید" tab intentionally removed - feed categories are now a fixed,
// non-editable list (see FEED_CATEGORIES in adminBlogs.js).
const SUB_TABS = [
  { key: "posts", label: "پست‌های وبلاگ", icon: "fas fa-newspaper" },
  {
    key: "display-categories",
    label: "دسته‌بندی‌های نمایشی",
    icon: "fas fa-th-large",
  },
  { key: "sidebar-tags", label: "برچسب‌های پیشنهادی", icon: "fas fa-hashtag" },
  { key: "hero", label: "هیرو و جستجو", icon: "fas fa-image" },
  { key: "mobile", label: "چیدمان موبایل", icon: "fas fa-mobile-alt" },
];

function toPersianDigits(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

function apiErrorMessage(err, fallback = "خطایی رخ داد. دوباره تلاش کنید.") {
  return err?.response?.data?.message || err?.response?.data?.title || fallback;
}

export default function BlogManagementSection() {
  const [activeSubTab, setActiveSubTab] = useState("posts");
  const [mobileSettings, setMobileSettings] = useState(initialMobileSettings);
  const [savedFlash, setSavedFlash] = useState("");

  const flashSaved = (label = "تغییرات ذخیره شد") => {
    setSavedFlash(label);
    window.clearTimeout(flashSaved._t);
    flashSaved._t = window.setTimeout(() => setSavedFlash(""), 2200);
  };

  return (
    <div id="blog-management-view" className="blog-mgmt">
      <div className="view-header">
        <h2 className="content-title">مدیریت وبلاگ</h2>
        {savedFlash && <span className="blog-mgmt__flash">{savedFlash}</span>}
      </div>

      <nav className="content-tab-nav">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`content-tab-link ${activeSubTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveSubTab(tab.key)}
          >
            <i className={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {activeSubTab === "posts" && (
        <div className="content-tab-pane active">
          <PostsPane onSaved={flashSaved} />
        </div>
      )}

      {activeSubTab === "display-categories" && (
        <div className="content-tab-pane active">
          <DisplayCategoriesPane onSaved={flashSaved} />
        </div>
      )}

      {activeSubTab === "sidebar-tags" && (
        <div className="content-tab-pane active">
          <SidebarTagsPane onSaved={flashSaved} />
        </div>
      )}

      {activeSubTab === "hero" && (
        <div className="content-tab-pane active">
          <HeroPane onSaved={flashSaved} />
        </div>
      )}

      {activeSubTab === "mobile" && (
        <div className="content-tab-pane active">
          <MobileLayoutPane
            settings={mobileSettings}
            setSettings={setMobileSettings}
            onSaved={flashSaved}
          />
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 1) POSTS (paginated)                                                */
/* ================================================================== */

function mapPostFromApi(p, categories = []) {
  return {
    id: p.id,
    title: p.title,
    // GET responses return a ready-to-use URL built server-side via
    // FileUrlService - use it for both preview and to derive the file name.
    coverSrc: p.coverImageUrl || "",
    coverFileName: p.coverImageUrl ? p.coverImageUrl.split("/").pop() : "",
    readingMins: p.readingMinutes,
    categoryId: p.categoryId,
    categoryTitle:
      p.categoryTitle ||
      categories.find((c) => c.id === p.categoryId)?.title ||
      "",
    published: p.isPublished,
  };
}

function mapPostToApi(draft) {
  return {
    title: draft.title,
    // Only ever send the bare file name - never the full URL.
    coverImageUrl: draft.coverFileName || null,
    readingMinutes: Number(draft.readingMins),
    categoryId: draft.categoryId,
    isPublished: !!draft.published,
  };
}

function emptyPost(defaultCategoryId = "") {
  return {
    id: null,
    title: "",
    coverFileName: "",
    coverSrc: "",
    readingMins: 5,
    categoryId: defaultCategoryId,
    published: true,
  };
}

const PAGE_SIZE = 20;

function PostsPane({ onSaved }) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  // searchDraft is bound to the input as the user types; searchTerm is only
  // updated when the search button (or Enter) is pressed, and it's the one
  // used to trigger the API call - this avoids firing a request per keystroke.
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [modalPost, setModalPost] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const reloadPosts = useCallback(
    async (categoriesForMapping = categories) => {
      const data = await getBlogPosts({
        search: searchTerm.trim() || undefined,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        page,
        pageSize: PAGE_SIZE,
      });
      setPosts(data.items.map((p) => mapPostFromApi(p, categoriesForMapping)));
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      return data;
    },
    [categories, searchTerm, categoryFilter, page],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [postsData, categoriesData] = await Promise.all([
          getBlogPosts({
            search: searchTerm.trim() || undefined,
            categoryId: categoryFilter === "all" ? undefined : categoryFilter,
            page,
            pageSize: PAGE_SIZE,
          }),
          getBlogCategories(),
        ]);
        if (!cancelled) {
          setCategories(categoriesData);
          setPosts(
            postsData.items.map((p) => mapPostFromApi(p, categoriesData)),
          );
          setTotalPages(postsData.totalPages);
          setTotalCount(postsData.totalCount);
        }
      } catch (err) {
        if (!cancelled)
          setApiError(apiErrorMessage(err, "بارگذاری پست‌ها با خطا مواجه شد."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchTerm, categoryFilter, page]);

  // Reset to page 1 whenever search/category filter changes.
  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchDraft);
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setUploadingImage(true);
    try {
      const oldFileName = modalPost.coverFileName || null;
      const { fileName, url } = await uploadBlogPostCoverImage(
        file,
        oldFileName,
      );
      setModalPost((prev) => ({
        ...prev,
        coverFileName: fileName,
        coverSrc: url,
      }));
    } catch (err) {
      setImageError(apiErrorMessage(err, "آپلود تصویر با خطا مواجه شد."));
    } finally {
      setUploadingImage(false);
    }
  };

  const openNew = () => {
    setErrors({});
    setImageError("");
    setModalPost(emptyPost(categories[0]?.id ?? ""));
  };

  const openEdit = (post) => {
    setErrors({});
    setImageError("");
    setModalPost({ ...post });
  };

  const validate = (draft) => {
    const errs = {};
    if (!draft.title.trim()) errs.title = "عنوان پست الزامی است.";
    if (!draft.categoryId) errs.category = "انتخاب دسته‌بندی الزامی است.";
    if (!draft.readingMins || draft.readingMins <= 0)
      errs.readingMins = "زمان مطالعه باید بزرگ‌تر از صفر باشد.";
    return errs;
  };

  const savePost = async () => {
    const errs = validate(modalPost);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setApiError("");
    try {
      if (modalPost.id) {
        await updateBlogPost(modalPost.id, mapPostToApi(modalPost));
        onSaved("پست ویرایش شد");
      } else {
        await createBlogPost(mapPostToApi(modalPost));
        onSaved("پست جدید اضافه شد");
      }
      await reloadPosts();
      setModalPost(null);
    } catch (err) {
      setApiError(apiErrorMessage(err, "ذخیره پست با خطا مواجه شد."));
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (post) => {
    try {
      const updated = await toggleBlogPostPublish(post.id);
      await reloadPosts();
      onSaved(updated?.isPublished ? "پست منتشر شد" : "پست پیش‌نویس شد");
    } catch (err) {
      setApiError(apiErrorMessage(err, "تغییر وضعیت پست با خطا مواجه شد."));
    }
  };

  const deletePost = async (id) => {
    try {
      await deleteBlogPost(id);
      // If we just deleted the last item on a page beyond page 1, step back
      // a page so the user doesn't land on a now-empty page.
      if (posts.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await reloadPosts();
      }
      setConfirmDeleteId(null);
      onSaved("پست حذف شد");
    } catch (err) {
      setApiError(apiErrorMessage(err, "حذف پست با خطا مواجه شد."));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="panel">
      {apiError && <span className="form-error">{apiError}</span>}

      <div className="blog-mgmt__posts-toolbar">
        <div className="blog-mgmt__posts-toolbar-group">
          {!loading && totalPages > 1 && (
            <div className="blog-mgmt__pagination">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                قبلی
              </button>
              <span className="blog-mgmt__pagination-label">
                صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)} (
                {toPersianDigits(totalCount)} پست)
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

          <form className="blog-mgmt__search-box" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="mh-input"
              placeholder="جستجو در عنوان پست‌ها..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
            <button
              type="submit"
              className="blog-mgmt__search-submit"
              title="جستجو"
              aria-label="جستجو"
            >
              <i className="fas fa-search" />
            </button>
          </form>
        </div>

        <div className="blog-mgmt__posts-toolbar-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ maxWidth: 220 }}
          >
            <option value="all">همه دسته‌ها</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <i className="fas fa-plus" /> پست جدید
          </button>
        </div>
      </div>

      <div className="table-container blog-mgmt__posts-scroll">
        <table>
          <thead>
            <tr>
              <th>پوستر</th>
              <th>عنوان</th>
              <th>دسته‌بندی</th>
              <th>زمان مطالعه</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-hint">در حال بارگذاری...</div>
                </td>
              </tr>
            )}
            {!loading && posts.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-hint">
                    هیچ پستی با این فیلتر پیدا نشد.
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="blog-mgmt__thumb">
                      {post.coverSrc ? (
                        <img src={post.coverSrc} alt={post.title} />
                      ) : (
                        <i className="fas fa-image" />
                      )}
                    </div>
                  </td>
                  <td>{post.title}</td>
                  <td>{post.categoryTitle}</td>
                  <td>{post.readingMins} دقیقه</td>
                  <td>
                    <span
                      className={`status-chip ${post.published ? "active" : "danger"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => togglePublished(post)}
                      title="برای تغییر وضعیت کلیک کنید"
                    >
                      {post.published ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      title="ویرایش"
                      onClick={() => openEdit(post)}
                    >
                      <i className="fas fa-pen" />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      title="حذف"
                      onClick={() => setConfirmDeleteId(post.id)}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalPost && (
        <div
          className="modal-backdrop"
          onClick={() => !saving && setModalPost(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{modalPost.id ? "ویرایش پست" : "پست جدید"}</h4>
              <button className="btn-icon" onClick={() => setModalPost(null)}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="form-vertical">
              <div className="input-group">
                <label>عنوان پست</label>
                <input
                  type="text"
                  value={modalPost.title}
                  onChange={(e) =>
                    setModalPost({ ...modalPost, title: e.target.value })
                  }
                />
                {errors.title && (
                  <span className="form-error">{errors.title}</span>
                )}
              </div>

              <div className="input-group">
                <label>تصویر کاور</label>
                {modalPost.coverSrc && (
                  <div className="blog-mgmt__thumb" style={{ marginBottom: 8 }}>
                    <img src={modalPost.coverSrc} alt={modalPost.title} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={handleCoverImageChange}
                />
                {uploadingImage && (
                  <span className="empty-hint">در حال آپلود...</span>
                )}
                {imageError && <span className="form-error">{imageError}</span>}
              </div>

              <div className="two-column-form">
                <div className="input-group">
                  <label>دسته‌بندی</label>
                  <select
                    value={modalPost.categoryId}
                    onChange={(e) =>
                      setModalPost({
                        ...modalPost,
                        categoryId: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      انتخاب کنید
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <span className="form-error">{errors.category}</span>
                  )}
                </div>

                <div className="input-group">
                  <label>زمان مطالعه (دقیقه)</label>
                  <input
                    type="number"
                    min={1}
                    value={modalPost.readingMins}
                    onChange={(e) =>
                      setModalPost({
                        ...modalPost,
                        readingMins: Number(e.target.value),
                      })
                    }
                  />
                  {errors.readingMins && (
                    <span className="form-error">{errors.readingMins}</span>
                  )}
                </div>
              </div>

              <label className="radio-label">
                <input
                  type="checkbox"
                  checked={modalPost.published}
                  onChange={(e) =>
                    setModalPost({ ...modalPost, published: e.target.checked })
                  }
                />
                منتشر شود
              </label>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                disabled={saving}
                onClick={() => setModalPost(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-primary"
                disabled={saving}
                onClick={savePost}
              >
                {saving ? "در حال ذخیره..." : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="modal blog-mgmt__modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>حذف پست</h4>
            </div>
            <p className="blog-mgmt__muted-text">
              این پست برای همیشه حذف می‌شود و این عملیات قابل بازگشت نیست.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDeleteId(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                onClick={() => deletePost(confirmDeleteId)}
              >
                حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 2) DISPLAY CATEGORIES (the 8 colored cards under the hero)          */
/* ================================================================== */

function mapCategoryFromApi(c) {
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    color: c.colorHex,
    sortOrder: c.sortOrder,
  };
}

function mapCategoryToApi(draft) {
  return {
    title: draft.title,
    subtitle: draft.subtitle,
    colorHex: draft.color,
  };
}

function emptyDisplayCategory() {
  return { id: null, title: "", subtitle: "", color: "#5A302F" };
}

const CATEGORY_TITLE_MAX = 30;
const CATEGORY_SUBTITLE_MAX = 50;

function DisplayCategoriesPane({ onSaved }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [modalCat, setModalCat] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const reloadCategories = useCallback(async () => {
    const data = await getBlogCategories();
    setCategories(data.map(mapCategoryFromApi));
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await reloadCategories();
      } catch (err) {
        if (!cancelled)
          setApiError(
            apiErrorMessage(err, "بارگذاری دسته‌بندی‌ها با خطا مواجه شد."),
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadCategories]);

  const openNew = () => {
    setErrors({});
    setModalCat(emptyDisplayCategory());
  };
  const openEdit = (cat) => {
    setErrors({});
    setModalCat({ ...cat });
  };

  const save = async () => {
    const errs = {};
    const title = modalCat.title.trim();
    const subtitle = modalCat.subtitle.trim();
    if (!title) errs.title = "عنوان الزامی است.";
    else if (title.length > CATEGORY_TITLE_MAX)
      errs.title = `عنوان نباید بیشتر از ${toPersianDigits(CATEGORY_TITLE_MAX)} کاراکتر باشد.`;
    if (!subtitle) errs.subtitle = "زیرعنوان الزامی است.";
    else if (subtitle.length > CATEGORY_SUBTITLE_MAX)
      errs.subtitle = `زیرعنوان نباید بیشتر از ${toPersianDigits(CATEGORY_SUBTITLE_MAX)} کاراکتر باشد.`;
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setApiError("");
    try {
      if (modalCat.id) {
        await updateBlogCategory(modalCat.id, mapCategoryToApi(modalCat));
      } else {
        await createBlogCategory(mapCategoryToApi(modalCat));
      }
      await reloadCategories();
      setModalCat(null);
      onSaved("دسته‌بندی نمایشی ذخیره شد");
    } catch (err) {
      setApiError(apiErrorMessage(err, "ذخیره دسته‌بندی با خطا مواجه شد."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteBlogCategory(id);
      await reloadCategories();
      setConfirmDeleteId(null);
      onSaved("دسته‌بندی حذف شد");
    } catch (err) {
      setApiError(apiErrorMessage(err, "حذف دسته‌بندی با خطا مواجه شد."));
      setConfirmDeleteId(null);
    }
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    try {
      await moveBlogCategory(categories[index].id, dir < 0 ? "up" : "down");
      await reloadCategories();
    } catch (err) {
      setApiError(apiErrorMessage(err, "تغییر ترتیب با خطا مواجه شد."));
    }
  };

  return (
    <div className="panel">
      {apiError && <span className="form-error">{apiError}</span>}

      <div className="panel-actions blog-mgmt__panel-actions--start">
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus" /> دسته‌بندی نمایشی جدید
        </button>
      </div>

      {loading && <div className="empty-hint">در حال بارگذاری...</div>}

      <div className="custom-icons-list blog-mgmt__cat-list">
        {!loading &&
          categories.map((cat, index) => (
            <div key={cat.id} className="custom-icon-row blog-mgmt__cat-row">
              <span
                className="icon blog-mgmt__cat-swatch"
                style={{ "--cat-color": cat.color }}
              />
              <div className="name blog-mgmt__cat-name">
                <strong>{cat.title}</strong>
                <small className="blog-mgmt__cat-subtitle">
                  {cat.subtitle}
                </small>
              </div>
              <div className="actions">
                <button
                  className="mh-reorder-btn btn-icon"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  title="بالا"
                >
                  <i className="fas fa-chevron-up" />
                </button>
                <button
                  className="btn-icon"
                  disabled={index === categories.length - 1}
                  onClick={() => move(index, 1)}
                  title="پایین"
                >
                  <i className="fas fa-chevron-down" />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => openEdit(cat)}
                  title="ویرایش"
                >
                  <i className="fas fa-pen" />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => setConfirmDeleteId(cat.id)}
                  title="حذف"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {modalCat && (
        <div
          className="modal-backdrop"
          onClick={() => !saving && setModalCat(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                {modalCat.id
                  ? "ویرایش دسته‌بندی نمایشی"
                  : "دسته‌بندی نمایشی جدید"}
              </h4>
              <button className="btn-icon" onClick={() => setModalCat(null)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="form-vertical">
              <div className="input-group">
                <div className="blog-mgmt__label-row">
                  <label>عنوان</label>
                  <span className="blog-mgmt__char-count">
                    {toPersianDigits(modalCat.title.length)}/
                    {toPersianDigits(CATEGORY_TITLE_MAX)}
                  </span>
                </div>
                <input
                  type="text"
                  value={modalCat.title}
                  maxLength={CATEGORY_TITLE_MAX}
                  onChange={(e) =>
                    setModalCat({ ...modalCat, title: e.target.value })
                  }
                />
                {errors.title && (
                  <span className="form-error">{errors.title}</span>
                )}
              </div>
              <div className="input-group">
                <div className="blog-mgmt__label-row">
                  <label>زیرعنوان</label>
                  <span className="blog-mgmt__char-count">
                    {toPersianDigits(modalCat.subtitle.length)}/
                    {toPersianDigits(CATEGORY_SUBTITLE_MAX)}
                  </span>
                </div>
                <input
                  type="text"
                  value={modalCat.subtitle}
                  maxLength={CATEGORY_SUBTITLE_MAX}
                  onChange={(e) =>
                    setModalCat({ ...modalCat, subtitle: e.target.value })
                  }
                />
                {errors.subtitle && (
                  <span className="form-error">{errors.subtitle}</span>
                )}
              </div>
              <div className="input-group">
                <label>رنگ کارت</label>
                <div className="blog-mgmt__color-row">
                  <input
                    type="color"
                    value={modalCat.color}
                    onChange={(e) =>
                      setModalCat({ ...modalCat, color: e.target.value })
                    }
                    className="blog-mgmt__color-swatch"
                  />
                  <input
                    type="text"
                    value={modalCat.color}
                    onChange={(e) =>
                      setModalCat({ ...modalCat, color: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                disabled={saving}
                onClick={() => setModalCat(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-primary"
                disabled={saving}
                onClick={save}
              >
                {saving ? "در حال ذخیره..." : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="modal blog-mgmt__modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>حذف دسته‌بندی</h4>
            </div>
            <p className="blog-mgmt__muted-text">
              این دسته‌بندی از صفحه‌ی وبلاگ حذف می‌شود.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDeleteId(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                onClick={() => remove(confirmDeleteId)}
              >
                حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 3) SIDEBAR "SUGGESTED TAGS" (name + article count)                  */
/* ================================================================== */

function mapTagFromApi(t) {
  return {
    id: t.id,
    name: t.name,
    count: `${toPersianDigits(t.articleCount)} مقاله`,
  };
}

function emptySidebarTag() {
  return { id: null, name: "" };
}

function SidebarTagsPane({ onSaved }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [modalTag, setModalTag] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reloadTags = useCallback(async () => {
    const data = await getBlogTags();
    setTags(data.map(mapTagFromApi));
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await reloadTags();
      } catch (err) {
        if (!cancelled)
          setApiError(
            apiErrorMessage(err, "بارگذاری برچسب‌ها با خطا مواجه شد."),
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadTags]);

  const openNew = () => {
    setError("");
    setModalTag(emptySidebarTag());
  };
  const openEdit = (tag) => {
    setError("");
    setModalTag({ ...tag });
  };

  const save = async () => {
    if (!modalTag.name.trim()) {
      setError("نام برچسب الزامی است.");
      return;
    }

    setSaving(true);
    try {
      if (modalTag.id) {
        await updateBlogTag(modalTag.id, modalTag.name.trim());
      } else {
        await createBlogTag(modalTag.name.trim());
      }
      await reloadTags();
      setModalTag(null);
      setError("");
      onSaved("برچسب پیشنهادی ذخیره شد");
    } catch (err) {
      setError(apiErrorMessage(err, "ذخیره برچسب با خطا مواجه شد."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteBlogTag(id);
      await reloadTags();
      setConfirmDeleteId(null);
      onSaved("برچسب حذف شد");
    } catch (err) {
      setApiError(apiErrorMessage(err, "حذف برچسب با خطا مواجه شد."));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="panel">
      {apiError && <span className="form-error">{apiError}</span>}

      <div className="panel-actions blog-mgmt__panel-actions--start">
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus" /> برچسب جدید
        </button>
      </div>

      {loading && <div className="empty-hint">در حال بارگذاری...</div>}

      <ul className="sidebar-tags-list blog-mgmt__sidebar-tags-list">
        {!loading &&
          tags.map((tag) => (
            <li key={tag.id} className="sidebar-tag-item">
              <div className="tag-item-right">
                <span className="mobile-blog-tags__hash blog-mgmt__tag-hash">
                  #
                </span>
                <span className="tag-item-name">{tag.name}</span>
              </div>
              <div className="blog-mgmt__tag-actions">
                <span className="tag-item-count">{tag.count}</span>
                <button
                  className="btn-icon"
                  onClick={() => openEdit(tag)}
                  title="ویرایش"
                >
                  <i className="fas fa-pen" />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => setConfirmDeleteId(tag.id)}
                  title="حذف"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </li>
          ))}
        {!loading && tags.length === 0 && (
          <div className="empty-hint">هنوز برچسبی اضافه نشده.</div>
        )}
      </ul>

      {modalTag && (
        <div
          className="modal-backdrop"
          onClick={() => !saving && setModalTag(null)}
        >
          <div
            className="modal blog-mgmt__modal--tag"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>{modalTag.id ? "ویرایش برچسب" : "برچسب جدید"}</h4>
              <button className="btn-icon" onClick={() => setModalTag(null)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="form-vertical">
              <div className="input-group">
                <label>نام برچسب</label>
                <input
                  type="text"
                  value={modalTag.name}
                  onChange={(e) =>
                    setModalTag({ ...modalTag, name: e.target.value })
                  }
                />
                {error && <span className="form-error">{error}</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                disabled={saving}
                onClick={() => setModalTag(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-primary"
                disabled={saving}
                onClick={save}
              >
                {saving ? "در حال ذخیره..." : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="modal blog-mgmt__modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>حذف برچسب</h4>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDeleteId(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                onClick={() => remove(confirmDeleteId)}
              >
                حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 4) HERO + SEARCH BAR                                                */
/* ================================================================== */

function mapHeroFromApi(h) {
  return {
    titleLine: h.titleLine,
    highlight: h.highlight,
    searchPlaceholder: h.searchPlaceholder,
  };
}

function HeroPane({ onSaved }) {
  const [draft, setDraft] = useState({
    titleLine: "",
    highlight: "",
    searchPlaceholder: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const hero = await getBlogHero();
        if (!cancelled) setDraft(mapHeroFromApi(hero));
      } catch (err) {
        if (!cancelled)
          setError(apiErrorMessage(err, "بارگذاری هیرو با خطا مواجه شد."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    if (!draft.titleLine.trim() || !draft.highlight.trim()) {
      setError("متن اصلی و متن هایلایت نباید خالی باشند.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateBlogHero(draft);
      setDraft(mapHeroFromApi(updated));
      setError("");
      onSaved("تنظیمات هیرو ذخیره شد");
    } catch (err) {
      setError(apiErrorMessage(err, "ذخیره هیرو با خطا مواجه شد."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      {loading && <div className="empty-hint">در حال بارگذاری...</div>}

      {!loading && (
        <>
          <div className="form-vertical blog-mgmt__form--hero">
            <div className="input-group">
              <label>متن اصلی هیرو</label>
              <input
                type="text"
                value={draft.titleLine}
                onChange={(e) =>
                  setDraft({ ...draft, titleLine: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>متن هایلایت (نارنجی)</label>
              <input
                type="text"
                value={draft.highlight}
                onChange={(e) =>
                  setDraft({ ...draft, highlight: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>متن جای‌گزین نوار جستجو</label>
              <input
                type="text"
                value={draft.searchPlaceholder}
                onChange={(e) =>
                  setDraft({ ...draft, searchPlaceholder: e.target.value })
                }
              />
            </div>
            {error && <span className="form-error">{error}</span>}
          </div>

          <div className="blog-mgmt__hero-preview">
            <span>{draft.titleLine}</span>{" "}
            <span className="highlight-text">{draft.highlight}</span>
            <div className="blog-mgmt__hero-preview-search">
              {draft.searchPlaceholder}
            </div>
          </div>

          <div className="panel-actions">
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={save}
            >
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ================================================================== */
/* 5) MOBILE LAYOUT - untouched for now (not wired to the backend)    */
/* ================================================================== */

function MobileLayoutPane({ settings, setSettings, onSaved }) {
  const togglePairType = (key) => {
    setSettings((prev) => ({
      ...prev,
      enabledPairTypes: {
        ...prev.enabledPairTypes,
        [key]: !prev.enabledPairTypes[key],
      },
    }));
  };

  const save = () => {
    const anyEnabled = Object.values(settings.enabledPairTypes).some(Boolean);
    if (!anyEnabled) {
      onSaved("حداقل یک نوع بلوک تصادفی باید فعال باشد");
      return;
    }
    onSaved("تنظیمات نسخه موبایل ذخیره شد");
  };

  return (
    <div className="panel">
      <div className="config-step">
        <h4>بلوک‌های تصادفی مجاز</h4>
        <div className="predefined-tags">
          {Object.entries(PAIR_TYPE_LABELS).map(([key, label]) => (
            <label
              key={key}
              className={`tag blog-mgmt__pair-chip ${settings.enabledPairTypes[key] ? "is-active" : ""}`}
            >
              <input
                type="checkbox"
                style={{ display: "none" }}
                checked={settings.enabledPairTypes[key]}
                onChange={() => togglePairType(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="config-step two-column-form">
        <div className="input-group">
          <label>تعداد بلوک‌های تصادفی نمایش داده شده</label>
          <input
            type="number"
            min={0}
            max={6}
            value={settings.randomBlockRounds}
            onChange={(e) =>
              setSettings({
                ...settings,
                randomBlockRounds: Number(e.target.value),
              })
            }
          />
        </div>
        <div className="input-group">
          <label>تعداد ردیف فید ساده</label>
          <input
            type="number"
            min={1}
            max={10}
            value={settings.feedRows}
            onChange={(e) =>
              setSettings({ ...settings, feedRows: Number(e.target.value) })
            }
          />
        </div>
        <div className="input-group">
          <label>تعداد کارت در هر ردیف فید</label>
          <input
            type="number"
            min={1}
            max={4}
            value={settings.feedPerRow}
            onChange={(e) =>
              setSettings({ ...settings, feedPerRow: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="config-step">
        <h4>بلوک پایانی (قبل از فوتر)</h4>
        <div className="two-column-form">
          <div className="input-group">
            <label>نوع بلوک</label>
            <select
              value={settings.finalBlock.forcedPairType}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  finalBlock: {
                    ...settings.finalBlock,
                    forcedPairType: e.target.value,
                  },
                })
              }
            >
              {Object.entries(PAIR_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>متن دکمه</label>
            <input
              type="text"
              disabled={!settings.finalBlock.showButton}
              value={settings.finalBlock.buttonLabel}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  finalBlock: {
                    ...settings.finalBlock,
                    buttonLabel: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
        <label className="radio-label blog-mgmt__radio-label--spaced">
          <input
            type="checkbox"
            checked={settings.finalBlock.showButton}
            onChange={(e) =>
              setSettings({
                ...settings,
                finalBlock: {
                  ...settings.finalBlock,
                  showButton: e.target.checked,
                },
              })
            }
          />
          نمایش دکمه در بلوک پایانی
        </label>
      </div>

      <div className="panel-actions">
        <button className="btn btn-primary" onClick={save}>
          ذخیره تغییرات
        </button>
      </div>
    </div>
  );
}
