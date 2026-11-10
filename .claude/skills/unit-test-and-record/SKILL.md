# unit-test-and-record
---
name: unit-test-and-record
description: 'Author the unit and regression tests a change needs, deriving the cases from its PLAN.md item, then record the coverage in the feature doc. Use after implementing and before verify.'
argument-hint: 'Optional: the NI id just implemented'
---

# unit-test-and-record

## Outcome
Tests that prove the change does what its instruction says, and that everything the instruction promised not
to touch still behaves — plus a `## Unit Tests` table in the feature's doc saying what is protected.

## When to Use
After implementing a change and **before** `verify`. This skill *writes* tests; `verify` *runs* them. Two
skills because writing and running are different responsibilities (*Command-Query Separation*) — and because a
task that legitimately ships no code still needs verifying.

---

## Step 1 — Derive the cases from the instruction, not from imagination

Three sources, all already in the `PLAN.md` item. Read it first.

| Source in the item | Produces |
|---|---|
| Every **`Pure`** row of the **Module decomposition** | One or more unit tests naming a concrete input and its expected output |
| Every entry under **Explicitly NOT changing** | A regression test proving it still behaves — or a written reason none is possible |
| The **Goal** and **Verification** section | The acceptance case: the change's own input → expected output |
| **Every contract the change shares with the other app** | A test on **each** side of it — see below |

### The fourth source: what the other app relies on

A change rarely stops at its own app. Read the feature doc's **Counterpart** line and its `## Unit Tests`
**Counterpart** row, then ask: *what does the other side assume that this change could break?*

| Changed | Also needs a test |
|---|---|
| A `Health` variant, an SSE event type | The other app's copy of that vocabulary |
| An SSE event field, a query parameter | The builder on one side and the reader on the other |
| A response key or its shape | Every consumer named in the counterpart doc |
| A validation that now rejects | The caller that must handle the rejection |

**Name the untestable ones too.** A cross-app path with no test gets a row under **Not covered** in both
feature docs, saying which side is missing. A pre-existing function the change now depends on counts: it is
not exempt for having existed before.

This is why the decomposition marks rows pure: a pure row is testable without a DB, a server or a browser.
**A row marked `Pure` that turns out not to be testable in isolation was mislabelled** — the item is wrong
about its own decomposition, which is a divergence. Halt, put it to the operator, and record the answer under
**Decided during implementation**.

If the decomposition has **no pure row** — a documentation or tooling change — then no unit test applies.
Say that explicitly in the report. Silence is not the same as "not applicable".

## Step 2 — Author them in the runner that already exists

No new framework, runner or config. Use what the app has:

| App | Runner | Notes |
|---|---|---|
| `frontend/` | Vitest (`npm --prefix frontend test`, jsdom, `src/**/*.test.{ts,tsx}`) | Pure logic in `features/*/logic/` and `shared/domain/`; `ServiceSource` contract suite |
| `backend/` (later) | set by the item that creates `backend/` | |

Component, WebGL and end-to-end behaviour (3D scene, camera tween, Isometric view) have no automated runner
yet. That is a gap to name in the report and in the item's `manual` rows, not a failure to fix inside a
feature task.

## Step 2.5 — When the code and the documentation disagree, assert the documentation

Sometimes the function under test does not do what its feature doc says it does. Two
choices, and this repo has settled on the second.

| | Assert the **code** | Assert the **documentation** ← **this repo** |
|---|---|---|
| The test | passes today | **fails today** |
| The suite | stays green | carries a known red |
| The defect | becomes *specified behaviour* — the next person to fix it breaks a test | stays visible, and the test **is** the acceptance criterion for the fix |
| What a reader learns | that this is intended | that this is broken, and who owns fixing it |

**Rule: assert what the documentation promises. A red test is the correct output when the code is wrong.**

Three obligations make a deliberate red legitimate rather than a broken suite:

1. **The test name says it is pinned, and names the item that will flip it** —
   `it('pinned defect (NI-nn flips this) — <the documented behaviour>')`. A reader must never have to guess
   whether a red is intentional.
2. **The feature doc's `## Unit Tests` section lists it** under a *pinned failures* row, with the same item id.
3. **The item that owns the fix exists.** If there is no such item, one is drafted — a pinned failure with no
   owner is just a broken test. That drafting is a decision the operator makes; halt and ask.

*Worked example.* The feature doc says `layout()` never lets two footprints overlap, but two services in
one district receive the same slot. Asserting the code (equal footprints) makes the overlap official.
Asserting the doc (disjoint footprints) fails, and that failure is the specification of the fix.

**The exception.** If the *documentation* is what is wrong, do not write a red test — correct the doc in this
task and assert the code. Deciding which of the two is wrong is a decision, not a fact: if the answer is not
obvious from the feature's purpose, halt and put it to the operator.

## Step 3 — Record the coverage in the feature's doc

A `## Unit Tests` section in the feature's `feature_docs/{frontend,backend}/feature_*.md`. Five parts,
in this order:

```markdown
## Unit Tests

`<path/to/suite.test.ts>` — **N cases**, `<command>`. <one line: pure? needs a DB? what is stubbed?>

| Covers | Cases |
|---|---|
| `functionName` — the behaviours asserted, named concretely | 4 |

**Not covered:** <the feature's own functions with no test, and why — "effectful", "needs the client
project", "node-testable and untested">

**Counterpart:** [`<other app>/feature_<name>.md` §Unit Tests](...) — <suite, count>. <What the two
apps share, and the change that must be re-tested on both sides.>
```

**Group by function, not by case.** One row per function or behaviour group, with a count. A per-case listing
duplicates the test file, which is the authoritative copy and cannot go stale.

**The counts must come from the runner, not from counting `it(` blocks.** Nested `describe`s and
parameterised cases make a grep undercount — run the suite and read the total.

**The Counterpart line is mandatory whenever the feature has one.** It is the only place a cross-app
dependency is written down: a change to a shared vocabulary — a `Health` variant, an SSE event type, a
response key — must be re-tested on both sides, and nothing else in the doc chain says so. If the feature
has no counterpart, say `**Counterpart:** none — this feature lives in one app.`

**Placement.** The feature's own doc owns all of it. Runners, coverage totals and what cannot be tested here
belong in `feature_docs/feature_architecture.md` §Testing — those are the only test facts no feature owns.
**Never create a separate test-documentation tree.** Two homes for one count means one of them is wrong, and
the wrong one is the one that gets read. Work that ships no product code needs no section.

**Never create a separate test-documentation tree, a root `Tests.md`, or a per-app test log.** A
second list of the same facts drifts from the first.

## Step 4 — Report

- Cases derived, and from which part of the item.
- Tests written, per app.
- **Gaps**: every case that could not be tested here, and why.
- Where coverage was recorded.

Then hand to `verify`, which runs the suites.

---

## Rules
- Cases come from the instruction. If you are inventing a case, you are testing something nobody agreed to.
- A regression test is not optional decoration — it is the half of the requirement that says *nothing else
  broke*.
- A missing or unrunnable runner is a reported blocker, never a silent skip.
- No new test framework, runner, config or CI.
- Do not run `git commit`.

## Completion checks
- Every `Pure` row has at least one test naming input and expected output — or the item was corrected.
- Every **Explicitly NOT changing** entry has a regression test or a written reason.
- The doc's `## Unit Tests` rows and the test files match: no row without a file, no new file without a row.
- Untestable cases appear as gaps in both the report and the doc.
- An instruction with no pure row ends with an explicit "no unit tests apply".
