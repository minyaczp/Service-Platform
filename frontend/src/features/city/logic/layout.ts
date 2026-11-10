import type { CityLayout, District, Footprint, Service } from '../../../shared/domain/service';

/** Footprint side as a fraction of its cell — demo footprint 80 in a 113 cell (NI-01 Conditions). */
export const FOOTPRINT_RATIO = 0.7;
const MIN_COLS = 3;

interface Grid {
  readonly cols: number;
  readonly rows: number;
}

/** Square plates: max(3, ⌈√n⌉)²; the Unassigned strip: one row of max(3, n) (Decided I6). */
function gridOf(district: District, n: number): Grid {
  if (district.plate.d < district.plate.w) return { cols: Math.max(MIN_COLS, n), rows: 1 };
  const side = Math.max(MIN_COLS, Math.ceil(Math.sqrt(n)));
  return { cols: side, rows: side };
}

function slot(plate: Footprint, grid: Grid, index: number): Footprint {
  const cellW = plate.w / grid.cols;
  const cellD = plate.d / grid.rows;
  const w = cellW * FOOTPRINT_RATIO;
  const d = cellD * FOOTPRINT_RATIO;
  const col = index % grid.cols;
  const row = Math.floor(index / grid.cols);
  return { x: plate.x + col * cellW + (cellW - w) / 2, z: plate.z + row * cellD + (cellD - d) / 2, w, d };
}

function groupByDistrict(
  services: readonly Service[],
  districtOf: (domain: string) => District,
): Map<District, string[]> {
  const groups = new Map<District, string[]>();
  for (const s of services) {
    const district = districtOf(s.reg.domain);
    groups.set(district, [...(groups.get(district) ?? []), s.reg.id]);
  }
  return groups;
}

/** Places every service in its district's grid, in id order, and lists the plates to draw. */
export function layout(services: readonly Service[], districtOf: (domain: string) => District): CityLayout {
  const footprints = new Map<string, Footprint>();
  for (const [district, ids] of groupByDistrict(services, districtOf)) {
    const grid = gridOf(district, ids.length);
    [...ids].sort().forEach((id, i) => footprints.set(id, slot(district.plate, grid, i)));
  }
  return { footprints, districts: platesInUse(services, districtOf) };
}

/** Districts holding at least one service, top-left to bottom-right; Unassigned only when used. */
function platesInUse(services: readonly Service[], districtOf: (domain: string) => District): District[] {
  const used = new Set(services.map((s) => districtOf(s.reg.domain)));
  return [...used].sort((a, b) => a.plate.z - b.plate.z || a.plate.x - b.plate.x);
}
