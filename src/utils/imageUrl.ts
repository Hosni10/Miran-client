const MEDIA_BASE = "/media"; // Use local proxy for CORS-free loading
const PLACEHOLDER_IMAGE = "/assets/placeholder_food.svg";

export const buildImageUrl = (relative: string | null): string =>
  relative
    ? `${MEDIA_BASE}/${encodeURI(relative)}`.replace("//media", "/media") // double-slash fix
    : PLACEHOLDER_IMAGE;
