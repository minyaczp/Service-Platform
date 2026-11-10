# PLAN

## Current Status

| Item | Status |
|---|---|
| NI-02 · Fill CLAUDE.md placeholders | ✅ Complete — NI-02 |
| NI-01 · Gridline Service City — Phase 1 frontend with mock data | ✅ Complete — NI-01 |
| NI-03 · Isometric buildings on/off (simple view) | 🟡 Pending — NI-03 |
| NI-04 · Pins as a DOM overlay (fix StrictMode unmount error) | ✅ Complete — NI-04 |
| NI-05 · 3D auto-rotate on/off | 🔵 Draft — NI-05 |

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

### [NI-05] 🔵 DRAFT — under review · 3D auto-rotate on/off

**Scope:** `frontend/src/features/city/view3d/` (`CityView3D.tsx`, `CityView3D.module.css`, `camera.ts`,
`camera.test.ts`); `feature_docs/frontend/feature_city.md`. **Outside:** `OrbitRig.tsx` (its `autoRotate`
prop already exists), `AppState`, `Prefs` / `gridline.state`, `TopBar`, the Isometric view, `main.tsx`,
`shared/**`.

**Docs consulted**

| Doc | What it settled |
|---|---|
| handoff README §City view 3D (Camera) | "slow auto-rotate (+0.0007 rad/frame, toggle `autoRotate`) when nothing is selected" — a toggle is intended; no UI given |
| `PLAN.md` NI-03 (Decisions 3–4, DD3) | Precedent for a view-local on/off: glass chip at top 64 / left 16, default ON, component-local, not persisted |
| `feature_docs/frontend/feature_city.md` | `CityView3D` props are the feature's public surface — unchanged here |
| `view3d/OrbitRig.tsx:82-97`, `CityView3D.tsx:112` | Rotation runs when `autoRotate` is true and no drag; today `autoRotate = selectedId === ''` |

**Problem.** In the 3D overview the camera always rotates (`CityView3D.tsx:112`); the operator cannot stop it.
**Goal.** A 3D-only "Auto-rotate: On / Off" chip. Off: the overview camera stays still; drag, zoom, pan and
fly-to behave as before. On: today's behaviour.

**Design decisions**

| # | Choice | Rejected | Why |
|---|---|---|---|
| DD1 | A glass button in `TopBar`, directly left of the 3D \| Isometric toggle (after Overview when shown); one click toggles rotating ↔ stopped; 3D only | Chip at top 64 / left 16 (NI-03 style) · keyboard shortcut | Operator, Decision 3 |
| DD2 | Component-local `useState(true)` in `CityView3D`; resets to On on reload or after switching to Isometric and back | Field in `gridline.state` | Persisting changes the stored schema — §5 halt list; NI-03 DD3 made the same call |
| DD3 | Pure `autoRotating(selectedId, enabled)` in `camera.ts`, true only when nothing is selected and enabled | Inline `&&` in JSX | Testable seam for the rule; `camera.ts` already holds `CAMERA.autoRotate` |
| DD4 | Chip styles rebuilt in `CityView3D.module.css` (`.toggle`, `.toggleOn`, `.toggleOff`), not imported from `viewIso` | Share NI-03's CSS | §0 *Reuse is designed*: features slices' views change independently; recorded as a rebuilt copy |

**Conditions & their justification**

| Condition | Whose problem | Evidence for the value | When it triggers | Default | If it is wrong | Removal criteria |
|---|---|---|---|---|---|---|
| Default On | 使用者 | handoff README: overview auto-rotates | every 3D mount | On | users must click Off each visit → revisit persistence (own item) | operator asks for a remembered choice |
| Chip at top 64 / left 16, z 15 | 使用者 | NI-03 Decision 4; below the breadcrumb (top 16, ≈40 px tall); under modal z 30 | 3D only | — | overlaps breadcrumb | operator moves it |

**Module decomposition**

| Module / function | Signature — params → returns | Single responsibility | Pure / effectful | Layer | New / reused |
|---|---|---|---|---|---|
| `view3d/camera.ts` · `autoRotating` | `(selectedId: string, enabled: boolean) → boolean` | Rotation rule: enabled and nothing selected | pure | logic (camera maths module) | New |
| `view3d/CityView3D.tsx` · `AutoRotateToggle` | `({ on: boolean; onToggle: () => void }) → JSX` | `<button aria-pressed>` "Auto-rotate: On/Off"; stops pointerdown so a click never starts an orbit drag | view | view | New (rebuilt from NI-03 `BuildingsToggle`) |
| `view3d/CityView3D.tsx` · `CityView3D` / `Scene` | public props unchanged; `Scene` gains `rotate: boolean` | Holds `useState(true)`; passes `autoRotating(selectedId, rotate)` to `OrbitRig` | view | view | Changed |
| `CityView3D.module.css` | `.toggle`, `.toggleOn`, `.toggleOff` | Chip look (DD4) | — | view | New |

**Decisions**

| # | Question | Answer | Authority |
|---|---|---|---|
| 1 | Split from NI-04 | Own item, after NI-04 | operator, 2026-11-10 |
| 3 | Placement and control | A button left of the 3D \| Isometric toggle; clicking switches between stopped and rotating | operator, 2026-11-10 |

**Explicitly NOT changing:** `OrbitRig` (prop already exists), `AppState`, `Prefs` / `gridline.state`, `TopBar`,
`CityViewIso`, fly-to / drag / zoom / pan, pins (NI-04).

**Verification — success conditions**

| Input / action | Expected observable outcome | Checked by |
|---|---|---|
| `autoRotating('', true)` · `('', false)` · `('payments', true)` | true · false · false | `auto` — unit test |
| 3D overview → click "Auto-rotate: On" | label reads Off; a pin's on-screen position is unchanged over 1 s | `auto` — Playwright |
| Off → click again | label On; pins move again | `auto` — Playwright |
| Off → select a building → Overview | fly-to still runs; overview stays still | `auto` — Playwright |
| Off → Isometric → 3D | chip reads On again (DD2) | `auto` — Playwright |
| 3D 總覽按 Auto-rotate 切到 Off | 城市停止轉動，拖曳、縮放、點建築飛過去都照常，console 沒有錯誤 | `manual` — operator |

**Open Decisions**

| # | Question | Recommendation |
|---|---|---|
| 2 | Remember the choice across reloads? | No (DD2) — schema change is a §5 halt; revisit as its own item if wanted |
| 5 | Where the on/off state lives, now that `TopBar` (renders it) and `CityView3D` (uses it) are siblings in `main.tsx` | Store field `autoRotate` + action `toggleAutoRotate` in `AppState`, not saved to `gridline.state` (edits flagged `main.tsx`) |
| 6 | Button label | `⏸ Pause` while rotating / `▶ Rotate` while stopped, `aria-pressed` |
| 4 | Manual Verification wording | as drafted above |

