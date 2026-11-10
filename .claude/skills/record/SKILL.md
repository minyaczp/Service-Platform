---
name: record
description: 'Write every record a finished change owes — feature docs, catalog, architecture docs, changelogs — and close the PLAN.md item. Runs only after verify has passed. Use before commitText.'
argument-hint: 'Optional: the NI id just implemented'
---

# record

## Outcome
Every document the change touches matches the code, both changelogs carry an entry, and the `PLAN.md` item is
closed. **This skill writes. It checks nothing** — `verify` already did, and running this before `verify`
passes documents behaviour that may still change.

## When to Use
After `verify` reports green, before `commitText`. A task that ships no code still ends here if it changed a
document or a rule.

---

## Step 1 — Sync the documentation chain

Every one of these, in the same task:

- The affected feature's `feature_docs/{frontend,backend}/feature_*.md` — create it for a new feature,
  **including the header block** (Feature · App · Entry point · Counterpart · Catalog anchor).
- Its section in `feature_docs/project_feature.md` — description, workflow, Related Docs anchor links —
  **and its row in §Feature Index**, the project's one canonical feature list.
- Any affected architecture doc, at the depth that doc owns
  (`feature_docs/feature_architecture.md` §Detail contract). Architecture docs describe *structure*; the
  feature doc owns its own `## Functions` and `## Dependencies` in full (and `## Endpoints` for a `backend/`
  feature).

## Step 2 — Find every other document that specifies what you changed

For each contract this change touched — a format, a rule, a field, a route, an envelope, a naming convention —
**search for the other places that specify it**, and reconcile them. A contract is rarely written down once.

```bash
# the format, the rule name, the field, the route — whatever was changed
grep -rn "<the thing>" CLAUDE.md .claude/skills/ feature_docs/ PLAN.md
```

| Changed | Also specified in, typically |
|---|---|
| A doc section's format | `feature_architecture.md` §Naming & Placement Rules · §Detail contract · the skill that writes it |
| A skill's name or its steps | `CLAUDE.md` §5 table · §Available Skills · `.claude/agents/*` · the skills that hand off to it |
| A route, a field, an enum | `shared/domain/` · `feature_architecture.md` · the counterpart app's feature doc |
| A command or script | root `CLAUDE.md` §4 · the `verify` skill · `feature_architecture.md` §Testing |

A contract stated in two documents will be changed in one of them. The grep is the only thing that catches
the other.

`.github/**` is **excluded** — it belongs to VS Code Copilot and is never synced (`CLAUDE.md`
§Available Skills). Do not update it, and do not report it as drift.

## Step 3 — Retire what the change supersedes

If a doc's content moved, its feature was removed, or a newer doc now owns it, **delete it in this task** and
name the deletion in the commit message. A doc left behind "just in case" is how duplicates accumulate.

This applies to documentation only. `CLAUDE.md` §3 still governs code — *don't remove pre-existing dead code
unless asked*.

## Step 4 — Update the changelogs

- Append a dated entry to the root `CHANGE_LOG.md`, naming the affected app (`frontend` / `backend`).
- Add one row to the root `Done.md` — Date · Title · App · Commit summary.
- Do **not** modify `README.md`.

## Step 5 — Close the item

Completion **clears** the item. All three, in this task:

- **Delete** the item from `PLAN.md ## New Instructions`. `PLAN.md` is the working set; `Done.md` is the
  permanent record. Leave it in place with a `— ✅ COMPLETE (YYYY-MM-DD)` heading **only** when the operator
  asks to keep it for reference.
- **Flip its `## Current Status` row** to `✅ Complete — NI-nn`, naming the id. Once the item is gone, that
  row is the only thing that lets a finished id still resolve.
- **Confirm the `Done.md` row** from Step 4 exists and names the id.

Ids are permanent and monotonic — a new instruction takes `max + 1` from `Done.md`, never a gap left by a
cleared item and never a reused number.

---

## Output template
1. Documents synced, by path, and what changed in each.
2. **Contracts searched, and what the search found** — the greps run, and every other document that also
   specified the thing changed. "Searched, nothing else specifies it" is a valid result; silence is not.
3. Documents retired, by path, and what now owns their content.
4. Changelog entries written.
5. The item's three closing actions, confirmed individually.

Then hand to `commitText`.

## Rules
- Never run before `verify` passes. Documenting an unverified change records a guess.
- Feature docs are an **output** synced here — never a change request. New work enters through
  `PLAN.md ## New Instructions`.
- One home per fact. If a fact already lives in a doc that owns it, link rather than copy.
- Superseded docs are deleted, not orphaned.
- Do not run `git commit`.

## Completion checks
- The feature doc, `project_feature.md` §Feature Index, and every affected architecture doc match the code.
- **Every contract this change touched was searched for other specifications of it**, and no two documents now
  state it differently.
- Superseded docs were deleted and the deletion is named for the commit message.
- `CHANGE_LOG.md` and `Done.md` both carry an entry.
- The item is cleared from `PLAN.md`, its `## Current Status` row names the id complete, and `Done.md` has its
  row — all three.
