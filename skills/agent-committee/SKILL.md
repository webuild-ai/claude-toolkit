---
name: agent-committee
description: Orchestrates a multi-agent committee to execute a tasks file in parallel with peer review. Implementer agents work independently on each task, reviewer agents critique their work, the two iterate until consensus, then the parent runtime aggregates and verifies the merged result. Use when the user has a tasks.md (or similar checklist) with 3+ independent tasks and asks for "a committee", "multiple agents", "agents reviewing each other", or "agents working in parallel". Also use when the user explicitly says "use the agent committee skill" or "/agent-committee".
---

# Agent Committee

## Overview

A multi-agent workflow for executing a list of tasks with built-in peer review. The structure:

```
tasks.md
   │
   ├── Phase 0: Read context, group tasks, surface ambiguities
   ├── Phase 1: Implementer per task group (parallel)
   ├── Phase 2: Reviewer per implementer (parallel, different agent)
   ├── Phase 3: Discussion loop until consensus (capped at 3 rounds)
   ├── Phase 3.5: Consolidate each worktree into parent, then remove it (atomic per agent)
   ├── Phase 4: Parent runtime aggregates, runs full verification battery
   └── Phase 5: Single consolidated report to the user
```

The cost is roughly **3× a single-pass run** (implementer + reviewer + at least one fix round on average). Use it when stakes justify the extra spend — coverage drives, security-sensitive work, anything where a missed bug is expensive.

## When to Use

- The user provides a `tasks.md` (or similar) with **3 or more discrete tasks** and asks the agents to "work in parallel", "review each other", form "a committee", or words to that effect.
- The user explicitly invokes `/agent-committee` or asks for "the committee skill".
- A spec-driven coverage push, a refactor across many files, or a documentation sweep where each task is small but the total list is long.

## When NOT to Use

- A single task — use one Agent call directly.
- Tasks with heavy interdependencies — parallelism breaks down; do `incremental-implementation` instead.
- Hot-fix work — the review loop is slow.
- Lists under 3 items — the orchestration overhead exceeds the gain.
- The user is cost-sensitive and hasn't asked for review — confirm before launching.

## Inputs

**Required:**
- Path to the tasks file (default: `./tasks.md`).

**Auto-discovered (read these in your own context first if they exist):**
- `SPEC.md` / `spec.md` — source of truth for project intent
- `README.md` — surface-level architecture
- `AGENTS.md` / `CLAUDE.md` — house rules
- `Makefile` / `package.json` / equivalent — to know what `test`, `build`, `lint` mean for this project

If the tasks file is missing or malformed, stop and ask the user — don't try to infer tasks from prose.

## Procedure

### Phase 0 — Read, group, sanity check

1. **Read the tasks file in full.** Confirm each task has: a clear scope, target file(s) or symbols, acceptance criteria. If any task is ambiguous, push back to the user before launching agents.
2. **Read the project context files** listed under Inputs. You'll quote relevant excerpts into agent prompts so each agent has the spec without re-reading the whole repo.
3. **Group tasks by file.** This is critical: if it has not been done already, tasks touching the same file MUST be combined under one implementer, otherwise parallel writes will silently overwrite each other. Build a grouping like:
   ```
   Group A: tasks T1.1 + T1.2  → cmd/root_test.go     → 1 implementer
   Group B: task  T1.3         → cmd/serve_test.go    → 1 implementer
   Group C: tasks T2.1 + T2.2  → proxy/router_test.go → 1 implementer
   ```
4. **Brief the user** with a one-paragraph plan: number of implementer agents, number of reviewer agents, expected rounds, and which tasks are being combined. Get implicit approval (no objection within the message they're already reading) before launching — unless `auto mode` is active, in which case proceed.

### Phase 1 — Implementers (parallel, one tool-call message)

Launch all implementers in a **single message with multiple Agent tool calls** so they run concurrently. Use `isolation: "worktree"` for true isolation.

Each implementer prompt MUST include:

- **The exact task description copied verbatim** from tasks.md. Don't summarize.
- **Pointers to context files** (SPEC.md / README.md sections relevant to this task). Don't paste entire files; quote the parts that matter.
- **A "verify the task is correct" step**: read the targeted code, confirm the premise (gap exists, approach works), push back if anything is wrong instead of guessing.
- **An "implement, then run tests" step**: run the project's full test suite (`go test ./...`, `npm test`, etc.) and confirm green.
- **Constraints**: no commits, no production-code changes unless the task requires, no scope creep, no unrelated refactors.
- **A structured report format** so the parent can parse the outcome.

Recommended report format:

```
WORKTREE: <path>
FILES: <list of files modified>
METRIC_BEFORE: <relevant before-state — coverage %, perf, etc.>
METRIC_AFTER: <after-state>
FULL_SUITE: PASS|FAIL
NOTES: <concerns, branches that were unreachable, anything surprising>
```

**Worktree fallback note** — bake this into every implementer prompt: "If your worktree appears empty or checked out to a stale branch with no source, work in the parent repository and report which path you actually edited." Worktree isolation has been observed to silently fail; the agent must detect and adapt.

### Phase 2 — Reviewers (parallel, one tool-call message)

For each implementer report, launch a reviewer Agent. Prefer `subagent_type: "agent-skills:code-reviewer"` for general work, `agent-skills:security-auditor` for security-sensitive tasks, `agent-skills:test-engineer` for test-heavy work. **Send all reviewers in a single message** for parallelism.

Each reviewer prompt MUST include:

- **The path to the file(s) under review**.
- **A summary of the task** the implementer was supposed to complete (copy from tasks.md).
- **The implementer's claims** verbatim (so the reviewer can check them).
- **A review checklist** sized to the task: correctness of test logic, style match against existing files, brittleness/flakiness, scope creep, whether production code was touched (usually shouldn't be).
- **An instruction to independently re-run the verification** — DO NOT trust the implementer's PASS claim. Every reviewer runs the test suite themselves. (This is the single most important guardrail; without it, the review is theatre.)
- **Output format**:
  ```
  VERDICT: APPROVE | REQUEST_CHANGES
  METRIC_CONFIRMED: yes | no (with the actual number)
  RACE_CLEAN: yes | no  (if applicable)
  ISSUES:
  - [BLOCKER|MAJOR|MINOR] <description, with file:line where possible>
  SUGGESTIONS: <optional, only if non-trivial>
  ```

Severity meanings:
- **BLOCKER** — correctness bug, broken test, missed branch claimed as covered, etc. Must be fixed.
- **MAJOR** — flake risk, missing assertion, brittle pattern that will break under modest churn. Should be fixed.
- **MINOR** — cosmetic, hardening, style. Nice to fix; not required for consensus.

### Phase 3 — Discussion loop until consensus

Per implementer/reviewer pair, route on the verdict:

```
APPROVE (no issues, or only MINORs)            → consensus reached, record done
APPROVE with 3+ MINORs                          → optional cleanup round (ask user or auto-mode skip)
REQUEST_CHANGES with any BLOCKER/MAJOR         → fix round (mandatory)
```

**Fix round** — launch a fix agent (fresh; agents don't persist memory):

- Pass the original file path.
- Pass the reviewer's feedback **verbatim**.
- Instruct: apply ONLY the listed fixes, do not refactor anything else.
- Require: re-run tests, report `FIXED: <list>`, `FULL_SUITE`, and `METRIC_HELD`.

**Re-review** — launch a fresh reviewer agent with:

- The original review's issue list.
- The fix agent's report.
- Instruction: verify each issue was addressed AND nothing else changed (diff-check the file).
- Output the same verdict format.

**Cap iterations at 3 rounds per task.** If consensus isn't reached after 3 rounds, escalate to the user with both sides' positions — don't silently land partial work.

For multi-pair work, run as many fix/re-review cycles as possible **in parallel** (one tool-call message). Sequential loops blow up wall-clock time.

### Phase 3.5 — Consolidate worktrees into parent and remove them (atomic per agent)

Each agent's work is atomic: it either lands in the parent repo AND its worktree is removed, or neither happens. Leftover worktrees from a successful run are clutter; leftover worktrees from a failed consolidation are debug artifacts and MUST be preserved.

**For each agent that reached consensus**, do these steps in order, completing all of them for one agent before moving to the next:

1. **Inspect the worktree's diff** against its base branch (`git -C <worktree> status --short` and `git -C <worktree> diff <base>...HEAD` if the agent committed, or `git -C <worktree> diff` if it didn't). Confirm the modified files match the task's "Files in scope". If anything outside scope is touched, surface it in the final report — but don't abandon the consolidation.
2. **Copy the modified files into the parent repo.** Use plain `cp` rather than `git merge` — the agents work uncommitted and `git merge` invites cross-worktree conflict resolution that you don't want. New files are copied; modified files overwrite the parent's version (this is safe because Phase 0's file-grouping guarantees no two agents touch the same file).
3. **Verify the copy.** `git -C <parent> status --short` should now show the expected files modified. If the diff in the parent doesn't match the diff in the worktree, STOP and investigate — do NOT remove the worktree.
4. **Remove the worktree.** `git worktree remove --force <worktree-path>` (the `--force` is needed because the worktree carries uncommitted changes, which is the normal state when agents are instructed not to commit). Also prune the agent's branch if no other worktree references it: `git branch -D <worktree-branch>`.
5. **Record the cleanup** in your working notes for the final report — list which worktrees were removed and which (if any) were kept for debugging.

**Worktree preservation rules — when to KEEP a worktree:**

- The consolidation copy failed (file missing, permission denied, parent state unexpected).
- The agent's diff includes files outside scope and you need the user to decide whether to merge.
- The reviewer's verdict was REQUEST_CHANGES that couldn't be resolved within the 3-round cap.
- The user explicitly asked to inspect the agent's work before cleanup.

In every other case, REMOVE the worktree. Stale worktrees from prior runs are noise that future debugging sessions have to wade through.

**One-shot fallback for the no-worktree case:** if any implementer hit the worktree-fallback (worked in parent because their worktree was stale/empty), there is no worktree to consolidate or remove — its changes are already in the parent's working tree. Note this in the report and skip the cleanup steps for that agent.

**Do not batch Phase 3.5 across all agents and then verify in Phase 4.** If Phase 4 fails, you want to know which agent's change broke it — and that's much easier when each consolidation was its own discrete step you can revert in isolation.

### Phase 4 — Parent runtime verification

Once every task has consensus, the parent (you) runs the integration check directly — agents are done.

Battery (adapt to project):

1. **Stability**: run the full test suite **5 times** with `-count=1` (or framework equivalent for fresh runs). Surfaces flakes that single-run doesn't.
2. **Race / concurrency** if the language supports it: `go test -race`, `pytest -p xdist`, etc.
3. **Build**: produce the artifact (`make build`, `npm run build`, …). Confirm size sanity.
4. **Lint / static analysis**: `golangci-lint run`, `eslint`, etc. Fall back to `go vet` / built-in if not installed.
5. **Behavior smoke**: run the binary / start the server / hit a known endpoint. Confirm the change didn't break runtime behavior, only test files. (For coverage tasks, this is critical — agents only ran tests; you verify the binary still works.)
6. **Confirm claimed metrics**: re-run coverage / perf / whatever the agents claimed, in the merged state. Numbers should match within ~1%.

If anything fails here that wasn't flagged by an agent, the orchestration has a hole — investigate and surface it in the final report.

### Phase 5 — Single consolidated report

Produce one report for the user, structured:

- **Workflow summary**: count of implementers, reviewers, fix rounds, total agent invocations.
- **Verdicts table**: task → verdict → final state.
- **Metric delta**: before / after / target, per slice and overall.
- **Stability**: N/N runs green.
- **Artifact**: build size, sanity-check result.
- **What landed**: list of files (new + modified). Distinguish from "what didn't land" if anything was skipped.
- **Caveats**: flakes observed, branches genuinely unreachable, lessons applicable to future runs.
- **Tasks file update**: if tasks.md uses checkboxes, mark completed items `[x]`.

Keep it factual and tight. Don't recap each agent's monologue — the user wants the integrated picture.

## Hard-won lessons (apply these to every run)

1. **Group tasks by file before assigning agents.** Parallel agents writing to the same file overwrite each other. This is the #1 cause of silent breakage.
2. **Worktree isolation can silently degrade.** Spawned worktrees may check out to stale branches with no source. Always include the "if worktree empty, work in parent and report" fallback in every implementer prompt.
3. **Reviewers MUST independently run the verification.** A reviewer who only reads the diff is theatre. Bake "run the tests yourself" into every reviewer prompt.
4. **Don't loop on MINOR-only feedback unless asked.** Cosmetic suggestions don't justify a fix round's cost. Loop on BLOCKER/MAJOR.
5. **Process-wide signals (SIGINT etc.) in test code can corrupt the whole test binary.** If a task involves signals, flag it explicitly in the implementer prompt — and verify in Phase 4 that the suite stays green across 5+ runs.
6. **Cost ramps fast.** A 14-task list = ~30 agent invocations. Confirm the user wants this before launching anything over 10 tasks.
7. **Trust but verify.** Agents claim what they intended to do, not always what they did. The Phase 4 re-run from clean state catches the gap between claim and reality.
8. **Same-package signal/global-state tests are flaky across packages.** When tests touch global state (env vars, package-level maps, signal handlers), require snapshot-and-restore patterns — not just delete-on-cleanup.
9. **Each agent's work is atomic — consolidate AND clean up in one step, per agent.** Once an agent reaches consensus, copy its files into the parent and remove its worktree before moving to the next agent. Don't accumulate worktrees across the run; leftover worktrees from successful work pollute future sessions (ruff/grep/test discovery all start to see ghost copies), and leftover worktrees from failed work blur which agent caused the problem. Only KEEP a worktree when the consolidation itself failed or the user asked to inspect — those are debug artifacts and the final report must call them out by path.

## Failure modes to watch for

- **Hidden cross-task dependencies** — implementers silently get partial state. Mitigate by grouping or sequencing in Phase 0.
- **Lenient reviewer** — when the reviewer prompt doesn't require independent test runs. Always require `-count=N -race` style verification.
- **Infinite review loops** — cap at 3 rounds, escalate to user.
- **Stale-cache PASS** — agent reports PASS while another agent's concurrent edits make the suite red. Phase 4's clean re-run catches this.
- **Scope creep in fix rounds** — fix agents that "while I'm here, I'll also …". Prompt language must say "ONLY the listed fixes".
- **Reviewer that approves to be agreeable** — push the reviewer to find concrete issues. If three reviews come back zero-issues across the board, suspect the prompt is too soft.
- **Worktree clutter accumulating across runs** — skipping Phase 3.5 cleanup leaves `.claude/worktrees/agent-*` directories behind. Repo-wide ruff, grep, and pytest collection will start scanning these stale copies and produce confusing duplicate findings. Always remove worktrees once their changes have been consolidated into the parent.
