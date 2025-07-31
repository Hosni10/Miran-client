//---------------------------------------------------------
import { useQuery } from "@tanstack/react-query";
import { fetchSecondaryFood } from "../api/secondaryFood";
import { MAP_CACHE_STALE_MS } from "../constants/endpoints";
import type { SecondaryFood } from "../types/secondaryFood";

export const useSecondaryFoodMap = () => {
  const { data = [] } = useQuery<SecondaryFood[]>({
    queryKey: ["secondary-food"],
    queryFn: fetchSecondaryFood,
    staleTime: MAP_CACHE_STALE_MS,
  });

  if (process.env.NODE_ENV !== "production" && data.length === 0)
    console.warn("[SecondaryFoodMap] fetched 0 items");
  return Object.fromEntries(
    data.map((c) => [c.id, { title: c.title, icon: c.icon }]),
  ) as Record<number, { title: string; icon: string | null }>;
};
//---------------------------------------------------------
