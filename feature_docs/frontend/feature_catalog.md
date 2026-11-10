# Feature: catalog

| | |
|---|---|
| **Feature** | catalog |
| **App** | frontend |
| **Entry point** | `Sidebar({ services, prefs, selection, onSelect, onToggleFav })` |
| **Counterpart** | none |
| **Catalog anchor** | [project_feature.md#catalog](../project_feature.md#catalog) |

## Functions

| File | Function | Responsibility |
|---|---|---|
| `features/catalog/logic.ts` | `filterServices(services, q)` | Case-insensitive match on name + domain; blank → all |
| `features/catalog/logic.ts` | `pushRecent(recent, id)`, `RECENT_MAX` | Most recent first, deduplicated, max 3 |
| `features/catalog/logic.ts` | `toggleFav(favs, id)` | Add or remove an id |
| `features/catalog/logic.ts` | `groupByDomain(services)`, `initialsOf(name)` | Sidebar groups in registry order; rail initials |
| `features/catalog/Sidebar.tsx` | `Sidebar(props)` | Panel (288 px) and rail (64 px); open state and search text are local (Decided I4) |

## Dependencies

| Needs | Supplied by | Wired at |
|---|---|---|
| `services`, `prefs`, `selection` | store | `main.tsx` `City` |
| `onSelect`, `onToggleFav` | store actions `select` (which calls `pushRecent`), `toggleFav` | `main.tsx` |

## Unit Tests

`src/features/catalog/logic.test.ts` — **8 cases**, `npm --prefix frontend test`. Pure.

| Covers | Cases |
|---|---|
| `pushRecent` — `['a','b','c'] + 'd' → ['d','a','b']`, dedupe, no mutation | 3 |
| `toggleFav` | 1 |
| `filterServices` — name, domain, blank / miss | 3 |
| `groupByDomain` — 6/6/5/5 | 1 |

**Not covered:** `Sidebar` component — no component test in Phase 1.

**Counterpart:** none — this feature lives in one app.
