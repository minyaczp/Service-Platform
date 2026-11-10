# Feature: city

| | |
|---|---|
| **Feature** | city |
| **App** | frontend |
| **Entry point** | `CityView3D` / `CityViewIso` (`{ services, layout, selection, onSelect }`), `TopBar`, `Legend`, `Hint` |
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
| `features/city/view3d/camera.ts` | `easeInOutCubic`, `tweenAt`, `flyTarget`, `overviewOf(plates)`, `CAMERA` | Camera tween maths and handoff camera constants; overview centred on the drawn plates, r = span × 120/72 (handoff ratio), `maxR` 260. Fog starts 30 past the overview r and fades over 170 |
| `features/city/viewIso/isoTransform.ts` | `stageTransform(rot, zoom, selected?)`, `stageScale`, `clampZoom`, `ISO` | Iso stage CSS transform |
| `features/city/viewIso/isoBoxes.ts` | `buildingBoxes`, `fillerBoxes`, `isoHeightOf` | Segments → CSS boxes with window / scaffold looks |
| `features/city/view3d/CityView3D.tsx` | `CityView3D(props)` | r3f scene; failure path shows "WebGL is unavailable here. Switch to Isometric view." |
| `features/city/viewIso/CityViewIso.tsx` | `CityViewIso(props)` | CSS 3D city; drag rotate, wheel zoom |
| `features/city/chrome/TopBar.tsx` | `TopBar({ selected, mode, onOverview, onMode })` | Breadcrumb, Overview, view toggle |
| `features/city/chrome/Legend.tsx` | `Legend()`, `Hint({ mode })` | Legend (Healthy / Degraded / Deploying / Down) and hint text |

View internals (not public): `view3d/{Ground,Fillers,Building,Arcs,SelectionFx,OrbitRig,Pins}.tsx`,
`view3d/{assets,textures}.ts`.

## Dependencies

| Needs | Supplied by | Wired at |
|---|---|---|
| `services`, `selection` | store (`AppState`) | `main.tsx` `City` |
| `layout` | `layout(services, districtFor)` from this feature | `main.tsx` `City` (`useMemo`) |
| `onSelect`, `onOverview`, `onMode` | store actions `select`, `clearSelection`, `setMode` | `main.tsx` `City` |

Rebuilt: health colours also in `shared/ui/tokens.css` ([architecture](../feature_architecture.md#rebuilt-rather-than-shared)).

## Unit Tests

`src/features/city/logic/{layout,visual,scene}.test.ts`, `src/features/city/view3d/camera.test.ts` —
**27 cases**, `npm --prefix frontend test`. Pure, no DOM.

| Covers | Cases |
|---|---|
| `districtOf` — known row, unknown → Unassigned | 2 |
| `layout` — 22 mocks disjoint inside plates; 10 → 4×4 at 59.5; order-independent; 4 → 5 plates; Unassigned one row | 5 |
| `heightOf`, `healthColor` | 2 |
| `segmentsOf` — four shapes, stacking to H; `constructionIndex` | 6 |
| `fillers` — deterministic, 18 px clearance, size ranges | 3 |
| `arcsOf` — one per edge, orphan skipped, control lifted | 3 |
| `easeInOutCubic`, `flyTarget`, `tweenAt`, `stageTransform` / `stageScale` | 6 |

**Not covered:** `CityView3D`, `CityViewIso`, `isoBoxes`, chrome components — effectful / need a browser
(manual Verification row).

**Counterpart:** none — this feature lives in one app until `backend/` exists.
