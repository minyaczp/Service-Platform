# CHANGE_LOG

## 2026-11-10 — City density & chrome fixes vs. the handoff demo (frontend)

- 3D city: `PLANE_PX_PER_UNIT` 10 → 7 and `FOOTPRINT_RATIO` 0.7 → 0.55, so 5–6 buildings per district stand
  on streets ≈ one footprint wide instead of forming a wall; ground grid and road lengths follow the scale.
- Camera: `overviewOf(plates)` frames the drawn plates (r = span × 120/72, the demo's ratio; 171 for the
  four districts); `CAMERA.maxR` 200 → 260; fog distance follows the overview r.
- Sidebar: `.row` gets `box-sizing: border-box` (rows were 20 px wider than the list, pushing the star column
  to the edge); footer counts add `down` and wrap per item.
- Legend adds Down.
- Tests: 53 (layout footprint expectation 59.5 → 46.75; 2 new `overviewOf` cases). Typecheck, lint
  (0 warnings), test and build pass.

## 2026-11-09 — NI-01 · Gridline Service City — Phase 1 frontend with mock data (frontend)

- New app `frontend/` (React 19 + TS 6 strict + Vite 8; @react-three/fiber + drei; Zustand; Scalar), 19
  exact-pinned dependencies (16 from Decisions #18 + 3 `@types/*`), `package-lock.json` committed.
- Features: `city` (layout, 3D and Isometric views, top bar, legend), `catalog` (sidebar), `inspect` (info
  panel, read-only API Docs), `use-service` (iframe modal), `auth` (Login button). One store in `main.tsx`.
- Data: 22 mock services through `ServiceSource` (`createMockSource`); 14 OpenAPI 3.1.0 files and one
  placeholder page under `frontend/public/mock/`.
- Tests: Vitest, 48 cases in 8 files. Typecheck, lint (0 warnings), test and build pass; manual side-by-side
  check passed by the operator.
- Docs: `feature_docs/` created — catalog, architecture, 5 feature docs.
- `.gitignore`: ignores `frontend/node_modules/` and `frontend/dist/`.
- `CLAUDE.md` §Project Context: the seed-design paragraph now names `feature_docs/` as the source of truth;
  `unit-test-and-record` names Vitest as the frontend runner (operator-approved).

## 2026-11-06 — NI-02 · Fill CLAUDE.md placeholders (docs)

- `CLAUDE.md`: 37 placeholders filled, template comment removed (38 distinct placeholders in total).
  Structure is now multi-app: `frontend/` (React + TS) and `backend/` (Go, later), sharing no code.
  Verification commands, flagged paths, the license whitelist (MIT / Apache-2.0 / BSD-2 / BSD-3 / ISC),
  the cycle check (`import-x/no-cycle`) and `simplify` as the step-4b review skill are recorded.
- Changelog moves from `AIREADME.md` to the root `CHANGE_LOG.md`; `Done.md` stays as the completion list
  and the source of the next NI id.
- `.claude/skills/`: 7 skills (`implement-new-instruction`, `verify`, `unit-test-and-record`, `grilling`,
  `plan-feature`, `record`, `commitText`) had rules left over from another project — Svelte 5, `bun`,
  `backend/js`, `backend/python-agent`, `agent/`, per-sub-project `CLAUDE.md`, SBOM examples, NI-20 —
  and now use this repo's apps, commands and examples.
- `.gitignore`: ignores `.serena/` (local serena MCP server data).
