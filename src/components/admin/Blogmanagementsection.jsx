import { useMemo, useState } from "react";

const initialHero = {
  titleLine: "بخون، بدون، با منرو",
  highlight: "متفاوت باش",
  searchPlaceholder: "جستجو مقاله ...",
};

const initialDisplayCategories = [
  {
    id: 1,
    title: "رستوران و فضای سرویس",
    subtitle: "فضای فیزیکی، خدمات، جو",
    color: "#5A302F",
  },
  {
    id: 2,
    title: "منو و غذا",
    subtitle: "چیدمان، انتخاب، تجربه طعم",
    color: "#664A25",
  },
  {
    id: 3,
    title: "رفتار و تجربه مشتری",
    subtitle: "عادت‌ها، رضایت، وفاداری",
    color: "#2B314B",
  },
  {
    id: 4,
    title: "برند و بازاریابی",
    subtitle: "ساخت برند، جذب، دیده‌شدن",
    color: "#274435",
  },
  {
    id: 5,
    title: "مدیریت و عملیات",
    subtitle: "پشت‌صحنه، منابع، فرآیندها",
    color: "#454C21",
  },
  {
    id: 6,
    title: "تکنولوژی و ابزارها",
    subtitle: "راهکارهای دیجیتال و هوشمند",
    color: "#58273E",
  },
  {
    id: 7,
    title: "فرهنگ و جامعه",
    subtitle: "تأثیر اجتماعی، سبک زندگی",
    color: "#264648",
  },
  {
    id: 8,
    title: "نگاه و دیدگاه",
    subtitle: "تحلیل، ترند، زاویه‌ی متفاوت",
    color: "#41224D",
  },
];

// The pill nav rendered inside BlogFeed ("همه" is a fixed, non-deletable
// "show everything" filter, so it's handled separately from the editable list).
const initialFeedTags = [
  "جدیدترین‌ها",
  "محبوب‌ترین‌ها",
  "پربازدیدترین‌ها",
  "داغ‌ترین‌ها",
];

const initialSidebarTags = [
  { id: 1, name: "منرو", count: "۹۶ مقاله" },
  { id: 2, name: "آموزش آشپزی", count: "۹۶ مقاله" },
  { id: 3, name: "منرو", count: "۹۶ مقاله" },
  { id: 4, name: "آموزش آشپزی", count: "۹۶ مقاله" },
];

const initialPosts = [
  {
    id: 1,
    title: "طرز تهیه پاستا آلفردو با مرغ و قارچ",
    coverSrc: "/images/blog-(1).png",
    readingMins: 5,
    category: "جدیدترین‌ها",
    published: true,
  },
  {
    id: 2,
    title: "راز یک پیتزای ایتالیایی خوشمزه",
    coverSrc: "/images/blog-(2).png",
    readingMins: 6,
    category: "جدیدترین‌ها",
    published: true,
  },
  {
    id: 3,
    title: "طرز تهیه قهوه دمی در خانه",
    coverSrc: "/images/blog-(3).png",
    readingMins: 3,
    category: "جدیدترین‌ها",
    published: true,
  },
  {
    id: 7,
    title: "بهترین رژیم غذایی برای ورزشکاران",
    coverSrc: "/images/blog-(3).png",
    readingMins: 8,
    category: "محبوب‌ترین‌ها",
    published: true,
  },
  {
    id: 13,
    title: "چگونه گوشت را سریع‌تر بپزیم؟",
    coverSrc: "/images/blog-(1).png",
    readingMins: 4,
    category: "پربازدیدترین‌ها",
    published: false,
  },
  {
    id: 19,
    title: "بررسی امکانات جدید اپلیکیشن منرو",
    coverSrc: "/images/blog-(3).png",
    readingMins: 3,
    category: "داغ‌ترین‌ها",
    published: true,
  },
];

const PAIR_TYPE_LABELS = {
  blogTags: "دو کارت وبلاگ + برچسب‌ها",
  blogBanner: "دو کارت وبلاگ + بنر تبلیغاتی",
  blogTagsBanner: "دو کارت وبلاگ + بنر (نسخه‌ی برچسب)",
  bannerTags: "بنر تبلیغاتی + برچسب‌ها",
};

const initialMobileSettings = {
  randomBlockRounds: 3, // how many <BlogMobileBlocksModule mode="random" /> to render
  enabledPairTypes: {
    blogTags: true,
    blogBanner: true,
    blogTagsBanner: true,
    bannerTags: true,
  },
  feedRows: 3,
  feedPerRow: 2,
  finalBlock: {
    forcedPairType: "bannerTags",
    showButton: true,
    buttonLabel: "نمایش بیشتر...",
  },
};

const SUB_TABS = [
  { key: "posts", label: "پست‌های وبلاگ", icon: "fas fa-newspaper" },
  {
    key: "display-categories",
    label: "دسته‌بندی‌های نمایشی",
    icon: "fas fa-th-large",
  },
  { key: "feed-tags", label: "فیلتر‌های فید", icon: "fas fa-filter" },
  { key: "sidebar-tags", label: "برچسب‌های پیشنهادی", icon: "fas fa-hashtag" },
  { key: "hero", label: "هیرو و جستجو", icon: "fas fa-image" },
  { key: "mobile", label: "چیدمان موبایل", icon: "fas fa-mobile-alt" },
];

export default function BlogManagementSection() {
  const [activeSubTab, setActiveSubTab] = useState("posts");

  const [hero, setHero] = useState(initialHero);
  const [displayCategories, setDisplayCategories] = useState(
    initialDisplayCategories,
  );
  const [feedTags, setFeedTags] = useState(initialFeedTags);
  const [sidebarTags, setSidebarTags] = useState(initialSidebarTags);
  const [posts, setPosts] = useState(initialPosts);
  const [mobileSettings, setMobileSettings] = useState(initialMobileSettings);

  const [savedFlash, setSavedFlash] = useState(""); // small transient "ذخیره شد" confirmation

  const flashSaved = (label = "تغییرات ذخیره شد") => {
    setSavedFlash(label);
    window.clearTimeout(flashSaved._t);
    flashSaved._t = window.setTimeout(() => setSavedFlash(""), 2200);
  };

  return (
    <div id="blog-management-view" className="blog-mgmt">
      <div className="view-header">
        <h2 className="content-title">مدیریت وبلاگ</h2>
        {savedFlash && <span className="blog-mgmt__flash">{savedFlash}</span>}
      </div>

      <nav className="content-tab-nav">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`content-tab-link ${activeSubTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveSubTab(tab.key)}
          >
            <i className={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div
        className={`content-tab-pane ${activeSubTab === "posts" ? "active" : ""}`}
      >
        <PostsPane
          posts={posts}
          setPosts={setPosts}
          feedTags={feedTags}
          onSaved={flashSaved}
        />
      </div>

      <div
        className={`content-tab-pane ${activeSubTab === "display-categories" ? "active" : ""}`}
      >
        <DisplayCategoriesPane
          categories={displayCategories}
          setCategories={setDisplayCategories}
          onSaved={flashSaved}
        />
      </div>

      <div
        className={`content-tab-pane ${activeSubTab === "feed-tags" ? "active" : ""}`}
      >
        <FeedTagsPane
          feedTags={feedTags}
          setFeedTags={setFeedTags}
          posts={posts}
          onSaved={flashSaved}
        />
      </div>

      <div
        className={`content-tab-pane ${activeSubTab === "sidebar-tags" ? "active" : ""}`}
      >
        <SidebarTagsPane
          tags={sidebarTags}
          setTags={setSidebarTags}
          onSaved={flashSaved}
        />
      </div>

      <div
        className={`content-tab-pane ${activeSubTab === "hero" ? "active" : ""}`}
      >
        <HeroPane hero={hero} setHero={setHero} onSaved={flashSaved} />
      </div>

      <div
        className={`content-tab-pane ${activeSubTab === "mobile" ? "active" : ""}`}
      >
        <MobileLayoutPane
          settings={mobileSettings}
          setSettings={setMobileSettings}
          onSaved={flashSaved}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/* 1) POSTS                                                            */
/* ================================================================== */

function emptyPost() {
  return {
    id: null,
    title: "",
    coverSrc: "",
    readingMins: 5,
    category: "",
    published: true,
  };
}

function PostsPane({ posts, setPosts, feedTags, onSaved }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("همه");
  const [modalPost, setModalPost] = useState(null); // null = closed, object = editing/new
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesQuery = p.title
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesCategory =
        categoryFilter === "همه" || p.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [posts, query, categoryFilter]);

  const openNew = () => {
    setErrors({});
    setModalPost({ ...emptyPost(), category: feedTags[0] || "" });
  };

  const openEdit = (post) => {
    setErrors({});
    setModalPost({ ...post });
  };

  const validate = (draft) => {
    const errs = {};
    if (!draft.title.trim()) errs.title = "عنوان پست الزامی است.";
    if (!draft.category) errs.category = "انتخاب دسته‌بندی الزامی است.";
    if (!draft.readingMins || draft.readingMins <= 0)
      errs.readingMins = "زمان مطالعه باید بزرگ‌تر از صفر باشد.";
    return errs;
  };

  const savePost = () => {
    const errs = validate(modalPost);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // TODO: API — POST /admin/blog/posts (create) or PUT /admin/blog/posts/:id (update)
    setPosts((prev) => {
      if (modalPost.id) {
        return prev.map((p) => (p.id === modalPost.id ? { ...modalPost } : p));
      }
      const nextId = Math.max(0, ...prev.map((p) => p.id)) + 1;
      return [{ ...modalPost, id: nextId }, ...prev];
    });

    setModalPost(null);
    onSaved(modalPost.id ? "پست ویرایش شد" : "پست جدید اضافه شد");
  };

  const togglePublished = (post) => {
    // TODO: API — PATCH /admin/blog/posts/:id/publish
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, published: !p.published } : p,
      ),
    );
    onSaved(post.published ? "پست پیش‌نویس شد" : "پست منتشر شد");
  };

  const deletePost = (id) => {
    // TODO: API — DELETE /admin/blog/posts/:id
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
    onSaved("پست حذف شد");
  };

  return (
    <div className="panel">
      <div className="input-group-inline">
        <input
          type="text"
          className="mh-input"
          placeholder="جستجو در عنوان پست‌ها..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ maxWidth: 220 }}
        >
          <option value="همه">همه دسته‌ها</option>
          {feedTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus" /> پست جدید
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>پوستر</th>
              <th>عنوان</th>
              <th>دسته‌بندی</th>
              <th>زمان مطالعه</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-hint">
                    هیچ پستی با این فیلتر پیدا نشد.
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((post) => (
              <tr key={post.id}>
                <td>
                  <div className="blog-mgmt__thumb">
                    {post.coverSrc ? (
                      <img src={post.coverSrc} alt={post.title} />
                    ) : (
                      <i className="fas fa-image" />
                    )}
                  </div>
                </td>
                <td>{post.title}</td>
                <td>{post.category}</td>
                <td>{post.readingMins} دقیقه</td>
                <td>
                  <span
                    className={`status-chip ${post.published ? "active" : "danger"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => togglePublished(post)}
                    title="برای تغییر وضعیت کلیک کنید"
                  >
                    {post.published ? "منتشر شده" : "پیش‌نویس"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-icon"
                    title="ویرایش"
                    onClick={() => openEdit(post)}
                  >
                    <i className="fas fa-pen" />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    title="حذف"
                    onClick={() => setConfirmDeleteId(post.id)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalPost && (
        <div className="modal-backdrop" onClick={() => setModalPost(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{modalPost.id ? "ویرایش پست" : "پست جدید"}</h4>
              <button className="btn-icon" onClick={() => setModalPost(null)}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="form-vertical">
              <div className="input-group">
                <label>عنوان پست</label>
                <input
                  type="text"
                  value={modalPost.title}
                  onChange={(e) =>
                    setModalPost({ ...modalPost, title: e.target.value })
                  }
                />
                {errors.title && (
                  <span className="form-error">{errors.title}</span>
                )}
              </div>

              <div className="input-group">
                <label>آدرس تصویر کاور</label>
                <input
                  type="text"
                  placeholder="/images/blog-(1).png"
                  value={modalPost.coverSrc}
                  onChange={(e) =>
                    setModalPost({ ...modalPost, coverSrc: e.target.value })
                  }
                />
              </div>

              <div className="two-column-form">
                <div className="input-group">
                  <label>دسته‌بندی</label>
                  <select
                    value={modalPost.category}
                    onChange={(e) =>
                      setModalPost({ ...modalPost, category: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      انتخاب کنید
                    </option>
                    {feedTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <span className="form-error">{errors.category}</span>
                  )}
                </div>

                <div className="input-group">
                  <label>زمان مطالعه (دقیقه)</label>
                  <input
                    type="number"
                    min={1}
                    value={modalPost.readingMins}
                    onChange={(e) =>
                      setModalPost({
                        ...modalPost,
                        readingMins: Number(e.target.value),
                      })
                    }
                  />
                  {errors.readingMins && (
                    <span className="form-error">{errors.readingMins}</span>
                  )}
                </div>
              </div>

              <label className="radio-label">
                <input
                  type="checkbox"
                  checked={modalPost.published}
                  onChange={(e) =>
                    setModalPost({ ...modalPost, published: e.target.checked })
                  }
                />
                منتشر شود
              </label>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setModalPost(null)}
              >
                انصراف
              </button>
              <button className="btn btn-primary" onClick={savePost}>
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="modal blog-mgmt__modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>حذف پست</h4>
            </div>
            <p className="blog-mgmt__muted-text">
              این پست برای همیشه حذف می‌شود و این عملیات قابل بازگشت نیست.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDeleteId(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                onClick={() => deletePost(confirmDeleteId)}
              >
                حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 2) DISPLAY CATEGORIES (the 8 colored cards under the hero)          */
/* ================================================================== */

function emptyDisplayCategory() {
  return { id: null, title: "", subtitle: "", color: "#5A302F" };
}

function DisplayCategoriesPane({ categories, setCategories, onSaved }) {
  const [modalCat, setModalCat] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [errors, setErrors] = useState({});

  const openNew = () => {
    setErrors({});
    setModalCat(emptyDisplayCategory());
  };
  const openEdit = (cat) => {
    setErrors({});
    setModalCat({ ...cat });
  };

  const save = () => {
    const errs = {};
    if (!modalCat.title.trim()) errs.title = "عنوان الزامی است.";
    if (!modalCat.subtitle.trim()) errs.subtitle = "زیرعنوان الزامی است.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // TODO: API — POST/PUT /admin/blog/display-categories
    setCategories((prev) => {
      if (modalCat.id)
        return prev.map((c) => (c.id === modalCat.id ? { ...modalCat } : c));
      const nextId = Math.max(0, ...prev.map((c) => c.id)) + 1;
      return [...prev, { ...modalCat, id: nextId }];
    });
    setModalCat(null);
    onSaved("دسته‌بندی نمایشی ذخیره شد");
  };

  const remove = (id) => {
    // TODO: API — DELETE /admin/blog/display-categories/:id
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
    onSaved("دسته‌بندی حذف شد");
  };

  const move = (index, dir) => {
    const next = [...categories];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
  };

  return (
    <div className="panel">
      <p className="panel-subtitle">
        همان ۸ کارت رنگی که زیر بخش هیرو، بالای فید وبلاگ نمایش داده می‌شوند.
        ترتیب این لیست دقیقاً همان ترتیب نمایش در صفحه‌ی وبلاگ است.
      </p>

      <div className="panel-actions blog-mgmt__panel-actions--start">
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus" /> دسته‌بندی نمایشی جدید
        </button>
      </div>

      <div className="custom-icons-list">
        {categories.map((cat, index) => (
          <div key={cat.id} className="custom-icon-row blog-mgmt__cat-row">
            <span
              className="icon blog-mgmt__cat-swatch"
              style={{ "--cat-color": cat.color }}
            />
            <div className="name blog-mgmt__cat-name">
              <strong>{cat.title}</strong>
              <small className="blog-mgmt__cat-subtitle">{cat.subtitle}</small>
            </div>
            <div className="actions">
              <button
                className="mh-reorder-btn btn-icon"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                title="بالا"
              >
                <i className="fas fa-chevron-up" />
              </button>
              <button
                className="btn-icon"
                disabled={index === categories.length - 1}
                onClick={() => move(index, 1)}
                title="پایین"
              >
                <i className="fas fa-chevron-down" />
              </button>
              <button
                className="btn-icon"
                onClick={() => openEdit(cat)}
                title="ویرایش"
              >
                <i className="fas fa-pen" />
              </button>
              <button
                className="btn-icon btn-danger"
                onClick={() => setConfirmDeleteId(cat.id)}
                title="حذف"
              >
                <i className="fas fa-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalCat && (
        <div className="modal-backdrop" onClick={() => setModalCat(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                {modalCat.id
                  ? "ویرایش دسته‌بندی نمایشی"
                  : "دسته‌بندی نمایشی جدید"}
              </h4>
              <button className="btn-icon" onClick={() => setModalCat(null)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="form-vertical">
              <div className="input-group">
                <label>عنوان</label>
                <input
                  type="text"
                  value={modalCat.title}
                  onChange={(e) =>
                    setModalCat({ ...modalCat, title: e.target.value })
                  }
                />
                {errors.title && (
                  <span className="form-error">{errors.title}</span>
                )}
              </div>
              <div className="input-group">
                <label>زیرعنوان</label>
                <input
                  type="text"
                  value={modalCat.subtitle}
                  onChange={(e) =>
                    setModalCat({ ...modalCat, subtitle: e.target.value })
                  }
                />
                {errors.subtitle && (
                  <span className="form-error">{errors.subtitle}</span>
                )}
              </div>
              <div className="input-group">
                <label>رنگ کارت</label>
                <div className="blog-mgmt__color-row">
                  <input
                    type="color"
                    value={modalCat.color}
                    onChange={(e) =>
                      setModalCat({ ...modalCat, color: e.target.value })
                    }
                    className="blog-mgmt__color-swatch"
                  />
                  <input
                    type="text"
                    value={modalCat.color}
                    onChange={(e) =>
                      setModalCat({ ...modalCat, color: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setModalCat(null)}
              >
                انصراف
              </button>
              <button className="btn btn-primary" onClick={save}>
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="modal blog-mgmt__modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>حذف دسته‌بندی</h4>
            </div>
            <p className="blog-mgmt__muted-text">
              این دسته‌بندی از صفحه‌ی وبلاگ حذف می‌شود.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDeleteId(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                onClick={() => remove(confirmDeleteId)}
              >
                حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 3) FEED CATEGORY TAGS (the pill nav: جدیدترین‌ها / محبوب‌ترین‌ها ...) */
/* ================================================================== */

function FeedTagsPane({ feedTags, setFeedTags, posts, onSaved }) {
  const [newTag, setNewTag] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");

  const countFor = (tag) => posts.filter((p) => p.category === tag).length;

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (feedTags.includes(trimmed)) {
      setError("این فیلتر از قبل وجود دارد.");
      return;
    }
    // TODO: API — POST /admin/blog/feed-tags
    setFeedTags((prev) => [...prev, trimmed]);
    setNewTag("");
    setError("");
    onSaved("فیلتر جدید اضافه شد");
  };

  const removeTag = (tag) => {
    const inUse = countFor(tag);
    if (inUse > 0) {
      setError(
        `این فیلتر روی ${inUse} پست فعال است؛ ابتدا دسته‌بندی آن پست‌ها را تغییر دهید.`,
      );
      setConfirmDelete(null);
      return;
    }
    // TODO: API — DELETE /admin/blog/feed-tags/:tag
    setFeedTags((prev) => prev.filter((t) => t !== tag));
    setConfirmDelete(null);
    onSaved("فیلتر حذف شد");
  };

  return (
    <div className="panel">
      <p className="panel-subtitle">
        این‌ها همان دکمه‌های فیلتر بالای فید وبلاگ هستند (کنار فیلتر ثابت
        «همه»). هر پست باید دقیقاً به یکی از این‌ها تعلق داشته باشد.
      </p>

      <div className="input-group-inline">
        <input
          type="text"
          placeholder="نام فیلتر جدید، مثلاً «ویژه»"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
        />
        <button className="btn btn-primary" onClick={addTag}>
          <i className="fas fa-plus" /> افزودن
        </button>
      </div>
      {error && <span className="form-error">{error}</span>}

      <div className="predefined-tags blog-mgmt__predefined-tags">
        <span className="tag blog-mgmt__tag--static">
          همه <span className="badge">ثابت</span>
        </span>
        {feedTags.map((tag) => (
          <span key={tag} className="tag blog-mgmt__tag--readonly">
            {tag}
            <span className="badge">{countFor(tag)} پست</span>
            <button
              type="button"
              className="btn-icon btn-danger blog-mgmt__tag-remove"
              onClick={() => setConfirmDelete(tag)}
              title="حذف فیلتر"
            >
              <i className="fas fa-times" />
            </button>
          </span>
        ))}
      </div>

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
          <div
            className="modal blog-mgmt__modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>حذف فیلتر «{confirmDelete}»</h4>
            </div>
            <p className="blog-mgmt__muted-text">
              با حذف این فیلتر، دکمه‌ی آن از فید وبلاگ برداشته می‌شود.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                onClick={() => removeTag(confirmDelete)}
              >
                حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 4) SIDEBAR "SUGGESTED TAGS" (name + article count)                  */
/* ================================================================== */

function emptySidebarTag() {
  return { id: null, name: "", count: "" };
}

function SidebarTagsPane({ tags, setTags, onSaved }) {
  const [modalTag, setModalTag] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState("");

  const openNew = () => {
    setError("");
    setModalTag(emptySidebarTag());
  };
  const openEdit = (tag) => {
    setError("");
    setModalTag({ ...tag });
  };

  const save = () => {
    if (!modalTag.name.trim()) {
      setError("نام برچسب الزامی است.");
      return;
    }
    // TODO: API — POST/PUT /admin/blog/sidebar-tags
    setTags((prev) => {
      if (modalTag.id)
        return prev.map((t) => (t.id === modalTag.id ? { ...modalTag } : t));
      const nextId = Math.max(0, ...prev.map((t) => t.id)) + 1;
      return [...prev, { ...modalTag, id: nextId }];
    });
    setModalTag(null);
    onSaved("برچسب پیشنهادی ذخیره شد");
  };

  const remove = (id) => {
    // TODO: API — DELETE /admin/blog/sidebar-tags/:id
    setTags((prev) => prev.filter((t) => t.id !== id));
    setConfirmDeleteId(null);
    onSaved("برچسب حذف شد");
  };

  return (
    <div className="panel">
      <p className="panel-subtitle">
        این برچسب‌ها همان لیست «برچسب‌های پیشنهادی» در سایدبار دسکتاپ و بلوک‌های
        تصادفی موبایل هستند. حداکثر ۸ مورد اول در نسخه‌ی موبایل نمایش داده
        می‌شود.
      </p>

      <div className="panel-actions blog-mgmt__panel-actions--start">
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus" /> برچسب جدید
        </button>
      </div>

      <ul className="sidebar-tags-list blog-mgmt__sidebar-tags-list">
        {tags.map((tag) => (
          <li key={tag.id} className="sidebar-tag-item">
            <div className="tag-item-right">
              <span className="mobile-blog-tags__hash blog-mgmt__tag-hash">
                #
              </span>
              <span className="tag-item-name">{tag.name}</span>
            </div>
            <div className="blog-mgmt__tag-actions">
              <span className="tag-item-count">{tag.count}</span>
              <button
                className="btn-icon"
                onClick={() => openEdit(tag)}
                title="ویرایش"
              >
                <i className="fas fa-pen" />
              </button>
              <button
                className="btn-icon btn-danger"
                onClick={() => setConfirmDeleteId(tag.id)}
                title="حذف"
              >
                <i className="fas fa-trash" />
              </button>
            </div>
          </li>
        ))}
        {tags.length === 0 && (
          <div className="empty-hint">هنوز برچسبی اضافه نشده.</div>
        )}
      </ul>

      {modalTag && (
        <div className="modal-backdrop" onClick={() => setModalTag(null)}>
          <div
            className="modal blog-mgmt__modal--tag"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>{modalTag.id ? "ویرایش برچسب" : "برچسب جدید"}</h4>
              <button className="btn-icon" onClick={() => setModalTag(null)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="form-vertical">
              <div className="input-group">
                <label>نام برچسب</label>
                <input
                  type="text"
                  value={modalTag.name}
                  onChange={(e) =>
                    setModalTag({ ...modalTag, name: e.target.value })
                  }
                />
                {error && <span className="form-error">{error}</span>}
              </div>
              <div className="input-group">
                <label>تعداد مقاله (متن نمایشی)</label>
                <input
                  type="text"
                  placeholder="۹۶ مقاله"
                  value={modalTag.count}
                  onChange={(e) =>
                    setModalTag({ ...modalTag, count: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setModalTag(null)}
              >
                انصراف
              </button>
              <button className="btn btn-primary" onClick={save}>
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="modal blog-mgmt__modal--confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>حذف برچسب</h4>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDeleteId(null)}
              >
                انصراف
              </button>
              <button
                className="btn btn-danger"
                onClick={() => remove(confirmDeleteId)}
              >
                حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* 5) HERO + SEARCH BAR                                                */
/* ================================================================== */

function HeroPane({ hero, setHero, onSaved }) {
  const [draft, setDraft] = useState(hero);
  const [error, setError] = useState("");

  const save = () => {
    if (!draft.titleLine.trim() || !draft.highlight.trim()) {
      setError("متن اصلی و متن هایلایت نباید خالی باشند.");
      return;
    }
    // TODO: API — PUT /admin/blog/hero
    setError("");
    setHero(draft);
    onSaved("تنظیمات هیرو ذخیره شد");
  };

  return (
    <div className="panel">
      <p className="panel-subtitle">
        متن اصلی، بخش رنگی هایلایت و متن جای‌گزین (placeholder) نوار جستجوی
        بالای صفحه‌ی وبلاگ. تصاویر شناور غذا (پیتزا، سوشی و ...) فعلاً ثابت
        هستند و از پوشه‌ی تصاویر پروژه خوانده می‌شوند.
      </p>

      <div className="form-vertical blog-mgmt__form--hero">
        <div className="input-group">
          <label>متن اصلی هیرو</label>
          <input
            type="text"
            value={draft.titleLine}
            onChange={(e) => setDraft({ ...draft, titleLine: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label>متن هایلایت (نارنجی)</label>
          <input
            type="text"
            value={draft.highlight}
            onChange={(e) => setDraft({ ...draft, highlight: e.target.value })}
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
        {error && <span className="form-error">{error}</span>}
      </div>

      <div className="blog-mgmt__hero-preview">
        <span>{draft.titleLine}</span>{" "}
        <span className="highlight-text">{draft.highlight}</span>
        <div className="blog-mgmt__hero-preview-search">
          {draft.searchPlaceholder}
        </div>
      </div>

      <div className="panel-actions">
        <button className="btn btn-primary" onClick={save}>
          ذخیره تغییرات
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 6) MOBILE LAYOUT (random blocks, feed rows, final CTA block)        */
/* ================================================================== */

function MobileLayoutPane({ settings, setSettings, onSaved }) {
  const togglePairType = (key) => {
    setSettings((prev) => ({
      ...prev,
      enabledPairTypes: {
        ...prev.enabledPairTypes,
        [key]: !prev.enabledPairTypes[key],
      },
    }));
  };

  const save = () => {
    const anyEnabled = Object.values(settings.enabledPairTypes).some(Boolean);
    if (!anyEnabled) {
      onSaved("حداقل یک نوع بلوک تصادفی باید فعال باشد");
      return;
    }
    // TODO: API — PUT /admin/blog/mobile-layout
    onSaved("تنظیمات نسخه موبایل ذخیره شد");
  };

  return (
    <div className="panel">
      <p className="panel-subtitle">
        نسخه‌ی موبایل وبلاگ به‌جای چیدمان دو ستونه، از بلوک‌های تصادفی، فید ساده
        و یک بلوک پایانی با دکمه‌ی «نمایش بیشتر» استفاده می‌کند. اینجا می‌توانید
        نوع بلوک‌های مجاز و اندازه‌ی فید را کنترل کنید.
      </p>

      <div className="config-step">
        <h4>بلوک‌های تصادفی مجاز</h4>
        <div className="predefined-tags">
          {Object.entries(PAIR_TYPE_LABELS).map(([key, label]) => (
            <label
              key={key}
              className={`tag blog-mgmt__pair-chip ${settings.enabledPairTypes[key] ? "is-active" : ""}`}
            >
              <input
                type="checkbox"
                style={{ display: "none" }}
                checked={settings.enabledPairTypes[key]}
                onChange={() => togglePairType(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="config-step two-column-form">
        <div className="input-group">
          <label>تعداد بلوک‌های تصادفی نمایش داده شده</label>
          <input
            type="number"
            min={0}
            max={6}
            value={settings.randomBlockRounds}
            onChange={(e) =>
              setSettings({
                ...settings,
                randomBlockRounds: Number(e.target.value),
              })
            }
          />
        </div>
        <div className="input-group">
          <label>تعداد ردیف فید ساده</label>
          <input
            type="number"
            min={1}
            max={10}
            value={settings.feedRows}
            onChange={(e) =>
              setSettings({ ...settings, feedRows: Number(e.target.value) })
            }
          />
        </div>
        <div className="input-group">
          <label>تعداد کارت در هر ردیف فید</label>
          <input
            type="number"
            min={1}
            max={4}
            value={settings.feedPerRow}
            onChange={(e) =>
              setSettings({ ...settings, feedPerRow: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="config-step">
        <h4>بلوک پایانی (قبل از فوتر)</h4>
        <div className="two-column-form">
          <div className="input-group">
            <label>نوع بلوک</label>
            <select
              value={settings.finalBlock.forcedPairType}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  finalBlock: {
                    ...settings.finalBlock,
                    forcedPairType: e.target.value,
                  },
                })
              }
            >
              {Object.entries(PAIR_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>متن دکمه</label>
            <input
              type="text"
              disabled={!settings.finalBlock.showButton}
              value={settings.finalBlock.buttonLabel}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  finalBlock: {
                    ...settings.finalBlock,
                    buttonLabel: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
        <label className="radio-label blog-mgmt__radio-label--spaced">
          <input
            type="checkbox"
            checked={settings.finalBlock.showButton}
            onChange={(e) =>
              setSettings({
                ...settings,
                finalBlock: {
                  ...settings.finalBlock,
                  showButton: e.target.checked,
                },
              })
            }
          />
          نمایش دکمه در بلوک پایانی
        </label>
      </div>

      <div className="panel-actions">
        <button className="btn btn-primary" onClick={save}>
          ذخیره تغییرات
        </button>
      </div>
    </div>
  );
}
