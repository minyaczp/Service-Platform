---
name: plan-feature
description: 'Turn a new requirement into a reviewed, approved instruction in PLAN.md. Use when the user raises a new feature, change or upgrade — in chat or by pointing at an NI id — and before any implementation begins. Design only: no code is edited.'
argument-hint: 'A requirement in your own words, or an NI id (e.g. NI-11)'
---

# plan-feature

## Outcome
One item under `PLAN.md ## New Instructions` that the operator has approved, carrying the design decisions,
the module decomposition, the justification for every condition it introduces, and an **empty Open
Decisions list**. **No file outside `PLAN.md` is edited by this skill.**

## When to Use
- The user raises a new feature, change or upgrade in conversation.
- The user points at an existing `## New Instructions` item that needs designing or reworking.
- Any time `implement-new-instruction` finds no approved item for the work it was asked to do.

Skip it only for changes below the threshold in root `CLAUDE.md` §5 — a typo or a single-line correction —
which still finish through `verify`, `record` and `commitText`.

**Do not use it to answer a question.** A general Q&A turn — *how does this work*, *why is it failing*,
*what would it take to do X* — is answered in chat and writes nothing to `PLAN.md` (root `CLAUDE.md` §5,
*Q&A never writes to `PLAN.md`*). Name the work the answer uncovered and offer to draft an item; start this
skill only once the user says yes.

---

## Workflow

### Step 1 — Take the requirement, whichever way it arrived
- **From chat:** there is no id yet. Restate the requirement in one sentence and confirm you have it right.
- **From an id** (`NI-11`, `ni11`, `11`, `[NI-11]`): load that item. If it is already `✅ COMPLETE`, or its id
  appears in `## Current Status` as complete, stop — see *The completed-id guard* below.

Both paths continue identically. The entry point differs in input, not in behaviour.

### Step 2 — Read the contract
Root `PLAN.md` and root `CLAUDE.md` — the only `CLAUDE.md` in this repo. §0 is what the design must satisfy;
you cannot check a design against principles you have not read.

### Step 3 — Read the feature docs the documented way
`feature_docs/project_feature.md` §Feature Index → `feature_docs/{frontend,backend}/feature_*.md`. For
structural work — new features, data shapes, folders, cross-app flows — also read
`feature_docs/feature_architecture.md`.

List every doc read in the item under **Docs consulted**, with what each one settled. A doc you read and
learned nothing from is still worth a row saying so.

### Step 4 — Verify against the code, not against memory
Name the real functions, files and fields the change will touch, and open them. **The feature doc's
`## Functions` section is where those names live** — start there, then confirm against the code. Where a doc
and the code disagree, **say so in the item**: correcting the doc is part of the work being planned, and it
is cheaper to repair before implementation than during it.

### Step 5 — Design, and justify
Write the item using the skeleton below. It must pass the design gate and the conditions analysis, both below.

### Step 6 — Grill until nothing is open

A decomposition you find convincing is not a decided plan. Before writing anything into
`PLAN.md ## New Instructions`, invoke `grilling` and walk its decision tree against this change.

- Present the proposed decomposition first, so the interview has something to attack. That statement of
  understanding is `grilling`'s opening move and it replaces any separate direction check — one interview,
  not a checkpoint followed by an interview.
- Every question comes with your recommended answer and the §0 principle or feature-doc line behind it.
- Resolve facts by reading the code and the feature docs. Put only genuine decisions to the operator.
- Write each answer into the item's **Decisions** as it is settled, not at the end.

Do not offer the item for approval while **Open Decisions** is non-empty. If the operator wants to
defer a decision, either split it into its own item and record the dependency, or leave the item in
`🔵 DRAFT` and say it is not approvable yet. An item approved with open decisions is the defect this
phase exists to prevent — it is exactly where implementation-time divergence comes from.

### Step 7 — Write the draft, delete what it promoted, and stop
Write the item into `## New Instructions` headed `### [NI-nn] 🔵 DRAFT — under review · <Title>`, add its
`🔵 Draft — NI-nn` row to `## Current Status`, then **stop**. Say that **Open Decisions** is empty — or, if
the operator chose to defer one, say the item is not approvable and why — and wait.

**In the same turn, delete from `BRAINSTORMING.md` whatever this item now owns.** Not a follow-up, not a
suggestion — a step of writing the draft.

- **Fully promoted section** → delete the section and its heading.
- **Partially promoted** → delete the promoted rows and head the remainder
  `— partially promoted, see NI-nn, <date>`, naming what went.
- **Any prose elsewhere in the file that referenced a deleted row** → rewrite it to name the behaviour and
  the `NI-nn`. A dangling local id is the same defect one level down.
- **Rejected instead of promoted** → delete it too, with one line saying so.

This step belongs to whoever creates the item, which is this skill. Two homes for one design means one of
them is stale, and a stale design is read as current.

Approval removes the `🔵 DRAFT — under review · ` prefix from the heading and flips the status row to
`🟡 Pending — NI-nn`. Only then may `implement-new-instruction` start.

---

## Design first, execution later

While designing, do not raise build commands, test runners, doc-sync order, changelog entries or commit
splitting. Those belong to steps 3–5 of root `CLAUDE.md` §5 and they crowd out the only question that matters
here: *is this the right shape?*

The one place this touches the skeleton: **Verification** states expected inputs, observable outcomes, which
behaviours must not change, and who checks each row. It does not list commands.

---

## Asking the operator

**The interview technique — how to ask, in what order, and when to stop — lives in `grilling`.** It is not
restated here and not reimplemented anywhere else; read it before Step 6. One rule is local to this skill:
**do not re-read** — a file already opened this session is cited from what was found, not opened again.

---

## Instruction skeleton

```
### [NI-nn] 🔵 DRAFT — under review · <Title>

**Scope:** apps and files touched; what is explicitly outside.
**Docs consulted** — table: doc | what it settled.
**Problem.** What is wrong or missing today, in terms of the existing code. Measured, not asserted.
**Goal.** The outcome, stated so it can be checked.
**Design decisions.** D1, D2, … Each names the choice, the alternative rejected, and why.
**Conditions & their justification** — the table below, whenever the change introduces a condition.
**Module decomposition** — the table below.
**Decisions** — every decision the grilling settled; question, answer, authority.
**Explicitly NOT changing** — the files, routes and envelopes this must leave alone.
**Verification — success conditions** — the acceptance table: inputs, observable outcomes, what must stay
unchanged, and **who or what checks each row**. See §Acceptance.
**Open Decisions** — anything the interview surfaced and did not settle. Non-empty means not approvable.
```

### The two records of the interview

**Decisions** — every decision the grilling settled, one line each: the question, the answer, and the
authority — `operator`, or the document that settled it with its path. This is the item's memory of why it
looks the way it does, and the reference implementation checks itself against when it thinks it has found a
fork.

**Open Decisions** — anything the interview surfaced and did not settle. **An item carrying a non-empty
Open Decisions list is not approvable.** Empty it, or split the unresolved part into its own item and record
the dependency there.

### Allocating the id
The next unused number, never a gap and never a reuse. Because completion **clears** the item from
`PLAN.md`, the highest id ever issued is found in `Done.md` — allocate `max + 1`.

### The completed-id guard
An id that was cleared still resolves through `## Current Status`, where its row reads `✅ Complete — NI-nn`.
Finding one means **do not plan this again**; point at the `Done.md` row instead.

What the guard prevents is a duplicate *instruction* — not similar functionality. A new feature needing
behaviour that resembles something already shipped enters as its own item; whether it calls the existing
module or rebuilds from its own spec is decided by that item's decomposition under §0's *Reuse is designed,
not discovered*.

---

## Acceptance — how anyone will know it worked

The **Verification** table is the item's acceptance criteria, and it is executed at step 4 rather than read.
Every row carries who checks it:

| Input / action | Expected observable outcome | Checked by |
|---|---|---|
| `layout(mockServices, districtOf)` | 22 footprints, pairwise disjoint, each inside its district plate | `auto` — unit test |
| Open the city after Login | Buildings coloured by health, as in the demo | `manual` — operator |
| `heightOf(1000)` before and after the change | 20 both times | `auto` — regression test |

**Four rules:**

1. **At least one row, or the item is not approvable.** Same gate as an empty Open Decisions list. An item
   nobody can check is an item nobody can finish.
2. **The operator writes the `manual` rows, in their own words.** Ask directly: *"what will you look at to
   decide this is done?"* Their sentence goes in verbatim — not a paraphrase of it.
3. **`manual` is a first-class answer, not a gap.** Dark mode, layout, wording, "does this feel right" are
   legitimately human checks. Marking a row `manual` is what stops it being skipped silently; pretending it is
   automatable is what gets it skipped.
4. **Name the row that cannot be checked at all**, and why. An unanswerable row is a stated gap, never an
   assumed pass.

---

## Design gate — clean architecture, minimal modules

An instruction is not ready to hand off until it satisfies root `CLAUDE.md` §0. Make that checkable, not
implied: include a **Module decomposition** table naming every module or function the change needs.

**This gate and `grilling`'s decision tree are one thing seen twice** — the rules below are the checklist,
levels 1–5 of the tree are the same rules asked as questions, in the order that makes them converge. Satisfy
them in the interview and this section is satisfied; neither is a second pass over the other.

| Module / function | Signature — params → returns | Single responsibility | Pure or effectful | Layer | New or reused |
|---|---|---|---|---|---|

The canonical names are from `CLAUDE.md` §0 (*Clean Code* / *Clean Architecture*, Robert C. Martin):

- **One responsibility per row (SRP).** A row needing "and" is two rows.
- **Humble Object.** Parse / map / validate / calculate rows are pure; I/O rows (DB, HTTP, filesystem, clock)
  sit in the thin outer layer. A row that is both is split before the instruction ships
  (*Command-Query Separation*).
- **Reuse before creation — and reuse only what was designed shared.** For every `New` row, say what was
  searched and why nothing existing fits. For every `Reused` row, say why that module's contract was written
  for more than one caller. Bending a feature-local helper to a second feature is not reuse.
- **Common Closure / Common Reuse (CCP / CRP), and ISP.** A new *shared* module needs a second real caller in
  the same instruction; otherwise keep the helper local to its feature and say so. Export only what callers use.
- **Open/Closed.** A new variant is a new row plus a new named function, never a new branch inside a function
  that already works. A row showing an existing function growing a mode is a branch pretending to be reuse.
- **Liskov Substitution.** Rows sharing a contract return the identical shape, so no caller downstream asks
  which variant produced it. State the shape once in the instruction.
- **No flag arguments.** Two behaviours are two named functions, not one with a boolean or a mode string.
- **The Dependency Rule.** Name the direction: details → adapters → use cases → entities. A `libs/` helper
  never imports a controller, a store never imports a route.
- **Testable in isolation.** Every pure row is unit-testable without a DB — and under `unit-test-and-record`
  each one becomes at least one test case, so a row marked pure that is not testable is mislabelled.
- **Take every row to the leaf — state its signature.** Params in, shape out, for every row. Two rows
  returning the same shape mean a **third row was missed**; a returned key that no other row and no existing
  caller reads means **that key does not belong** (ISP / CRP). This is the check that catches the helper
  which would otherwise "emerge" halfway through implementation.
- **Every effectful row states its failure path.** What is left behind when it throws — a temp file, a
  half-written document, an open handle — and which row clears it. A row whose failure path is unstated is
  not designed.

If a decomposition cannot satisfy these, the design is wrong. Rework it or surface the conflict. Do not write
the instruction around the violation.

---

## Pre-flight — is this item well-defined?

**Well-defined means nothing can surface during implementation that the item did not decide.** That is
checkable before approval, because the things that actually surface are a short list. Six questions, each
answerable yes or no:

| # | Check | Fails when |
|---|---|---|
| 1 | **Every function has a signature** — params in, shape out | Two rows return the same shape (a row is missing) · a returned key no other row and no existing caller reads (that key does not belong) |
| 2 | **Every value is decided** — number, default, timeout, gate, enum, required-vs-optional | A constant is named but its value has no stated source (§Conditions) |
| 3 | **Every assertion was checked against real data** | A Verification row claims a stored value that was never queried while planning |
| 4 | **Every access the work needs is named** — credentials, environment, database, external service | The work will need something the operator has not been asked for |
| 5 | **Every file to be edited is named, and has been read** | A file appears in Scope that nobody opened |
| 6 | **Every new name is stated** — file, function, field, enum value | The name will be invented while coding |

**Report the count.** *"Six of six"*, or *"four of six — 3 and 5 outstanding"*. That number is what makes the
interview finite: `grilling` asks about the unfilled ones and stops.

**A failing check is not a caveat.** It goes to `grilling` like any open decision, or the item stays
`🔵 DRAFT`. An item approved with a hole is where mid-build decisions come from.

---

## Conditions & their justification

Any change that introduces one of these must fill the table: **a numeric limit or threshold · a default
(on/off) · a timeout · a retry count · a page size · a cache TTL · required-vs-optional · a validation that
rejects · a feature flag · a permission gate · an enum whitelist.**

**`grilling` level 7 is where these are asked**, one at a time, before the table is filled. A value that
reaches this table without having been put to the operator was chosen, not decided — which is the whole
failure this table exists to prevent.

| Condition | Whose problem | Evidence for the value | When it triggers | Default | If it is wrong | Removal criteria |
|---|---|---|---|---|---|---|

### The seven checks
1. **No unjustified number.** §0 requires naming a constant; naming is not justifying. Every constant needs a
   line saying where its value came from.
2. **A limit that only produces refusals is not a safeguard.** If the cost it guards against does not exist in
   this deployment, its net effect is refusal — default it off, make it opt-in.
3. **Measure before you enforce.** Counting and refusing are two decisions (*Command-Query Separation*). The
   first is the default; the second needs its own case.
4. **Every refusal needs a recovery path.** With no action the user can take, offer none — a dialog of useless
   buttons is worse than a plain statement.
5. **Opt-in beats opt-out** for anything able to block work.
6. **State the removal criteria.** If nobody can say what evidence would retire the condition, nobody
   understands why it exists.
7. **An advisory still needs a basis.** Softening a condition from refusal to advice lowers its cost, not its
   burden of proof. An unevidenced number is unevidenced whether or not it can refuse work — find an anchor,
   or delete it.

An anchor is a value derived from something already true in the repo (an existing file's size, a measured
runtime, a documented external limit). "Seems safe" is not an anchor.

---

## Rules
- **Do not edit code.** This skill writes to `PLAN.md`, and deletes from `BRAINSTORMING.md` what it promoted
  (Step 7). Nothing else.
- **Feature docs are outputs.** Read them when planning; never edit them as a change request.
- **Never decide silently — and never leave a decision open in an item you offer for approval.** Name what
  the operator must decide, put it to them through `grilling` with your recommendation, and record the answer
  under **Decisions**. Justification is how an item earns agreement; **an empty Open Decisions list is what
  makes it approvable**. A decision the operator declines to settle stays in **Open Decisions**, and the item
  stays `🔵 DRAFT`.
- **Stop at approval.** Writing the draft is the end of this skill's work.
- Do not run `git commit`.

## Completion checks
- **The pre-flight count is stated**, and every one of the six checks passes.
- **Verification carries at least one row**, each with a `Checked by` value, and the `manual` rows are the
  operator's own words.
- Every doc read is listed under **Docs consulted**, with what it settled.
- Every claim about the code was verified by opening the file, and disagreements are recorded.
- Any Verification assertion resting on stored data was queried, and any access the work needs was named.
- The decomposition satisfies every gate rule, or the conflict is surfaced. Every row has a signature; every
  effectful row has a failure path.
- The `grilling` interview opened with a statement of understanding, walked all eight levels, and every
  condition the change introduces was put to the operator at level 7 rather than chosen silently.
- Every condition the change introduces has a justification row with an anchored value.
- **Verification** states inputs, outputs and invariants — no commands.
- The item was grilled before drafting, its **Decisions** records every answer with its authority, and
  **Open Decisions** is empty — an item offered for approval with a non-empty list is the defect this stage
  exists to prevent.
- The item is written as `🔵 DRAFT`, its `## Current Status` row exists, and the operator has been asked.
- **Everything this item promoted is gone from `BRAINSTORMING.md`**, partial promotions are marked, and no
  prose there still references a deleted row. Grep the file for the ids you removed.

## Hand-off
`implement-new-instruction` — once, and only once, the operator has approved the item.
