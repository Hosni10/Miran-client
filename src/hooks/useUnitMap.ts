//---------------------------------------------------------
import { useQuery } from "@tanstack/react-query";
import { fetchUnits } from "../api/units";
import { MAP_CACHE_STALE_MS } from "../constants/endpoints";
import type { Unit } from "../types/unit";

export const useUnitMap = () => {
  const { data = [] } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: fetchUnits,
    staleTime: MAP_CACHE_STALE_MS,
  });

  if (process.env.NODE_ENV !== "production" && data.length === 0)
    console.warn("[UnitMap] fetched 0 items");
  return Object.fromEntries(data.map((u) => [u.id, u.title])) as Record<
    number,
    string
  >;
};
//---------------------------------------------------------
