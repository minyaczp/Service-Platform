# Feature Architecture

## The two apps

| App | Stack | Status |
|---|---|---|
| `frontend/` | React 19 + TypeScript 6 (strict) + Vite 8; three.js via @react-three/fiber (drei removed in NI-04); Zustand; CSS Modules over CSS-variable tokens; Scalar | Phase 1, NI-01 |
| `backend/` | Go | Not started. Will read Helm-chart annotations and Prometheus, push over SSE |

The apps share no code. A shape both need is written once in each (`CLAUDE.md` §Structure rule 3).

## Frontend structure

```
frontend/src/
  main.tsx                 wiring: createAppStore, MockSource → store, store → savePrefs, App / City / Overlay
  shared/domain/           service.ts (all shapes) · source.ts (SourceEvent, ServiceSource) · assertNever.ts
  shared/source/           mockServices.ts (22 mocks) · mockSource.ts (ServiceSource implementation)
  shared/persistence/      prefs.ts (localStorage `gridline.state`)
  shared/ui/               tokens.css · StatusChip / StatusDot · tone.ts (health → CSS token)
  features/city/           logic/ (pure) · view3d/ (WebGL) · viewIso/ (CSS 3D) · chrome/ (TopBar, Legend, Hint)
  features/catalog/        logic.ts (pure) · Sidebar.tsx
  features/inspect/        InfoPanel.tsx · ApiDocs.tsx (fetch) · ScalarView.tsx (lazy)
  features/use-service/    ServiceModal.tsx
  features/auth/           LoginPage.tsx
frontend/public/mock/      openapi/<id>.json ×14 · ui/placeholder.html
```

**Layering inside a slice:** view (components) → logic (pure). Effects — WebGL, `fetch`, `localStorage`,
canvas textures — sit in views and in `shared/persistence` / `shared/source`. No feature imports another;
`main.tsx` composes them and passes callbacks as props.

**State:** one Zustand store (`AppState`, `main.tsx`) holds services, selection, modal, session, prefs and `autoRotate` (NI-05; not part of `prefs`, never saved). It
does no I/O. `main.tsx` subscribes it to the source and saves prefs on change. UI-only state (sidebar open,
search text, iso rotation / zoom) is component-local (NI-01 Decided I4).

## What is in `shared/` and why

| Module | Kind (`CLAUDE.md` rule 2) | Consumers |
|---|---|---|
| `domain/service.ts`, `domain/source.ts` | Domain shapes | every feature, `main.tsx` |
| `domain/assertNever.ts` | Language identity | city (`segments.ts`) |
| `source/mockSource.ts`, `source/mockServices.ts` | Platform primitive (data source) | `main.tsx`; tests in city and catalog |
| `persistence/prefs.ts` | Platform primitive (persistence) | `main.tsx` |
| `ui/StatusChip.tsx`, `ui/tone.ts`, `ui/tokens.css` | Presentational, no domain behaviour | catalog, inspect, city, use-service |

## Rebuilt rather than shared

| Behaviour | Copies | Source of truth |
|---|---|---|
| Health colours | `features/city/logic/visual.ts` (`healthColor`, hex for WebGL) · `shared/ui/tokens.css` (`--health-*`) | handoff README §Attribute mapping |
| Health labels | `features/inspect/InfoPanel.tsx` (`LABEL`) | handoff README |
| Plate px → world units (3D `÷ PLANE_PX_PER_UNIT` = 7, demo 10; iso height `× 7`) | `features/city/logic/world.ts`, `visual.ts` | demo `Service City.dc.html` |

## Detail contract

- `## Functions` — `File · Function · Responsibility`, one row per public-surface function: exports of
  `logic/`, the entry component's props, each `ServiceSource` implementation.
- `## Dependencies` — `Needs · Supplied by · Wired at`.
- `## Unit Tests` — suite, case count from the runner, what is not covered, counterpart.

## Testing

Runner: Vitest 5.1.0 (`npm --prefix frontend test`), jsdom environment, files `src/**/*.test.{ts,tsx}`.
Total **48 cases in 8 files** (2026-11-09).

| Suite | Cases | Owner |
|---|---|---|
| `src/shared/source/source.test.ts` | 7 | shared: `ServiceSource` contract suite (`describe.each` over implementations), mock composition, mock files |
| `src/shared/persistence/prefs.test.ts` | 4 | shared: load / save with an in-memory `Storage` |
| feature suites | 37 | see each feature doc |

**Not testable here:** WebGL scene, camera tween in the browser, Isometric rendering, iframe loading — no
browser runner. Covered by NI-01's `manual` Verification row.
