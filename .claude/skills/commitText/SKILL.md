# commitText
---
name: commitText
description: 'Generate a git commit message for this repository. Use when asked to create, write, or generate a git commit message or commit text. Follows the project commit format: <type>: <title> with -- bullet lines per change. Types: feature, update, delete, fix, doc.'
argument-hint: 'Optional: app to focus on (frontend, backend, all)'
---

# commitText — Git Commit Message Generator

## When to Use
- User asks to "create a commit message", "write commit text", or "generate a git commit"
- After implementing a feature or fix and needing to summarise changes
- As the last step of the post-implementation checklist
- Only generate the commit message text — do not run `git commit` or `git add`
- Only generate messages when changes are detected or when there is clear recent implementation context

---

## Commit Format (this repo)

```
<type>: <title>
-- <change line 1>
-- <change line 2>
```

### Types
| Type | When |
|---|---|
| `feature` | New functionality added |
| `update` | Existing functionality modified |
| `delete` | Code or files removed |
| `fix` | Bug or broken behaviour corrected |
| `doc` | Documentation, comments, changelogs only |

### Rules
- **Title**: concise noun phrase, no period, ≤72 chars. If changes span several themes, list them in the title separated by commas: `feature: city layout, sidebar search`
- **Bullet lines**: one `--` line per logical change; start each with an action verb (`add`, `update`, `fix`, `remove`, `extend`, `replace`)
- **Scope prefix** (optional): prefix the bullet with `frontend:`, `backend:` or `docs:` when the commit touches more than one of them
- **Never run `git commit`** — output the message text in a fenced code block only

---

## Procedure

### Step 1 — Discover changed files
Run both commands in the terminal:
```
git diff --stat HEAD
git status --short
```
The first shows modified tracked files; the second reveals untracked new files (`??`).

### Step 2 — Understand the changes
For each changed/new file that is not obvious from its path, read the diff or the file to understand *what* changed and *why*. Focus on:
- New handlers or routes (`backend/`) → what HTTP / SSE endpoint was added or changed?
- New or modified React components → what UI feature or style change?
- New `logic/` functions or `ServiceSource` implementations → what behaviour?
- Config or `package.json` / `go.mod` changes → dependency added?

Skip lock files (`package-lock.json`, `go.sum`) and generated files (`frontend/dist/`).

### Step 3 — Determine the type
- Any net-new user-facing feature → `feature`
- Behaviour change to existing code only → `update`
- Only removals → `delete`
- Bug fix only → `fix`
- Only docs/comments/changelogs → `doc`
- Mixed: use the dominant type

### Step 4 — Write the message
1. Write a short title capturing the overall theme of all changes.
2. Write one `--` bullet per logical unit of change (not per file).
   - Group related file changes into a single bullet.
   - Include the app prefix when the commit touches more than one app or also changes docs.
3. Order bullets: backend changes first, then frontend, then docs.

### Step 5 — Output
Output the final message in a fenced code block:

```
feature: example title
-- backend: add X handler and route
-- frontend: add Y component reading X
```

Do **not** run `git add`, `git commit`, or `git push` unless the user explicitly asks.

---

## Examples

```
feature: service city 3D view, sidebar search
-- frontend: add layout() — district slot grid, footprints never overlap
-- frontend: add CityView3D with orbit camera and fly-to tween
-- frontend: Sidebar — search by name and domain, Favorites, Recent (max 3)
-- docs: add feature_docs/frontend/feature_city.md
```

```
fix: Unassigned district hidden when empty domain table
-- frontend: districtOf returns Unassigned for any domain missing from the table
```

```
doc: fill CLAUDE.md placeholders
-- docs: CLAUDE.md — multi-app structure, verify commands, flagged paths
-- docs: record skill — write the changelog to CHANGE_LOG.md
```
