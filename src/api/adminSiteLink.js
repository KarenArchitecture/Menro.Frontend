import adminSiteLinkAxios from "./adminSiteLinkAxios.js";

/* ==========================================================================
 * Mirrors AdminMenuItemsController.cs 1:1:
 *   GET    /                        -> getAllMenuItems      (all locations, admin overview)
 *   GET    /{location}              -> getMenuItemsByLocation (single location, includes inactive)
 *   POST   /                        -> createMenuItem
 *   PUT    /{id}                    -> updateMenuItem
 *   DELETE /{id}                    -> deleteMenuItem
 *   PUT    /{location}/reorder      -> reorderMenuItems
 *
 * MenuItemDto.location comes back from the server as a string (Header /
 * Footer / Hamburger) via entity.Location.ToString() on the backend.
 * ========================================================================== */

export const getAllMenuItems = () =>
  adminSiteLinkAxios.get("/").then((r) => r.data); // MenuItemDto[]

export const getMenuItemsByLocation = (location) =>
  adminSiteLinkAxios.get(`/${location}`).then((r) => r.data); // MenuItemDto[]

// location must match MenuLocation enum name ("Header" | "Footer" | "Hamburger").
export const createMenuItem = ({ location, title, url, isActive, parentId }) =>
  adminSiteLinkAxios
    .post("/", { location, title, url, isActive, parentId })
    .then((r) => r.data); // MenuItemDto

export const updateMenuItem = (id, { title, url, isActive, parentId }) =>
  adminSiteLinkAxios
    .put(`/${id}`, { title, url, isActive, parentId })
    .then((r) => r.data); // MenuItemDto

export const deleteMenuItem = (id) =>
  adminSiteLinkAxios.delete(`/${id}`).then((r) => r.data);

// orderedIds must be the FULL ordered id list for that location (backend
// rewrites Order = index+1 for every id it recognizes — matches
// MenuItemService.ReorderAsync).
export const reorderMenuItems = (location, orderedIds) =>
  adminSiteLinkAxios
    .put(`/${location}/reorder`, { orderedIds })
    .then((r) => r.data);
