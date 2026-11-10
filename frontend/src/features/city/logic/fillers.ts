import type { CityLayout, Footprint } from '../../../shared/domain/service';

/** A non-interactive background building; x / z / w / d in plane px, h in iso px. */
export interface Filler extends Footprint {
  readonly h: number;
}

/** Demo values (:663-677): 62 px lattice, 30 % gaps, 22–42 px sides, 16–116 px tall, 18 px clearance. */
const STEP = 62;
const INSET = 14;
const SKIP = 0.3;
const CLEARANCE = 18;

/** Mulberry32 — the demo's deterministic generator. */
function rngFrom(seed: number): () => number {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function overlaps(a: Footprint, b: Footprint, gap: number): boolean {
  return a.x < b.x + b.w + gap && a.x + a.w > b.x - gap && a.z < b.z + b.d + gap && a.z + a.d > b.z - gap;
}

/** Zero or one filler at a lattice point. */
function candidate(rng: () => number, x: number, z: number): Filler[] {
  if (rng() < SKIP) return [];
  const w = 22 + rng() * 20;
  const d = 22 + rng() * 20;
  const fx = x + rng() * (56 - w);
  const fz = z + rng() * (56 - d);
  return [{ x: fx, z: fz, w, d, h: 16 + Math.pow(rng(), 1.6) * 100 }];
}

function latticeOf(plate: Footprint): { x: number; z: number }[] {
  const points: { x: number; z: number }[] = [];
  for (let z = plate.z + INSET; z < plate.z + plate.d - 44; z += STEP)
    for (let x = plate.x + INSET; x < plate.x + plate.w - 44; x += STEP) points.push({ x, z });
  return points;
}

/** Deterministic filler buildings on every drawn plate, clear of all service footprints (Decided I1). */
export function fillers(city: CityLayout, seed: number): Filler[] {
  const rng = rngFrom(seed);
  const taken = [...city.footprints.values()];
  return city.districts
    .flatMap((district) => latticeOf(district.plate))
    .flatMap((p) => candidate(rng, p.x, p.z))
    .filter((f) => !taken.some((t) => overlaps(f, t, CLEARANCE)));
}
