# Feature: inspect

| | |
|---|---|
| **Feature** | inspect |
| **App** | frontend |
| **Entry point** | `InfoPanel({ service, isFav, onUse, onToggleFav, onClose })` |
| **Counterpart** | none yet — OpenAPI documents will come from `gridline.io/openapi` annotations |
| **Catalog anchor** | [project_feature.md#inspect](../project_feature.md#inspect) |

## Functions

| File | Function | Responsibility |
|---|---|---|
| `features/inspect/InfoPanel.tsx` | `InfoPanel(props)` | Spec panel; API Docs tab when `docs.kind === 'openapi'`, panel widens to `min(720px, 100% − 40px)` on that tab (Decided I8); Use service disabled when `ui.kind === 'none'` (I7); down reason in a red notice (I9); `onClose` → overview (I10) |
| `features/inspect/ApiDocs.tsx` | `ApiDocs({ specUrl })`, `DOCS_FAILED` | Fetch the spec; on 404 / network / non-object shows 「無法載入 API 文件」 |
| `features/inspect/ScalarView.tsx` | `ScalarView({ spec })` (lazy) | Scalar reference, Try-it and client buttons hidden, dark mode forced |

## Dependencies

| Needs | Supplied by | Wired at |
|---|---|---|
| `service`, `isFav` | store (`selection`, `prefs.favs`) | `main.tsx` `Overlay` |
| `onUse`, `onToggleFav`, `onClose` | store `openModal`, `toggleFav`, `clearSelection` | `main.tsx` `Overlay` |
| spec document | `fetch(specUrl)` — Phase 1 `public/mock/openapi/<id>.json` | `ApiDocs` |

Rebuilt: health labels (`LABEL`) — see [architecture](../feature_architecture.md#rebuilt-rather-than-shared).

## Unit Tests

`src/features/inspect/ApiDocs.test.tsx` — **2 cases**, `npm --prefix frontend test`. jsdom, `fetch` stubbed.

| Covers | Cases |
|---|---|
| `ApiDocs` — 404 and network failure both show 「無法載入 API 文件」 | 2 |

**Not covered:** `InfoPanel` rendering, Scalar success path — Scalar needs a browser (manual row).

**Counterpart:** none — this feature lives in one app.
