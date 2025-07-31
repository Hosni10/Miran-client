import { api } from "../lib/api";
import { unwrap } from "./helpers";
import { PaginatedTrainer } from "../types/trainer";

export const fetchTrainerPage = async (
  page_num = 1,
  page_size = 10,
): Promise<{ data: PaginatedTrainer }> => {
  const endpoint = `/v1/user/trainer-list?page_num=${page_num}&page_size=${page_size}`;

  console.log("🔧 fetchTrainerPage called with:", {
    page_num,
    page_size,
    endpoint,
  });

  const data = await unwrap(api.get(endpoint));

  console.log("🔧 fetchTrainerPage success data:", data);

  return { data: data as PaginatedTrainer };
};
