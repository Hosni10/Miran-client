const TARGET_API = "https://testing.miranapp.com";
const MEDIA_BASE = "/media"; // Use local proxy for CORS-free loading
const PLACEHOLDER_IMAGE = "/assets/placeholder_food.svg";

export const buildImageUrl = (relative: string | null): string =>
  relative
    ? `${TARGET_API}/${MEDIA_BASE}/${encodeURI(relative)}`.replace(`${TARGET_API}//media`, `${TARGET_API}/media`) // double-slash fix
    : PLACEHOLDER_IMAGE;
