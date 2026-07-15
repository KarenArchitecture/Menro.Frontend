import adminLandingAxios from "./AdminLandingAxios";

/* ==========================================================================
 * Mirrors AdminLandingController.cs 1:1:
 *   GET  /general                 -> getLandingGeneral
 *   PUT  /general                 -> updateLandingGeneral
 *   POST /general/hero-image      -> uploadLandingHeroImage
 *   GET  /reasons                 -> getLandingReasons
 *   POST /reasons                 -> createLandingReason
 *   PUT  /reasons/{id}            -> updateLandingReason
 *   DELETE /reasons/{id}          -> deleteLandingReason
 *   PUT  /reasons/{id}/move       -> moveLandingReason
 *   GET  /faqs                    -> getLandingFaqs
 *   POST /faqs                    -> createLandingFaq
 *   PUT  /faqs/{id}               -> updateLandingFaq
 *   DELETE /faqs/{id}             -> deleteLandingFaq
 *   PUT  /faqs/{id}/move          -> moveLandingFaq
 *
 * ASP.NET Core serializes DTOs as camelCase JSON by default, so
 * LandingReasonResponse.ColorHex arrives as `colorHex`, etc. The map*
 * helpers below only exist to translate between that camelCase DTO shape
 * and the local {icon, color, title, description} shape the components use
 * (same purpose as mapBlogPostFromApi in adminBlogs.js).
 * ========================================================================== */

/* ---------------------------- helpers ---------------------------- */

// Pulls the bare file name back out of a full hero image URL so it can be
// sent as `oldFileName` when uploading a replacement image (same convention
// as the cover-image cleanup on BlogPostsController).
export const extractFileNameFromUrl = (url) => {
  if (!url) return null;
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").pop() || "") || null;
  } catch {
    const parts = url.split("/");
    return parts[parts.length - 1] || null;
  }
};

/* ---------------------------- General (hero) ---------------------------- */

export const getLandingGeneral = () =>
  adminLandingAxios.get("/general").then((r) => r.data); // LandingGeneralResponse

// heroImageFileName must be the bare file name previously returned by
// uploadLandingHeroImage — never a full URL. Pass null to remove the image.
export const updateLandingGeneral = ({
  heroHighlight,
  heroTitle,
  spotlightTitle,
  heroImageFileName,
}) =>
  adminLandingAxios
    .put("/general", {
      heroHighlight,
      heroTitle,
      spotlightTitle,
      heroImageFileName: heroImageFileName || null,
    })
    .then((r) => r.data); // LandingGeneralResponse

// Pass the currently-stored file name as oldFileName when replacing an
// existing image so the old file gets cleaned up on the server.
export const uploadLandingHeroImage = (file, oldFileName) => {
  const formData = new FormData();
  formData.append("file", file);
  return adminLandingAxios
    .post("/general/hero-image", formData, {
      params: oldFileName ? { oldFileName } : undefined,
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data); // { fileName, url }
};

/* ---------------------------- Reasons ("چرا منرو؟") ---------------------------- */

const mapReasonFromApi = (dto) => ({
  id: dto.id,
  icon: dto.icon,
  color: dto.colorHex,
  title: dto.title,
  description: dto.description,
  sortOrder: dto.sortOrder,
});

const mapReasonToApi = (reason) => ({
  icon: reason.icon,
  colorHex: reason.color,
  title: reason.title,
  description: reason.description,
});

export const getLandingReasons = () =>
  adminLandingAxios.get("/reasons").then((r) => r.data.map(mapReasonFromApi));

export const createLandingReason = (reason) =>
  adminLandingAxios
    .post("/reasons", mapReasonToApi(reason))
    .then((r) => mapReasonFromApi(r.data));

export const updateLandingReason = (id, reason) =>
  adminLandingAxios
    .put(`/reasons/${id}`, mapReasonToApi(reason))
    .then((r) => mapReasonFromApi(r.data));

export const deleteLandingReason = (id) =>
  adminLandingAxios.delete(`/reasons/${id}`).then((r) => r.data);

// direction must be "up" or "down" (matches the admin UI's move buttons).
export const moveLandingReason = (id, direction) =>
  adminLandingAxios
    .put(`/reasons/${id}/move`, null, { params: { direction } })
    .then((r) => r.data);

/* ---------------------------- FAQ ("سوالات متداول") ---------------------------- */

const mapFaqFromApi = (dto) => ({
  id: dto.id,
  question: dto.question,
  answer: dto.answer,
  sortOrder: dto.sortOrder,
});

export const getLandingFaqs = () =>
  adminLandingAxios.get("/faqs").then((r) => r.data.map(mapFaqFromApi));

export const createLandingFaq = ({ question, answer }) =>
  adminLandingAxios
    .post("/faqs", { question, answer })
    .then((r) => mapFaqFromApi(r.data));

export const updateLandingFaq = (id, { question, answer }) =>
  adminLandingAxios
    .put(`/faqs/${id}`, { question, answer })
    .then((r) => mapFaqFromApi(r.data));

export const deleteLandingFaq = (id) =>
  adminLandingAxios.delete(`/faqs/${id}`).then((r) => r.data);

// direction must be "up" or "down" (matches the admin UI's move buttons).
export const moveLandingFaq = (id, direction) =>
  adminLandingAxios
    .put(`/faqs/${id}/move`, null, { params: { direction } })
    .then((r) => r.data);
