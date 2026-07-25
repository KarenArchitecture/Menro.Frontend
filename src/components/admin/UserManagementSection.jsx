import { useCallback, useEffect, useState } from "react";
import {
  getUsers,
  getUserRoles,
  getUserById,
  updateUserRoles,
  apiErrorMessage,
} from "../../api/adminUsers";
import "../../assets/css/admin/userMngmnt.css";

/* ======================================================================
 * UserManagementSection
 * ----------------------------------------------------------------------
 * Admin panel listing every registered user (the `User : IdentityUser`
 * entity). Built to match the structure/conventions of
 * BlogManagementSection.jsx's PostsPane 1:1 (toolbar, pagination, table,
 * modals) — see src/api/adminUsers.js for the full REST contract.
 * ==================================================================== */

const PAGE_SIZE = 20;

function initials(fullName) {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

function toPersianDigits(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

export default function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // searchDraft is bound to the input as the user types; searchTerm only
  // updates on submit (button / Enter) — identical pattern to the blog
  // posts search, per the request.
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [viewUser, setViewUser] = useState(null);
  const [viewDetailLoading, setViewDetailLoading] = useState(false);
  const [viewDetailError, setViewDetailError] = useState("");

  const [rolesModalUser, setRolesModalUser] = useState(null);
  const [rolesDraft, setRolesDraft] = useState([]);
  const [savingRoles, setSavingRoles] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const reloadUsers = useCallback(async () => {
    const data = await getUsers({
      search: searchTerm.trim() || undefined,
      role: roleFilter,
      page,
      pageSize: PAGE_SIZE,
    });
    setUsers(data.items);
    setTotalPages(data.totalPages);
    setTotalCount(data.totalCount);
    return data;
  }, [searchTerm, roleFilter, page]);

  // Load the roles dropdown once — it powers both the list filter and the
  // "ویرایش نقش‌ها" modal, and doesn't need to change on every page/filter.
  useEffect(() => {
    getUserRoles()
      .then(setAvailableRoles)
      .catch(() => setAvailableRoles([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setApiError("");
        const data = await getUsers({
          search: searchTerm.trim() || undefined,
          role: roleFilter,
          page,
          pageSize: PAGE_SIZE,
        });
        if (!cancelled) {
          setUsers(data.items);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        if (!cancelled)
          setApiError(
            apiErrorMessage(err, "بارگذاری کاربران با خطا مواجه شد."),
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchTerm, roleFilter, page]);

  // Reset to page 1 whenever search/filters change.
  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchDraft);
  };

  /* ------------------------------ view modal ------------------------------ */

  const openView = (user) => {
    setViewUser(user);
    setViewDetailError("");
    setViewDetailLoading(true);
    getUserById(user.id)
      .then((fresh) => setViewUser(fresh))
      .catch((err) =>
        setViewDetailError(
          apiErrorMessage(err, "دریافت اطلاعات کامل کاربر با خطا مواجه شد."),
        ),
      )
      .finally(() => setViewDetailLoading(false));
  };

  /* --------------------------- edit roles modal ---------------------------- */

  const openRolesModal = (user) => {
    setRolesError("");
    setRolesModalUser(user);
    setRolesDraft(user.roles);
  };

  const toggleDraftRole = (role) => {
    setRolesDraft((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const saveRoles = async () => {
    setSavingRoles(true);
    setRolesError("");
    try {
      const updated = await updateUserRoles(rolesModalUser.id, rolesDraft);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      if (viewUser?.id === updated.id) setViewUser(updated);
      setRolesModalUser(null);
    } catch (err) {
      setRolesError(apiErrorMessage(err, "ذخیره نقش‌ها با خطا مواجه شد."));
    } finally {
      setSavingRoles(false);
    }
  };

  return (
    <div id="user-management-view" className="blog-mgmt user-mgmt">
      <div className="view-header">
        <h2 className="content-title">مدیریت کاربران</h2>
      </div>

      <div className="panel">
        {apiError && <span className="form-error">{apiError}</span>}

        <div className="blog-mgmt__posts-toolbar">
          <div className="blog-mgmt__posts-toolbar-group">
            {!loading && totalPages > 1 && (
              <div className="blog-mgmt__pagination">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  قبلی
                </button>
                <span className="blog-mgmt__pagination-label">
                  صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}{" "}
                  ({toPersianDigits(totalCount)} کاربر)
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  بعدی
                </button>
              </div>
            )}

            <form
              className="blog-mgmt__search-box"
              onSubmit={handleSearchSubmit}
            >
              <input
                type="text"
                className="mh-input"
                placeholder="جستجو در نام، ایمیل یا شماره تماس..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
              />
              <button
                type="submit"
                className="blog-mgmt__search-submit"
                title="جستجو"
                aria-label="جستجو"
              >
                <i className="fas fa-search" />
              </button>
            </form>
          </div>

          <div className="blog-mgmt__posts-toolbar-group">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ maxWidth: 200 }}
            >
              <option value="all">همه نقش‌ها</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container blog-mgmt__posts-scroll">
          <table>
            <thead>
              <tr>
                <th>تصویر</th>
                <th>نام کامل</th>
                <th>نقش‌ها</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-hint">در حال بارگذاری...</div>
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-hint">
                      هیچ کاربری با این فیلتر پیدا نشد.
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-mgmt__avatar">
                        {user.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt={user.fullName} />
                        ) : initials(user.fullName) ? (
                          <span className="user-mgmt__avatar-initials">
                            {initials(user.fullName)}
                          </span>
                        ) : (
                          <i className="fas fa-circle-user" />
                        )}
                      </div>
                    </td>
                    <td>{user.fullName}</td>
                    <td>
                      <div className="user-mgmt__roles">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <span key={role} className="user-mgmt__role-chip">
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="user-mgmt__role-chip user-mgmt__role-chip--muted">
                            کاربر عادی
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        title="مشاهده اطلاعات کاربر"
                        onClick={() => openView(user)}
                      >
                        <i className="fas fa-eye" />
                      </button>
                      <button
                        className="btn-icon"
                        title="ویرایش نقش‌ها"
                        onClick={() => openRolesModal(user)}
                      >
                        <i className="fas fa-user-shield" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------ VIEW MODAL ------------------------------ */}
      {viewUser && (
        <div className="modal-backdrop" onClick={() => setViewUser(null)}>
          <div
            className="modal user-mgmt__view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>اطلاعات کاربر</h4>
              <button className="btn-icon" onClick={() => setViewUser(null)}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="user-mgmt__view-header">
              <div className="user-mgmt__avatar user-mgmt__avatar--lg">
                {viewUser.profileImageUrl ? (
                  <img src={viewUser.profileImageUrl} alt={viewUser.fullName} />
                ) : initials(viewUser.fullName) ? (
                  <span className="user-mgmt__avatar-initials">
                    {initials(viewUser.fullName)}
                  </span>
                ) : (
                  <i className="fas fa-circle-user" />
                )}
              </div>
              <div className="user-mgmt__view-header-text">
                <strong>{viewUser.fullName}</strong>
                {viewUser.userName && (
                  <span className="user-mgmt__muted">@{viewUser.userName}</span>
                )}
              </div>
            </div>

            {viewDetailError && (
              <span className="form-error">{viewDetailError}</span>
            )}

            <div className="user-mgmt__detail-grid">
              <div className="user-mgmt__detail-item">
                <span>ایمیل</span>
                <strong>
                  {viewUser.email || "—"}
                  {viewUser.email && (
                    <i
                      className={`fas ${
                        viewUser.emailConfirmed
                          ? "fa-circle-check user-mgmt__verified"
                          : "fa-circle-xmark user-mgmt__unverified"
                      }`}
                      title={
                        viewUser.emailConfirmed
                          ? "ایمیل تایید شده"
                          : "ایمیل تایید نشده"
                      }
                    />
                  )}
                </strong>
              </div>
              <div className="user-mgmt__detail-item">
                <span>شماره تماس</span>
                <strong>
                  {viewUser.phoneNumber || "—"}
                  {viewUser.phoneNumber && (
                    <i
                      className={`fas ${
                        viewUser.phoneNumberConfirmed
                          ? "fa-circle-check user-mgmt__verified"
                          : "fa-circle-xmark user-mgmt__unverified"
                      }`}
                      title={
                        viewUser.phoneNumberConfirmed
                          ? "شماره تایید شده"
                          : "شماره تایید نشده"
                      }
                    />
                  )}
                </strong>
              </div>
              <div className="user-mgmt__detail-item user-mgmt__detail-item--full">
                <span>نقش‌ها</span>
                <div className="user-mgmt__roles">
                  {viewUser.roles.length > 0 ? (
                    viewUser.roles.map((role) => (
                      <span key={role} className="user-mgmt__role-chip">
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="user-mgmt__role-chip user-mgmt__role-chip--muted">
                      کاربر عادی
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="user-mgmt__stats-row">
              <div className="user-mgmt__stat">
                <strong>
                  {viewDetailLoading
                    ? "…"
                    : toPersianDigits(viewUser.restaurantsCount)}
                </strong>
                <span>رستوران</span>
              </div>
              <div className="user-mgmt__stat">
                <strong>
                  {viewDetailLoading
                    ? "…"
                    : toPersianDigits(viewUser.ordersCount)}
                </strong>
                <span>سفارش</span>
              </div>
              <div className="user-mgmt__stat">
                <strong>
                  {viewDetailLoading
                    ? "…"
                    : toPersianDigits(viewUser.favoriteFoodsCount)}
                </strong>
                <span>علاقه‌مندی</span>
              </div>
            </div>

            <p className="user-mgmt__muted-text">
              جزئیات بیشتر (تاریخچه سفارش‌ها، رستوران‌های ثبت‌شده و ...) در
              نسخه‌ی بعدی این مودال اضافه می‌شود.
            </p>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setViewUser(null)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------- EDIT ROLES MODAL --------------------------- */}
      {rolesModalUser && (
        <div
          className="modal-backdrop"
          onClick={() => !savingRoles && setRolesModalUser(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>ویرایش نقش‌های {rolesModalUser.fullName}</h4>
              <button
                className="btn-icon"
                onClick={() => setRolesModalUser(null)}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="form-vertical">
              {availableRoles.length === 0 && (
                <div className="empty-hint">
                  هیچ نقشی در سیستم تعریف نشده است.
                </div>
              )}
              <div className="user-mgmt__role-picker">
                {availableRoles.map((role) => (
                  <label key={role} className="user-mgmt__role-option">
                    <input
                      type="checkbox"
                      checked={rolesDraft.includes(role)}
                      onChange={() => toggleDraftRole(role)}
                    />
                    {role}
                  </label>
                ))}
              </div>
              {rolesError && <span className="form-error">{rolesError}</span>}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                disabled={savingRoles}
                onClick={() => setRolesModalUser(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-primary"
                disabled={savingRoles}
                onClick={saveRoles}
              >
                {savingRoles ? "در حال ذخیره..." : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
