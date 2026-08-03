// src/utils/tagName.js
export function normalizeTagNameLive(value) {
  return value.replace(/\s+/g, "_");
}

export function normalizeTagNameFinal(value) {
  return normalizeTagNameLive(value).replace(/^_+|_+$/g, "");
}
