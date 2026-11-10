import type { Service } from '../domain/service';
import type { ServiceSource, SourceEvent } from '../domain/source';

/** Emits one snapshot asynchronously after subscribe; nothing after unsubscribe. */
export function createMockSource(services: readonly Service[]): ServiceSource {
  return {
    subscribe(onEvent: (e: SourceEvent) => void): () => void {
      let live = true;
      queueMicrotask(() => {
        if (live) onEvent({ type: 'snapshot', services });
      });
      return () => {
        live = false;
      };
    },
  };
}
