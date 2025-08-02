
const PLACEHOLDER_IMAGE = "/assets/placeholder_food.svg";

export const buildImageUrl = (relative: string | null): string =>
  relative
    ? `${import.meta.env.VITE_API_URL}/${encodeURI(relative)}`.replace(`${import.meta.env.VITE_API_URL}`, `${import.meta.env.VITE_MEDIA_BASE_URL}`) // double-slash fix
    : PLACEHOLDER_IMAGE;
