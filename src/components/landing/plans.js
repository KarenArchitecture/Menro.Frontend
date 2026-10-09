// src/components/landing/plans.js
//
// HOW TO EDIT THIS FILE
// ---------------------
// 1. Backgrounds  -> only touch the BACKGROUNDS map below.
// 2. Colors       -> only touch the `theme(...)` call of a plan.
// 3. Text/content -> only touch that plan's title / description / features.
// 4. New plan     -> copy one `definePlan({...})` block, give it a new unique id.
//
// Everything else (badge, CTA, link, duplicate-feature cleanup, hue math)
// is handled by the helpers so hand edits can't desync the cards.

/* ------------------------------------------------------------------ */
/* Shared defaults                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_BADGE = "• اشتراک‌های منرو";
const DEFAULT_CTA_LABEL = "اطلاعات بیشتر";
const DEFAULT_DESCRIPTION =
  "پلن سازمانی با امکانات کاملاً اختصاصی، پشتیبانی ویژه و توسعه متناسب با نیاز برند شما.";

/* ------------------------------------------------------------------ */
/* Backgrounds (one place only)                                        */
/* ------------------------------------------------------------------ */

// Used by any plan that has no entry in BACKGROUNDS.
const DEFAULT_BG = "/images/phone-background.png";

// Add a plan's own image here, keyed by plan id. Example:
//   custom: "/images/plans/bg-custom.webp",
// A plan with its own image should also use theme(..., { recolor: false }).
const BACKGROUNDS = {
  // custom: "/images/plans/bg-custom.webp",
  // menroPlus: "/images/plans/bg-menro-plus.webp",
  // pro: "/images/plans/bg-pro.webp",
  // advanced: "/images/plans/bg-advanced.webp",
};

/* ------------------------------------------------------------------ */
/* Theme helper                                                        */
/* ------------------------------------------------------------------ */

// Approximate hue (0-360) of the shared blue background image.
// If every card looks tinted wrong by the same amount, adjust this one number.
const BASE_IMAGE_HUE = 235;

/**
 * theme(targetHue, options)
 *
 * targetHue : the color you want, as a hue angle.
 *             0 red | 20 orange | 45 gold | 140 green | 165 teal
 *             205 sky blue | 235 original navy | 265 purple | 320 pink
 * options.accent  : optional exact color (hex/hsl) for chip, icons, border.
 *                   Defaults to a color generated from targetHue.
 * options.recolor : true  -> CSS hue-rotates the shared image to targetHue.
 *                   false -> image is used as-is (use for per-plan images).
 *
 * Returns { accent, hue, recolor } which PlanCard turns into CSS variables.
 */
function theme(targetHue, { accent, recolor = true } = {}) {
  const shift = (((targetHue - BASE_IMAGE_HUE) % 360) + 360) % 360;

  return {
    accent: accent ?? `hsl(${targetHue} 90% 62%)`,
    hue: recolor ? shift : 0,
    recolor,
  };
}

/* ------------------------------------------------------------------ */
/* Plan builder                                                        */
/* ------------------------------------------------------------------ */

function definePlan({
  id,
  label,
  title,
  description = DEFAULT_DESCRIPTION,
  features = [],
  badge = DEFAULT_BADGE,
  ctaLabel = DEFAULT_CTA_LABEL,
  ctaHref,
  theme: planTheme = theme(BASE_IMAGE_HUE, { accent: "#029dfb" }),
}) {
  return {
    id,
    label: label.trim(),
    title: title.trim(),
    description,
    bgSrc: BACKGROUNDS[id] ?? DEFAULT_BG,
    // Set() drops accidental duplicates (e.g. a list pasted twice by hand).
    // PlanCard already duplicates the list itself for the infinite scroll.
    features: [...new Set(features.map((f) => f.trim()).filter(Boolean))],
    badge,
    ctaLabel,
    ctaHref: ctaHref ?? `#${id}`,
    ...planTheme, // adds: accent, hue, recolor
  };
}

/* ------------------------------------------------------------------ */
/* Plans                                                               */
/* ------------------------------------------------------------------ */

const plans = [
  definePlan({
    id: "custom",
    label: "سفارشی",
    title: "سفارشی",
    theme: theme(20), // orange
    features: [
      "امکان طراحی رابط کاربری اختصاصی متناسب با برند سازمان",
      "دسترسی به ماژول‌های سفارشی و توسعه‌پذیر",
      "پشتیبانی ویژه ۲۴ ساعته در تمام روزهای هفته",
      "هماهنگی مستقیم با تیم فنی برای تغییرات در API و داده‌ها",
      "امنیت سطح سازمانی با رمزنگاری داده‌ها و دسترسی چندلایه",
      "امکان ادغام با نرم‌افزارهای حسابداری و ERP سازمان",
      "گزارش‌گیری دقیق از عملکرد کارکنان و سفارشات",
      "قابلیت تعریف نقش‌ها و مجوزهای پیشرفته برای کاربران مختلف",
      "مدیریت همزمان چند شعبه با داشبورد مرکزی قدرتمند",
    ],
  }),

  definePlan({
    id: "menroPlus",
    label: "منرو+",
    title: "رشد +",
    theme: theme(165), // teal
    features: [
      "مدیریت پیشرفته منو با تصاویر، قیمت‌گذاری پویا و برچسب‌ها",
      "اتصال مستقیم به درگاه‌های پرداخت و حسابداری آنلاین",
      "ابزار بازاریابی پیامکی و اطلاع‌رسانی خودکار به مشتریان",
      "گزارش لحظه‌ای از فروش و سود هر روز به تفکیک شعبه",
      "پشتیبانی از تخفیف‌ها و کمپین‌های تبلیغاتی زمان‌بندی‌شده",
      "نمایش آمار دقیق از سفارشات تکراری و مشتریان وفادار",
      "دسترسی تیمی با سطح دسترسی‌های مختلف (مدیر، صندوقدار، پیک)",
      "قابلیت فعال‌سازی نسخه موبایل برای مدیریت سریع در هر لحظه",
      "پشتیبانی فنی از طریق پنل چت و تماس فوری در ساعات کاری",
    ],
  }),

  definePlan({
    id: "pro",
    label: "حرفه‌ای",
    title: "حرفه‌ای",
    theme: theme(235, { accent: "#029dfb" }), // original blue, image unchanged
    features: [
      "مدیریت سفارش‌های حضوری، تلفنی و آنلاین در یک داشبورد واحد",
      "سیستم هشدار خودکار برای موجودی مواد اولیه",
      "پشتیبانی از چاپگرهای حرارتی و فیش‌های سفارش در لحظه",
      "دسترسی به گزارش مالی ماهانه و نمودارهای تحلیلی",
      "امکان تعریف تخفیف، مالیات و هزینه‌های جانبی به تفکیک آیتم‌ها",
      "مدیریت کارکنان و ثبت ساعت کاری با کارت ورود و خروج",
      "نمایش خلاصه فروش روزانه و مقایسه با هفته‌های گذشته",
      "سازگار با نسخه دسکتاپ، موبایل و تبلت بدون نیاز به نصب",
      "پشتیبانی سریع از طریق تیکت و به‌روزرسانی‌های منظم سیستم",
    ],
  }),

  definePlan({
    id: "advanced",
    label: "پیشرفته",
    title: "پیشرفته",
    theme: theme(265), // purple
    features: [
      "مدیریت ساده منو با قابلیت افزودن سریع آیتم‌ها و قیمت‌ها",
      "امکان دریافت سفارش از طریق QR و لینک اختصاصی منرو",
      "نمایش آمار کلی فروش، بازدید و سفارشات انجام‌شده",
      "پشتیبانی از تم‌های رنگی مختلف برای هماهنگی با برند شما",
      "قابلیت افزودن تصاویر غذاها و توضیحات اختصاصی برای هر آیتم",
      "گزارش عملکرد روزانه و تحلیل فروش بر اساس دسته‌بندی‌ها",
      "دسترسی مدیر به تنظیمات از هر دستگاه و مرورگر",
      "پشتیبانی از چند زبان برای منوی مشتری (فارسی / انگلیسی)",
      "اتصال آسان به شبکه‌های اجتماعی و لینک سفارش مستقیم",
    ],
  }),
];

/* ------------------------------------------------------------------ */
/* Dev-only sanity checks (stripped from production builds)            */
/* ------------------------------------------------------------------ */

if (process.env.NODE_ENV !== "production") {
  const ids = plans.map((p) => p.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) {
    console.warn(`[plans] duplicate plan id(s): ${[...new Set(dupes)].join(", ")}`);
  }

  plans.forEach((p) => {
    if (!p.features.length) console.warn(`[plans] "${p.id}" has no features`);
    if (p.recolor === false && p.bgSrc === DEFAULT_BG) {
      console.warn(
        `[plans] "${p.id}" has recolor:false but no entry in BACKGROUNDS`,
      );
    }
  });
}

export default plans;