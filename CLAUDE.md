# CLAUDE.md — Service Platform

Behavioral guidelines for a platform that monitors many microservices and presents them as a 3D city.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment. A task is
trivial when it changes no contract listed under *When an item is required* and touches no flagged path —
not when it merely feels small.

---

## How to answer

**Precise, short, undramatic. Fewest words, most detail.**

- **Lead with the answer.** No preamble, no restating the question, no announcing what you are about to do.
- **Density over length.** Every sentence carries a fact — a number, a file, a line, a name. Cut any
  sentence that only introduces the next one.
- **Precision beats hedging.** `frontend/src/features/city/logic/layout.ts:129, 7 exported functions, 0 tests` — not *"the module
  appears to have fairly limited coverage"*. If a claim is uncertain, say what would settle it.
- **No drama.** No superlatives, no "critical", "catastrophic", "massive", no exclamation. State the fact and
  its consequence; the reader judges severity.
- **No filler.** Drop "I'll now", "Let me", "Great question", "As you can see", "It's worth noting". Drop
  closing summaries that repeat what was just said.
- **Structure only when it earns its place.** A table when comparing, a list when enumerating, prose
  otherwise. Never a heading for two sentences.
- **Say what is not known.** Unverified, unread, untested, assumed — name it in one clause rather than
  writing around it.

Detail is not length. A dense paragraph naming five files beats a page of qualifiers.

**Numbers and results are reported as measured.**

- **Sum your own tables.** A stated total that disagrees with its rows misreports the scope of the work.
- **Measure before recommending.** A recommendation resting on an unmeasured quantity either measures first
  or says which number is a guess. This governs advice about this repo's own rules as much as about its code:
  a threshold is proposed with the distribution it was read from, never from intuition.
- **Report only what was run.** A check skipped, blocked, or assumed is named as such — in the reply **and**
  in any record written from it. Never write a result before the command that produces it has finished.

---

## Session start

In order, before the first answer of a session: this file → `CLAUDE_MEMORY.md` → `PLAN.md ## Current Status`.
Nothing else is read until a task names it. None is re-read mid-session unless a tool result shows it changed.

---

## 0. Core Principles — Above All Rules

These apply to every module and every task. A module is a TypeScript file in `frontend/` and a Go package
in `backend/`. They override defaults and preferences.

Where a bullet carries a canonical name it is grounded in that source and **not** in the common paraphrase —
several differ sharply from the version most codebases assume. Sources: SRP / OCP / LSP / ISP / DIP, the
Dependency Rule, and the component principles CCP / CRP / ADP / SDP / SAP from Robert C. Martin (*Clean
Code*, *Clean Architecture*); OCP originally Meyer (1988); module decomposition from Parnas (1972); the
extensibility axes from Wadler's Expression Problem (1998); behavioral subtyping from Liskov & Wing (1994);
composition from Hughes (*Why Functional Programming Matters*). Some bullets adapt their source for this
codebase rather than restating it; those carry **[local]** and are the repo's own call to change.

### Style and state

- **Language style.** TypeScript: `strict` on, no `any`, `readonly` for every input that is not meant to
  change, closed sets as string-literal unions. Go: `gofmt`, errors returned as values, never `panic` for an
  expected failure.
- **Inputs are not yours.** Never mutate an argument. A function that needs a changed value returns a new
  one. Shared mutable state is owned by exactly one value, created at the wiring edge (`frontend/src/main.tsx`; later `backend/src/main.go`) and
  passed down — never reachable as a global.
- **Keep functions small:** Target ≤ 20 lines. If a function grows beyond that, extract a named helper. A
  function is *one thing* when it braids one concern, not when it is short: if naming it needs "and" or
  "then", it braids two. The pure/effectful split and Command-Query Separation are the two braids that must
  never share a function.
- **Compose, don't accumulate.** Behaviour is built by composing small named functions, not by growing one.
  When a function's body is a sequence of steps, each step is a named function and the body is the
  composition — a reader sees the shape of the computation, not its details. Extraction and composition are
  not the same move: extraction removes lines from a long function, composition is how the behaviour was
  designed in the first place.
- **Total functions inside, validation at the edge.** A function either handles every input in its domain or
  narrows its domain so that it can. Shapes are validated and narrowed at the boundary; once inside
  `features/*/logic/` and `shared/domain/` every input is already valid, and no function there returns an error for a shape that should
  have been rejected at the edge.
- **Make illegal states unrepresentable.** Model the domain so that a value that cannot occur cannot be
  constructed: narrow types over wide ones, a closed set of variants over a free-form string, a shape that
  carries only the fields its variant has. A validation that must be remembered at every call site belongs
  in the type instead. This is the other half of the rule above — the edge narrows the input, the type
  remembers that it was narrowed.
- **Expected failures are values.** A failure the caller must handle — not found, unreadable, rejected — is a
  variant of the return shape. Exceptions (TS) and `panic` (Go) are reserved for programmer errors. No error
  is swallowed: it is handled, returned, or shown.

### Modules and dependencies

- **Minimal modules — Common Closure & Common Reuse (CCP / CRP):** Group what changes together; things not
  reused together don't belong in the same module. Export only what callers actually use — no grab-bag
  `util` / `common` / `helpers`. Split a file when it gains a second reason to change, not because it got
  long, and create a *shared* module only once a second consumer exists.
- **A boundary costs; decide when to pay.** A new module buys independent change and charges indirection, a
  contract to keep, and a seam to test. Create one when two actors or two rates of change already sit on
  either side — not in anticipation of them. Until then the seam can be a function signature inside one
  module: a partial boundary you can promote later, which is cheaper than a boundary you must demolish.
- **Depend in the direction of stability (SDP), and stability implies abstraction (SAP).** Nothing volatile
  is depended upon by something stable, and anything depended upon by many is abstract enough to be extended
  rather than edited. The `shared/domain/` types (`ServiceSource`, `Health`, `ServiceRegistration`,
  `ServiceStatus`, `SourceEvent`) and the design tokens, together with the flagged paths (§3), are this
  repo's stable set — that is what **O** protects, and why.
- **Reuse is designed, not discovered.** Two helpers that look alike are duplication only if they will
  **change together**. Default to rebuilding from the new feature's spec: identical code that varies for
  different reasons is coincidence, and bending one helper to serve a second feature gives it two actors
  (**S**) and buys the second behaviour with a flag or a branch (**O**). Share only when
  (a) the definition's source of truth is **outside this system** — a published standard, a protocol, a
  mathematical identity — because those cannot diverge, or (b) what is shared is a domain **shape** rather
  than a behaviour, since two copies of a shape go silently incompatible. Extracting a genuinely shared
  function is decided while planning, with both callers in view — never as a side effect of implementation.
  **When you rebuild rather than share, record it** in the feature doc, so a change to the external spec can
  find every copy.
- **Humble Object — pure core, effects at the edge:** Separate the logic that is easy to test from the code
  that is hard to test. Parsing, mapping, validating and calculating are pure functions in
  `features/*/logic/` and `shared/domain/`; I/O — storage, network, subprocesses, filesystem, clock,
  randomness, WebGL — lives in the thin outer modules that call them. A function that both computes and writes is two functions (*Command-Query Separation*: a
  function either does something or answers something, never both). Pass the clock in rather than reading it
  inside logic.
- **No flag arguments:** A boolean or mode parameter means the function does more than one thing — split it
  into two named functions and compose them. Prefer fewer arguments (niladic > monadic > dyadic); an options
  bag hiding four behaviours is four functions.
- **Clean Architecture — The Dependency Rule:** Separate concerns by layer — transport, orchestration, data
  access and business logic never mix in the same function. Source-code dependencies point one way only:
  inward, toward policy. In this repo, inside each feature slice: view (components) → store (adapter) →
  logic (pure); source and client modules (effect) sit at the same outer ring as views; `shared/domain/`
  shapes are innermost and import nothing. If two modules need each other, one of them holds the wrong
  responsibility.
- **No cycles (ADP).** The dependency graph between modules is acyclic. A cycle is not a packaging
  inconvenience — it means a responsibility sits on the wrong side of a boundary, and the fix is to move it
  or to invert the edge through a consumer-declared contract (**D**), never to merge the two modules.
  Checked in `frontend/` by `import-x/no-cycle` (`eslint-plugin-import-x`) as part of `lint`; in `backend/`
  the Go compiler rejects import cycles.
- **Clean Code baseline:** Intention-revealing, searchable names — no encodings, no magic values (name the
  constant). One level of abstraction per function. Comments explain *why*; a comment that restates *what* is
  a naming failure. **Don't reach through structures** (Law of Demeter): a function uses what it was handed,
  not what it can navigate to from it — a chain of accessors through three shapes couples the caller to all
  three. **Absence is explicit:** never return a bare null/nil/undefined for "not found" and never pass one
  as an argument; the absent case is part of the return shape. No dead code and no commented-out code —
  delete it, and leave the file cleaner than you found it (Boy Scout Rule).

### SOLID

All five hold here. The unit is a module and its exported functions, not a class.

- **S — Single Responsibility, at module scale.** A file or module encapsulates **one design decision that
  may change** (Parnas) **and** answers to **one actor** — the stakeholder whose request would force the
  edit (Martin). **[local:** requiring both is stricter than either source; they overlap but are not the
  same criterion.**]** Two actors sharing one module is the defect SRP names, even when the code looks
  tidy. Its two observable tells: **accidental duplication**, where two actors' logic was merged into one
  shared helper because it looked alike, and **repeated merge conflicts** in one file from different people.
  SRP is not "does one thing" — that is the function-scale rule under *Keep functions small*, and it does
  not apply at module scale. **[local:** a function has no stakeholder, so it has no SRP; Martin does not
  state this exemption.**]**
- **O — Open/Closed.** Only what is **stable and depended upon** must stay closed — the set named under SDP
  above: the `shared/domain/` types, the design tokens, and the flagged paths (§3). Elsewhere, which axis is open decides the shape
  (Wadler's Expression Problem):
  - New **variants** keep arriving → dispatch through a table or a passed-in function. A new variant is a
    new named function plus a row — never a new branch inside a function that already works.
  - The set of variants is **closed by design** → a closed union with exhaustive handling is correct, and a
    new **operation** is a new function over it.

  Adding a branch to a deliberately closed union is not a violation; adding one to an open dispatch is.
  **[local:** Meyer and Martin forbid modifying working source at all; this relaxation is deliberate,
  because a closed union is a legitimate design here and inheritance — their mechanism — is not available.**]**
  Building a dispatch table for two variants that will never grow is a speculative abstraction — see
  *Simplicity First*. Which axis is open is decided in the item, not at the keyboard. In TypeScript a `switch` over
  a closed union ends with `assertNever(x)`, so a new variant fails to compile until every switch handles it.
- **L — Liskov Substitution.** Anything behind a shared contract is substitutable at every call site
  **without the caller knowing which implementation it holds**. Same shape is not enough: the same
  preconditions (nothing one implementation requires that the others do not — an ordering, exclusivity, a
  warm cache), the same postconditions, the same invariants, the same error behaviour on the same inputs,
  and the same concurrency contract **[local:** concurrency is not one of Liskov & Wing's four conditions;
  their fourth, the history constraint, is covered here by *Inputs are not yours***]**. The tell is a caller
  that needs a conditional for one implementation. **The contract is a test, not a sentence:** one
  parameterised suite runs over every implementation, and a new implementation is added to that suite in the
  same item that introduces it. **[local:** executable contracts come from the type-class-law tradition, not
  from Liskov.**]**
- **I — Interface Segregation.** A consumer declares the **narrow contract it needs** and depends on that,
  not on the whole module — depending on what you do not use means a change to the unused part still
  forces you to rebuild, redeploy and retest. Producer-side narrowing (export only what callers use) is
  necessary but not sufficient: eight exports, all used by someone, with each consumer depending on all
  eight, still violates it. **The test:** remove one member from the contract a consumer declares — if it
  still builds, the contract was too wide. **[local:** Martin requires client-shaped interfaces but does not
  mandate the declaration site; declaring at the consumer, and this shrink test, are this repo's choice.**]**
- **D — Dependency Inversion.** High-level policy never imports a **volatile** detail; stable dependencies
  (the standard library, language primitives) are not details in this sense. The contract is **declared by
  the consumer** and merely satisfied by the provider — a contract declared in the provider inverts nothing,
  because the consumer still points at it. **[local:** Martin also permits the abstraction to live in a
  component of its own; this repo keeps it with the consumer, so that the declaring side never has to be
  looked up.**]** The contract is the signature the consumer accepts — not a file, and not a document: what
  each feature needs supplied, and by whom, is recorded in the feature doc, but the inversion itself is a
  property of the code. Which side declares is decided in the item, never during implementation.
- **Testable by design.** Dependencies are passed in — as parameters, as functions, or through a
  consumer-declared contract. Pure logic is covered by tests with no network, no storage and no clock.
- **Tests are outside the system.** A test depends on a seam's public contract and on nothing behind it. It
  reads as a specification of a capability — *"rejects an SBOM with no components"* — not as a transcript of
  an implementation, and it survives a rewrite of everything behind the seam. Expected values come from the
  item's Verification or an external source of truth: a test that recomputes its expectation the way the
  code does passes by construction and can never disagree with the code.

**When two principles collide. [local]** No source gives SOLID an internal precedence; this one exists
because these rules do collide here and an unordered set is decided by whoever is at the keyboard.
Precedence: the Dependency Rule → SRP → ≤ 20 lines → Simplicity First. A
decomposition that cannot satisfy the first two is wrong, not the rules. A function that cannot reach 20
lines without a speculative abstraction stays long and says so in the item.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- Always read `feature_docs/feature_architecture.md` before touching cross-cutting concerns (the contract
  surfaces: the `ServiceSource` contract, the `shared/domain/` types, the district table, the design tokens,
  the `gridline.state` localStorage schema; later, the backend HTTP / SSE API).
- Read the feature's `feature_docs/{frontend,backend}/feature_*.md` before planning or changing it — the doc is the source of truth,
  and the plan must be based on it.
- **Decompose before writing.** Name the modules and functions the change needs — each with its one
  responsibility, whether it is pure or effectful, and whether it is reused or new — before any code. For
  each new contract, name the side that declares it. A decomposition that cannot satisfy §0 means the design
  is wrong, not the rules.
- If a function could belong to more than one module, present options — don't pick silently.
- If the spec contradicts the existing architecture or a recorded design decision (the **Decisions** of a
  `PLAN.md` item, `D1`–`D10` in `BRAINSTORMING.md`), stop.
  Name the conflict. Ask.
- If something is unclear, name what's confusing. Don't guess.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code — no contract with one implementation and one caller unless a test
  needs the seam.
- If a function already exists in `{frontend,backend}/src/shared/`, use it — don't create a new one. Whether a
  look-alike elsewhere counts is settled by *Reuse is designed, not discovered*, not by similarity.
- Match existing patterns: feature slices; CSS Modules over the CSS-variable design tokens; one Zustand
  store created in `main.tsx`.
- Standard library first; a new dependency needs a reason, and a direct dependency must be licensed MIT,
  Apache-2.0, BSD-2-Clause, BSD-3-Clause or ISC — any other license halts for the operator. Transitive
  dependencies are not checked.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

- Don't rename the `shared/domain/` types or the design tokens — consumers depend on them.
- Don't change a shared contract without verifying all consumers.
- Match the existing style of the file you're editing, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Flag before touching — high blast-radius: `CLAUDE.md`, `.claude/skills/**`, `{frontend,backend}/src/main.*`,
  `{frontend,backend}/src/shared/**`. Creating one of these files for the first time inside an approved item
  does not halt; every later edit does.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.
- Don't mark pre-existing dead code "kept deliberately" with an invented rationale unless the operator
  asked for it to be kept — name it as unreferenced and stop there. Keeping and removing are both the
  operator's call, not a default either way.

**Cleanup is a stage, not an opportunity.** §0's ≤ 20 lines and the Boy Scout Rule describe the code you
write; they never authorise reshaping code the item did not send you to. Refactoring beyond the item's scope
happens at step 4b with the suite green, or in an item of its own.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Every task has a clear done state:
- `npm --prefix frontend run typecheck`, `npm --prefix frontend run lint`, `npm --prefix frontend test` and
  `npm --prefix frontend run build` all pass.
- `npm --prefix frontend run dev` serves the app; after Login the city renders and the browser console
  shows no errors.
- No function exceeds 20 lines: ESLint `max-lines-per-function` (20, warn) reports none, or the item names
  the function that stays long and why.

After any task:
1. Run verification command(s) — fix all errors.
2. Update the feature's `feature_docs/{frontend,backend}/feature_*.md` to match the change (contract
   surfaces and feature-facing functions), **plus** the feature's section in the catalog (including Related
   Docs anchors if headings changed) and any affected architecture doc.
3. Append a dated entry to `CHANGE_LOG.md` and a row to `Done.md`.
4. Output git commit message in chat — do **not** run `git commit`.

---

## 5. Development Flow — From a New Requirement to a Commit

**Two entry points, one path.** A requirement raised in chat and a requirement written into `PLAN.md`
converge on the same thing before any file is edited: a reviewed, approved item under `## New Instructions`.
The feature docs and the catalog are *outputs* — never a change request.

| # | Step | Owner |
|---|---|---|
| 1 | **Design** — read §0 and the feature docs, verify against the code, propose the decomposition, name each contract's declaring side, agree the seams, **grill until the operator confirms shared understanding**, write a `🔵 DRAFT` item, and **stop for approval** | `plan-feature` → `grilling` |
| 2 | **Implement** — read every file before editing it, state the plan before the first edit, build the decomposition and nothing more | `implement-new-instruction` |
| 3 | **Test** — author cases at the item's agreed seams, with expected values taken from the item's **Verification**, never read back from the implementation; extend the contract suite for any new implementation | `unit-test-and-record` |
| 4 | **Verify** — typecheck · lint · test · build, then answer the item's Verification table row by row. Writes nothing | `verify` |
| 4b | **Review** — the only stage that may refactor, and only with the suite green: §0 conformance, the Contracts table, removal plan. `simplify` covers reuse and simplification only; §0 conformance and the Contracts table are checked by `verify` and the operator | `simplify` (built-in) |
| 5 | **Record** — sync the doc chain, write both changelogs, close the item. Checks nothing | `record` |
| 6 | **Hand over** — commit message text only; never run `git add` / `commit` / `push` | `commitText` |

Each skill owns its own procedure — this table routes, it does not restate. Planning is a skill, not an
agent: `.claude/agents/*` hold roles, and rules placed there never reach the main loop.

**Root wins on conflict — and the conflict is a defect.** Where an agent definition or a skill contradicts a
core concept here, follow this file, then fix the subordinate one in the same task **if the repo owns it**.
Where the source is external — vendored guidance, a tool's own output — leave it and record the override
where the subordinate is required, so no reader is told two different things. **A subordinate contract may
never authorise ignoring this one.**

**Design first, execution later.** While designing, do not raise build commands, test runners, doc-sync order
or commit splitting. An item's **Verification** states expected inputs, outputs and what must not change; the
commands that check them belong to steps 3 and 4.

**An item is approvable only when the operator says the understanding is shared.** A `🔵 DRAFT` carries two
records of the design interview: **Decisions**, every question the grilling settled and who settled it, and
**Open Decisions**, everything it surfaced and did not settle. An empty Open Decisions list is the agent's
claim that it ran out of questions, not the gate — the gate is the operator's confirmation. A non-empty list
is not a caveat on an approved item: either grill it to empty, or split the unresolved part into its own item
and record the dependency.

**Facts are yours; decisions are the operator's — in the interview and in the build alike.** If the answer is
in the code, a feature doc, or the item, *read* it and continue; nothing is recorded, because there was no
decision. If two defensible options exist and no document settles it, it is a decision: put it to the
operator and wait. An agent that answers its own open question has made a decision and left no record of it.

**Implementation continues only on what it can derive.** At a fork whose answer is not in the item, the code
or a feature doc: **halt before the edit**, settle it through `grilling`, write it into the item under
**Decided during implementation**, then resume. Never decide now and record after.

**Four things halt, and a better idea is one of them.** A gap the item is silent on · a divergence, where the
item's instruction does not work or contradicts the code · **an approach you believe is better than the one
the item specifies** — say so and let the operator choose, because silently following a plan you think wrong
and silently improving on it are the same failure · a solution you would have to invent. Plus **irreversible
or shared** changes, which halt *even when the item authorises them*: `git push`; deleting a file outside
the item's scope; changing the `gridline.state` localStorage schema; a major-version dependency upgrade.

**The loop runs inside the plan.** `implement → test → verify` cycles freely while every fix is mechanical
and within the item; the moment one needs anything from that list, it leaves the loop and asks.
`implement-new-instruction` holds the classification, and `verify` diffs the finished work against the item's
scope independently of the log.

**Three failed loops is a halt.** If the same verification fails three times, stop and report what was tried
and what the failures have in common. A fourth attempt on an unchanged hypothesis is not progress.

**Two records, two stages, never interchangeable.** **Decisions** is what the design interview settled before
approval; **Decided during implementation** is what the build settled after it. A decision written to the
wrong one hides when it was made, which is the only thing either record exists to show. **A long
Decided-during-implementation list is a finding about the design stage**, not about the code.

**The item is binding.** A plan that no longer matches the code is worse than no plan.

**When an item is required.** If the change touches a contract surface (§1), or any documented contract, it
needs one. A typo or single-line correction does not, but still ends at steps 4 and 5.

**Q&A never writes to `PLAN.md`.** A question — *how does this work*, *why is it failing*, *what would it
take to do X* — is answered in chat and nowhere else: no new item, no amended item, no `## Current Status`
row. `PLAN.md` is touched only when the user asks for a plan, an instruction or an implementation. If an
answer reveals work worth doing, say so and offer step 1 — entering it is the user's call, not a side effect
of having asked.

**A change to this file is an item like any other.** When a `CLAUDE_MEMORY.md` observation hardens into a
rule, or a principle here proves wrong, it enters through step 1 as an item whose deliverable is the edit to
this file, and it is approved the same way. Nothing in this file changes as a side effect of a coding task.

**`BRAINSTORMING.md` is the staging area; `PLAN.md` is the queue.** Exploration that is not yet a
decomposition — evidence gathered, options weighed — is written to `BRAINSTORMING.md` at the repo root, one
`## YYYY-MM-DD — <topic>` section per design, and **never** to `PLAN.md`. Nothing there is approved and
nothing there is an instruction; it is raw material for step 1. **A section is deleted the moment its content
becomes an item**, in that same task — partial promotions leave the rest and mark what was taken, a rejected
design is deleted with one line saying so, and an emptied heading goes too. One design, one home: two copies
drift, and the stale one is always the one someone reads.

---

## Project Context

Service Platform monitors the microservices running on a Kubernetes (k3s) cluster and shows each one as a
building in a 3D city: height from traffic, colour from health. It is two apps — `frontend/` (React +
TypeScript) and, later, `backend/` (Go), which reads service registrations from Helm-chart annotations
through the Kubernetes API and metrics from Prometheus, and pushes changes to the browser over SSE. Phase 1
(NI-01) is the frontend alone, on mock data.

**Sources of truth:** `feature_docs/` for everything built (NI-01 onward). The handoff README
(`3d miro service city/design_handoff_service_city/README.md`) stays the visual reference for tokens and
interactions only; `BRAINSTORMING.md` holds the platform decisions D1–D10 not yet promoted to an item.

### Structure — feature slices outside, layers inside

The repo holds two apps, `frontend/` and `backend/`. **They share no code**: each reaches the other only
through its published interface (rule 3), and a shape both need is written once in each app. Inside each
app the same layout applies.

Each app is organised by **feature**, not by technical role: everything one capability needs sits in one
folder, under the same name its feature doc uses. That name is the only index a reader needs — a change to
one capability touches one folder and one doc.

Inside a slice the Dependency Rule still holds, and it is the whole point: a feature folder is a smaller
place to apply the layering, not permission to drop it. Adding a slice is adding a boundary, so *A boundary
costs; decide when to pay* applies — a capability with one adapter and no rules of its own is not yet a
feature.

```
PLAN.md · BRAINSTORMING.md · CHANGE_LOG.md · Done.md · CLAUDE_MEMORY.md · CLAUDE.md ⚑
feature_docs/          project_feature · feature_architecture · {frontend,backend}/feature_<feature>.md
                       · DEPLOY.md
.claude/               skills/<name>/SKILL.md (authoritative) ⚑ · agents/<name>.md (roles only)

frontend/              React + TypeScript + Vite
  src/
    main.tsx           builds features, wires dependencies, owns shared state  wiring ⚑
    features/<feature>/  components (view) · state (adapter) → logic/ (pure)
                       · source or client (effect) · tests
    shared/            domain/ shapes · source/ · ui/ (no domain knowledge)     platform ⚑
  dist/                build output — generated, never edited

backend/               Go — later
  src/
    main.go            wiring ⚑
    features/<feature>/  handler (adapter) → logic (pure) · client (effect) · tests
    shared/            transport · config · domain/ shapes                       platform ⚑

⚑ = flagged, high blast-radius: halt before touching
```

**Four rules the shape enforces:**

1. **A feature never imports another feature.** When one needs another's behaviour, it takes it as an
   argument and `main.*` supplies it (**D**) — including when one feature renders another as a slot. The
   contract is that parameter's signature; where a language writes it down is a language detail, not a file
   this structure mandates. If the two always change and ship together, they were one feature with two
   routes all along (*A boundary costs*). Either way it is a step-1 decision, never an import added
   mid-build.
2. **`shared/` is the layer features sit on, not a dumping ground.** The test: **a `shared/` module's
   contract names no feature, and deleting any one feature leaves it both correct and still used.** Four
   kinds pass — presentational components with no domain knowledge, definitions whose source of truth is
   outside this system, domain shapes, and platform primitives (transport, persistence, config, logging,
   the response envelope). A second consumer must already exist, and for behaviour *Reuse is designed, not
   discovered* still decides: two features that merely look alike stay apart.
3. **The published interface is the only way in.** Everything outside this app — another service, a browser,
   a CLI, a scheduled job, the other app in this repo — reaches it through its published interface (for
   `frontend/`, the browser URL; for `backend/`, its HTTP / SSE API), never through its code. The shapes it
   sends and receives are its own: a consumer's convenience is not a reason to export a type, because an
   exported type makes that consumer change whenever this app does.
4. **`main.*` and `shared/` are the stable set.** They are what **O** protects and what **SDP** points
   toward; a feature slice is free to change, which is why the flags sit outside the slices.

**Constraints that every change must respect:**

- `frontend/` and `backend/` share no code; they communicate only over HTTP / SSE.
- Every direct dependency is licensed MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause or ISC (§2).
- Design tokens and interactions follow the handoff README, which is high-fidelity; any deviation is
  recorded in the item that makes it.

---

**Project memory:** `CLAUDE_MEMORY.md` at the repo root holds what I have learned about this project and how
its operator works — environment facts, working preferences, and the lasting consequences of past decisions.
It **describes and never governs**: this file is the contract, and a memory that hardens into a rule moves
here as its own item. `user-compact` rewrites it.

---

## Feature Documentation

**The feature docs are the source of truth. A task is not done until its feature doc matches the code.**
`record` (§5 step 5) owns the procedure; this section owns where things live.

| Doc | Holds |
|---|---|
| `feature_docs/project_feature.md` | Catalog of features, with the §Feature Index |
| `feature_docs/feature_architecture.md` | Structure: the two apps, layering inside a slice, what is in `shared/` and why, §Detail contract |
| `feature_docs/{frontend,backend}/feature_<feature>.md` | One per feature: `## Functions`, `## Dependencies` |
| `feature_docs/DEPLOY.md` | Deployment (written when deployment exists) |
| `CHANGE_LOG.md` | One dated entry per change |
| `Done.md` | One row per completed item; source of the next NI id |

**What must be recorded:** not every internal helper, but every function on the feature's public surface —
the functions exported from `logic/`, the props of the feature's entry component, and each `ServiceSource`
implementation — is named and briefly described in that feature's doc.

**Where each kind of fact lives.** `feature_architecture.md` describes *structure* — the tiers, the layering
inside a slice, what is in `shared/` and why. One feature doc covers that feature across every tier, so a
capability is read in one place rather than reassembled from a per-tier doc each. It carries two tables:

- `## Functions` — `File · Function · Responsibility` (paths, not line numbers), one row per public-surface
  function.
- `## Dependencies` — `Needs · Supplied by · Wired at`. One row per thing this feature takes as an argument
  rather than imports: what it needs, which feature or `shared/` module provides it, and the `main.*` that
  connects them. A row naming another feature's internals rather than a supplied capability is a rule-1
  finding. A behaviour this feature rebuilt rather than shared is noted here too, naming the other copies
  and the external spec they both follow.

Full rules: `feature_docs/feature_architecture.md` §Detail contract.

---

## Available Skills

| Skill | Reached |
|---|---|
| `plan-feature` | §5 step 1 |
| `grilling` | Interview primitive — from `plan-feature` at step 1, from `implement-new-instruction` at a fork |
| `brainstorming` | Before a decomposition exists; writes to `BRAINSTORMING.md` |
| `implement-new-instruction` | §5 step 2 |
| `unit-test-and-record` | §5 step 3 |
| `verify` | §5 step 4 — answers, never writes |
| `simplify` (built-in) | §5 step 4b — the only stage that may refactor |
| `record` | §5 step 5 — writes, never checks |
| `commitText` | §5 step 6 |
| `user-compact` | Rewrites `CLAUDE_MEMORY.md` — you invoke it, it never self-starts |

**Where a skill is authoritative:** `.claude/skills/<name>/SKILL.md` holds the full body — the copy Claude
loads and the only copy to edit. There are no pointer files. `.github/**` belongs to VS Code Copilot:
unrelated to Claude, never read, never kept in sync, and touched only when a mirror is explicitly requested.
The same holds for `.claude/agents/` versus `.github/agents/`.