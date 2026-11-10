import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Service } from '../domain/service';
import type { ServiceSource, SourceEvent } from '../domain/source';
import { createMockSource } from './mockSource';
import { mockServices } from './mockServices';

/** ServiceSource contract suite (CLAUDE.md §0 L): every implementation is added to this list. */
const implementations: readonly [string, (s: readonly Service[]) => ServiceSource][] = [['MockSource', createMockSource]];

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

describe.each(implementations)('ServiceSource contract — %s', (_, make) => {
  it('delivers exactly one snapshot equal to the input', async () => {
    const events: SourceEvent[] = [];
    make(mockServices).subscribe((e) => events.push(e));
    await flush();
    expect(events).toEqual([{ type: 'snapshot', services: mockServices }]);
  });
  it('calls nothing after unsubscribe', async () => {
    const events: SourceEvent[] = [];
    const off = make(mockServices).subscribe((e) => events.push(e));
    off();
    await flush();
    expect(events).toEqual([]);
  });
});

/** Domain kind follows the district table (tower/block/cylinder/stepped = Core/Commerce/Messaging/Data). */
const KIND: Readonly<Record<string, string>> = { 'Core Platform': 'tower', Commerce: 'block', Messaging: 'cylinder', 'Data & Storage': 'stepped' };
const docsUi = (s: Service) => `${s.reg.docs.kind === 'openapi'}/${s.reg.ui.kind === 'iframe'}`;

describe('mockServices (Decisions #9)', () => {
  it('has 22 services: health 10/4/4/4, docs 14, ui 14', () => {
    const count = (st: string) => mockServices.filter((s) => s.status.health.state === st).length;
    expect(mockServices).toHaveLength(22);
    expect([count('healthy'), count('degraded'), count('deploying'), count('down')]).toEqual([10, 4, 4, 4]);
    expect(mockServices.filter((s) => s.reg.docs.kind === 'openapi')).toHaveLength(14);
    expect(mockServices.filter((s) => s.reg.ui.kind === 'iframe')).toHaveLength(14);
  });
  it('covers all 16 (kind × health) and all 16 (health × docs × ui) combinations', () => {
    expect(new Set(mockServices.map((s) => `${KIND[s.reg.domain]}/${s.status.health.state}`)).size).toBe(16);
    expect(new Set(mockServices.map((s) => `${s.status.health.state}/${docsUi(s)}`)).size).toBe(16);
  });
  it('has unique ids', () => {
    expect(new Set(mockServices.map((s) => s.reg.id)).size).toBe(22);
  });
});

describe('mock OpenAPI files (Decisions #17)', () => {
  const pub = resolve(__dirname, '../../../public');
  it('every openapi specUrl resolves to a valid OpenAPI 3.1.0 JSON file', () => {
    for (const s of mockServices) {
      if (s.reg.docs.kind !== 'openapi') continue;
      const file = resolve(pub, `.${s.reg.docs.specUrl}`);
      expect(existsSync(file), file).toBe(true);
      expect((JSON.parse(readFileSync(file, 'utf8')) as { openapi: string }).openapi).toBe('3.1.0');
    }
  });
  it('the iframe placeholder page exists', () => {
    expect(existsSync(resolve(pub, 'mock/ui/placeholder.html'))).toBe(true);
  });
});
