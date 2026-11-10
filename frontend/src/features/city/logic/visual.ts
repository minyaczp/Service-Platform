import type { HealthState } from '../../../shared/domain/service';

/** World units per 100 rps — handoff §Attribute mapping: H3D = 10 + rps / 100. */
const BASE_HEIGHT = 10;
const RPS_PER_UNIT = 100;
/** Iso px per 3D world unit (handoff: iso height = H3D × 7). */
export const ISO_PX_PER_UNIT = 7;
/**
 * Plane px per 3D world unit. The demo used 10 for 5 services; at 22 services a district holds 5–6
 * buildings, so 7 widens the streets between them while heights (world units, from rps) stay as specified.
 */
export const PLANE_PX_PER_UNIT = 7;
export const PLANE_SIZE = 800;

export function heightOf(rps: number): number {
  return BASE_HEIGHT + rps / RPS_PER_UNIT;
}

/** Health colours for WebGL and inline gradients; the same values are CSS tokens in shared/ui/tokens.css. */
const HEALTH_COLOR: Readonly<Record<HealthState, string>> = {
  healthy: '#5fe1ec',
  degraded: '#f2b45a',
  deploying: '#6aa2ff',
  down: '#ff6b6b',
};

export function healthColor(s: HealthState): string {
  return HEALTH_COLOR[s];
}


/** '#rrggbb' + alpha → 'rgba(r,g,b,a)'. */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${alpha})`;
}
