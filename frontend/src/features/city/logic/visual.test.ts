import { describe, expect, it } from 'vitest';
import type { Footprint } from '../../../shared/domain/service';
import { constructionIndex, segmentsOf } from './segments';
import { healthColor, heightOf } from './visual';

const fp: Footprint = { x: 0, z: 0, w: 100, d: 100 };

describe('heightOf', () => {
  it('follows H3D = 10 + rps / 100 (handoff)', () => {
    expect(heightOf(0)).toBe(10);
    expect(heightOf(1000)).toBe(20);
  });
});

describe('healthColor', () => {
  it('uses the handoff palette', () => {
    expect(healthColor('healthy')).toBe('#5fe1ec');
    expect(healthColor('degraded')).toBe('#f2b45a');
    expect(healthColor('deploying')).toBe('#6aa2ff');
    expect(healthColor('down')).toBe('#ff6b6b');
  });
});

describe('segmentsOf (handoff §Shapes)', () => {
  it('tower: base w×d 0.68H, upper 0.64w×0.64d at 18 % inset, 0.32H', () => {
    const [base, upper] = segmentsOf('tower', fp, 100);
    expect(base).toMatchObject({ w: 100, d: 100, base: 0, h: 68 });
    expect(upper).toMatchObject({ x: 18, z: 18, base: 68, roof: true });
    expect(upper?.w).toBeCloseTo(64);
    expect(upper?.h).toBeCloseTo(32);
  });
  it('block: podium 0.22H, tower 0.6w×0.7d offset (12 %, 15 %), 0.78H', () => {
    const [podium, tower] = segmentsOf('block', fp, 100);
    expect(podium?.h).toBeCloseTo(22);
    expect(tower).toMatchObject({ x: 12, z: 15 });
    expect(tower?.w).toBeCloseTo(60);
    expect(tower?.d).toBeCloseTo(70);
    expect(tower?.h).toBeCloseTo(78);
  });
});

describe('segmentsOf — round and stepped', () => {
  it('cylinder: round body ⌀0.8w 0.9H, cap 0.4w 0.1H', () => {
    const [body, cap] = segmentsOf('cylinder', fp, 100);
    expect(body).toMatchObject({ round: true, w: 80 });
    expect(body?.h).toBeCloseTo(90);
    expect(cap?.w).toBeCloseTo(40);
    expect(cap?.h).toBeCloseTo(10);
  });
  it('stepped: w 0.45H, 0.76w 0.3H, 0.5w 0.25H', () => {
    const segs = segmentsOf('stepped', fp, 100);
    expect(segs.map((s) => [Math.round(s.w), Math.round(s.h)])).toEqual([[100, 45], [76, 30], [50, 25]]);
  });
  it('stacks every segment on the one below, ending at H', () => {
    for (const kind of ['tower', 'block', 'cylinder', 'stepped'] as const) {
      const segs = segmentsOf(kind, fp, 100);
      const top = segs[segs.length - 1];
      expect((top?.base ?? 0) + (top?.h ?? 0)).toBeCloseTo(100);
    }
  });
});

describe('constructionIndex', () => {
  it('is the top segment — the stepped third one, the others second', () => {
    expect(constructionIndex('stepped')).toBe(2);
    expect(constructionIndex('tower')).toBe(1);
    expect(constructionIndex('block')).toBe(1);
    expect(constructionIndex('cylinder')).toBe(1);
  });
});
