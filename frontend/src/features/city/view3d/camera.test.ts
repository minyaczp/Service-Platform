import { describe, expect, it } from 'vitest';
import { easeInOutCubic, flyTarget, tweenAt, type Cam } from './camera';
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
