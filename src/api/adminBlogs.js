import adminBlogsAxios from "./adminBlogsAxios";

// Fixed feed categories (formerly the editable "فیلترهای فید" tab).
// These mirror the backend's BlogFeedCategory enum 1:1 - if the enum ever
// changes on the backend, this list must be updated to match.
export const FEED_CATEGORIES = [
  { value: 1, label: "جدیدترین‌ها" },
  { value: 2, label: "محبوب‌ترین‌ها" },
  { value: 3, label: "پربازدیدترین‌ها" },
];

const MOVE_DIRECTION = { up: -1, down: 1 };

/* ---------------------------- Blog Posts --------------------------- */

export const getBlogPosts = ({
  search,
  categoryId,
  page = 1,
  pageSize = 20,
} = {}) =>
  adminBlogsAxios
    .get("/posts", { params: { search, categoryId, page, pageSize } })
    .then((r) => r.data); // { items, page, pageSize, totalCount, totalPages }

export const getBlogPost = (id) =>
  adminBlogsAxios.get(`/posts/${id}`).then((r) => r.data);

// Create is now a bare "auto-draft": only a title, sent as JSON (no file,
// no multipart). The rest of the metadata (cover, category, reading time,
// publish status) is filled in afterwards on the post's own editor page via
// updateBlogPost.
export const createBlogPost = (title) =>
  adminBlogsAxios.post("/posts", { title }).then((r) => r.data);

export const updateBlogPost = (id, formData) =>
  adminBlogsAxios
    .put(`/posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const toggleBlogPostPublish = (id) =>
  adminBlogsAxios.patch(`/posts/${id}/publish`).then((r) => r.data);

export const deleteBlogPost = (id) =>
  adminBlogsAxios.delete(`/posts/${id}`).then((r) => r.data);

/* ------------------------- Blog Post Content ------------------------ */
// Raw HTML body (Tiptap editor output), stored separately from the post's
// metadata - see BlogPostContent on the backend. Used by the upcoming
// dedicated content editor, kept independent from updateBlogPost so
// autosave never has to resubmit the metadata form (or its file upload).

export const getBlogPostContent = (id) =>
  adminBlogsAxios.get(`/posts/${id}/content`).then((r) => r.data);

export const updateBlogPostContent = (id, content) =>
  adminBlogsAxios.put(`/posts/${id}/content`, { content }).then((r) => r.data);

export const searchBlogRestaurants = (term, take = 10) =>
  adminBlogsAxios
    .get("/posts/restaurant-search", { params: { term, take } })
    .then((r) => r.data);

export const getBlogRestaurantById = (id) =>
  adminBlogsAxios.get(`/posts/restaurant-search/${id}`).then((r) => r.data);

/* ------------------------ Display Categories ------------------------ */

export const getBlogCategories = () =>
  adminBlogsAxios.get("/display-categories").then((r) => r.data);

export const createBlogCategory = (payload) =>
  adminBlogsAxios.post("/display-categories", payload).then((r) => r.data);

export const updateBlogCategory = (id, payload) =>
  adminBlogsAxios.put(`/display-categories/${id}`, payload).then((r) => r.data);

// direction: "up" | "down"
export const moveBlogCategory = (id, direction) =>
  adminBlogsAxios
    .post(`/display-categories/${id}/move`, {
      direction: MOVE_DIRECTION[direction],
    })
    .then((r) => r.data);

export const getBlogCategoryAffectedPostsCount = (id) =>
  adminBlogsAxios
    .get(`/display-categories/${id}/affected-posts-count`)
    .then((r) => r.data);

export const deleteBlogCategory = (id) =>
  adminBlogsAxios.delete(`/display-categories/${id}`).then((r) => r.data);

/* --------------------------- Sidebar Tags ---------------------------- */
// Note: articleCount is always server-computed, so it's never sent in the
// create/update payloads below - only received back in the response.

export const getBlogTags = () =>
  adminBlogsAxios.get("/sidebar-tags").then((r) => r.data);

export const createBlogTag = (name, suggested = false) =>
  adminBlogsAxios
    .post("/sidebar-tags", { name, suggested })
    .then((r) => r.data);

export const updateBlogTag = (id, name, suggested = false) =>
  adminBlogsAxios
    .put(`/sidebar-tags/${id}`, { name, suggested })
    .then((r) => r.data);

export const toggleBlogTagSuggested = (id) =>
  adminBlogsAxios
    .patch(`/sidebar-tags/${id}/toggle-suggested`)
    .then((r) => r.data);

export const deleteBlogTag = (id) =>
  adminBlogsAxios.delete(`/sidebar-tags/${id}`).then((r) => r.data);

/* ------------------------------- Hero -------------------------------- */

export const getBlogHero = () =>
  adminBlogsAxios.get("/hero").then((r) => r.data);

export const updateBlogHero = (payload) =>
  adminBlogsAxios.put("/hero", payload).then((r) => r.data);
