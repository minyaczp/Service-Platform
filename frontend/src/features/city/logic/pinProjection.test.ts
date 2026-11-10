import { describe, expect, it } from 'vitest';
import { projectPin, samePlacement, type PinCamera } from './pinProjection';

/** Column-major 4×4 identity: clip = world, w = 1. */
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
/** Minimal perspective: clip w = −z (camera looks down −z), as three.js's projection does. */
const PERSPECTIVE = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -1, 0, 0, 0, 0];
const ORIGIN = { x: 0, y: 0, z: 0 };
const cam = (viewProj: readonly number[], position = ORIGIN): PinCamera => ({ viewProj, position, near: 0.5, far: 800 });
const VIEW = { w: 800, h: 600 };

describe('projectPin (NI-04)', () => {
  it('maps clip-space origin to the viewport centre', () => {
    expect(projectPin(ORIGIN, cam(IDENTITY), VIEW)).toMatchObject({ kind: 'shown', x: 400, y: 300 });
  });

  it('maps NDC (1, 1) to the top-right corner (y grows downward)', () => {
    expect(projectPin({ x: 1, y: 1, z: 0 }, cam(IDENTITY), VIEW)).toMatchObject({ kind: 'shown', x: 800, y: 0 });
  });

  it('hides a point behind the camera (clip w ≤ 0)', () => {
    expect(projectPin({ x: 0, y: 0, z: 5 }, cam(PERSPECTIVE), VIEW)).toEqual({ kind: 'hidden' });
    expect(projectPin({ x: 0, y: 0, z: -5 }, cam(PERSPECTIVE), VIEW).kind).toBe('shown');
  });

  it('z-index is 10 at distance = near and 0 at distance = far (drei objectZIndex onto [10, 0])', () => {
    expect(projectPin(ORIGIN, cam(IDENTITY, { x: 0, y: 0, z: 0.5 }), VIEW)).toMatchObject({ zIndex: 10 });
    expect(projectPin(ORIGIN, cam(IDENTITY, { x: 0, y: 0, z: 800 }), VIEW)).toMatchObject({ zIndex: 0 });
  });

  it('hides every pin while the viewport has no area', () => {
    expect(projectPin(ORIGIN, cam(IDENTITY), { w: 0, h: 0 })).toEqual({ kind: 'hidden' });
  });
});

describe('samePlacement (NI-04 DD3)', () => {
  const at = (x: number, y: number, zIndex = 5) => ({ kind: 'shown', x, y, zIndex }) as const;
  it('treats moves under 0.1 px as unchanged and larger ones as changed', () => {
    expect(samePlacement(at(10, 10), at(10.05, 10.05))).toBe(true);
    expect(samePlacement(at(10, 10), at(10.2, 10))).toBe(false);
  });
  it('a z-index change or a shown/hidden flip is a change', () => {
    expect(samePlacement(at(10, 10, 5), at(10, 10, 6))).toBe(false);
    expect(samePlacement(at(10, 10), { kind: 'hidden' })).toBe(false);
    expect(samePlacement({ kind: 'hidden' }, { kind: 'hidden' })).toBe(true);
  });
});
