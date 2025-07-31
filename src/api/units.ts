//---------------------------------------------------------
import { api } from "../lib/api";
import { UNITS_ENDPOINT } from "../constants/endpoints";
import type { Unit } from "../types/unit";

interface Resp {
  result: Unit[];
}
export const fetchUnits = () =>
  api.get<Resp>(UNITS_ENDPOINT).then((r) => r.data.result);
//---------------------------------------------------------
