import type { Service } from '../../shared/domain/service';

/** Handoff §Interactions: Recent keeps the last 3 selections. */
export const RECENT_MAX = 3;

/** Case-insensitive match on name + domain; an empty query matches everything. */
export function filterServices(services: readonly Service[], q: string): Service[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [...services];
  return services.filter((s) => `${s.reg.name} ${s.reg.domain}`.toLowerCase().includes(needle));
}

export function pushRecent(recent: readonly string[], id: string): string[] {
  return [id, ...recent.filter((x) => x !== id)].slice(0, RECENT_MAX);
}

export function toggleFav(favs: readonly string[], id: string): string[] {
  return favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
}

export interface DomainGroup {
  readonly domain: string;
  readonly services: readonly Service[];
}

/** Groups in first-seen domain order, so the sidebar follows the registry order. */
export function groupByDomain(services: readonly Service[]): DomainGroup[] {
  const groups = new Map<string, Service[]>();
  for (const s of services) groups.set(s.reg.domain, [...(groups.get(s.reg.domain) ?? []), s]);
  return [...groups].map(([domain, list]) => ({ domain, services: list }));
}

export function initialsOf(name: string): string {
  return name.slice(0, 2).toUpperCase();
}
