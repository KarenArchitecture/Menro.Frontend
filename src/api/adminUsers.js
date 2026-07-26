import adminUsersAxios from "./adminUsersAxios";

/* ==========================================================================
 * Backend contract this file expects (mirrors AdminUsersController +
 * UserManagementDTOs + UserManagementService):
 *
 * GET /api/admin/users
 *   query: search?, role?, page (default 1), pageSize (default 20)
 *   response: {
 *     items: [{ id, fullName, profileImageUrl, phoneNumber, roles }],
 *     page, pageSize, totalCount, totalPages
 *   }
 *
 * GET /api/admin/users/roles
 *   response: string[]
 *
 * GET /api/admin/users/{id}
 *   response: {
 *     id, fullName, userName, profileImageUrl, email, phoneNumber,
 *     emailConfirmed, phoneNumberConfirmed, roles,
 *     restaurantsCount, ordersCount, favoriteFoodsCount
 *   }
 *
 * PUT /api/admin/users/{id}/roles
 *   body: { roles: string[] }
 *   response: string[] — just the updated roles, nothing else
 * ========================================================================== */

export const apiErrorMessage = (
  err,
  fallback = "خطایی رخ داد. دوباره تلاش کنید.",
) => err?.response?.data?.message || err?.response?.data?.title || fallback;

const mapUserListItem = (dto) => ({
  id: dto.id,
  fullName: dto.fullName,
  profileImageUrl: dto.profileImageUrl || "",
  phoneNumber: dto.phoneNumber || "",
  roles: dto.roles || [],
});

const mapUserDetail = (dto) => ({
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
      items: r.data.items.map(mapUserListItem),
      page: r.data.page,
      pageSize: r.data.pageSize,
      totalCount: r.data.totalCount,
      totalPages: r.data.totalPages,
    }));

export const getUserRoles = () =>
  adminUsersAxios.get("/roles").then((r) => r.data);

export const getUserById = (id) =>
  adminUsersAxios.get(`/${id}`).then((r) => mapUserDetail(r.data));

export const updateUserRoles = (id, roles) =>
  adminUsersAxios.put(`/${id}/roles`, { roles }).then((r) => r.data); // string[]
