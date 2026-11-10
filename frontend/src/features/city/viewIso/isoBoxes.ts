import type { CityLayout, Kind, Service } from '../../../shared/domain/service';
import type { Filler } from '../logic/fillers';
import { constructionIndex, segmentsOf, type Segment } from '../logic/segments';
import { healthColor, heightOf, ISO_PX_PER_UNIT, withAlpha } from '../logic/visual';

/** Background, glow and edge strings for the five faces of one CSS box (demo :905-916). */
export interface Look {
  readonly sideA: string;
  readonly sideB: string;
  readonly top: string;
  readonly topShadow: string;
  readonly edge: string;
  readonly border: string;
}

export interface IsoBox {
  readonly key: string;
  readonly x: number;
  readonly z: number;
  readonly w: number;
  readonly d: number;
  readonly base: number;
  readonly h: number;
  readonly look: Look;
  /** The service this box belongs to; empty for fillers. */
  readonly serviceId: readonly string[];
}

const winA = (b: string, w: string): string =>
  `linear-gradient(90deg, ${b} 50%, transparent 50%) 0 0 / 7px 9px, linear-gradient(${b} 45%, ${w} 45%) 0 0 / 7px 9px, ${b}`;
const winB = (b: string, w: string): string =>
  `linear-gradient(${b} 50%, transparent 50%) 0 0 / 9px 7px, linear-gradient(90deg, ${b} 45%, ${w} 45%) 0 0 / 9px 7px, ${b}`;

const FILLER_LOOK: Look = {
  sideA: winA('#0d1626', 'rgba(127,176,224,0.20)'), sideB: winB('#0a111e', 'rgba(127,176,224,0.12)'),
  top: '#111b2c', topShadow: 'none', edge: 'inset 0 0 0 1px rgba(61,111,160,0.25)', border: 'none',
};

function scaffoldLook(c: string): Look {
  const scaf = `repeating-linear-gradient(0deg, ${withAlpha(c, 0.55)} 0 1px, transparent 1px 11px), repeating-linear-gradient(90deg, ${withAlpha(c, 0.55)} 0 1px, ${withAlpha(c, 0.06)} 1px 14px)`;
  return { sideA: scaf, sideB: scaf, top: withAlpha(c, 0.1), topShadow: 'none', edge: 'none', border: `1px dashed ${c}` };
}

function litLook(c: string, roof: boolean, on: boolean): Look {
  const glow = `0 0 ${on ? 60 : 36}px ${withAlpha(c, on ? 0.75 : 0.5)}, inset 0 0 0 1px ${c}`;
  return {
    sideA: winA('#0f1b2e', withAlpha(c, 0.6)), sideB: winB('#0b1424', withAlpha(c, 0.4)), top: '#14223a',
    topShadow: roof ? glow : `inset 0 0 0 1px ${withAlpha(c, 0.6)}`,
    edge: `inset 0 0 0 1px ${withAlpha(c, on ? 0.95 : 0.45)}`, border: 'none',
  };
}

export function fillerBoxes(list: readonly Filler[]): IsoBox[] {
  return list.map((f, i) => ({ key: `f${i}`, x: f.x, z: f.z, w: f.w, d: f.d, base: 0, h: f.h, look: FILLER_LOOK, serviceId: [] }));
}

/** Building height in iso px. */
export const isoHeightOf = (s: Service): number => heightOf(s.status.rps) * ISO_PX_PER_UNIT;

function serviceBoxes(s: Service, kind: Kind, city: CityLayout, selectedId: string): IsoBox[] {
  const fp = city.footprints.get(s.reg.id);
  if (!fp) return [];
  const c = healthColor(s.status.health.state);
  const scaffold = s.status.health.state === 'deploying' ? constructionIndex(kind) : -1;
  return segmentsOf(kind, fp, isoHeightOf(s)).map((g: Segment, i) => ({
    key: `${s.reg.id}-${i}`, x: fp.x + g.x, z: fp.z + g.z, w: g.w, d: g.d, base: g.base, h: g.h,
    look: i === scaffold ? scaffoldLook(c) : litLook(c, g.roof, s.reg.id === selectedId),
    serviceId: [s.reg.id],
  }));
}

/** Height of the flat health marker drawn when buildings are off (NI-03 Decisions #4). */
export const MARKER_H = 2;

function markerLook(c: string, on: boolean): Look {
  const side = withAlpha(c, 0.35);
  return {
    sideA: side, sideB: side, top: withAlpha(c, on ? 0.75 : 0.5),
    topShadow: `0 0 ${on ? 36 : 18}px ${withAlpha(c, on ? 0.7 : 0.45)}, inset 0 0 0 1px ${c}`,
    edge: 'none', border: 'none',
  };
}

/** One flat, health-coloured box per placed service — the simple view (NI-03). */
export function markerBoxes(services: readonly Service[], city: CityLayout, selectedId: string): IsoBox[] {
  return services.flatMap((s) => {
    const fp = city.footprints.get(s.reg.id);
    if (!fp) return [];
    const look = markerLook(healthColor(s.status.health.state), s.reg.id === selectedId);
    return [{ key: `${s.reg.id}-marker`, x: fp.x, z: fp.z, w: fp.w, d: fp.d, base: 0, h: MARKER_H, look, serviceId: [s.reg.id] }];
  });
}

/** All service segments as CSS boxes; `selectedId` is '' when nothing is selected. */
export function buildingBoxes(services: readonly Service[], kindOf: (s: Service) => Kind, city: CityLayout, selectedId: string): IsoBox[] {
  return services.flatMap((s) => serviceBoxes(s, kindOf(s), city, selectedId));
}
