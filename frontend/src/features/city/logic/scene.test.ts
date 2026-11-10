import { describe, expect, it } from 'vitest';
import type { Footprint } from '../../../shared/domain/service';
import { mockServices } from '../../../shared/source/mockServices';
import { arcsOf } from './arcs';
import { districtOf, districtTable } from './districts';
import { fillers } from './fillers';
import { layout } from './layout';

const city = layout(mockServices, (d) => districtOf(d, districtTable));

const gap = (a: Footprint, b: Footprint, g: number): boolean =>
  a.x + a.w + g <= b.x || b.x + b.w + g <= a.x || a.z + a.d + g <= b.z || b.z + b.d + g <= a.z;

describe('fillers (Decided I1)', () => {
  it('is deterministic for a seed', () => {
    expect(fillers(city, 11)).toEqual(fillers(city, 11));
  });
  it('keeps 18 px clear of every service footprint', () => {
    const taken = [...city.footprints.values()];
    for (const f of fillers(city, 11)) for (const t of taken) expect(gap(f, t, 18)).toBe(true);
  });
  it('sizes within the demo ranges: sides 22–42 px, height 16–116 px', () => {
    for (const f of fillers(city, 11)) {
      expect(f.w).toBeGreaterThanOrEqual(22);
      expect(f.w).toBeLessThanOrEqual(42);
      expect(f.h).toBeGreaterThanOrEqual(16);
      expect(f.h).toBeLessThanOrEqual(116);
    }
  });
});

describe('arcsOf (Decided I2)', () => {
  it('draws one arc per dependsOn edge of the mocks', () => {
    const edges = mockServices.reduce((n, s) => n + s.reg.dependsOn.length, 0);
    expect(arcsOf(mockServices, city)).toHaveLength(edges);
  });
  it('skips an edge whose target is not registered', () => {
    const first = mockServices[0] as (typeof mockServices)[number];
    const orphan = { ...first, reg: { ...first.reg, dependsOn: ['nope'] } };
    expect(arcsOf([orphan], city)).toEqual([]);
  });
  it('lifts the control point above both ends', () => {
    for (const a of arcsOf(mockServices, city)) expect(a.control.y).toBeGreaterThan(Math.max(a.from.y, a.to.y));
  });
});
