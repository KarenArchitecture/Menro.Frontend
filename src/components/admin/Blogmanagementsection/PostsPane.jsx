import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBlogPosts,
  createBlogPost,
  toggleBlogPostPublish,
  deleteBlogPost,
  getBlogCategories,
} from "../../../api/adminBlogs";
import { useGlobalUI } from "../../common/GlobalUI";
import { toPersianDigits, apiErrorMessage } from "./blogManagementShared.js";

/* ================================================================== */
/* POSTS (paginated)                                                   */
/* ================================================================== */

function mapPostFromApi(p, categories = []) {
  return {
    id: p.id,
    title: p.title,
    coverSrc: p.thumbnailUrl || "",
    coverFileName: p.thumbnailUrl ? p.thumbnailUrl.split("/").pop() : "",
    removeImage: false,
    readingMins: p.readingMinutes,
    categoryId: p.categoryId,
    categoryTitle:
      p.categoryTitle ||
      categories.find((c) => c.id === p.categoryId)?.title ||
      "",
    authorName: p.authorName || "",
    published: p.isPublished,
  };
}

const PAGE_SIZE = 20;

export default function PostsPane() {
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
  const [brokenThumbs, setBrokenThumbs] = useState(() => new Set());
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
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, published: updated.isPublished } : p,
        ),
      );
      notify({
        type: "success",
        message: updated.isPublished ? "پست منتشر شد" : "پست پیش‌نویس شد",
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
              <th>نویسنده</th>
              <th>زمان مطالعه</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-hint">در حال بارگذاری...</div>
                </td>
              </tr>
            )}
            {!loading && posts.length === 0 && (
              <tr>
                <td colSpan={7}>
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
                      {post.coverSrc && !brokenThumbs.has(post.id) ? (
                        <img
                          src={post.coverSrc}
                          alt={post.title}
                          onError={() =>
                            setBrokenThumbs((prev) =>
                              new Set(prev).add(post.id),
                            )
                          }
                        />
                      ) : (
                        <i className="fas fa-image" />
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="blog-mgmt__title-cell" title={post.title}>
                      {post.title}
                    </span>
                  </td>
                  <td>
                    {post.categoryTitle ? (
                      post.categoryTitle
                    ) : (
                      <span className="blog-mgmt__category-empty">
                        بدون دسته‌بندی
                      </span>
                    )}
                  </td>
                  <td>{post.authorName || "-"}</td>
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
