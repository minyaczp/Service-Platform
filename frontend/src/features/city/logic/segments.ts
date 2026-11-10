import type { Footprint, Kind } from '../../../shared/domain/service';
import { assertNever } from '../../../shared/domain/assertNever';

/**
 * One box (or cylinder) of a building, relative to its footprint's corner.
 * x / z / w / d in plane px; base / h in iso px. `roof` marks a glowing top.
 */
export interface Segment {
  readonly x: number;
  readonly z: number;
  readonly w: number;
  readonly d: number;
  readonly base: number;
  readonly h: number;
  readonly roof: boolean;
  readonly round: boolean;
}

function box(x: number, z: number, w: number, d: number, base: number, h: number): Segment {
  return { x, z, w, d, base, h, roof: false, round: false };
}

const lit = (s: Segment): Segment => ({ ...s, roof: true });

const tower = ({ w, d }: Footprint, H: number): Segment[] => [
  box(0, 0, w, d, 0, H * 0.68),
  lit(box(w * 0.18, d * 0.18, w * 0.64, d * 0.64, H * 0.68, H * 0.32)),
];

const block = ({ w, d }: Footprint, H: number): Segment[] => [
  box(0, 0, w, d, 0, H * 0.22),
  lit(box(w * 0.12, d * 0.15, w * 0.6, d * 0.7, H * 0.22, H * 0.78)),
];

const cylinder = ({ w, d }: Footprint, H: number): Segment[] => [
  { ...box(w * 0.1, d * 0.1, w * 0.8, d * 0.8, 0, H * 0.9), round: true },
  lit(box(w * 0.3, d * 0.3, w * 0.4, d * 0.4, H * 0.9, H * 0.1)),
];

const stepped = ({ w, d }: Footprint, H: number): Segment[] => [
  box(0, 0, w, d, 0, H * 0.45),
  lit(box(w * 0.12, d * 0.12, w * 0.76, d * 0.76, H * 0.45, H * 0.3)),
  lit(box(w * 0.25, d * 0.25, w * 0.5, d * 0.5, H * 0.75, H * 0.25)),
];

/** Segments of a building of total height h (handoff §Shapes, demo `segs()` :678-684). */
export function segmentsOf(kind: Kind, fp: Footprint, h: number): Segment[] {
  switch (kind) {
    case 'tower': return tower(fp, h);
    case 'block': return block(fp, h);
    case 'cylinder': return cylinder(fp, h);
    case 'stepped': return stepped(fp, h);
    default: return assertNever(kind);
  }
}

/** Index of the segment drawn as scaffolding while deploying: the top one (handoff §Attribute mapping). */
export function constructionIndex(kind: Kind): number {
  switch (kind) {
    case 'tower':
    case 'block':
    case 'cylinder': return 1;
    case 'stepped': return 2;
    default: return assertNever(kind);
  }
}
