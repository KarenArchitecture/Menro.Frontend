import publicAxios from "./publicAxios";

// publicAxios baseURL is already /api/public in your project
export async function publicSearch(term, take = 50) {
    const res = await publicAxios.get("/search", { params: { term, take } });
    return res.data; // { term, items }
}

export async function publicSearchPaged({
    term,
    type,
    cursor = null,
    take = 12,
    categoryId = null,
}) {
    const res = await publicAxios.get("/search/paged", {
        params: {
            term,
            type,
            take,
            cursor: cursor || undefined,
            categoryId: categoryId || undefined,
        },
    });
    return res.data; // { items, nextCursor, hasMore }
}
