// src/components/admin/QrCodeSection.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import QRCodeStyling from "qr-code-styling";
import JSZip from "jszip";
import ownerRestaurantQr from "../../api/ownerRestaurantQr";
import ownerRestaurantTables from "../../api/ownerRestaurantTables";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../assets/css/admin/QrCodeSection.css";

const PREVIEW_SIZE = 240;
const DOWNLOAD_SIZE = 1024;

// فقط رنگ‌های تیره، تا کنتراست روی زمینه‌ی سفید همیشه برای اسکن کافی باشد.
const COLOR_PRESETS = [
  { name: "مشکی", value: "#111111" },
  { name: "سرمه‌ای", value: "#1e3a5f" },
  { name: "نارنجی تیره", value: "#c2410c" },
  { name: "سبز تیره", value: "#14532d" },
  { name: "بنفش تیره", value: "#4c1d95" },
];

const DOT_STYLES = [
  { key: "square", label: "مربعی" },
  { key: "rounded", label: "گرد" },
];

/* ---------- Printable card ---------- */
// هر دو اندازه نسبت یکسان (۱ به ۱٫۴۱۴) دارند؛ پس طرح کارت برای هر دو یکی است
// و فقط رزولوشن خروجی و اندازه‌ی صفحه‌ی PDF فرق می‌کند (۳۰۰ dpi).
const CARD_SIZES = {
  a6: {
    label: "A6",
    hint: "۱۰٫۵×۱۴٫۸ سانتی‌متر",
    mmW: 105,
    mmH: 148,
    pxW: 1240,
  },
  a5: { label: "A5", hint: "۱۴٫۸×۲۱ سانتی‌متر", mmW: 148, mmH: 210, pxW: 1748 },
};
const CARD_PREVIEW_WIDTH = 620;
const DEFAULT_HEADLINE = "برای مشاهده‌ی منو اسکن کنید";

function buildQr({ data, size, color, dotStyle, logoUrl }) {
  return new QRCodeStyling({
    width: size,
    height: size,
    type: "canvas",
    data,
    image: logoUrl || undefined,
    margin: Math.round(size * 0.04),
    qrOptions: { errorCorrectionLevel: "H" },
    dotsOptions: { color, type: dotStyle },
    cornersSquareOptions: {
      color,
      type: dotStyle === "rounded" ? "extra-rounded" : "square",
    },
    cornersDotOptions: { color },
    backgroundOptions: { color: "#fafaf4" },
    imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.24 },
  });
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // لوگو اختیاری است؛ خطا کارت را خراب نکند
    img.src = src;
  });
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function pathRoundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
  }
}

// تمام ابعاد نسبت به عرض کارت (W) محاسبه می‌شوند تا طرح در هر رزولوشنی یکسان بماند.
function drawCard({
  width: W,
  height: H,
  color,
  name,
  headline,
  link,
  qrImage,
  logoImage,
  fontFamily,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fafaf4";
  ctx.fillRect(0, 0, W, H);

  // قاب
  const m = W * 0.04;
  ctx.lineWidth = W * 0.008;
  ctx.strokeStyle = color;
  pathRoundRect(ctx, m, m, W - 2 * m, H - 2 * m, W * 0.05);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.direction = "rtl";
  const cx = W / 2;
  let y = W * 0.1;

  // لوگو
  if (logoImage) {
    const d = W * 0.17;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, y + d / 2, d / 2, 0, Math.PI * 2);
    ctx.clip();
    const side = Math.min(logoImage.width, logoImage.height);
    ctx.drawImage(
      logoImage,
      (logoImage.width - side) / 2,
      (logoImage.height - side) / 2,
      side,
      side,
      cx - d / 2,
      y,
      d,
      d,
    );
    ctx.restore();
    ctx.lineWidth = W * 0.004;
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.arc(cx, y + d / 2, d / 2, 0, Math.PI * 2);
    ctx.stroke();
    y += d + W * 0.035;
  }

  // نام رستوران
  if (name) {
    const fs = W * 0.062;
    ctx.fillStyle = "#111111";
    ctx.font = `700 ${fs}px ${fontFamily}`;
    const lines = wrapLines(ctx, name, W * 0.74).slice(0, 2);
    lines.forEach((ln) => {
      y += fs;
      ctx.fillText(ln, cx, y);
      y += fs * 0.25;
    });
    y += W * 0.015;
  }

  // خط جداکننده
  ctx.fillStyle = color;
  pathRoundRect(ctx, cx - W * 0.06, y, W * 0.12, W * 0.008, W * 0.004);
  ctx.fill();
  y += W * 0.04;

  // متن راهنما
  if (headline) {
    const fs = W * 0.05;
    ctx.fillStyle = color;
    ctx.font = `700 ${fs}px ${fontFamily}`;
    const lines = wrapLines(ctx, headline, W * 0.74).slice(0, 2);
    lines.forEach((ln) => {
      y += fs;
      ctx.fillText(ln, cx, y);
      y += fs * 0.3;
    });
  }

  // QR (به پایین کارت لنگر شده تا همیشه جای ثابت داشته باشد)
  const qrSize = W * 0.6;
  const qrX = cx - qrSize / 2;
  const qrY = H - W * 0.15 - qrSize;
  const pad = W * 0.02;
  ctx.lineWidth = W * 0.004;
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  pathRoundRect(
    ctx,
    qrX - pad,
    qrY - pad,
    qrSize + 2 * pad,
    qrSize + 2 * pad,
    W * 0.025,
  );
  ctx.stroke();
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // لینک زیر QR
  ctx.direction = "ltr";
  ctx.fillStyle = "#555555";
  ctx.font = `500 ${W * 0.026}px ${fontFamily}`;
  ctx.fillText(link, cx, H - W * 0.1);

  // فوتر
  ctx.direction = "rtl";
  ctx.fillStyle = "#9a9a9a";
  ctx.font = `500 ${W * 0.024}px ${fontFamily}`;
  ctx.fillText("ساخته‌شده با منرو", cx, H - W * 0.065);

  return canvas;
}

export default function QrCodeSection() {
  useDocumentTitle("کد QR");

  const { notify } = useGlobalUI();

  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [tables, setTables] = useState([]);

  const [color, setColor] = useState(COLOR_PRESETS[0].value);
  const [dotStyle, setDotStyle] = useState("square");
  const [useLogo, setUseLogo] = useState(true);

  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);
  const [cardSize, setCardSize] = useState("a6");
  const [cardPreview, setCardPreview] = useState(null);

  const [busyKey, setBusyKey] = useState(null); // "png" | "svg" | "zip" | "card-png" | "card-pdf" | `table-${id}`
  const [copied, setCopied] = useState(false);

  const previewRef = useRef(null);
  const qrRef = useRef(null);

  const menuUrl = useMemo(
    () => (slug ? `${window.location.origin}/restaurant/${slug}` : ""),
    [slug],
  );

  const effectiveLogo = useLogo ? logoUrl : null;

  /* ---------- Load ---------- */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [infoRes, tablesRes] = await Promise.all([
        ownerRestaurantQr.get(""),
        ownerRestaurantTables.get(""),
      ]);
      setSlug(infoRes.data?.slug ?? "");
      setLogoUrl(infoRes.data?.logoUrl ?? null);
      setRestaurantName(infoRes.data?.name ?? "");
      setTables(tablesRes.data ?? []);
    } catch (err) {
      console.error("Error loading QR info:", err);
      notify({ type: "error", message: "دریافت اطلاعات QR با خطا مواجه شد" });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------- Live preview ---------- */
  useEffect(() => {
    if (!menuUrl || !previewRef.current) return;

    const options = {
      data: menuUrl,
      size: PREVIEW_SIZE,
      color,
      dotStyle,
      logoUrl: effectiveLogo,
    };

    if (!qrRef.current) {
      qrRef.current = buildQr(options);
      previewRef.current.innerHTML = "";
      qrRef.current.append(previewRef.current);
    } else {
      previewRef.current.innerHTML = "";
      qrRef.current = buildQr(options);
      qrRef.current.append(previewRef.current);
    }
  }, [menuUrl, color, dotStyle, effectiveLogo]);

  /* ---------- Printable card ---------- */
  const buildCardCanvas = async (sizeKey, pxWidth) => {
    const s = CARD_SIZES[sizeKey];
    const width = pxWidth;
    const height = Math.round((pxWidth * s.mmH) / s.mmW);

    const fontFamily =
      getComputedStyle(document.body).fontFamily || "sans-serif";
    try {
      await document.fonts.load(`700 40px ${fontFamily}`);
    } catch {
      /* فونت سیستم هم کافی است */
    }

    const qrBlob = await buildQr({
      data: menuUrl,
      size: pxWidth >= 1000 ? 1024 : 512,
      color,
      dotStyle,
      logoUrl: effectiveLogo,
    }).getRawData("png");
    const qrImage = await createImageBitmap(qrBlob);
    const logoImage = await loadImage(logoUrl);

    return drawCard({
      width,
      height,
      color,
      name: restaurantName,
      headline: headline.trim(),
      link: menuUrl.replace(/^https?:\/\//, ""),
      qrImage,
      logoImage,
      fontFamily,
    });
  };

  useEffect(() => {
    if (!menuUrl) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const canvas = await buildCardCanvas(cardSize, CARD_PREVIEW_WIDTH);
        if (!cancelled) setCardPreview(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("Card preview failed:", err);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    menuUrl,
    color,
    dotStyle,
    effectiveLogo,
    logoUrl,
    restaurantName,
    headline,
    cardSize,
  ]);

  const downloadCardPng = async () => {
    setBusyKey("card-png");
    try {
      const canvas = await buildCardCanvas(cardSize, CARD_SIZES[cardSize].pxW);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      saveBlob(blob, `menu-card-${slug}-${cardSize}.png`);
    } catch (err) {
      console.error("Card PNG failed:", err);
      notify({ type: "error", message: "دانلود کارت با خطا مواجه شد." });
    } finally {
      setBusyKey(null);
    }
  };

  const downloadCardPdf = async () => {
    setBusyKey("card-pdf");
    try {
      const s = CARD_SIZES[cardSize];
      const canvas = await buildCardCanvas(cardSize, s.pxW);
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        unit: "mm",
        format: [s.mmW, s.mmH],
        orientation: "portrait",
      });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, s.mmW, s.mmH);
      pdf.save(`menu-card-${slug}-${cardSize}.pdf`);
    } catch (err) {
      console.error("Card PDF failed:", err);
      notify({ type: "error", message: "ساخت PDF با خطا مواجه شد." });
    } finally {
      setBusyKey(null);
    }
  };

  /* ---------- Downloads ---------- */
  const makeQrBlob = async (data, extension) => {
    const qr = buildQr({
      data,
      size: DOWNLOAD_SIZE,
      color,
      dotStyle,
      logoUrl: effectiveLogo,
    });
    return qr.getRawData(extension);
  };

  const downloadMain = async (extension) => {
    setBusyKey(extension);
    try {
      const blob = await makeQrBlob(menuUrl, extension);
      saveBlob(blob, `menu-qr-${slug}.${extension}`);
    } catch (err) {
      console.error("QR download failed:", err);
      notify({ type: "error", message: "دانلود QR با خطا مواجه شد." });
    } finally {
      setBusyKey(null);
    }
  };

  const downloadTable = async (table) => {
    setBusyKey(`table-${table.id}`);
    try {
      const blob = await makeQrBlob(`${menuUrl}?table=${table.id}`, "png");
      saveBlob(blob, `qr-${slug}-table-${table.id}.png`);
    } catch (err) {
      console.error("Table QR download failed:", err);
      notify({ type: "error", message: "دانلود QR میز با خطا مواجه شد." });
    } finally {
      setBusyKey(null);
    }
  };

  const downloadAllTables = async () => {
    if (tables.length === 0) return;
    setBusyKey("zip");
    try {
      const zip = new JSZip();
      for (const table of tables) {
        const blob = await makeQrBlob(`${menuUrl}?table=${table.id}`, "png");
        zip.file(`${table.label.replace(/[\\/:*?"<>|]/g, "-")}.png`, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveBlob(content, `qr-tables-${slug}.zip`);
    } catch (err) {
      console.error("ZIP download failed:", err);
      notify({ type: "error", message: "ساخت فایل ZIP با خطا مواجه شد." });
    } finally {
      setBusyKey(null);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      notify({ type: "error", message: "کپی لینک انجام نشد." });
    }
  };

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <div className="panel qrc-panel">
        <div className="empty-hint">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="panel qrc-panel">
        <div className="empty-hint">
          ابتدا در «پروفایل رستوران» یک آدرس اختصاصی (Slug) ثبت کنید.
        </div>
      </div>
    );
  }

  return (
    <div className="panel qrc-panel">
      <div className="view-header qrc-header">
        <div>
          <h3>کد QR</h3>
          <p className="panel-subtitle qrc-subtitle">
            QR منو را دانلود و چاپ کنید تا مشتری با اسکن آن به صفحه‌ی رستوران
            برسد
          </p>
        </div>
        <span className="qrc-count-badge">
          <i className="fa-solid fa-qrcode" /> QR منو و میزها
        </span>
      </div>

      {/* ---------- Main QR ---------- */}
      <section className="qrc-main">
        <div className="qrc-preview-card">
          <div className="qrc-preview" ref={previewRef} />
          <div className="qrc-link-row">
            <span className="qrc-link" dir="ltr" title={menuUrl}>
              {menuUrl}
            </span>
            <button
              className="btn-icon"
              onClick={copyLink}
              aria-label="کپی لینک"
              title="کپی لینک"
            >
              <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} />
            </button>
          </div>
        </div>

        <div className="qrc-settings">
          <div className="qrc-field">
            <span className="qrc-field__label">رنگ کد</span>
            <div className="qrc-swatches">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`qrc-swatch ${color === c.value ? "qrc-swatch--active" : ""}`}
                  style={{ background: c.value }}
                  onClick={() => setColor(c.value)}
                  aria-label={c.name}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="qrc-field">
            <span className="qrc-field__label">شکل نقطه‌ها</span>
            <div className="qrc-segmented">
              {DOT_STYLES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`qrc-segmented__btn ${dotStyle === s.key ? "qrc-segmented__btn--active" : ""}`}
                  onClick={() => setDotStyle(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <label
            className={`qrc-toggle ${!logoUrl ? "qrc-toggle--disabled" : ""}`}
          >
            <input
              type="checkbox"
              checked={useLogo && !!logoUrl}
              disabled={!logoUrl}
              onChange={(e) => setUseLogo(e.target.checked)}
            />
            <span>
              نمایش لوگوی رستوران وسط QR
              {!logoUrl && (
                <em> (ابتدا لوگو را در پروفایل رستوران آپلود کنید)</em>
              )}
            </span>
          </label>

          <div className="qrc-downloads">
            <button
              className="qrc-btn qrc-btn--primary"
              onClick={() => downloadMain("png")}
              disabled={busyKey !== null}
            >
              <i
                className={`fa-solid ${busyKey === "png" ? "fa-spinner fa-spin" : "fa-image"}`}
              />
              دانلود PNG
            </button>
            <button
              className="qrc-btn"
              onClick={() => downloadMain("svg")}
              disabled={busyKey !== null}
            >
              <i
                className={`fa-solid ${busyKey === "svg" ? "fa-spinner fa-spin" : "fa-vector-square"}`}
              />
              دانلود SVG (مناسب چاپخانه)
            </button>
          </div>

          <p className="qrc-tip">
            <i className="fa-solid fa-circle-info" /> برای چاپ، اندازه‌ی QR را
            حداقل ۳×۳ سانتی‌متر در نظر بگیرید و پیش از چاپ نهایی با گوشی تست
            کنید.
          </p>
        </div>
      </section>

      {/* ---------- Printable card ---------- */}
      <section className="qrc-tables qrc-card-section">
        <div className="qrc-tables__head">
          <div>
            <h4>کارت آماده‌ی چاپ</h4>
            <p className="qrc-subtitle">
              کارتی با نام و لوگوی رستوران که مستقیم چاپ می‌شود و سر میزها قرار
              می‌گیرد؛ رنگ و شکل QR از تنظیمات بالا اعمال می‌شود
            </p>
          </div>
        </div>

        <div className="qrc-card-grid">
          <div className="qrc-card-preview">
            {cardPreview ? (
              <img src={cardPreview} alt="پیش‌نمایش کارت چاپی" />
            ) : (
              <div className="empty-hint">در حال ساخت پیش‌نمایش...</div>
            )}
          </div>

          <div className="qrc-settings">
            <div className="qrc-field">
              <span className="qrc-field__label">متن روی کارت</span>
              <input
                type="text"
                className="qrc-input"
                value={headline}
                maxLength={60}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder={DEFAULT_HEADLINE}
              />
            </div>

            <div className="qrc-field">
              <span className="qrc-field__label">اندازه‌ی کارت</span>
              <div className="qrc-segmented">
                {Object.entries(CARD_SIZES).map(([key, s]) => (
                  <button
                    key={key}
                    type="button"
                    className={`qrc-segmented__btn ${cardSize === key ? "qrc-segmented__btn--active" : ""}`}
                    onClick={() => setCardSize(key)}
                  >
                    {s.label} ({s.hint})
                  </button>
                ))}
              </div>
            </div>

            <div className="qrc-downloads">
              <button
                className="qrc-btn qrc-btn--primary"
                onClick={downloadCardPdf}
                disabled={busyKey !== null}
              >
                <i
                  className={`fa-solid ${busyKey === "card-pdf" ? "fa-spinner fa-spin" : "fa-file-pdf"}`}
                />
                دانلود PDF (آماده‌ی چاپ)
              </button>
              <button
                className="qrc-btn"
                onClick={downloadCardPng}
                disabled={busyKey !== null}
              >
                <i
                  className={`fa-solid ${busyKey === "card-png" ? "fa-spinner fa-spin" : "fa-image"}`}
                />
                دانلود PNG
              </button>
            </div>

            <p className="qrc-tip">
              <i className="fa-solid fa-circle-info" /> هنگام چاپ، گزینه‌ی
              «اندازه‌ی واقعی» (Actual size / 100%) را انتخاب کنید تا کارت کوچک
              یا بزرگ نشود.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Tables ---------- */}
      {/* <section className="qrc-tables">
        <div className="qrc-tables__head">
          <div>
            <h4>QR هر میز</h4>
            <p className="qrc-subtitle">
              هر میز لینک اختصاصی خودش را دارد تا سفارش به همان میز مرتبط شود
            </p>
          </div>
          <button
            className="qrc-btn"
            onClick={downloadAllTables}
            disabled={busyKey !== null || tables.length === 0}
          >
            <i
              className={`fa-solid ${busyKey === "zip" ? "fa-spinner fa-spin" : "fa-file-zipper"}`}
            />
            دانلود همه (ZIP)
          </button>
        </div>

        {tables.length === 0 ? (
          <div className="empty-hint">
            هنوز میزی ثبت نشده. از تب «میزهای رستوران» میزها را اضافه کنید.
          </div>
        ) : (
          <div className="qrc-grid">
            {tables.map((table) => (
              <div key={table.id} className="qrc-table-card">
                <div className="qrc-table-card__icon">
                  <i className="fa-solid fa-chair" />
                </div>
                <div className="qrc-table-card__label" title={table.label}>
                  {table.label}
                </div>
                <button
                  className="qrc-btn qrc-btn--small"
                  onClick={() => downloadTable(table)}
                  disabled={busyKey !== null}
                >
                  <i
                    className={`fa-solid ${busyKey === `table-${table.id}` ? "fa-spinner fa-spin" : "fa-download"}`}
                  />
                  دانلود QR
                </button>
              </div>
            ))}
          </div>
        )}
      </section> */}
    </div>
  );
}
