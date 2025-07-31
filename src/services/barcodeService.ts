import { api } from "../lib/api";

export interface BarcodeResponse {
  id: number;
  code: string;
  food: number;
}

export interface DeleteBarcodeResponse {
  status: boolean;
}

/**
 * Create a new barcode for a food item
 * @param foodId - The ID of the food item
 * @param code - The barcode string
 */
export const createBarcode = async (
  foodId: number,
  code: string
): Promise<BarcodeResponse> => {
  const response = await api.post("/v1/resources/bar_code", {
    code,
    food: foodId,
  });
  return response.data;
};

/**
 * Delete a barcode by code and food ID
 * @param foodId - The ID of the food item
 * @param code - The barcode string to delete
 */
export const deleteBarcode = async (
  foodId: number,
  code: string
): Promise<DeleteBarcodeResponse> => {
  const response = await api.delete(`/v1/resources/bar_code/${code}/using_code`, {
    data: { food: String(foodId) },
  });
  return response.data;
};