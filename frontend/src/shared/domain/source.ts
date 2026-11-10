import type { Service, ServiceStatus } from './service';

export type SourceEvent =
  | { readonly type: 'snapshot'; readonly services: readonly Service[] }
  | { readonly type: 'status'; readonly id: string; readonly status: ServiceStatus };

/** Where services come from. Returns the unsubscribe function. */
export interface ServiceSource {
  subscribe(onEvent: (e: SourceEvent) => void): () => void;
}
