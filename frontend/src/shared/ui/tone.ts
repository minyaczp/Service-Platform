import type { HealthState } from '../domain/service';

/** The CSS token for a health state, for use as a `tone`. */
export function healthTone(state: HealthState): string {
  return `var(--health-${state})`;
}
