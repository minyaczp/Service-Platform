import type { CityLayout, Service } from '../../../shared/domain/service';
import { heightOf } from './visual';
import { centreOf, type Vec3 } from './world';

/** Quadratic bezier between two dependent services, in world units. */
export interface Arc {
  readonly from: Vec3;
  readonly control: Vec3;
  readonly to: Vec3;
}

/** Demo :831-833 — endpoints at 0.6 H, control above the taller building by a quarter of the span. */
const END_HEIGHT = 0.6;
const LIFT_PER_SPAN = 0.25;

function anchor(s: Service, city: CityLayout): Vec3[] {
  const fp = city.footprints.get(s.reg.id);
  if (!fp) return [];
  const c = centreOf(fp);
  return [{ x: c.x, y: heightOf(s.status.rps) * END_HEIGHT, z: c.z }];
}

function arcBetween(a: Vec3, b: Vec3): Arc {
  const span = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  const top = Math.max(a.y, b.y) / END_HEIGHT;
  return { from: a, to: b, control: { x: (a.x + b.x) / 2, y: top + span * LIFT_PER_SPAN, z: (a.z + b.z) / 2 } };
}

/** One arc per `dependsOn` edge whose both ends are placed (Decided I2). */
export function arcsOf(services: readonly Service[], city: CityLayout): Arc[] {
  const byId = new Map(services.map((s) => [s.reg.id, s]));
  return services.flatMap((s) =>
    s.reg.dependsOn.flatMap((dep) => {
      const target = byId.get(dep);
      if (!target) return [];
      return anchor(s, city).flatMap((a) => anchor(target, city).map((b) => arcBetween(a, b)));
    }),
  );
}
