import { describe, expect, it } from 'vitest';
import { mockServices } from '../../shared/source/mockServices';
import { filterServices, groupByDomain, pushRecent, toggleFav } from './logic';

describe('pushRecent (Recent max 3)', () => {
  it("pushRecent(['a','b','c'], 'd') → ['d','a','b']", () => {
    expect(pushRecent(['a', 'b', 'c'], 'd')).toEqual(['d', 'a', 'b']);
  });
  it('moves an existing id to the front without duplicating it', () => {
    expect(pushRecent(['a', 'b', 'c'], 'c')).toEqual(['c', 'a', 'b']);
  });
  it('does not mutate its input', () => {
    const r = ['a'];
    pushRecent(r, 'b');
    expect(r).toEqual(['a']);
  });
});

describe('toggleFav', () => {
  it('adds a missing id and removes a present one', () => {
    expect(toggleFav(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleFav(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('filterServices (handoff §Search: name + domain)', () => {
  it('matches by name, case-insensitively', () => {
    expect(filterServices(mockServices, 'PAY').map((s) => s.reg.id)).toEqual(['payments']);
  });
  it('matches by domain', () => {
    expect(filterServices(mockServices, 'messaging')).toHaveLength(5);
  });
  it('returns everything for a blank query and nothing for a miss', () => {
    expect(filterServices(mockServices, '  ')).toHaveLength(22);
    expect(filterServices(mockServices, 'zzz')).toEqual([]);
  });
});

describe('groupByDomain', () => {
  it('groups the mocks into 4 domains of 6/6/5/5', () => {
    expect(groupByDomain(mockServices).map((g) => g.services.length)).toEqual([6, 6, 5, 5]);
  });
});
