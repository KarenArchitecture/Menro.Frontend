// src/components/admin/ThemeSection.jsx
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGlobalUI } from "../common/GlobalUI";
import { getOwnerTheme, saveOwnerTheme } from "../../api/ownerTheme";
import {
  DEFAULT_THEME_ID,
  THEMES,
  getTheme,
  themeToCssVars,
} from "../../Themes/restaurantThemes";
import "../../assets/css/admin/themeSection.css";

const QUERY_KEY = ["owner-theme"];

function ThemePreview({ theme }) {
  // The preview is styled with the same --rt-* variables the public page will use.
  return (
    <span className="theme-preview" style={themeToCssVars(theme)} aria-hidden="true">
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

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getOwnerTheme,
  });

  // Saved theme comes from the backend; unknown/missing ids fall back to the default.
  const savedId = data?.themeId ? getTheme(data.themeId).id : DEFAULT_THEME_ID;

  // pendingId = the choice the owner made but has not saved yet.
  const [pendingId, setPendingId] = useState(null);
  const selectedId = pendingId ?? savedId;
  const dirty = pendingId !== null && pendingId !== savedId;

  const saveMutation = useMutation({
    mutationFn: saveOwnerTheme,
    onSuccess: (_result, themeId) => {
      queryClient.setQueryData(QUERY_KEY, { themeId });
      setPendingId(null);
      notify("قالب رستوران ذخیره شد", "success");
    },
    onError: () => {
      notify("ذخیره قالب انجام نشد. دوباره تلاش کنید.", "error");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dirty || saveMutation.isPending) return;
    saveMutation.mutate(selectedId);
  };

  const handleReset = () => setPendingId(null);

  return (
    <form className="theme-picker" onSubmit={handleSubmit}>
      <div className="panel">
        <h3>قالب رستوران</h3>
        <p className="panel-subtitle">
          یک قالب انتخاب کنید تا رنگ پس‌زمینه، کارت‌ها، دکمه‌ها و متن‌های صفحه
          رستوران شما تغییر کند.
        </p>

        <fieldset className="theme-picker__grid" disabled={isLoading}>
          <legend className="theme-sr-only">انتخاب قالب</legend>

          {THEMES.map((theme) => (
            <label key={theme.id} className="theme-card">
              <input
                className="theme-card__input"
                type="radio"
                name="restaurant_theme"
                value={theme.id}
                checked={selectedId === theme.id}
                onChange={() => setPendingId(theme.id)}
              />
              <span className="theme-card__body">
                <ThemePreview theme={theme} />
                <span className="theme-card__label">
                  {theme.label}
                  {savedId === theme.id && (
                    <span className="theme-card__current">فعلی</span>
                  )}
                </span>
                <span className="theme-card__desc">{theme.description}</span>
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
          ))}
        </fieldset>
      </div>

      <div className="theme-picker__actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!dirty || saveMutation.isPending}
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