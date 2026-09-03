// src/utils/pendingIdentity.js
const IDENTITY_KEY = "menro_pending_identity";
export const GUEST_ID = "guest";

export function currentIdentity() {
  return localStorage.getItem(IDENTITY_KEY) || GUEST_ID;
}

export function setIdentity(next) {
  localStorage.setItem(IDENTITY_KEY, next);
}