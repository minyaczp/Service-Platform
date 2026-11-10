export interface ServiceRegistration {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly owner: string;
  readonly version: string;
  readonly endpoint: string;
  readonly region: string;
  readonly description: string;
  readonly capabilities: readonly string[];
  readonly dependsOn: readonly string[];
  readonly docs: { readonly kind: 'openapi'; readonly specUrl: string } | { readonly kind: 'none' };
  readonly ui: { readonly kind: 'iframe'; readonly url: string } | { readonly kind: 'none' };
}

export type Health =
  | { readonly state: 'healthy' }
  | { readonly state: 'degraded'; readonly reason: string }
  | { readonly state: 'deploying'; readonly percent: number }
  | { readonly state: 'down'; readonly reason: string };

export type HealthState = Health['state'];

export interface ServiceStatus {
  readonly health: Health;
  readonly instances: { readonly ready: number; readonly desired: number };
  readonly rps: number;
  readonly p99Ms: number;
  /** Fraction in [0, 1]. */
  readonly uptime30d: number;
}

export interface Service {
  readonly reg: ServiceRegistration;
  readonly status: ServiceStatus;
}

export type Kind = 'tower' | 'block' | 'cylinder' | 'stepped';

/** Rectangle on the 800×800 city plane, in iso px. */
export interface Footprint {
  readonly x: number;
  readonly z: number;
  readonly w: number;
  readonly d: number;
}

export interface District {
  readonly id: string;
  readonly label: string;
  readonly kind: Kind;
  readonly plate: Footprint;
}

export interface CityLayout {
  readonly footprints: ReadonlyMap<string, Footprint>;
  readonly districts: readonly District[];
}

export type Selection = { readonly kind: 'none' } | { readonly kind: 'service'; readonly id: string };

export type ViewMode = '3d' | 'iso';

export interface Prefs {
  readonly mode: ViewMode;
  readonly favs: readonly string[];
  readonly recent: readonly string[];
}
