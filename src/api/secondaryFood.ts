//---------------------------------------------------------
import { api } from "../lib/api";
import { SECONDARY_FOOD_ENDPOINT } from "../constants/endpoints";
import type { SecondaryFood } from "../types/secondaryFood";

interface Resp {
  result: SecondaryFood[];
}
export const fetchSecondaryFood = () =>
  api.get<Resp>(SECONDARY_FOOD_ENDPOINT).then((r) => r.data.result);
//---------------------------------------------------------
