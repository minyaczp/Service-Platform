---
name: verify
description: 'Prove a finished change works — build, test, and check it against its PLAN.md item. Answers a question and writes no documentation. Use after unit-test-and-record and before record.'
argument-hint: 'Optional: affected app(s): frontend, backend'
---

# verify

## Outcome
Evidence that the change builds, that its tests pass, and that it does what its instruction said it would.
**This skill answers a question. It writes nothing** — no docs, no changelogs, no commit message. That is
`record`'s job, and the split is Command-Query Separation applied to the workflow itself.

## When to Use
After `unit-test-and-record`, before `record`. Also on its own, for a task that ships no code but still needs
its claims checked.

---

## Step 1 — Identify scope
Determine the affected app(s) — `frontend/`, `backend/`, or neither for a docs-only change. If not given,
infer from the changed files.

## Step 2 — Build and test

A change that compiles is not a change that works. Run every command for each affected app (root
`CLAUDE.md` §4):

| App | Commands |
|---|---|
| `frontend/` | `npm --prefix frontend run typecheck` · `npm --prefix frontend run lint` · `npm --prefix frontend test` · `npm --prefix frontend run build` |
| `backend/` (later) | set by the item that creates `backend/`, and added to root `CLAUDE.md` §4 by that item |
| docs only | none — go straight to Step 3 |

Fix any errors before proceeding.

**A missing runner is a reported blocker, not a silent skip.** If a tool is unavailable — an uninstalled
linter, an unreachable database, a browser that is not present — say so explicitly in the output and in the
commit message. Never let an unrun check pass as a passed check.

**Tests that touch shared state must be isolated first.** A test that reads or writes `localStorage`
(`gridline.state`) uses a fresh in-memory `Storage`, never the browser's real one.

## Step 3 — Check the change against its item

Build and test prove the code runs. They do not prove it does what was asked. Open the `PLAN.md` item and
work its **Verification — success conditions** table row by row, reading each row's **Checked by** value.

| `Checked by` | How it is answered |
|---|---|
| `auto` | Run it. State the actual output beside the expected one |
| `manual — operator` | Present it to the operator as a numbered question **and wait**. Do not self-certify a row the item assigned to them |
| unanswerable now | Say so, and why. A blocked row is a reported gap, never an assumed pass |

**Every row gets an answer.** The table is the acceptance criteria, not a description of them.

Also confirm the item's **Invariants** and its **Explicitly NOT changing** list still hold.

**A row that cannot be answered does not pass.** Reporting a check as done when it was skipped is the single
failure this step exists to prevent.

## Step 4 — Diff the work against the item's scope

The item's **Decided during implementation** list records what the operator settled mid-build. **It is written
by the party doing the work, so it cannot be the only check.** This step is the independent one, and it is
mechanical:

```bash
git status --short          # every file actually touched
git diff --stat             # and how much of each
```

Then compare against the item, three ways:

| Check | Fails when |
|---|---|
| **Files** — every touched file appears in the item's **Scope** | A file was changed that the item never named |
| **Modules** — every new or changed function appears in the **Module decomposition** | A helper exists that no row asked for |
| **Boundaries** — nothing under **Outside this item** or **Explicitly NOT changing** was touched | The change reached past its own edge |

**A mismatch is reported, never absorbed.** Name the file or function, and which of the two it is:

- **Unlogged** — it is not in the item and not in **Decided during implementation** either. This is the
  failure the diff exists to catch: a design change nobody agreed to and nobody recorded.
- **Unasked** — the work continued through a fork that was not derivable from the item, instead of halting.
  Name the fork and what should have settled it.

## Step 5 — Check the process record

Confirm, and report as a finding either way:

- The item was approved with **Open Decisions** empty.
- Every fork that halted is written into the item under **Decided during implementation**, naming what the
  operator settled. **None** is a valid answer; silence is not.
- Every fork that did **not** halt can name the line — in the item, the code, or a feature doc — that settled
  it.

An item that reached implementation with open decisions is one the design stage let through — say so, because
that is a defect in stage 1, not in the code.

## Step 6 — Decide where a failure goes

A failure here does not end the task; it routes it. Two exits, and picking the wrong one is how a plan turns
into a changelog.

```
   implement ──▶ test ──▶ verify
       ▲                    │
       │                    ├── all green ──────────────▶ record
       │                    │
       └── MECHANICAL ──────┤  a bug, a typo, a wrong assertion, a missed file
           fix, run again    │  — the item was right, the code is not
           no ceiling        │
                             │
                             └── THE ITEM WAS WRONG ────▶ plan-feature
                                 the requirement cannot be met as specified,
                                 or meeting it breaks something the item
                                 promised to leave alone
```

**Mechanical failures loop freely.** No ceiling — a build that fails four times because of four typos is not
a design problem.

**A failure that means the item decided wrongly leaves the loop.** Report it, name which of the item's
decisions is wrong, and hand back to `plan-feature`. Quietly changing the item to match what the code does is
the one move that must not happen.

---

## Output template
1. Build and test results, per app, separately.
2. The item's Verification table, row by row: expected · actual · pass/fail/manual/blocked.
3. Invariants and **Explicitly NOT changing** — held, or not.
4. **The scope diff** — files and functions touched vs named by the item; every mismatch, and whether it was
   logged. "No mismatch" is a valid result and must be stated.
5. Mid-build halts — how many, and what the operator settled in each.
6. Blockers, and the next action.

Then hand to `record`, which writes the documentation and closes the item.

## Rules
- Write nothing outside this report. No docs, no changelogs, no `PLAN.md` edits.
- Never report a check as passed that was not run.
- A missing runner, an unreachable database, an uninstalled browser — all are blockers to name, not gaps to
  pass over.
- Do not run `git commit`.

## Completion checks
- Build **and** test succeeded for every affected app, or every blocker is named.
- Every **Verification** row is answered — passed, failed, manual-confirmed, or explicitly blocked.
- Invariants and **Explicitly NOT changing** were checked, not assumed.
- **The scope diff was run**, not reasoned about — `git status` and `git diff --stat` were read, and every
  file and function was matched against the item.
- The process record was reported, including "no mid-build halts" when that is the case.
