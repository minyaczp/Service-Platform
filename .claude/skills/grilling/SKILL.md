---
name: grilling
description: Interview the operator one question at a time until every open decision in a change is
  resolved, each question carrying a recommended answer. Use when shaping a PLAN.md item during the
  design stage, when the operator asks to stress-test a plan or design, or when implementation reaches
  a fork the item does not decide.
---

# Grilling

Interview the operator relentlessly until the two of you share the same understanding of the change.
Walk the decomposition as a decision tree: settle a parent decision before the choices that hang off it,
so an early answer reshapes what you ask next.

This skill holds the interview technique for the whole repo. `plan-feature` reaches it at §5 step 1;
`implement-new-instruction` reaches it on divergence. Never reimplement the interview elsewhere.

**Not a user entry point.** It is reached by `plan-feature` at §5 step 1 and by
`implement-new-instruction` on divergence, because it needs what they guarantee — an item to write to and
a decomposition to attack. If invoked directly, ask which change it applies to and route through
`plan-feature`; do not start an interview with nothing to record it in.

## Rules

- **One question at a time.** Wait for the answer before asking the next. A batch of questions is
  bewildering, and it destroys the dependency order that makes the interview converge.
- **Every question carries your recommended answer**, plus the §0 principle or feature-doc line that
  backs it. The operator should be reacting to a proposal, never staring at a blank prompt.
- **Facts are yours; decisions are theirs.** If the answer is in the codebase, `feature_docs/feature_architecture.md`, or
  `feature_docs/**/feature_*.md`, go read it — never ask the operator to describe code that already
  exists. If two defensible options exist and no document settles it, it is a decision: put it to them
  and wait.
- **Every answer lands in the item before the next question.** A resolved decision is written to the
  PLAN.md item under **Decisions** immediately, never batched at the end. An interview whose output
  lives only in the conversation is lost the moment the context is compacted.
- **Never edit code from a grilling session.** The output is a decided plan, nothing else.

## Opening move

Before question one, state your own understanding of the change in a short block — the problem, the goal,
the approach in outline — and let the operator correct it. An interview that starts from a blank page
spends its first four questions rebuilding what you already knew.

That block is the *only* batched thing in this skill. From the operator's confirmation onward it is one
question at a time.

## What to grill

**These levels are not a new checklist.** Each one is an existing repo gate turned into a question, and the
right-hand column says which — so an answer settled here satisfies that gate, and a gate that already has a
documented answer skips its level. Ask in this order; each level constrains the next. Skip a level only
when a document already settles it — and say which document.

| # | Level | The gate it asks |
|---|---|---|
| 1 | Boundary | `plan-feature` §Design gate → *The Dependency Rule* |
| 2 | Reuse | §Design gate → *Reuse before creation*, *CCP / CRP* |
| 3 | Decomposition | §Design gate → *SRP*, *Humble Object*, *No flag arguments* |
| 4 | Contracts | §Design gate → *Liskov Substitution*, the **Signature** column |
| 5 | Data and edges | §Design gate → *every effectful row states its failure path* |
| 6 | Blast radius | root `CLAUDE.md` §3 flagged files |
| 7 | Conditions | `plan-feature` §Conditions & their justification — the seven checks |
| 8 | Verification | the item's **Verification** section |

1. **Boundary** — which app (`frontend/`, `backend/`) and which feature slice owns this? Which layer does
   each new function sit in under the Dependency Rule? If it could belong to more than one, that is a
   decision, not a guess.
2. **Reuse** — does a module in `{frontend,backend}/src/shared/` already serve this contract, or is
   this a second caller that justifies extracting one? Per §0, extracting a shared module is a planning
   decision made with both callers in view — it is decided here or not at all.
3. **Decomposition** — name every module and function, its one responsibility, pure or effectful. A
   function that both computes and writes is two functions. A boolean parameter is two functions.
4. **Contracts** — exact request and response shapes, SSE event types, the `ServiceSource` contract,
   store action signatures, `shared/domain/` field names and types, component props. Names and shapes are
   decided here, not typed into existence during implementation.
5. **Data and edges** — empty, duplicate, partial failure, a field absent from an older payload, a
   source that returns a different shape.
6. **Blast radius** — does this touch a root `CLAUDE.md` §3 flagged path (`CLAUDE.md`, `.claude/skills/**`,
   `{frontend,backend}/src/main.*`, `{frontend,backend}/src/shared/**`) or any documented contract? Which existing
   consumers change?
7. **Conditions** — every threshold, default, timeout, retry count, page size, cache TTL,
   required-vs-optional, rejecting validation, feature flag, permission gate and enum whitelist the change
   introduces. **Ask where each value comes from, and whether it defaults on or off.** This level exists
   because a limit that ships enabled where the cost it guards against does not exist has one effect:
   refusing the operator's own work. A number nobody can source is a decision nobody made.
8. **Verification** — expected inputs, outputs, and what must not change. Not the commands: per §5,
   build and test commands belong to steps 3 and 4.

## Mid-implementation mode

Reached from `implement-new-instruction` for **any fork it cannot derive from the item** — a gap, a
divergence, an approach it believes is better than the item's, a solution it would have to invent — and for any
irreversible or shared change even when the item authorises it. Grill **only that one decision**, plus anything
it directly forces. Do not reopen the item. Write the answer under **Decided during implementation**, confirm,
and hand control back.

Forks the build *can* derive by reading never reach this mode, and nothing is recorded for them.

**Never write to Decisions or Open Decisions in this mode.** Those two are the design stage's record and they
are sealed at approval; reopening them would erase the fact that the item shipped for approval looking
settled. A build-time answer belongs under **Decided during implementation** and nowhere else.

## Stop condition

**The interview is bounded by `plan-feature`'s six pre-flight checks.** Walk them, ask about the ones that
fail, and stop when all six pass and the operator confirms the change end to end:

1. Every function has a signature — params in, shape out
2. Every value is decided, with a stated source
3. Every assertion was checked against real data
4. Every access the work needs is named
5. Every file to be edited is named and has been read
6. Every new name is stated

Plus: **Verification carries at least one row**, and the operator wrote the `manual` ones themselves.

Report progress as a count — *"four of six; 3 and 5 outstanding"* — so the operator can see how much is left
rather than facing an open-ended interview. Then say so explicitly:

> Six of six. No open decisions remain. Shall I write the DRAFT item?

If decisions remain that the operator does not want to settle now, leave them in **Open Decisions**
and say plainly that the item is not approvable until they are settled or split out.
