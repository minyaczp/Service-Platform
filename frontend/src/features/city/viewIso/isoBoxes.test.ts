import { describe, expect, it } from 'vitest';
import type { Service } from '../../../shared/domain/service';
import { mockServices } from '../../../shared/source/mockServices';
import { districtOf, districtTable } from '../logic/districts';
import { layout } from '../logic/layout';
import { buildingBoxes, markerBoxes } from './isoBoxes';

const districtFor = (d: string) => districtOf(d, districtTable);
const city = layout(mockServices, districtFor);
const kindOf = (s: Service) => districtFor(s.reg.domain).kind;

describe('markerBoxes (NI-03)', () => {
  it('draws 22 flat boxes, h = 2, each exactly on its service footprint', () => {
    const boxes = markerBoxes(mockServices, city, '');
    expect(boxes).toHaveLength(22);
    for (const b of boxes) {
      const fp = city.footprints.get(b.serviceId[0] ?? '');
      expect(b.h).toBe(2);
      expect({ x: b.x, z: b.z, w: b.w, d: b.d }).toEqual(fp);
    }
  });
  it('glows stronger on the selected service only', () => {
    const boxes = markerBoxes(mockServices, city, 'identity');
    const on = boxes.find((b) => b.serviceId[0] === 'identity');
    const off = boxes.find((b) => b.serviceId[0] === 'orders');
    expect(on?.look.topShadow).toContain('36px');
    expect(off?.look.topShadow).toContain('18px');
  });
});

describe('buildingBoxes regression (NI-03 Verification)', () => {
  it('draws one box per segment: 6×2 + 6×2 + 5×2 + 5×3 = 49', () => {
    expect(buildingBoxes(mockServices, kindOf, city, '')).toHaveLength(49);
  });
});
