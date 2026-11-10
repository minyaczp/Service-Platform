import { describe, expect, it } from 'vitest';
import { DEFAULT_PREFS, loadPrefs, PREFS_KEY, savePrefs } from './prefs';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => { data.delete(k); },
    setItem: (k, v) => { data.set(k, v); },
  };
}

const throwing: Storage = {
  ...memoryStorage(),
  getItem: () => { throw new Error('blocked'); },
  setItem: () => { throw new Error('quota'); },
};

describe('loadPrefs', () => {
  it('returns the defaults for no storage, throwing storage, missing key, or bad JSON', () => {
    expect(loadPrefs(undefined)).toEqual(DEFAULT_PREFS);
    expect(() => loadPrefs(throwing)).not.toThrow();
    expect(loadPrefs(throwing)).toEqual(DEFAULT_PREFS);
    expect(loadPrefs(memoryStorage())).toEqual(DEFAULT_PREFS);
    expect(loadPrefs(memoryStorage({ [PREFS_KEY]: '{not json' }))).toEqual(DEFAULT_PREFS);
  });
  it('keeps valid fields and replaces malformed ones', () => {
    const stored = JSON.stringify({ mode: 'iso', favs: 'nope', recent: ['a'] });
    expect(loadPrefs(memoryStorage({ [PREFS_KEY]: stored }))).toEqual({ mode: 'iso', favs: [], recent: ['a'] });
  });
});

describe('savePrefs', () => {
  it("round-trips through the 'gridline.state' key", () => {
    const st = memoryStorage();
    savePrefs(st, { mode: 'iso', favs: ['x'], recent: ['y'] });
    expect(JSON.parse(st.getItem('gridline.state') ?? '')).toEqual({ mode: 'iso', favs: ['x'], recent: ['y'] });
    expect(loadPrefs(st)).toEqual({ mode: 'iso', favs: ['x'], recent: ['y'] });
  });
  it('does not throw when storage is missing or full', () => {
    expect(() => savePrefs(undefined, DEFAULT_PREFS)).not.toThrow();
    expect(() => savePrefs(throwing, DEFAULT_PREFS)).not.toThrow();
  });
});
