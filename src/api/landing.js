import landingAxios from "./landingAxios";

// Backs LandingController.GetGeneral (GET /api/landing/general).
// Hero image + hero texts + "با منرو تو چشم باش" heading text (used by BurgerPanelSection).
//
// Assumed shape (adjust to match LandingGeneralResponse if it differs):
// {
//   heroImageUrl: string,
//   heroTitleHighlight: string,   // e.g. "منرو"
//   heroTitleText: string,        // e.g. "بهترین همیار رستوران تو"
//   burgerPanelTitle: string,     // e.g. "با منرو تو چشم باش"
// }
export async function getLandingGeneral() {
  const { data } = await landingAxios.get("/general");
  return data;
}

// Backs LandingController.GetReasons (GET /api/landing/reasons).
// "چرا منرو؟" cards, already ordered by SortOrder.
//
// Matches LandingReasonResponse:
// {
//   id: string,          // Guid
//   icon: string,        // Font Awesome class, e.g. "fa-solid fa-cube"
//   colorHex: string,    // e.g. "#ff683c"
//   title: string,
//   description: string,
//   sortOrder: number,
// }
export async function getLandingReasons() {
  const { data } = await landingAxios.get("/reasons");
  return data;
}

// Backs LandingController.GetFaqs (GET /api/landing/faqs).
// "سوالات متداول", already ordered by SortOrder.
//
// Assumed shape (array), one item per LandingFaqResponse:
// {
//   id: string | number,
//   question: string,
//   answer: string,   // paragraphs separated by a blank line, if multi-paragraph
//   sortOrder: number,
// }
export async function getLandingFaqs() {
  const { data } = await landingAxios.get("/faqs");
  return data;
}
