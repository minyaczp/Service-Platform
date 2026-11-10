import type { Footprint } from '../../../shared/domain/service';
import { PLANE_PX_PER_UNIT } from '../logic/visual';
import { centreOf } from '../logic/world';

/** Orbit camera: target (tx, ty, tz), radius r, azimuth th, polar ph, horizontal view-offset shift. */
export interface Cam {
  readonly tx: number;
  readonly ty: number;
  readonly tz: number;
  readonly r: number;
  readonly th: number;
  readonly ph: number;
  readonly shift: number;
}

/** Handoff §City view 3D. */
export const CAMERA = {
  minR: 12, maxR: 260, minPh: 0.3, maxPh: 1.38,
  flyMs: 1200, autoRotate: 0.0007, clickPx: 5,
  overview: { tx: 0, ty: 0, tz: 0, r: 120, ph: 0.95, shift: 0 },
  start: { tx: 0, ty: 0, tz: 0, r: 120, th: 0.9, ph: 0.95, shift: 0 },
} as const;

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/** Camera at fraction t ∈ [0, 1] of a tween; azimuth is kept from `from`. */
export function tweenAt(from: Cam, to: Omit<Cam, 'th'>, t: number): Cam {
  const k = easeInOutCubic(Math.min(1, Math.max(0, t)));
  return {
    tx: lerp(from.tx, to.tx, k), ty: lerp(from.ty, to.ty, k), tz: lerp(from.tz, to.tz, k),
    r: lerp(from.r, to.r, k), th: from.th, ph: lerp(from.ph, to.ph, k), shift: lerp(from.shift, to.shift, k),
  };
}

/** Fly-to target for a building of height h (world units): (x, 0.55 H, z), r = max(32, 2.2 H), φ 1.1, 14 % shift. */
export function flyTarget(fp: Footprint, h: number): Omit<Cam, 'th'> {
  const c = centreOf(fp);
  return { tx: c.x, ty: h * 0.55, tz: c.z, r: Math.max(32, h * 2.2), ph: 1.1, shift: 0.14 };
}

/** The handoff framed its 72-unit plate span at r 120; keep that ratio for any city size. */
const OVERVIEW_R_PER_UNIT = 120 / 72;

/** Smallest footprint covering every plate (plane px). */
function boundsOf(plates: readonly Footprint[]): Footprint {
  const x = Math.min(...plates.map((p) => p.x));
  const z = Math.min(...plates.map((p) => p.z));
  const w = Math.max(...plates.map((p) => p.x + p.w)) - x;
  const d = Math.max(...plates.map((p) => p.z + p.d)) - z;
  return { x, z, w, d };
}

/** Overview goal framing the drawn plates: centred on them, r scaled to their span. No plates → the handoff overview. */
export function overviewOf(plates: readonly Footprint[]): Omit<Cam, 'th'> {
  if (plates.length === 0) return CAMERA.overview;
  const b = boundsOf(plates);
  const c = centreOf(b);
  const span = Math.max(b.w, b.d) / PLANE_PX_PER_UNIT;
  const r = Math.min(CAMERA.maxR, Math.max(CAMERA.minR, span * OVERVIEW_R_PER_UNIT));
  return { ...CAMERA.overview, tx: c.x, tz: c.z, r };
}
