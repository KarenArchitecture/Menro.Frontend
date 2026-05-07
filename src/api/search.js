import publicAxios from "./publicAxios";

// publicAxios baseURL is already /api/public in your project
export async function publicSearch(term, take = 50) {
    const res = await publicAxios.get("/search", { params: { term, take } });
    return res.data; // { term, items }
}
