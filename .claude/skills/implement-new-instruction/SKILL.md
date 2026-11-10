---
name: implement-new-instruction
description: 'Implement a new feature or instruction from PLAN.md New Instructions following project conventions, then finalize with completion log and commit message.'
argument-hint: 'NI id (e.g. NI-15) or a task description'
---

# Implement New Instruction

## Outcome
Complete an instruction from root `PLAN.md` safely and consistently:
- Implement the requested change using project conventions.
- Validate and finalize via post-implementation workflow.
- Update `PLAN.md` to reflect completion (clear the implemented item in `## New Instructions`) and record the work in `Done.md`.
- Provide commit message text (without running `git commit`).

## When to Use
Use this skill when the user asks to implement a task documented in `PLAN.md` under `## New Instructions`.

## Workflow

### Step 1: Select the Instruction

**Precondition — an approved item must exist.** This skill builds an agreed design; it does not invent one.
If the work in front of you has no approved item, stop and hand to `plan-feature`. That is a routing decision,
not a refusal — the same turn continues in the design stage.

**If an NI id was passed as the argument** — `NI-15`, `ni15`, `15` and `[NI-15]` are all accepted:
- Normalize it to `[NI-nn]` and find that heading under `## New Instructions`.
- **Found, not complete, not a draft** → use it. Do **not** ask which task to implement.
- **Found and headed `🔵 DRAFT — under review`** → stop. The design has not been approved; say so and hand to
  `plan-feature`. A draft is a proposal, not an instruction.
- **Found but marked `✅ COMPLETE`** → stop. Report that it is already done and point at its `Done.md` row.
- **No match under `## New Instructions`** → check `## Current Status` before giving up. Completion **clears**
  the item, so a finished id survives only as a `✅ Complete — NI-nn` row there. Found → stop, it is done.
  Still no match → list the live NI ids with their titles and ask which was meant. Do not guess at the nearest
  number.

**What the completed-id guard prevents.** A duplicate **instruction**, not similar functionality. A new
feature needing behaviour that resembles something already shipped enters as its own item; whether it calls
the existing module or rebuilds from its own spec is decided by that item's Module decomposition under root
`CLAUDE.md` §0 *Reuse is designed, not discovered*. Never refuse work on the grounds that comparable code
already exists.

**If no argument was given** — read `## New Instructions`, then:
- No actionable instructions → stop and report there is nothing to implement.
- Exactly one, and not a draft → use it.
- Several → list them and ask the user to choose.

**If free text was given instead of an id** — match it against `PLAN.md` and confirm which NI it refers to
before starting. **No match at all means the requirement has never been designed** → hand to `plan-feature`
rather than starting to edit.

### Step 2: Understand Project Context
- Read root `CLAUDE.md` to capture global principles and constraints. It is the only `CLAUDE.md`; there are
  no per-app copies.
- Read the affected feature's docs — they are the source of truth. Navigate the documented way: `feature_docs/project_feature.md` §Feature Index → `feature_docs/{frontend,backend}/feature_*.md`. Each feature doc opens with a header block naming its app, its entry point and its counterpart in the other app, if any.
- If the task includes structural changes (new features, data shapes, folders, cross-app flows), also read `feature_docs/feature_architecture.md` (the two apps, layering inside a slice, naming and placement rules, §Detail contract).

### Step 3: Identify and Read Target Files
- **Start from the feature doc's `## Functions` section** — it names the feature's public surface and the
  file each function lives in, so the read list is already written. Search the repo only for what it does
  not cover.
- Identify all files required for implementation.
- Read target files before editing.
- Do not edit any file that has not been read.

### Step 3.5: Restate the Plan Before Editing

Before the first edit, state the plan in one short block — not a document:

- **Files to touch**, and the change intended in each.
- **The verification command** that will prove it works.
- **Anything the NI leaves undecided** — each one, and the option you intend to take.

Proceed unless the operator objects.

## When the item does not decide it

**One question decides it: can this be derived from the item?**

Derived means the answer is *already there* — in the item, in the code, or in a feature doc — and reading is
enough to find it. Anything else is the operator's call, and the work stops until they make it.

```
  fork appears
      │
      ├─ derivable from the item, the code, or a feature doc
      │     └──▶ continue. Nothing is logged; there was no decision to make.
      │
      └─ not derivable  ──▶  HALT before the edit
                             `grilling` in mid-implementation mode → the operator decides →
                             write it into the item under **Decided during implementation** → resume
```

### What halts

| | Halts because |
|---|---|
| **A gap** — the item is silent, and no amount of reading settles it | The answer would have to be invented |
| **A divergence** — the item's instruction does not work, contradicts itself, or contradicts the code | Following it produces something wrong; changing it is not yours to do |
| **A better idea** — the item specifies X and you believe Y is better | Say so and let the operator choose. Silently doing X when you think it wrong, and silently doing Y instead of X, are both failures |
| **A solution you would have to invent** — no row, no doc, no precedent points at it | An invented answer is a design decision wearing an implementation costume |
| **Irreversible or shared** — a schema migration, a write that changes stored documents, a deletion, a `shared/domain/` type or the `ServiceSource` contract, the `gridline.state` schema, a public function other consumers call, anything on the flagged-path list in root `CLAUDE.md` §3, or anything in root `CLAUDE.md` §5's irreversible list | **Halts even when the item authorises it.** Confirm before the edit |

### What does not halt

Only what reading settles: what a function returns · whether a helper exists · what shape a collection has ·
which file a component lives in · what an existing consumer expects · a local variable name · where a `const`
sits · which of two equivalent assertions to write · the order of two independent statements · an import path.

**If you cannot point at the line that settles it, it is not derived.** "It seemed obvious" is not a
derivation, and neither is "the stronger option was clear".

### The loop keeps running only inside the plan

`implement → test → verify` cycles freely while every fix is **mechanical and within the item** — a bug, a
typo, a wrong assertion, a missed file. No ceiling on those laps.

The moment a fix would need anything from the halt list, **leave the loop and ask**. A loop that keeps running
by inventing answers stops building the feature that was planned, which is the whole reason the item exists.

**The NI is binding.** A plan that no longer matches the code is worse than no plan.

### Step 4: Implement the Changes
Implement the instruction while following project conventions:
- Keep functions small and focused (Single Responsibility).
- **Build the instruction's Module decomposition, nothing more.** If the NI carries a decomposition table, each row is one function with one responsibility, pure or effectful as stated, in the layer stated. A row you cannot implement that way is a divergence — halt before the edit and grill it (see §When the item does not decide it). If the NI has no table, apply root `CLAUDE.md` §0 directly: minimal modules, pure core with effects at the edge, composition instead of flag parameters, dependencies pointing one way.
- Use proper separation of concerns: view → state → logic inside a slice, effects at the edge.
- Maintain consistency with existing architecture and naming style.

For `frontend/` instructions, enforce these conventions (root `CLAUDE.md` §0 *Language style*, §2):
- React function components with TypeScript `strict`; no `any`.
- Styling through CSS Modules that read the CSS-variable design tokens; no inline colour literals.
- Global state lives only in the Zustand store created in `src/main.tsx`; features receive what they need
  as props or a passed-in selector, never by importing another feature.
- A `switch` over a closed union ends with `assertNever(x)`.

For `backend/` instructions (Go, later): `gofmt`, errors returned as values, no `panic` for an expected failure.

### Step 5: Hand On — this skill ends when the code is written

Implementation stops at working code. The three stages after it own their own procedures, and this skill
routes to them rather than restating what they do:

| Run | Skill | Owns |
|---|---|---|
| 1st | `unit-test-and-record` | Derives the cases from **this instruction** — every `Pure` decomposition row, every **Explicitly NOT changing** entry — writes them, records coverage |
| 2nd | `verify` | Build and test per app, then the item's **Verification** table row by row. Writes nothing |
| 3rd | `record` | The whole documentation chain, both changelogs, and closing the item — delete from `PLAN.md`, flip the `## Current Status` row, append `Done.md`. Checks nothing |
| 4th | `commitText` | The commit message text, in chat only |

**Do not sync docs or close the item here.** `record` owns both, and it runs only after `verify` is green —
documenting an unverified change records a guess. Reaching `record` is this skill's completion condition, not
an optional follow-up.

## Decision Points
- **An explicit NI id wins.** If the user passes `NI-nn`, implement that instruction without asking.
- A free-text task argument defers to `PLAN.md`; only override when the user explicitly requests it.
- If multiple tasks exist and no id was given, ask the user to choose before implementation.
- If scope spans both apps, apply each app's conventions above and reflect both scopes in commit text.
- If requirements are ambiguous, ask one focused clarification question before implementation.

## Completion Checks
- The instruction implemented is the one selected — by id, or by explicit user choice.
- The plan was stated before the first edit; every fork that was **not derivable from the item** halted the
  work, was put to the operator, and was written into the item under **Decided during implementation** before
  editing resumed. Every fork that continued can name the line that settled it.
- All edited files were read before modification.
- Implementation satisfies root `CLAUDE.md` and the app conventions above.
- `verify` ran and reported — **tests run, not only builds** — or every blocker is explicitly named.
- Feature docs (with header blocks), the `project_feature.md` catalog section and its §Feature Index row, and affected architecture docs match the implemented change.
- Superseded docs were deleted, not orphaned.
- The item was cleared from `PLAN.md`, its `## Current Status` row names the id as complete, and `Done.md` has
  its row — all three, or the operator explicitly asked to keep the item in place.
- Commit message text is provided in repository format.

## Rules
- Never edit a file before reading it.
- Always follow conventions in `CLAUDE.md`.
- State the plan before editing. A fact you can read, you resolve; a decision you cannot, you halt for —
  amend the item, then edit, never the reverse.
- For structural or architectural changes, consult `feature_docs/feature_architecture.md`.
- Feature docs are an **output** synced during implementation — never a change request. New work enters through `PLAN.md ## New Instructions`.
- Never start against an unapproved design. No item, or a `🔵 DRAFT` item → `plan-feature` first.
- Do not run `git commit` unless explicitly asked.
- If the task spans both apps, mention both in commit message bullets.
