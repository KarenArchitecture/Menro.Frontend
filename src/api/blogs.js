import blogAxios from "./blogAxios";

// export async function getPublicBlogCategories() {
//   const { data } = await blogAxios.get("/display-categories");
//   return data;
// }

export async function getBlogPageBootstrap() {
  const { data } = await blogAxios.get("/page-bootstrap");
  return data;
}

// Backs BlogPostPage.jsx. Currently the backend endpoint (GET
// /api/public/blog/{slug}) only returns the post itself
// (BlogPostPublicDetailResponse) - relatedPosts/popularPosts/sidebarTags
// aren't implemented on the backend yet (next steps), so we wrap the flat
// response here to match what BlogPostPage/RelatedPosts/BlogPostSidebar
// already expect, with empty arrays as placeholders for now. Once the
// backend grows those fields, swap this to read them straight from `data`
// instead of hardcoding empty arrays.
export async function getBlogPostBootstrap(slug) {
  const { data } = await blogAxios.get(`/posts/${slug}`);
  return {
    post: data,
    relatedPosts: [],
    popularPosts: [],
    sidebarTags: [],
  };
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
