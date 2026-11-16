// src/components/admin/ThemeSection.jsx
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGlobalUI } from "../common/GlobalUI";
import {
  getActiveRestaurantThemes,
  getOwnerTheme,
  saveOwnerTheme,
} from "../../api/ownerTheme";
import "../../assets/css/admin/themeSection.css";

const OWNER_QUERY_KEY = ["owner-theme"];
const THEMES_QUERY_KEY = ["available-restaurant-themes"];

function themeToCssVars(theme) {
  return {
    "--rt-bg": theme.bgColor,
    "--rt-bar-bg": theme.barBgColor,
    "--rt-surface": theme.surfaceColor,
    "--rt-card-start": theme.cardStartColor,
    "--rt-card-end": theme.cardEndColor,
    "--rt-text": theme.textColor,
    "--rt-text-muted": theme.textMutedColor,
    "--rt-border": theme.borderColor,
    "--rt-primary": theme.primaryColor,
    "--rt-on-primary": theme.onPrimaryColor,
    "--rt-hero-btn-start": theme.heroBtnStartColor,
    "--rt-hero-btn-end": theme.heroBtnEndColor,
    "--rt-search-bg": theme.searchBgColor,
    "--rt-search-text": theme.searchTextColor,
    "--rt-search-border": theme.searchBorderColor,
  };
}

function ThemePreview({ theme }) {
  return (
    <span
      className="theme-preview"
      style={themeToCssVars(theme)}
      aria-hidden="true"
    >
      <span className="theme-preview__card">
        <span className="theme-preview__title">پیتزا مخصوص</span>
        <span className="theme-preview__muted">قارچ، پنیر، زیتون</span>
        <span className="theme-preview__row">
          <span className="theme-preview__price">۲۸۰,۰۰۰</span>
          <span className="theme-preview__btn">افزودن</span>
        </span>
      </span>
    </span>
  );
}

export default function ThemeSection() {
  const { notify } = useGlobalUI();
  const queryClient = useQueryClient();

  const {
    data: ownerTheme,
    isLoading: isOwnerThemeLoading,
    isError: ownerThemeError,
  } = useQuery({
    queryKey: OWNER_QUERY_KEY,
    queryFn: getOwnerTheme,
  });

  const {
    data: themes = [],
    isLoading: isThemesLoading,
    isError: themesError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: THEMES_QUERY_KEY,
    queryFn: getActiveRestaurantThemes,
  });

  const savedId = ownerTheme?.themeId == null ? null : Number(ownerTheme.themeId);
  const [pendingId, setPendingId] = useState(null);
  const selectedId = pendingId ?? savedId;
  const dirty = pendingId !== null && pendingId !== savedId;
  const isLoading = isOwnerThemeLoading || isThemesLoading;

  const saveMutation = useMutation({
    mutationFn: saveOwnerTheme,
    onSuccess: (_result, themeId) => {
      queryClient.setQueryData(OWNER_QUERY_KEY, { themeId });
      setPendingId(null);
      notify("قالب رستوران ذخیره شد", "success");
    },
    onError: () => {
      notify("ذخیره قالب انجام نشد. دوباره تلاش کنید.", "error");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!dirty || saveMutation.isPending || selectedId == null) return;
    saveMutation.mutate(selectedId);
  };

  const handleReset = () => setPendingId(null);

  return (
    <form className="theme-picker" onSubmit={handleSubmit}>
      <div className="panel">
        <h3>قالب رستوران</h3>
        <p className="panel-subtitle">
          یکی از قالب‌های فعال منرو را انتخاب کنید تا ظاهر صفحه عمومی رستوران
          شما مطابق آن نمایش داده شود.
        </p>

        {isLoading ? (
          <div className="theme-picker__message">در حال دریافت قالب‌ها...</div>
        ) : ownerThemeError || themesError ? (
          <div className="theme-picker__message theme-picker__message--error" role="alert">
            دریافت اطلاعات قالب‌ها با خطا مواجه شد.
            <button type="button" className="btn" onClick={() => refetch()} disabled={isFetching}>
              تلاش دوباره
            </button>
          </div>
        ) : themes.length === 0 ? (
          <div className="theme-picker__message">
            در حال حاضر هیچ قالب فعالی برای انتخاب وجود ندارد.
          </div>
        ) : (
          <fieldset className="theme-picker__grid">
            <legend className="theme-sr-only">انتخاب قالب</legend>

            {themes.map((theme) => {
              const id = Number(theme.id);
              return (
                <label key={id} className="theme-card">
                  <input
                    className="theme-card__input"
                    type="radio"
                    name="restaurant_theme"
                    value={id}
                    checked={selectedId === id}
                    onChange={() => setPendingId(id)}
                  />
                  <span className="theme-card__body">
                    <ThemePreview theme={theme} />
                    <span className="theme-card__label">
                      {theme.name}
                      {savedId === id && (
                        <span className="theme-card__current">فعال فعلی</span>
                      )}
                    </span>
                    <span className="theme-card__desc">
                      {theme.description || "بدون توضیحات"}
                    </span>
                    <svg
                      className="theme-card__check"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </label>
              );
            })}
          </fieldset>
        )}
      </div>

      <div className="theme-picker__actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!dirty || saveMutation.isPending || isLoading}
        >
          {saveMutation.isPending ? "در حال ذخیره..." : "ذخیره قالب"}
        </button>

        {dirty && (
          <>
            <button type="button" className="btn" onClick={handleReset}>
              انصراف
            </button>
            <span className="theme-picker__status">تغییرات ذخیره نشده</span>
          </>
        )}
      </div>
    </form>
  );
}
