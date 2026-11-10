import type { Prefs, ViewMode } from '../domain/service';

/** Handoff §Interactions: `gridline.state` holds mode, favs, recent. */
export const PREFS_KEY = 'gridline.state';

export const DEFAULT_PREFS: Prefs = { mode: '3d', favs: [], recent: [] };

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isMode = (v: unknown): v is ViewMode => v === '3d' || v === 'iso';

/** Narrows stored JSON field by field; anything malformed falls back to the default for that field. */
function parsePrefs(raw: unknown): Prefs {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_PREFS;
  const r = raw as Record<string, unknown>;
  return {
    mode: isMode(r.mode) ? r.mode : DEFAULT_PREFS.mode,
    favs: isStringArray(r.favs) ? r.favs : DEFAULT_PREFS.favs,
    recent: isStringArray(r.recent) ? r.recent : DEFAULT_PREFS.recent,
  };
}

/** Never throws: no storage, unreadable storage or bad JSON all give the defaults. */
export function loadPrefs(storage: Storage | undefined): Prefs {
  if (!storage) return DEFAULT_PREFS;
  try {
    const text = storage.getItem(PREFS_KEY);
    return text === null ? DEFAULT_PREFS : parsePrefs(JSON.parse(text));
  } catch {
    return DEFAULT_PREFS;
  }
}

/** Best effort: a full or blocked storage leaves the in-memory prefs as the only copy. */
export function savePrefs(storage: Storage | undefined, p: Prefs): void {
  if (!storage) return;
  try {
    storage.setItem(PREFS_KEY, JSON.stringify({ mode: p.mode, favs: p.favs, recent: p.recent }));
  } catch {
    // Storage quota or privacy mode: keeping prefs in memory is the documented fallback.
  }
}
