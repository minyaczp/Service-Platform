# CHANGE_LOG

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
