import blogAxios from "./blogAxios";

// export async function getPublicBlogCategories() {
//   const { data } = await blogAxios.get("/display-categories");
//   return data;
// }

export async function getBlogPageBootstrap() {
  const { data } = await blogAxios.get("/page-bootstrap");
  return data;
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
