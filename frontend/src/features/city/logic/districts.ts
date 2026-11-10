import type { District } from '../../../shared/domain/service';

const PLATE = 340;

/** domain → District. A new domain is a new row (NI-01 DD6). Plates as in the demo (:133-136). */
export const districtTable: Readonly<Record<string, District>> = {
  'Core Platform': { id: 'core', label: 'Core Platform', kind: 'tower', plate: { x: 40, z: 40, w: PLATE, d: PLATE } },
  Commerce: { id: 'commerce', label: 'Commerce', kind: 'block', plate: { x: 420, z: 40, w: PLATE, d: PLATE } },
  Messaging: { id: 'messaging', label: 'Messaging', kind: 'cylinder', plate: { x: 40, z: 420, w: PLATE, d: PLATE } },
  'Data & Storage': { id: 'data', label: 'Data & Storage', kind: 'stepped', plate: { x: 420, z: 420, w: PLATE, d: PLATE } },
};

/** Services whose domain has no row (Decisions #11, #15, #19). */
export const unassigned: District = {
  id: 'unassigned',
  label: 'Unassigned',
  kind: 'block',
  plate: { x: 40, z: 800, w: 720, d: 140 },
};

export function districtOf(domain: string, table: Readonly<Record<string, District>>): District {
  return table[domain] ?? unassigned;
}
