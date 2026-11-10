# user-compact
---
name: user-compact
description: 'Rewrite CLAUDE_MEMORY.md from the current conversation — merging, retiring and compressing rather than appending.'
disable-model-invocation: true
---

# user-compact

## Outcome
`CLAUDE_MEMORY.md` rewritten so it holds everything durable this conversation produced and nothing that has
stopped being true, stopped mattering, or was never this file's business.

## When to Use
When the operator invokes it. Nothing else starts this skill: memory the operator is expected to trust should
not rewrite itself.

**A directed change does not need this skill.** "Remember X" or "forget Y" is an ordinary edit to
`CLAUDE_MEMORY.md`, applied in the turn it is asked for, under the same admission tests below. This skill
exists for the whole-file rewrite.

---

## What belongs in the file

Two tests, and a line must pass **both**:

1. **Not derivable.** Nothing already recorded by `CLAUDE.md`, `PLAN.md`, `Done.md`, a feature doc, or
   `git log`. Code structure, endpoint lists, past fixes and commit history are all excluded by rule.
2. **Durable across sessions.** It must still be true and still matter to a session starting tomorrow with no
   knowledge of this conversation. Two kinds qualify — **how the operator works**, and **a change already made
   whose consequence still shapes what comes next**. Work in progress fails: `PLAN.md` owns that.

And one test applied per line, at write time:

3. **It must name a decision it would change.** A line that changes nothing is noise competing for attention
   with the lines that matter. A 4 KB file of platitudes is worse than a 12 KB file of real consequences.

**Never normative.** `CLAUDE.md` is the contract. A line here may point at a rule; it never restates one. A
memory that has hardened into a rule moves into `CLAUDE.md` through the flow in its §5 — with explicit
consent — and what is left behind is a pointer.

### The five sections

| Section | Holds |
|---|---|
| §Snapshot | The shortest orientation that makes the rest usable — environment facts that change what is worth proposing. Never a feature list |
| §How the operator works | Observed working preferences, each with its *why* |
| §Standing constraints | Hard rules the operator has stated — as pointers to their authoritative home |
| §Decisions that still shape the work | A change already made whose *consequence* outlives it: what it now forbids, requires, or makes cheap |
| §Superseded | A belief that would otherwise be re-learned — kept only while that risk is live |

---

## Procedure

Run all nine in order. Steps 3–7 are pure judgement over text and touch no file.

1. **Read** `CLAUDE_MEMORY.md`.
2. **Revalidate** every line already in it against the repo. A line naming a file, flag, provider, path or
   preference that no longer exists is deleted now. Without this step a stale fact survives forever, because
   nothing in the conversation ever contradicts it.
3. **Harvest** candidate facts from the conversation.
4. **Admit** only the candidates passing both tests above. Be strict — most of a conversation is not memory.
5. **Merge** each survivor into the line that already covers it. Update in place; never add a second line
   about the same thing.
6. **Supersede** a line the conversation contradicts. It leaves its section, and a one-line tombstone goes to
   §Superseded **only if the old belief would otherwise be re-learned** from what is still in the repo. A
   tombstone whose risk has passed is deleted too — §Superseded is not an archive.
7. **Apply the per-line test.** Drop any line that cannot name a decision it would change.
8. **Rewrite** the whole file once, in the five sections, one fact per line, every date absolute
   (`2026-07-31`, never "yesterday"). Update the "Last rewritten" date.
9. **Report**: what was added, what was merged, what was retired, what was dropped and why — then the file's
   size against the 10 KB mark.

### The 15 KB mark
Reaching it means one thing: **stop and ask the operator whether the file should be re-summarised.** It never
drops a line by itself and never blocks a write, and it is not a budget to spend up to.

**The threshold is calibrated against how often it interrupts, not against a theory of the right size, and not
against the size of another file.** Do not re-anchor it on `CLAUDE.md`: that file grows for its own reasons and
using it as a ceiling silently raises this one. If the question starts arriving on runs that add nothing, put
the next value to the operator rather than moving it yourself.

---

## Rules
- Rewrite; never append. Append-only growth is the failure this replaces.
- Never delete a fact silently — step 9 names everything that left.
- Never write a rule. Point at `CLAUDE.md` instead.
- Never record work in progress.
- Do not run `git commit`.

## Completion checks
- Running twice with no new information leaves the file byte-identical.
- Every surviving line passes all three tests.
- Nothing describes the current conversation or work in flight.
- The report accounts for every line that was added, merged, retired or dropped.
