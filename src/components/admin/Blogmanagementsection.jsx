import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBlogPosts,
  createBlogPost,
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
  toggleBlogTagSuggested,
  deleteBlogTag,
  getBlogHero,
  updateBlogHero,
} from "../../api/adminBlogs";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../assets/css/admin/admin.css";
import "../../assets/css/admin/admin-modal.css";
import "../../assets/css/admin/blogManagementSection.css";

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
];

function toPersianDigits(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

function apiErrorMessage(err, fallback = "خطایی رخ داد. دوباره تلاش کنید.") {
  return err?.response?.data?.message || err?.response?.data?.title || fallback;
}

export default function BlogManagementSection() {
  useDocumentTitle("مدیریت بلاگ");
  const [activeSubTab, setActiveSubTab] = useState("posts");

  return (
    <div id="blog-management-view" className="blog-mgmt">
      <div className="view-header">
        <h2 className="content-title">مدیریت وبلاگ</h2>
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
          <PostsPane />
        </div>
      )}

      {activeSubTab === "display-categories" && (
        <div className="content-tab-pane active">
          <DisplayCategoriesPane />
        </div>
      )}

      {activeSubTab === "sidebar-tags" && (
        <div className="content-tab-pane active">
          <SidebarTagsPane />
        </div>
      )}

      {activeSubTab === "hero" && (
        <div className="content-tab-pane active">
          <HeroPane />
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
    coverSrc: p.coverImageUrl || "",
    coverFileName: p.coverImageUrl ? p.coverImageUrl.split("/").pop() : "",
    removeImage: false,
    readingMins: p.readingMinutes,
    categoryId: p.categoryId,
    categoryTitle:
      p.categoryTitle ||
      categories.find((c) => c.id === p.categoryId)?.title ||
      "",
    published: p.isPublished,
  };
}

const PAGE_SIZE = 20;

function PostsPane() {
  const navigate = useNavigate();
  const { notify, confirmModal } = useGlobalUI();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  // searchDraft is bound to the input as the user types; searchTerm is only
  // updated when the search button (or Enter) is pressed, and it's the one
  // used to trigger the API call - this avoids firing a request per keystroke.
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  // Small modal used only to collect the title for a brand-new post. Full
  // metadata (cover, category, reading time, publish) is edited on the
  // dedicated /admin/blog/post-editor/:id page, not here.
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [newTitleError, setNewTitleError] = useState("");

  const reloadPosts = useCallback(async () => {
    const data = await getBlogPosts({
      search: searchTerm.trim() || undefined,
      categoryId: categoryFilter === "all" ? undefined : categoryFilter,
      page,
      pageSize: PAGE_SIZE,
    });
    setPosts(data.items.map((p) => mapPostFromApi(p, categories)));
    setTotalPages(data.totalPages);
    setTotalCount(data.totalCount);
    return data;
  }, [searchTerm, categoryFilter, page, categories]);

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
          notify({
            type: "error",
            message: apiErrorMessage(err, "بارگذاری پست‌ها با خطا مواجه شد."),
          });
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

  const openNewModal = () => {
    setNewTitleError("");
    setNewTitle("");
    setCreating(true);
  };

  // Creates a bare draft post (title only - see CreateBlogPostRequest) and
  // sends the admin straight to the dedicated editor page, where category,
  // cover image, reading time, publish status, and (eventually) the Tiptap
  // body are all filled in.
  const submitNewPost = async () => {
    if (!newTitle.trim()) {
      setNewTitleError("عنوان پست الزامی است.");
      return;
    }
    setSavingNew(true);
    try {
      const created = await createBlogPost(newTitle.trim());
      setCreating(false);
      navigate(`/admin/blog/post-editor/${created.id}`);
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "ساخت پست با خطا مواجه شد."),
      });
    } finally {
      setSavingNew(false);
    }
  };

  const togglePublished = async (post) => {
    try {
      const updated = await toggleBlogPostPublish(post.id);
      await reloadPosts();
      notify({
        type: "success",
        message: updated?.isPublished ? "پست منتشر شد" : "پست پیش‌نویس شد",
      });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "تغییر وضعیت پست با خطا مواجه شد."),
      });
    }
  };

  const deletePost = async (id) => {
    try {
      await deleteBlogPost(id);
      if (posts.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await reloadPosts();
      }
      notify({ type: "success", message: "پست حذف شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "حذف پست با خطا مواجه شد."),
      });
    }
  };

  const handleDeleteClick = async (id) => {
    const ok = await confirmModal({
      title: "حذف پست",
      message: "این پست برای همیشه حذف می‌شود و این عملیات قابل بازگشت نیست.",
      confirmText: "حذف شود",
      cancelText: "انصراف",
      danger: true,
    });
    if (!ok) return;
    await deletePost(id);
  };

  return (
    <div className="panel">
      <div className="admin-toolbar">
        <div className="admin-toolbar-group">
          <form className="admin-search-box" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="mh-input"
              placeholder="جستجو در عنوان پست‌ها..."
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
        </div>

        <div className="admin-toolbar-group">
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
          <button
            type="button"
            className="btn btn-primary"
            onClick={openNewModal}
          >
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
                      onClick={() =>
                        navigate(`/admin/blog/post-editor/${post.id}`)
                      }
                    >
                      <i className="fas fa-pen" />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      title="حذف"
                      onClick={() => handleDeleteClick(post.id)}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <div
          className="admin-modal-overlay"
          onClick={() => !savingNew && setCreating(false)}
        >
          <div
            className="admin-modal admin-modal--compact"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>
                <i className="fas fa-plus" />
                پست جدید
              </h3>
              <button className="btn-icon" onClick={() => setCreating(false)}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="admin-modal__body">
              <div className="form-vertical">
                <div className="input-group">
                  <label>عنوان پست</label>
                  <input
                    type="text"
                    value={newTitle}
                    autoFocus
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  {newTitleError && (
                    <span className="form-error">{newTitleError}</span>
                  )}
                </div>
                <p className="empty-hint">
                  بعد از ساخت، به صفحه‌ی ویرایش کامل پست هدایت می‌شوید تا
                  دسته‌بندی، عکس کاور، زمان مطالعه، وضعیت انتشار و محتوای پست را
                  تکمیل کنید.
                </p>
              </div>

              <div className="panel-actions">
                <button
                  className="btn btn-secondary"
                  disabled={savingNew}
                  onClick={() => setCreating(false)}
                >
                  انصراف
                </button>
                <button
                  className="btn btn-primary"
                  disabled={savingNew}
                  onClick={submitNewPost}
                >
                  {savingNew ? "در حال ساخت..." : "ساخت و ادامه"}
                </button>
              </div>
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

function DisplayCategoriesPane() {
  const { notify, confirmModal } = useGlobalUI();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCat, setModalCat] = useState(null);
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
          notify({
            type: "error",
            message: apiErrorMessage(
              err,
              "بارگذاری دسته‌بندی‌ها با خطا مواجه شد.",
            ),
          });
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
    try {
      if (modalCat.id) {
        await updateBlogCategory(modalCat.id, mapCategoryToApi(modalCat));
      } else {
        await createBlogCategory(mapCategoryToApi(modalCat));
      }
      await reloadCategories();
      setModalCat(null);
      notify({ type: "success", message: "دسته‌بندی نمایشی ذخیره شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "ذخیره دسته‌بندی با خطا مواجه شد."),
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteBlogCategory(id);
      await reloadCategories();
      notify({ type: "success", message: "دسته‌بندی حذف شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "حذف دسته‌بندی با خطا مواجه شد."),
      });
    }
  };

  const handleDeleteClick = async (id) => {
    const ok = await confirmModal({
      title: "حذف دسته‌بندی",
      message: "این دسته‌بندی از صفحه‌ی وبلاگ حذف می‌شود.",
      confirmText: "حذف شود",
      cancelText: "انصراف",
      danger: true,
    });
    if (!ok) return;
    await remove(id);
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    try {
      await moveBlogCategory(categories[index].id, dir < 0 ? "up" : "down");
      await reloadCategories();
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "تغییر ترتیب با خطا مواجه شد."),
      });
    }
  };

  return (
    <div className="panel">
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
                  onClick={() => handleDeleteClick(cat.id)}
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
          className="admin-modal-overlay"
          onClick={() => !saving && setModalCat(null)}
        >
          <div
            className="admin-modal admin-modal--compact"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>
                <i className="fas fa-th-large" />
                {modalCat.id
                  ? "ویرایش دسته‌بندی نمایشی"
                  : "دسته‌بندی نمایشی جدید"}
              </h3>
              <button className="btn-icon" onClick={() => setModalCat(null)}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="admin-modal__body">
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

              <div className="panel-actions">
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
    suggested: !!t.suggested,
  };
}

function emptySidebarTag() {
  return { id: null, name: "", suggested: false };
}

// Sidebar block on the public blog is small - keep the number of tags an
// admin can mark "suggested" capped so the block never grows unbounded.
const MAX_SUGGESTED_TAGS = 10;

function SidebarTagsPane() {
  const { notify, confirmModal } = useGlobalUI();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalTag, setModalTag] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  // Local-only, no API calls involved: free-text filter and a "suggested
  // only" switch that just narrow down what's already loaded in `tags`.
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlySuggested, setShowOnlySuggested] = useState(false);
  // Shown next to "برچسب جدید" in red when a toggle is rejected for hitting
  // the MAX_SUGGESTED_TAGS limit (separate from the generic apiError banner).
  const [limitError, setLimitError] = useState("");

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
          notify({
            type: "error",
            message: apiErrorMessage(err, "بارگذاری برچسب‌ها با خطا مواجه شد."),
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadTags]);

  // Count of currently-suggested tags, shown as the x/10 counter.
  const suggestedCount = useMemo(
    () => tags.filter((t) => t.suggested).length,
    [tags],
  );

  // Local-only filtering: text search over the name, optionally narrowed to
  // suggested-only tags. No API call - just derived from `tags` in memory.
  const filteredTags = useMemo(() => {
    const term = searchTerm.trim();
    return tags.filter((tag) => {
      if (showOnlySuggested && !tag.suggested) return false;
      if (term && !tag.name.includes(term)) return false;
      return true;
    });
  }, [tags, searchTerm, showOnlySuggested]);

  const openNew = () => {
    setError("");
    setLimitError("");
    setModalTag(emptySidebarTag());
  };
  const openEdit = (tag) => {
    setError("");
    setLimitError("");
    setModalTag({ ...tag });
  };

  const save = async () => {
    if (!modalTag.name.trim()) {
      setError("نام برچسب الزامی است.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      if (modalTag.id) {
        await updateBlogTag(
          modalTag.id,
          modalTag.name.trim(),
          modalTag.suggested,
        );
      } else {
        await createBlogTag(modalTag.name.trim(), modalTag.suggested);
      }
      await reloadTags();
      setModalTag(null);
      notify({ type: "success", message: "برچسب پیشنهادی ذخیره شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "ذخیره برچسب با خطا مواجه شد."),
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSuggested = async (tag) => {
    setLimitError("");
    try {
      await toggleBlogTagSuggested(tag.id);
      await reloadTags();
      notify({
        type: "success",
        message: tag.suggested
          ? "تگ از حالت پیشنهادی خارج شد"
          : "تگ پیشنهادی شد",
      });
    } catch (err) {
      if (err?.response?.status === 409) {
        setLimitError(
          apiErrorMessage(
            err,
            `حداکثر تعداد برچسب‌های پیشنهادی (${toPersianDigits(MAX_SUGGESTED_TAGS)} عدد) است.`,
          ),
        );
        window.clearTimeout(toggleSuggested._t);
        toggleSuggested._t = window.setTimeout(() => setLimitError(""), 5000);
      } else {
        notify({
          type: "error",
          message: apiErrorMessage(err, "تغییر وضعیت تگ با خطا مواجه شد."),
        });
      }
    }
  };

  const remove = async (id) => {
    try {
      await deleteBlogTag(id);
      await reloadTags();
      notify({ type: "success", message: "برچسب حذف شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "حذف برچسب با خطا مواجه شد."),
      });
    }
  };

  const handleDeleteClick = async (id) => {
    const ok = await confirmModal({
      title: "حذف برچسب",
      message: "آیا از حذف این برچسب مطمئن هستید؟",
      confirmText: "حذف شود",
      cancelText: "انصراف",
      danger: true,
    });
    if (!ok) return;
    await remove(id);
  };

  return (
    <div className="panel">
      <div className="admin-toolbar">
        <div className="admin-toolbar-group">
          <div className="admin-search-box">
            <input
              type="text"
              className="mh-input"
              placeholder="جستجو در برچسب‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <label className="blog-mgmt__suggested-toggle">
            <input
              type="checkbox"
              checked={showOnlySuggested}
              onChange={(e) => setShowOnlySuggested(e.target.checked)}
            />
            برچسب‌های پیشنهادی
          </label>
        </div>

        <div className="admin-toolbar-group">
          {limitError && (
            <span className="blog-mgmt__tag-limit-error">{limitError}</span>
          )}
          <button className="btn btn-primary" onClick={openNew}>
            <i className="fas fa-plus" /> برچسب جدید
          </button>
          <span className="blog-mgmt__tag-counter">
            تگ‌های پیشنهادی سایدبار: {toPersianDigits(suggestedCount)}/
            {toPersianDigits(MAX_SUGGESTED_TAGS)}
          </span>
        </div>
      </div>

      {loading && <div className="empty-hint">در حال بارگذاری...</div>}

      <ul className="blog-mgmt__admin-tags-list blog-mgmt__tags-scroll">
        {!loading &&
          filteredTags.map((tag) => (
            <li key={tag.id} className="blog-mgmt__admin-tag-item">
              <div className="blog-mgmt__admin-tag-right">
                <span className="mobile-blog-tags__hash blog-mgmt__tag-hash">
                  #
                </span>
                <span className="blog-mgmt__admin-tag-name">{tag.name}</span>
              </div>
              <label
                className="blog-mgmt__suggested-toggle"
                title="نمایش این تگ در سایدبار عمومی وبلاگ"
              >
                <input
                  type="checkbox"
                  checked={tag.suggested}
                  onChange={() => toggleSuggested(tag)}
                />
                تگ پیشنهادی
              </label>
              <div className="blog-mgmt__tag-actions">
                <span className="blog-mgmt__admin-tag-count">{tag.count}</span>
                <button
                  className="btn-icon"
                  onClick={() => openEdit(tag)}
                  title="ویرایش"
                >
                  <i className="fas fa-pen" />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleDeleteClick(tag.id)}
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
        {!loading && tags.length > 0 && filteredTags.length === 0 && (
          <div className="empty-hint">برچسبی مطابق فیلتر پیدا نشد.</div>
        )}
      </ul>

      {modalTag && (
        <div
          className="admin-modal-overlay"
          onClick={() => !saving && setModalTag(null)}
        >
          <div
            className="admin-modal admin-modal--compact"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>
                <i className="fas fa-hashtag" />
                {modalTag.id ? "ویرایش برچسب" : "برچسب جدید"}
              </h3>
              <button className="btn-icon" onClick={() => setModalTag(null)}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="admin-modal__body">
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

                <label className="radio-label">
                  <input
                    type="checkbox"
                    checked={modalTag.suggested}
                    onChange={(e) =>
                      setModalTag({
                        ...modalTag,
                        suggested: e.target.checked,
                      })
                    }
                  />
                  تگ پیشنهادی
                </label>
              </div>

              <div className="panel-actions">
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

function HeroPane() {
  const { notify } = useGlobalUI();
  const [draft, setDraft] = useState({
    titleLine: "",
    highlight: "",
    searchPlaceholder: "",
  });
  const [loading, setLoading] = useState(true);
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
          notify({
            type: "error",
            message: apiErrorMessage(err, "بارگذاری هیرو با خطا مواجه شد."),
          });
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
      notify({
        type: "warning",
        message: "متن اصلی و متن هایلایت نباید خالی باشند.",
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateBlogHero(draft);
      setDraft(mapHeroFromApi(updated));
      notify({ type: "success", message: "تنظیمات هیرو ذخیره شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "ذخیره هیرو با خطا مواجه شد."),
      });
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
