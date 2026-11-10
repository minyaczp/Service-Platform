import type { Footprint } from '../../../shared/domain/service';
import { PLANE_PX_PER_UNIT, PLANE_SIZE } from './visual';

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** Plane px → 3D world units, origin at the plane centre (demo: (x - 400) / 10). */
export function toWorld(planePx: number): number {
  return (planePx - PLANE_SIZE / 2) / PLANE_PX_PER_UNIT;
}

/** World-space centre of a footprint, at ground level. */
export function centreOf(fp: Footprint): { readonly x: number; readonly z: number } {
  return { x: toWorld(fp.x + fp.w / 2), z: toWorld(fp.z + fp.d / 2) };
}
