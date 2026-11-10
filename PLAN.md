# PLAN

## Current Status

| Item | Status |
|---|---|
| NI-02 · Fill CLAUDE.md placeholders | ✅ Complete — NI-02 |
| NI-01 · Gridline Service City — Phase 1 frontend with mock data | ✅ Complete — NI-01 |
| NI-03 · Isometric buildings on/off (simple view) | 🟡 Pending — NI-03 |
| NI-04 · Pins as a DOM overlay (fix StrictMode unmount error) | ✅ Complete — NI-04 |
| NI-05 · 3D auto-rotate on/off | ✅ Complete — NI-05 |

## New Instructions

### [NI-03] Isometric buildings on/off (simple view)

**Scope:** `frontend/src/features/city/viewIso/` (`CityViewIso.tsx`, `CityViewIso.module.css`, `isoBoxes.ts`)
and its test; `feature_docs/frontend/feature_city.md`. **Outside:** the 3D view, `AppState`, `gridline.state`,
every other feature.
**Docs consulted:** `feature_docs/frontend/feature_city.md` (Isometric is `CityViewIso` + `isoBoxes.ts`;
rot / zoom are component-local, NI-01 Decided I4).

**Problem.** The Isometric view always draws ~60 filler buildings and every service's segments; the operator
wants a clean, simple map.
**Goal.** A "Buildings" on/off chip in the Isometric view. OFF hides fillers and service segments and draws
each service as a flat square in its health colour plus its name pill; selection, Info panel and Use service
work as before.

**Design decisions**

| # | Choice | Rejected | Why |
|---|---|---|---|
| DD1 | Toggle inside the Isometric view | A third view mode | Operator: on/off is simpler; no `ViewMode` change |
| DD2 | OFF = plates + roads + flat health markers + labels | Labels only · plates only | Operator: map stays clickable |
| DD3 | Component-local state, default ON, not persisted | Field in `gridline.state` | Operator: schema change is on the §5 halt list |

**Module decomposition**

| Module / function | Signature | Responsibility | Pure / effectful | Layer | New / reused |
|---|---|---|---|---|---|
| `viewIso/isoBoxes.ts` | `markerBoxes(services, layout, selectedId): IsoBox[]` | One flat box per placed service: footprint, `h = MARKER_H`, health-coloured top, glow when selected | pure | logic | New |
| `viewIso/CityViewIso.tsx` | `useState<boolean>(true)` `buildings`; `BuildingsToggle({ on, onToggle })` | Chooses `fillerBoxes + buildingBoxes` vs `markerBoxes`; label lift = building height or `MARKER_H` | view | view | changed / New |

**Conditions & their justification**

| Condition | Whose problem | Evidence | When it triggers | Default | If it is wrong | Removal criteria |
|---|---|---|---|---|---|---|
| `MARKER_H` = 2 px | 使用者 | thin enough to read as flat, still shows a top face at 55° tilt | buildings OFF | 2 | marker invisible / too thick | operator 改值 |
| Toggle position: glass chip at top 64 / left 16, below the breadcrumb | 使用者 | top bar is at top 16 (≈ 40 px tall); Info panel occupies the right side | Isometric only | ON | overlaps breadcrumb | operator 改位置 |

**Decisions**

| # | Question | Answer | Authority |
|---|---|---|---|
| 1 | Separate view or toggle | Toggle in Isometric | operator, 2026-11-09 |
| 2 | What remains when OFF | Plates + flat health markers + labels | operator, 2026-11-09 |
| 3 | Persist across reload | No; resets to ON | operator, 2026-11-09 |
| 4 | Toggle position, `MARKER_H` | Glass chip top 64 / left 16, Isometric only; `MARKER_H` = 2 px | operator, 2026-11-09 |
| 5 | Manual row wording | as written in Verification | operator, 2026-11-09 |

**Explicitly NOT changing:** `CityView3D`, `AppState`, `Prefs` / `gridline.state`, `TopBar`, `layout()`.

**Verification — success conditions**

| Input / action | Expected observable outcome | Checked by |
|---|---|---|
| `markerBoxes(mockServices, layout, '')` | 22 boxes, each `h = 2`, x / z / w / d equal to the service footprint | `auto` — unit test |
| `buildingBoxes(mockServices, …)` with buildings ON | one box per segment: 22 services → 49 boxes (6 tower × 2 + 6 block × 2 + 5 cylinder × 2 + 5 stepped × 3) — regression test added (NI-01 had none for `isoBoxes`) | `auto` — unit test |
| Isometric → Buildings OFF → click a marker → reload | Isometric 關掉 Buildings 後只剩 plate、色塊和名稱，點色塊能開 Info panel，reload 後恢復開啟，console 沒有錯誤 | `manual` — operator |

**Open Decisions**

（無）
