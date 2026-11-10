import { describe, expect, it } from 'vitest';
import { easeInOutCubic, flyTarget, overviewOf, tweenAt, type Cam } from './camera';
import { stageScale, stageTransform } from '../viewIso/isoTransform';

const from: Cam = { tx: 0, ty: 0, tz: 0, r: 120, th: 0.9, ph: 0.95, shift: 0 };

describe('easeInOutCubic', () => {
  it('maps 0 → 0, 0.5 → 0.5, 1 → 1', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
  });
});

describe('flyTarget (handoff §Fly-to)', () => {
  it('targets (x, 0.55 H, z) with r = max(32, 2.2 H), φ 1.1, 14 % shift', () => {
    const goal = flyTarget({ x: 390, z: 390, w: 20, d: 20 }, 20);
    expect(goal).toMatchObject({ tx: 0, tz: 0, ph: 1.1, shift: 0.14 });
    expect(goal.ty).toBeCloseTo(11);
    expect(goal.r).toBe(44);
    expect(flyTarget({ x: 0, z: 0, w: 10, d: 10 }, 10).r).toBe(32);
  });
});

describe('tweenAt', () => {
  const to = { tx: 10, ty: 5, tz: -10, r: 40, ph: 1.1, shift: 0.14 };
  it('starts at `from`, ends at `to`, keeps azimuth', () => {
    expect(tweenAt(from, to, 0)).toEqual(from);
    expect(tweenAt(from, to, 1)).toEqual({ ...to, th: from.th });
  });
  it('clamps t outside [0, 1]', () => {
    expect(tweenAt(from, to, 2)).toEqual(tweenAt(from, to, 1));
  });
});

describe('stageTransform (handoff §Isometric)', () => {
  it('overview: scale 0.78 × zoom, centred on (400, 400)', () => {
    expect(stageTransform(45, 1, undefined)).toBe(
      'translate(0px, 0px) scale3d(0.78, 0.78, 0.78) rotateX(55deg) rotateZ(45deg) translate3d(-400px, -400px, 0px)',
    );
  });
  it('selected: S = clamp(300 / h, 1.3, 2.4), offset −180 px', () => {
    expect(stageScale(1, { x: 0, z: 0, w: 10, d: 10, h: 300 })).toBe(1.3);
    expect(stageScale(1, { x: 0, z: 0, w: 10, d: 10, h: 50 })).toBe(2.4);
    expect(stageTransform(0, 1, { x: 100, z: 200, w: 20, d: 20, h: 200 })).toContain('translate(-180px, 0px) scale3d(1.5, 1.5, 1.5)');
  });
});

describe('overviewOf', () => {
  const plate = (x: number, z: number) => ({ x, z, w: 340, d: 340 });
  it('centres on the four district plates and keeps the handoff ratio r 120 per 72-unit span', () => {
    const goal = overviewOf([plate(40, 40), plate(420, 40), plate(40, 420), plate(420, 420)]);
    expect(goal.tx).toBeCloseTo(0);
    expect(goal.tz).toBeCloseTo(0);
    expect(goal.r).toBeCloseTo(171.43, 1); // 720 px / 7 px per unit × 120 / 72
    expect(goal).toMatchObject({ ty: 0, ph: 0.95, shift: 0 });
  });
  it('falls back to the handoff overview when no plate is drawn', () => {
    expect(overviewOf([])).toMatchObject({ tx: 0, tz: 0, r: 120 });
  });
});
