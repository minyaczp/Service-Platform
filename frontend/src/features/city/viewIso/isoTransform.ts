import type { Footprint } from '../../../shared/domain/service';

/** Handoff §Isometric: drag 0.35°/px, zoom 0.5–2.5, selected S = clamp(300 / h, 1.3, 2.4), offset −180 px. */
export const ISO = {
  degPerPx: 0.35, minZoom: 0.5, maxZoom: 2.5, overviewScale: 0.78,
  minScale: 1.3, maxScale: 2.4, focusPx: 300, panelOffset: -180, startRot: 45, tilt: 55,
} as const;

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

export function clampZoom(z: number): number {
  return clamp(z, ISO.minZoom, ISO.maxZoom);
}

/** Scale applied to the stage; billboards divide by it. */
export function stageScale(zoom: number, selected?: Footprint & { h: number }): number {
  if (!selected) return ISO.overviewScale * zoom;
  return clamp(ISO.focusPx / selected.h, ISO.minScale, ISO.maxScale) * zoom;
}

/** CSS transform of the iso stage (demo :936-976). `h` is the building height in iso px. */
export function stageTransform(rot: number, zoom: number, selected?: Footprint & { h: number }): string {
  const S = stageScale(zoom, selected);
  const cx = selected ? selected.x + selected.w / 2 : 400;
  const cy = selected ? selected.z + selected.d / 2 : 400;
  const cz = selected ? selected.h * 0.5 : 0;
  const offX = selected ? ISO.panelOffset : 0;
  return `translate(${offX}px, 0px) scale3d(${S}, ${S}, ${S}) rotateX(${ISO.tilt}deg) rotateZ(${rot}deg) translate3d(${-cx}px, ${-cy}px, ${-cz}px)`;
}
