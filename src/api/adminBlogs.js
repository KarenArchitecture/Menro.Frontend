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

export const uploadBlogPostCoverImage = (file, oldFileName) => {
  const formData = new FormData();
  formData.append("file", file);
  if (oldFileName) formData.append("oldFileName", oldFileName);
  return adminBlogsAxios
    .post("/posts/cover-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const createBlogPost = (payload) =>
  adminBlogsAxios.post("/posts", payload).then((r) => r.data);

export const updateBlogPost = (id, payload) =>
  adminBlogsAxios.put(`/posts/${id}`, payload).then((r) => r.data);

export const toggleBlogPostPublish = (id) =>
  adminBlogsAxios.patch(`/posts/${id}/publish`).then((r) => r.data);

export const deleteBlogPost = (id) =>
  adminBlogsAxios.delete(`/posts/${id}`).then((r) => r.data);

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

export const deleteBlogCategory = (id) =>
  adminBlogsAxios.delete(`/display-categories/${id}`).then((r) => r.data);

/* --------------------------- Sidebar Tags ---------------------------- */
// Note: articleCount is always server-computed, so it's never sent in the
// create/update payloads below - only received back in the response.

export const getBlogTags = () =>
  adminBlogsAxios.get("/sidebar-tags").then((r) => r.data);

export const createBlogTag = (name) =>
  adminBlogsAxios.post("/sidebar-tags", { name }).then((r) => r.data);

export const updateBlogTag = (id, name) =>
  adminBlogsAxios.put(`/sidebar-tags/${id}`, { name }).then((r) => r.data);

export const deleteBlogTag = (id) =>
  adminBlogsAxios.delete(`/sidebar-tags/${id}`).then((r) => r.data);

/* ------------------------------- Hero -------------------------------- */

export const getBlogHero = () =>
  adminBlogsAxios.get("/hero").then((r) => r.data);

export const updateBlogHero = (payload) =>
  adminBlogsAxios.put("/hero", payload).then((r) => r.data);
