import adminUsersAxios from "./adminUsersAxios";

/* ==========================================================================
 * Backend contract this file expects (mirrors AdminUsersController +
 * UserManagementDTOs + UserManagementService):
 *
 * GET /api/admin/users
 *   query: search?, role?, page (default 1), pageSize (default 20)
 *   - `search` matches against FullName, Email, PhoneNumber and UserName (OR),
 *     same spirit as the blog posts title search.
 *   response: {
 *     items: [{
 *       id, fullName, userName, profileImageUrl, email, phoneNumber,
 *       emailConfirmed, phoneNumberConfirmed,  // already on IdentityUser
 *       roles: string[],            // e.g. ["مدیر", "رستوران‌دار"]
 *       restaurantsCount, ordersCount, favoriteFoodsCount
 *     }],
 *     page, pageSize, totalCount, totalPages
 *   }
 *
 * GET /api/admin/users/roles
 *   response: string[] — every role name that exists in the system
 *   (powers both the list filter dropdown and the "ویرایش نقش‌ها" modal's
 *   checkbox list; deliberately its own endpoint so it can be cached /
 *   loaded once instead of being re-sent on every user row).
 *
 * GET /api/admin/users/{id}
 *   response: same shape as a list item (see above) — used to refresh a
 *   single user's detail inside the "مشاهده اطلاعات کاربر" modal without
 *   re-fetching the whole page.
 *
 * PUT /api/admin/users/{id}/roles
 *   body: { roles: string[] }
 *   response: updated list-item-shaped user
 * ========================================================================== */

export const apiErrorMessage = (
  err,
  fallback = "خطایی رخ داد. دوباره تلاش کنید.",
) => err?.response?.data?.message || err?.response?.data?.title || fallback;

const mapUserFromApi = (dto) => ({
  id: dto.id,
  fullName: dto.fullName,
  userName: dto.userName || "",
  profileImageUrl: dto.profileImageUrl || "",
  email: dto.email || "",
  phoneNumber: dto.phoneNumber || "",
  emailConfirmed: !!dto.emailConfirmed,
  phoneNumberConfirmed: !!dto.phoneNumberConfirmed,
  roles: dto.roles || [],
  restaurantsCount: dto.restaurantsCount ?? 0,
  ordersCount: dto.ordersCount ?? 0,
  favoriteFoodsCount: dto.favoriteFoodsCount ?? 0,
});

export const getUsers = ({ search, role, page = 1, pageSize = 20 } = {}) =>
  adminUsersAxios
    .get("", {
      params: {
        search: search || undefined,
        role: role && role !== "all" ? role : undefined,
        page,
        pageSize,
      },
    })
    .then((r) => ({
      items: r.data.items.map(mapUserFromApi),
      page: r.data.page,
      pageSize: r.data.pageSize,
      totalCount: r.data.totalCount,
      totalPages: r.data.totalPages,
    }));

export const getUserRoles = () =>
  adminUsersAxios.get("/roles").then((r) => r.data);

export const getUserById = (id) =>
  adminUsersAxios.get(`/${id}`).then((r) => mapUserFromApi(r.data));

export const updateUserRoles = (id, roles) =>
  adminUsersAxios
    .put(`/${id}/roles`, { roles })
    .then((r) => mapUserFromApi(r.data));
