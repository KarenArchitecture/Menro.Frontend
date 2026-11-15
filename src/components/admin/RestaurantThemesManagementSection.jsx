import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminRestaurantTheme,
  deleteAdminRestaurantTheme,
  getAdminRestaurantThemes,
  setAdminRestaurantThemeActive,
  updateAdminRestaurantTheme,
} from "../../api/adminRestaurantThemes";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../assets/css/admin/restaurantThemesManagementSection.css";

const QUERY_KEY = ["admin-restaurant-themes"];

const COLOR_GROUPS = [
  {
    title: "ساختار و پس‌زمینه",
    description: "رنگ‌های اصلی صفحه، نوار بالایی و سطح کارت‌ها",
    fields: [
      { key: "bgColor", label: "پس‌زمینه صفحه" },
      { key: "barBgColor", label: "پس‌زمینه نوار بالا" },
      { key: "surfaceColor", label: "سطح کارت و پنل" },
      { key: "cardStartColor", label: "ابتدای گرادیان کارت" },
      { key: "cardEndColor", label: "انتهای گرادیان کارت" },
    ],
  },
  {
    title: "متن و مرزبندی",
    description: "رنگ نوشته‌های اصلی، توضیحات و خطوط جداکننده",
    fields: [
      { key: "textColor", label: "متن اصلی" },
      { key: "textMutedColor", label: "متن کم‌رنگ" },
      { key: "borderColor", label: "کادر و مرزها" },
    ],
  },
  {
    title: "رنگ‌های تأکیدی و دکمه‌ها",
    description: "رنگ اصلی رابط و دکمه‌های بخش معرفی",
    fields: [
      { key: "primaryColor", label: "رنگ اصلی" },
      { key: "onPrimaryColor", label: "متن روی رنگ اصلی" },
      { key: "heroBtnStartColor", label: "ابتدای گرادیان دکمه" },
      { key: "heroBtnEndColor", label: "انتهای گرادیان دکمه" },
    ],
  },
  {
    title: "جست‌وجو",
    description: "رنگ پس‌زمینه، متن و کادر جست‌وجو",
    fields: [
      { key: "searchBgColor", label: "پس‌زمینه جست‌وجو" },
      { key: "searchTextColor", label: "متن جست‌وجو" },
      { key: "searchBorderColor", label: "کادر جست‌وجو" },
    ],
  },
];

const COLOR_FIELDS = COLOR_GROUPS.flatMap((group) => group.fields);
const COLOR_PATTERN = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const DEFAULT_THEME = {
  name: "",
  description: "",
  sortOrder: 0,
  isActive: true,
  bgColor: "#0C0F14",
  barBgColor: "#0C0F14",
  surfaceColor: "#1E232A",
  cardStartColor: "#262B33",
  cardEndColor: "#161B20",
  textColor: "#FAFAF4",
  textMutedColor: "#A5ADC0",
  borderColor: "#FAFAF410",
  primaryColor: "#FF683C",
  onPrimaryColor: "#FAFAF4",
  heroBtnStartColor: "#262B33",
  heroBtnEndColor: "#161B20",
  searchBgColor: "#0C0F14",
  searchTextColor: "#A5ADC0",
  searchBorderColor: "#00000000",
};

function getFormValues(theme) {
  if (!theme) return { ...DEFAULT_THEME };

  return {
    ...DEFAULT_THEME,
    name: theme.name ?? "",
    description: theme.description ?? "",
    sortOrder: Number.isInteger(Number(theme.sortOrder))
      ? Number(theme.sortOrder)
      : 0,
    isActive: Boolean(theme.isActive),
    ...Object.fromEntries(
      COLOR_FIELDS.map((field) => [
        field.key,
        theme[field.key] ?? DEFAULT_THEME[field.key],
      ]),
    ),
  };
}

function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  return (
    data?.message ||
    (typeof data === "string" ? data : null) ||
    error?.message ||
    fallback
  );
}

function getPreviewStyle(theme) {
  return {
    "--rta-bg": theme.bgColor || DEFAULT_THEME.bgColor,
    "--rta-bar": theme.barBgColor || DEFAULT_THEME.barBgColor,
    "--rta-surface": theme.surfaceColor || DEFAULT_THEME.surfaceColor,
    "--rta-card-start": theme.cardStartColor || DEFAULT_THEME.cardStartColor,
    "--rta-card-end": theme.cardEndColor || DEFAULT_THEME.cardEndColor,
    "--rta-text": theme.textColor || DEFAULT_THEME.textColor,
    "--rta-muted": theme.textMutedColor || DEFAULT_THEME.textMutedColor,
    "--rta-border": theme.borderColor || DEFAULT_THEME.borderColor,
    "--rta-primary": theme.primaryColor || DEFAULT_THEME.primaryColor,
    "--rta-on-primary": theme.onPrimaryColor || DEFAULT_THEME.onPrimaryColor,
    "--rta-hero-start":
      theme.heroBtnStartColor || DEFAULT_THEME.heroBtnStartColor,
    "--rta-hero-end": theme.heroBtnEndColor || DEFAULT_THEME.heroBtnEndColor,
    "--rta-search-bg": theme.searchBgColor || DEFAULT_THEME.searchBgColor,
    "--rta-search-text":
      theme.searchTextColor || DEFAULT_THEME.searchTextColor,
    "--rta-search-border":
      theme.searchBorderColor || DEFAULT_THEME.searchBorderColor,
  };
}

function ThemePreview({ theme, compact = false }) {
  return (
    <div
      className={"rta-preview" + (compact ? " rta-preview--compact" : "")}
      style={getPreviewStyle(theme)}
      aria-label={"پیش‌نمایش قالب " + (theme.name || "جدید")}
    >
      <div className="rta-preview__bar">
        <span className="rta-preview__brand">منرو</span>
        <span className="rta-preview__restaurant">
          {theme.name || "رستوران نمونه"}
        </span>
        <span className="rta-preview__menu-icon">
          <i className="fas fa-bars" />
        </span>
      </div>

      <div className="rta-preview__content">
        <div className="rta-preview__hero">
          <div className="rta-preview__hero-copy">
            <strong>طعم خوب، انتخاب آسان</strong>
            <span>منوی اختصاصی رستوران شما</span>
          </div>
          <span className="rta-preview__hero-button">مشاهده منو</span>
        </div>

        <div className="rta-preview__search">
          <i className="fas fa-search" />
          <span>جست‌وجو در منو...</span>
        </div>

        <div className="rta-preview__product">
          <div className="rta-preview__food-art">
            <i className="fas fa-utensils" />
          </div>
          <div className="rta-preview__product-copy">
            <strong>پیتزا مخصوص</strong>
            <span>قارچ، پنیر، زیتون و فلفل دلمه‌ای</span>
            <b>۲۸۰,۰۰۰ تومان</b>
          </div>
          <span className="rta-preview__add">+</span>
        </div>
      </div>
    </div>
  );
}

function ColorField({ field, value, onChange }) {
  const isValid = COLOR_PATTERN.test(value || "");
  const pickerValue =
    isValid && value.length >= 7 ? value.slice(0, 7) : "#000000";

  return (
    <div className="rta-color-field">
      <label htmlFor={"rta-color-" + field.key}>{field.label}</label>
      <div className="rta-color-field__control">
        <input
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(field.key, event.target.value.toUpperCase())}
          aria-label={"انتخاب " + field.label}
        />
        <input
          id={"rta-color-" + field.key}
          type="text"
          dir="ltr"
          spellCheck="false"
          autoComplete="off"
          maxLength={9}
          value={value}
          placeholder="#RRGGBB"
          onChange={(event) => onChange(field.key, event.target.value)}
        />
      </div>
      {!isValid && value !== "" && (
        <small className="rta-color-field__error">
          فرمت مجاز: #RRGGBB یا #RRGGBBAA
        </small>
      )}
    </div>
  );
}

export default function RestaurantThemesManagementSection() {
  useDocumentTitle("قالب‌های منرو");

  const { notify, confirmModal } = useGlobalUI();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [form, setForm] = useState({ ...DEFAULT_THEME });

  const {
    data: themes = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getAdminRestaurantThemes,
  });

  const filteredThemes = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fa-IR");

    return [...themes]
      .filter((theme) => {
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && theme.isActive) ||
          (statusFilter === "inactive" && !theme.isActive);
        const searchableText = (
          (theme.name || "") +
          " " +
          (theme.description || "")
        ).toLocaleLowerCase("fa-IR");

        return matchesStatus && searchableText.includes(normalizedSearch);
      })
      .sort(
        (a, b) =>
          (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
          (a.name || "").localeCompare(b.name || "", "fa"),
      );
  }, [themes, search, statusFilter]);

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      id
        ? updateAdminRestaurantTheme(id, payload)
        : createAdminRestaurantTheme(payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      notify({
        type: "success",
        message: variables.id
          ? "قالب با موفقیت ویرایش شد."
          : "قالب جدید با موفقیت ساخته شد.",
      });
      setEditorOpen(false);
      setEditingTheme(null);
    },
    onError: (mutationError) => {
      notify({
        type: "error",
        title: "ذخیره قالب ناموفق بود",
        message: getApiErrorMessage(
          mutationError,
          "در ذخیره اطلاعات قالب مشکلی رخ داد.",
        ),
      });
    },
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, active }) =>
      setAdminRestaurantThemeActive(id, active),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      notify({
        type: "success",
        message: variables.active
          ? "قالب فعال شد و در فهرست انتخاب رستوران‌ها قرار می‌گیرد."
          : "قالب غیرفعال شد و دیگر قابل انتخاب نیست.",
      });
    },
    onError: (mutationError) => {
      notify({
        type: "error",
        message: getApiErrorMessage(
          mutationError,
          "تغییر وضعیت قالب انجام نشد.",
        ),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminRestaurantTheme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      notify({ type: "success", message: "قالب حذف شد." });
    },
    onError: (mutationError) => {
      notify({
        type: "error",
        title: "حذف قالب انجام نشد",
        message: getApiErrorMessage(
          mutationError,
          "ممکن است این قالب به یک یا چند رستوران اختصاص داده شده باشد.",
        ),
      });
    },
  });

  const activeCount = themes.filter((theme) => theme.isActive).length;
  const inactiveCount = themes.length - activeCount;

  const openCreateEditor = () => {
    setEditingTheme(null);
    setForm({ ...DEFAULT_THEME });
    setEditorOpen(true);
  };

  const openEditEditor = (theme) => {
    setEditingTheme(theme);
    setForm(getFormValues(theme));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (saveMutation.isPending) return;
    setEditorOpen(false);
    setEditingTheme(null);
  };

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      notify({ type: "warning", message: "نام قالب را وارد کنید." });
      return;
    }
    if (form.name.trim().length > 50) {
      notify({
        type: "warning",
        message: "نام قالب نمی‌تواند بیشتر از ۵۰ کاراکتر باشد.",
      });
      return;
    }
    if ((form.description || "").length > 150) {
      notify({
        type: "warning",
        message: "توضیحات نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.",
      });
      return;
    }
    if (
      !Number.isInteger(Number(form.sortOrder)) ||
      Number(form.sortOrder) < 0
    ) {
      notify({
        type: "warning",
        message: "ترتیب نمایش باید یک عدد صحیح و نامنفی باشد.",
      });
      return;
    }

    const invalidColor = COLOR_FIELDS.find(
      (field) => !COLOR_PATTERN.test(form[field.key] || ""),
    );
    if (invalidColor) {
      notify({
        type: "warning",
        message: "رنگ «" + invalidColor.label + "» معتبر نیست.",
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      sortOrder: Number(form.sortOrder),
      isActive: Boolean(form.isActive),
    };

    COLOR_FIELDS.forEach((field) => {
      payload[field.key] = form[field.key].toUpperCase();
    });

    saveMutation.mutate({
      id: editingTheme?.id ?? null,
      payload,
    });
  };

  const handleDelete = async (theme) => {
    const confirmed = await confirmModal({
      title: "حذف قالب",
      message:
        "قالب «" +
        theme.name +
        "» حذف شود؟ اگر این قالب به رستورانی اختصاص داده شده باشد، سرور اجازه حذف آن را نمی‌دهد.",
      confirmText: "حذف قالب",
      cancelText: "انصراف",
      danger: true,
    });

    if (confirmed) deleteMutation.mutate(theme.id);
  };

  return (
    <div className="rta-admin" dir="rtl">
      <header className="rta-page-header">
        <div>
          <span className="rta-eyebrow">
            <i className="fas fa-swatchbook" />
            مدیریت ظاهر رستوران‌ها
          </span>
          <h2 className="content-title">قالب‌های منرو</h2>
          <p>
            قالب‌های رنگی قابل انتخاب برای صفحات عمومی رستوران‌ها را طراحی و
            مدیریت کنید.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary rta-create-button"
          onClick={openCreateEditor}
        >
          <i className="fas fa-plus" />
          ساخت قالب جدید
        </button>
      </header>

      <section className="rta-stats" aria-label="آمار قالب‌ها">
        <div className="rta-stat">
          <span className="rta-stat__icon rta-stat__icon--total">
            <i className="fas fa-palette" />
          </span>
          <div>
            <span>مجموع قالب‌ها</span>
            <strong>{themes.length}</strong>
          </div>
        </div>
        <div className="rta-stat">
          <span className="rta-stat__icon rta-stat__icon--active">
            <i className="fas fa-check-circle" />
          </span>
          <div>
            <span>قالب‌های فعال</span>
            <strong>{activeCount}</strong>
          </div>
        </div>
        <div className="rta-stat">
          <span className="rta-stat__icon rta-stat__icon--inactive">
            <i className="fas fa-eye-slash" />
          </span>
          <div>
            <span>قالب‌های غیرفعال</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>
      </section>

      <section className="rta-library panel">
        <div className="rta-library__toolbar">
          <div>
            <h3>کتابخانه قالب‌ها</h3>
            <p className="panel-subtitle">
              رنگ‌ها را ویرایش کنید، پیش‌نمایش بگیرید و وضعیت انتشار را تغییر دهید.
            </p>
          </div>
          <div className="rta-toolbar-controls">
            <label className="rta-search">
              <i className="fas fa-search" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجوی نام یا توضیحات..."
                aria-label="جست‌وجوی قالب‌ها"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="فیلتر وضعیت قالب"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فقط فعال</option>
              <option value="inactive">فقط غیرفعال</option>
            </select>
            <button
              type="button"
              className="btn rta-refresh-button"
              onClick={() => refetch()}
              disabled={isFetching}
              title="دریافت دوباره فهرست"
            >
              <i className={"fas fa-sync-alt" + (isFetching ? " fa-spin" : "")} />
              <span>به‌روزرسانی</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="rta-state">
            <span className="submit-spinner" aria-hidden="true" />
            <span>در حال دریافت قالب‌ها...</span>
          </div>
        ) : isError ? (
          <div className="rta-state rta-state--error" role="alert">
            <i className="fas fa-exclamation-triangle" />
            <strong>دریافت قالب‌ها ناموفق بود.</strong>
            <span>
              {getApiErrorMessage(error, "اتصال به سرویس مدیریت قالب برقرار نشد.")}
            </span>
            <button type="button" className="btn" onClick={() => refetch()}>
              تلاش دوباره
            </button>
          </div>
        ) : filteredThemes.length === 0 ? (
          <div className="rta-state">
            <i className="fas fa-swatchbook" />
            <strong>
              {themes.length === 0
                ? "هنوز قالبی ثبت نشده است."
                : "قالبی با این فیلتر پیدا نشد."}
            </strong>
            <span>
              {themes.length === 0
                ? "اولین قالب منرو را بسازید تا در فهرست نمایش داده شود."
                : "عبارت جست‌وجو یا فیلتر وضعیت را تغییر دهید."}
            </span>
            {themes.length === 0 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreateEditor}
              >
                ساخت اولین قالب
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
        ) : (
          <div className="rta-theme-grid">
            {filteredThemes.map((theme) => (
              <article className="rta-theme-card" key={theme.id}>
                <div className="rta-theme-card__preview">
                  <ThemePreview theme={theme} compact />
                  <span
                    className={
                      "rta-status " +
                      (theme.isActive
                        ? "rta-status--active"
                        : "rta-status--inactive")
                    }
                  >
                    <i
                      className={
                        theme.isActive
                          ? "fas fa-check-circle"
                          : "fas fa-pause-circle"
                      }
                    />
                    {theme.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>

                <div className="rta-theme-card__body">
                  <div className="rta-theme-card__heading">
                    <div>
                      <h4>{theme.name}</h4>
                      <p>{theme.description || "بدون توضیحات"}</p>
                    </div>
                    <span className="rta-theme-card__id">
                      #{theme.id}
                    </span>
                  </div>

                  <div className="rta-theme-card__swatches" aria-label="رنگ‌های قالب">
                    {COLOR_FIELDS.map((field) => (
                      <span
                        key={field.key}
                        title={field.label + ": " + theme[field.key]}
                        style={{ backgroundColor: theme[field.key] }}
                      />
                    ))}
                  </div>

                  <div className="rta-theme-card__meta">
                    <span>
                      <i className="fas fa-sort-numeric-down" />
                      ترتیب نمایش: {theme.sortOrder}
                    </span>
                  </div>

                  <div className="rta-theme-card__actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => openEditEditor(theme)}
                    >
                      <i className="fas fa-pen" />
                      ویرایش
                    </button>
                    <button
                      type="button"
                      className="btn rta-icon-action"
                      onClick={() =>
                        activeMutation.mutate({
                          id: theme.id,
                          active: !theme.isActive,
                        })
                      }
                      disabled={activeMutation.isPending}
                      title={theme.isActive ? "غیرفعال کردن" : "فعال کردن"}
                    >
                      <i
                        className={
                          theme.isActive
                            ? "fas fa-eye-slash"
                            : "fas fa-eye"
                        }
                      />
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger rta-icon-action"
                      onClick={() => handleDelete(theme)}
                      disabled={deleteMutation.isPending}
                      title="حذف قالب"
                    >
                      {deleteMutation.isPending &&
                      deleteMutation.variables === theme.id ? (
                        <span className="submit-spinner" aria-hidden="true" />
                      ) : (
                        <i className="fas fa-trash" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && !isError && filteredThemes.length > 0 && (
          <div className="rta-results-count">
            نمایش {filteredThemes.length} قالب از {themes.length}
          </div>
        )}
      </section>

      {editorOpen && (
        <div
          className="rta-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <section
            className="rta-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rta-editor-title"
          >
            <form onSubmit={handleSubmit}>
              <header className="rta-modal__header">
                <div>
                  <span className="rta-eyebrow">
                    <i className="fas fa-sliders-h" />
                    تنظیمات ظاهر
                  </span>
                  <h3 id="rta-editor-title">
                    {editingTheme ? "ویرایش قالب" : "ساخت قالب جدید"}
                  </h3>
                </div>
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={closeEditor}
                  disabled={saveMutation.isPending}
                  aria-label="بستن پنجره"
                >
                  <i className="fas fa-times" />
                </button>
              </header>

              <div className="rta-modal__body">
                <div className="rta-editor-layout">
                  <div className="rta-editor-fields">
                    <section className="rta-form-section">
                      <div className="rta-form-section__heading">
                        <h4>مشخصات قالب</h4>
                        <span>اطلاعاتی که در پنل انتخاب قالب نمایش داده می‌شود</span>
                      </div>

                      <div className="rta-form-grid">
                        <label className="rta-form-field">
                          <span>نام قالب <b>*</b></span>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(event) =>
                              updateField("name", event.target.value)
                            }
                            maxLength={50}
                            required
                            placeholder="مثلاً مدرن"
                          />
                          <small>{form.name.length}/۵۰ کاراکتر</small>
                        </label>

                        <label className="rta-form-field">
                          <span>ترتیب نمایش</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.sortOrder}
                            onChange={(event) =>
                              updateField(
                                "sortOrder",
                                event.target.value === ""
                                  ? ""
                                  : Number(event.target.value),
                              )
                            }
                          />
                          <small>عدد کمتر، جایگاه بالاتر در فهرست</small>
                        </label>

                        <label className="rta-form-field rta-form-field--wide">
                          <span>توضیحات</span>
                          <textarea
                            rows={2}
                            value={form.description}
                            onChange={(event) =>
                              updateField("description", event.target.value)
                            }
                            maxLength={150}
                            placeholder="توضیح کوتاهی درباره سبک و رنگ‌بندی قالب..."
                          />
                          <small>{form.description.length}/۱۵۰ کاراکتر</small>
                        </label>
                      </div>

                      <label className="rta-active-switch">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(event) =>
                            updateField("isActive", event.target.checked)
                          }
                        />
                        <span className="rta-active-switch__track" />
                        <span>
                          <strong>قالب فعال باشد</strong>
                          <small>
                            قالب فعال برای انتخاب مدیران رستوران نمایش داده می‌شود.
                          </small>
                        </span>
                      </label>
                    </section>

                    {COLOR_GROUPS.map((group) => (
                      <section className="rta-form-section" key={group.title}>
                        <div className="rta-form-section__heading">
                          <h4>{group.title}</h4>
                          <span>{group.description}</span>
                        </div>
                        <div className="rta-color-grid">
                          {group.fields.map((field) => (
                            <ColorField
                              key={field.key}
                              field={field}
                              value={form[field.key]}
                              onChange={updateField}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>

                  <aside className="rta-preview-panel">
                    <div className="rta-preview-panel__heading">
                      <h4>پیش‌نمایش زنده</h4>
                      <span>
                        <i className="fas fa-eye" />
                        تغییر رنگ‌ها را هم‌زمان ببینید
                      </span>
                    </div>
                    <ThemePreview theme={form} />
                    <div className="rta-preview-panel__note">
                      <i className="fas fa-info-circle" />
                      این پیش‌نمایش نمونه‌ای از ترکیب رنگ‌هاست. نمایش نهایی در
                      صفحات عمومی رستوران در مرحله بعد تکمیل می‌شود.
                    </div>
                  </aside>
                </div>
              </div>

              <footer className="rta-modal__footer">
                <button
                  type="button"
                  className="btn"
                  onClick={closeEditor}
                  disabled={saveMutation.isPending}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <>
                      <span className="submit-spinner" aria-hidden="true" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save" />
                      {editingTheme ? "ذخیره تغییرات" : "ایجاد قالب"}
                    </>
                  )}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
