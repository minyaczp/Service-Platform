import { describe, expect, it } from 'vitest';
import type { Footprint, Service } from '../../../shared/domain/service';
import { mockServices } from '../../../shared/source/mockServices';
import { districtOf, districtTable, unassigned } from './districts';
import { layout } from './layout';

const districtFor = (d: string) => districtOf(d, districtTable);

const inside = (fp: Footprint, plate: Footprint): boolean =>
  fp.x >= plate.x && fp.z >= plate.z && fp.x + fp.w <= plate.x + plate.w && fp.z + fp.d <= plate.z + plate.d;

const disjoint = (a: Footprint, b: Footprint): boolean =>
  a.x + a.w <= b.x || b.x + b.w <= a.x || a.z + a.d <= b.z || b.z + b.d <= a.z;

function allDisjoint(fps: readonly Footprint[]): boolean {
  return fps.every((a, i) => fps.slice(i + 1).every((b) => disjoint(a, b)));
}

function withDomain(base: Service, id: string, domain: string): Service {
  return { ...base, reg: { ...base.reg, id, domain } };
}

const first = mockServices[0] as Service;

describe('districtOf', () => {
  it('maps a known domain to its row', () => {
    expect(districtFor('Commerce').id).toBe('commerce');
  });
  it('sends an unknown domain to Unassigned', () => {
    expect(districtFor('Unknown')).toBe(unassigned);
  });
});

describe('layout — placement', () => {
  it('places all 22 mocks, pairwise disjoint, each inside its district plate', () => {
    const city = layout(mockServices, districtFor);
    expect(city.footprints.size).toBe(22);
    expect(allDisjoint([...city.footprints.values()])).toBe(true);
    for (const s of mockServices) expect(inside(city.footprints.get(s.reg.id) as Footprint, districtFor(s.reg.domain).plate)).toBe(true);
  });

  it('10 services in one district use a 4×4 grid with 46.75×46.75 footprints', () => {
    const ten = Array.from({ length: 10 }, (_, i) => withDomain(first, `s${String(i).padStart(2, '0')}`, 'Commerce'));
    const fps = [...layout(ten, districtFor).footprints.values()];
    expect(fps).toHaveLength(10);
    for (const fp of fps) {
      expect(fp.w).toBeCloseTo(46.75);
      expect(fp.d).toBeCloseTo(46.75);
      expect(inside(fp, districtFor('Commerce').plate)).toBe(true);
    }
    expect(allDisjoint(fps)).toBe(true);
  });
});

describe('layout — order and plates', () => {
  it('gives every id the same footprint whatever the input order', () => {
    const a = layout(mockServices, districtFor).footprints;
    const b = layout([...mockServices].reverse(), districtFor).footprints;
    for (const [id, fp] of a) expect(b.get(id)).toEqual(fp);
  });

  it('draws 4 plates for the mocks, and a 5th (Unassigned) once an unknown domain appears', () => {
    expect(layout(mockServices, districtFor).districts).toHaveLength(4);
    const withUnknown = [...mockServices, withDomain(first, 'stray', 'Unknown')];
    const districts = layout(withUnknown, districtFor).districts;
    expect(districts).toHaveLength(5);
    expect(districts).toContain(unassigned);
  });

});

describe('layout — Unassigned strip', () => {
  it('lays Unassigned out in one row inside its 720×140 strip, even past 3 services (Decided I6)', () => {
    const strays = Array.from({ length: 5 }, (_, i) => withDomain(first, `u${i}`, 'Unknown'));
    const fps = [...layout(strays, districtFor).footprints.values()];
    expect(new Set(fps.map((f) => f.z)).size).toBe(1);
    expect(fps.every((f) => inside(f, unassigned.plate))).toBe(true);
    expect(allDisjoint(fps)).toBe(true);
  });
});
