import blogAxios from "./blogAxios";

export async function getBlogPageBootstrap() {
  const { data } = await blogAxios.get("/page-bootstrap");
  return data;
}

// Backs BlogPostPage.jsx. Combines the post itself + suggested/sidebar tags
// (reused from the main blog page bootstrap - not tied to any specific
// post) + related posts (dedicated backend endpoint). popularPosts isn't
// wired to a real backend endpoint yet - stays empty for now (next step).
export async function getBlogPostBootstrap(slug) {
  const [postRes, pageBootstrap, relatedRes, popularRes] = await Promise.all([
    blogAxios.get(`/posts/${slug}`),
    getBlogPageBootstrap(),
    blogAxios.get(`/posts/${slug}/related`, { params: { count: 3 } }),
    blogAxios.get(`/posts/${slug}/popular`, { params: { count: 5 } }),
  ]);

  return {
    post: postRes.data,
    relatedPosts: relatedRes.data,
    popularPosts: popularRes.data,
    sidebarTags: pageBootstrap?.sidebarTags ?? [],
  };
}

// Fire-and-forget view tracking. Backend dedupes per visitor (IP+UA hash,
// 24h cache window) - safe to call once per page load, no response body
// to handle either way.
export async function trackBlogPostView(slug) {
  await blogAxios.patch(`/posts/${slug}/view`);
}

export async function toggleBlogPostLike(slug) {
  const { data } = await blogAxios.post(`/posts/${slug}/like`);
  return data; // { isLiked, likeCount } - shape depends on BlogPostLikeResponse
}

// sort: "Newest" | "MostPopular" | "MostViewed" — must match BlogPostSortOrder member names
export async function getBlogPosts({
  search,
  categoryId,
  sort,
  page = 1,
  pageSize = 12,
} = {}) {
  const { data } = await blogAxios.get("/posts", {
    params: { search, categoryId, sort, page, pageSize },
  });
  return data; // { items, page, pageSize, totalCount, totalPages }
}

// Backs the Blog Result page (search / tag / category entry points), all of
// which share PublicBlogPostsController. Only one of search/categorySlug/
// tagSlug is expected to be set at a time by the result page today, but the
// endpoint itself allows combining them.
// sort: "Newest" | "MostPopular" | "MostViewed" — must match BlogPostSortOrder member names
export async function getBlogResultPosts({
  search,
  categorySlug,
  tagSlug,
  sort,
  page = 1,
  pageSize = 12,
} = {}) {
  const { data } = await blogAxios.get("/posts", {
    params: { search, categorySlug, tagSlug, sort, page, pageSize },
  });
  return data; // { items, page, pageSize, totalCount, totalPages }
}
