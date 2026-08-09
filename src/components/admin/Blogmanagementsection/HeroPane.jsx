import { useEffect, useState } from "react";
import { getBlogHero, updateBlogHero } from "../../../api/adminBlogs";
import { useGlobalUI } from "../../common/GlobalUI";
import { apiErrorMessage } from "./blogManagementShared.js";

/* ================================================================== */
/* HERO + SEARCH BAR                                                   */
/* ================================================================== */

function mapHeroFromApi(h) {
  return {
    titleLine: h.titleLine,
    highlight: h.highlight,
    searchPlaceholder: h.searchPlaceholder,
  };
}

export default function HeroPane() {
  const { notify } = useGlobalUI();
  const [draft, setDraft] = useState({
    titleLine: "",
    highlight: "",
    searchPlaceholder: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const hero = await getBlogHero();
        if (!cancelled) setDraft(mapHeroFromApi(hero));
      } catch (err) {
        if (!cancelled)
          notify({
            type: "error",
            message: apiErrorMessage(err, "بارگذاری هیرو با خطا مواجه شد."),
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    if (!draft.titleLine.trim() || !draft.highlight.trim()) {
      notify({
        type: "warning",
        message: "متن اصلی و متن هایلایت نباید خالی باشند.",
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateBlogHero(draft);
      setDraft(mapHeroFromApi(updated));
      notify({ type: "success", message: "تنظیمات هیرو ذخیره شد" });
    } catch (err) {
      notify({
        type: "error",
        message: apiErrorMessage(err, "ذخیره هیرو با خطا مواجه شد."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      {loading && <div className="empty-hint">در حال بارگذاری...</div>}

      {!loading && (
        <>
          <div className="form-vertical blog-mgmt__form--hero">
            <div className="input-group">
              <label>متن اصلی هیرو</label>
              <input
                type="text"
                value={draft.titleLine}
                onChange={(e) =>
                  setDraft({ ...draft, titleLine: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>متن هایلایت (نارنجی)</label>
              <input
                type="text"
                value={draft.highlight}
                onChange={(e) =>
                  setDraft({ ...draft, highlight: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>متن جای‌گزین نوار جستجو</label>
              <input
                type="text"
                value={draft.searchPlaceholder}
                onChange={(e) =>
                  setDraft({ ...draft, searchPlaceholder: e.target.value })
                }
              />
            </div>
          </div>

          <div className="blog-mgmt__hero-preview">
            <span>{draft.titleLine}</span>{" "}
            <span className="highlight-text">{draft.highlight}</span>
            <div className="blog-mgmt__hero-preview-search">
              {draft.searchPlaceholder}
            </div>
          </div>

          <div className="panel-actions">
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={save}
            >
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
