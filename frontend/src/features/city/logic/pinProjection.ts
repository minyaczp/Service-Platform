import type { Vec3 } from './world';

/** Camera data a pin projection needs; `viewProj` is projection × view, 16 numbers, column-major. */
export interface PinCamera {
  readonly viewProj: readonly number[];
  readonly position: Vec3;
  readonly near: number;
  readonly far: number;
}

export interface Viewport {
  readonly w: number;
  readonly h: number;
}

export type PinPlacement =
  | { readonly kind: 'shown'; readonly x: number; readonly y: number; readonly zIndex: number }
  | { readonly kind: 'hidden' };

/** Pins stack below the top bar (z 15) and the info panel (z 20): nearest pin 10, farthest 0. */
const Z_NEAR = 10;
const Z_FAR = 0;
/** Below one device pixel at dpr 2, so skipping a smaller move is never visible. */
const MOVE_EPSILON_PX = 0.1;
const HIDDEN: PinPlacement = { kind: 'hidden' };

/** drei `objectZIndex`: camera distance mapped linearly from [near, far] onto [Z_NEAR, Z_FAR]. */
function zIndexAt(distance: number, cam: PinCamera): number {
  const a = (Z_FAR - Z_NEAR) / (cam.far - cam.near);
  const b = Z_FAR - a * cam.far;
  return Math.round(a * distance + b);
}

function distanceBetween(p: Vec3, q: Vec3): number {
  return Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
}

/** Viewport px of a world point; hidden behind the camera (clip w ≤ 0) or when the viewport has no area. */
export function projectPin(anchor: Vec3, cam: PinCamera, viewport: Viewport): PinPlacement {
  if (viewport.w <= 0 || viewport.h <= 0) return HIDDEN;
  const m = cam.viewProj;
  const { x, y, z } = anchor;
  const w = (m[3] ?? 0) * x + (m[7] ?? 0) * y + (m[11] ?? 0) * z + (m[15] ?? 0);
  if (w <= 0) return HIDDEN;
  const ndcX = ((m[0] ?? 0) * x + (m[4] ?? 0) * y + (m[8] ?? 0) * z + (m[12] ?? 0)) / w;
  const ndcY = ((m[1] ?? 0) * x + (m[5] ?? 0) * y + (m[9] ?? 0) * z + (m[13] ?? 0)) / w;
  return {
    kind: 'shown',
    x: ((ndcX + 1) * viewport.w) / 2,
    y: ((1 - ndcY) * viewport.h) / 2,
    zIndex: zIndexAt(distanceBetween(anchor, cam.position), cam),
  };
}

/** True when writing `b` over `a` would change nothing visible. */
export function samePlacement(a: PinPlacement, b: PinPlacement): boolean {
  if (a.kind === 'hidden' || b.kind === 'hidden') return a.kind === b.kind;
  return a.zIndex === b.zIndex && Math.abs(a.x - b.x) < MOVE_EPSILON_PX && Math.abs(a.y - b.y) < MOVE_EPSILON_PX;
}
