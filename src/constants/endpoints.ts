/**
 * API Endpoints Constants
 * Single source of truth for API endpoint paths
 */

// Food endpoints
export const FOOD_DETAIL_PATH = "/v1/resources/food/{id}/";
export const FOOD_LIST_PATH = "/v1/resources/food/";
export const FOOD_SEARCH_ENDPOINT = "/v1/resources/food_list";
export const SEARCH_PARAM_KEY = "search";
export const PAGE_PARAM_KEY = "offset";
export const LIMIT_PARAM_KEY = "limit";
export const DEFAULT_LIMIT = 50;

// Trainer endpoints
export const TRAINER_LIST_PATH = "/v1/user/trainer-list";

// User endpoints
export const USER_LIST_PATH = "/v1/user/list/";

//---------------------------------------------------------
export const SECONDARY_FOOD_ENDPOINT = "/v1/resources/secondary_food?limit=300";
export const UNITS_ENDPOINT = "/v1/resources/units?limit=300";
export const MAP_CACHE_STALE_MS = 1000 * 60 * 60; // 1 hour
//---------------------------------------------------------
