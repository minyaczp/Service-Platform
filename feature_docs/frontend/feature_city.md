# Feature: city

| | |
|---|---|
| **Feature** | city |
| **App** | frontend |
| **Entry point** | `CityView3D` (`{ services, layout, selection, onSelect, autoRotate }`) / `CityViewIso` (`{ services, layout, selection, onSelect }`), `TopBar`, `Legend`, `Hint` |
| **Counterpart** | none yet — `backend/` will supply `rps` and health over SSE |
| **Catalog anchor** | [project_feature.md#city](../project_feature.md#city) |

## Functions

| File | Function | Responsibility |
|---|---|---|
| `features/city/logic/districts.ts` | `districtTable`, `unassigned`, `districtOf(domain, table)` | domain → District; unknown → Unassigned (`kind: block`, plate 720×140 at (40, 800)) |
| `features/city/logic/layout.ts` | `layout(services, districtOf): CityLayout` | Footprints per district: square plates `cols = max(3, ⌈√n⌉)`, Unassigned one row `max(3, n)`; footprint 0.55 × cell (street ≈ one footprint wide); id order. Returns the districts in use |
| `features/city/logic/visual.ts` | `heightOf(rps)`, `healthColor(state)`, `withAlpha(hex, a)` | `10 + rps/100`; health hex; rgba string. `PLANE_PX_PER_UNIT` = 7 (demo 10), so 22 services keep wide streets |
| `features/city/logic/segments.ts` | `segmentsOf(kind, fp, h)`, `constructionIndex(kind)` | Building segments per handoff §Shapes; which segment is scaffolding while deploying |
| `features/city/logic/fillers.ts` | `fillers(layout, seed)` | Deterministic background buildings, 18 px clear of services (Decided I1) |
| `features/city/logic/arcs.ts` | `arcsOf(services, layout)` | Bezier arcs per `dependsOn` edge (Decided I2) |
| `features/city/logic/world.ts` | `toWorld(px)`, `centreOf(fp)` | Plane px → world units |
| `features/city/logic/pinProjection.ts` | `projectPin(anchor, cam, viewport)`, `samePlacement(a, b)`; `PinCamera`, `Viewport`, `PinPlacement` | World point → viewport px; hidden behind the camera or with a 0×0 viewport; z-index = camera distance from near→far mapped onto [10, 0] (drei `objectZIndex`, NI-04). `samePlacement`: < 0.1 px and same z-index → skip the DOM write |
| `features/city/view3d/camera.ts` | `easeInOutCubic`, `tweenAt`, `flyTarget`, `overviewOf(plates)`, `autoRotating(selectedId, enabled)`, `CAMERA` | Camera tween maths and handoff camera constants; the overview turns only when enabled and nothing is selected (NI-05); overview centred on the drawn plates, r = span × 120/72 (handoff ratio), `maxR` 260. Fog starts 30 past the overview r and fades over 170 |
| `features/city/viewIso/isoTransform.ts` | `stageTransform(rot, zoom, selected?)`, `stageScale`, `clampZoom`, `ISO` | Iso stage CSS transform |
| `features/city/viewIso/isoBoxes.ts` | `buildingBoxes`, `fillerBoxes`, `isoHeightOf` | Segments → CSS boxes with window / scaffold looks |
| `features/city/view3d/CityView3D.tsx` | `CityView3D(props: CityView3DProps)` | r3f scene; `autoRotate` (store-owned, NI-05) gates the overview rotation; failure path shows "WebGL is unavailable here. Switch to Isometric view." |
| `features/city/viewIso/CityViewIso.tsx` | `CityViewIso(props)` | CSS 3D city; drag rotate, wheel zoom |
| `features/city/chrome/TopBar.tsx` | `TopBar({ selected, mode, onOverview, onMode, autoRotate, onToggleRotate })` | Breadcrumb, Overview, rotate button (3D only, icon-only pause / play, `aria-label` "Pause rotation" / "Resume rotation", NI-05), view toggle |
| `features/city/chrome/Legend.tsx` | `Legend()`, `Hint({ mode })` | Legend (Healthy / Degraded / Deploying / Down) and hint text |

Pins (NI-04) are a DOM overlay, not drei `<Html>`: `view3d/PinLayer.tsx` renders every pin beside the canvas
(no stacking context, so pin z 0–10 stays under the top bar z 15 and info panel z 20) and registers each element;
`view3d/PinProjector.tsx`, inside the canvas, projects the anchors (roof top + `PIN_LIFT` 1.8) every frame and
writes `transform` / `z-index` / `display` only when the placement changed.

View internals (not public): `view3d/{Ground,Fillers,Building,Arcs,SelectionFx,OrbitRig,Pins,PinLayer,PinProjector}.tsx`,
`view3d/{assets,textures}.ts`.

## Dependencies

| Needs | Supplied by | Wired at |
|---|---|---|
| `services`, `selection` | store (`AppState`) | `main.tsx` `City` |
| `layout` | `layout(services, districtFor)` from this feature | `main.tsx` `City` (`useMemo`) |
| `onSelect`, `onOverview`, `onMode` | store actions `select`, `clearSelection`, `setMode` | `main.tsx` `City` |
| `autoRotate`, `onToggleRotate` | store field `autoRotate` (initial `true`, not in `Prefs`, never saved) and action `toggleAutoRotate` | `main.tsx` `City` |

Rebuilt: health colours also in `shared/ui/tokens.css` ([architecture](../feature_architecture.md#rebuilt-rather-than-shared)).

## Unit Tests

`src/features/city/logic/{layout,visual,scene,pinProjection}.test.ts`,
`src/features/city/view3d/{camera.test.ts,PinLayer.test.tsx}`, `src/features/city/viewIso/isoBoxes.test.ts`,
`src/features/city/chrome/TopBar.test.tsx` — **45 cases**, `npm --prefix frontend test`. Pure, no DOM, except `PinLayer` and `TopBar` (jsdom + Testing Library).

| Covers | Cases |
|---|---|
| `districtOf` — known row, unknown → Unassigned | 2 |
| `layout` — 22 mocks disjoint inside plates; 10 → 4×4 at 59.5; order-independent; 4 → 5 plates; Unassigned one row | 5 |
| `heightOf`, `healthColor` | 2 |
| `segmentsOf` — four shapes, stacking to H; `constructionIndex` | 6 |
| `fillers` — deterministic, 18 px clearance, size ranges | 3 |
| `arcsOf` — one per edge, orphan skipped, control lifted | 3 |
| `easeInOutCubic`, `flyTarget`, `tweenAt`, `stageTransform` / `stageScale`; `overviewOf` — centred on 4 plates, r 171.43; no plates → r 120; `autoRotating` — enabled & nothing selected only (NI-05) | 9 |
| `isoBoxes` — `buildingBoxes` / `markerBoxes` (NI-03 suite) | 3 |
| `projectPin` — origin → viewport centre; NDC (1, 1) → top-right; behind camera hidden; z-index 10 at near, 0 at far; 0×0 viewport hidden (NI-04) | 5 |
| `samePlacement` — < 0.1 px unchanged, larger move / z-index / shown↔hidden changed (NI-04) | 2 |
| `PinLayer` — registers one element per pin and releases on unmount; click selects (NI-04) | 2 |
| `TopBar` rotate button — "Pause rotation" / "Resume rotation" with `aria-pressed`; absent in Isometric; icon-only, one click → one `onToggleRotate` (NI-05) | 3 |

**Not covered:** `CityView3D`, `CityViewIso`, `PinProjector`, chrome components — effectful / need WebGL or a
browser (manual Verification row; NI-04's console count is a Playwright script, not part of the suite).

**Counterpart:** none — this feature lives in one app until `backend/` exists.
