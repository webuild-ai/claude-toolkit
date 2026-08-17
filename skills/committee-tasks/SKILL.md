---
name: committee-tasks
description: Authors a tasks.md file from a free-form goal description by reading project context (SPEC.md, README.md, source) and decomposing the goal into agent-ready tasks. Each task gives context and acceptance criteria but NOT step-by-step implementation — the executing agent figures out the how. Tasks are grouped so that no two tasks touch the same file (race-safe under parallel execution). Pairs with the agent-committee skill which executes the resulting tasks.md. Use when the user describes a goal ("add feature X", "improve coverage", "refactor module Y") and asks for it to be broken into tasks, especially when they mention agents, parallelism, or a committee will execute them. Also triggers on "/committee-tasks" or "create tasks for the committee".
---

# Committee Tasks

## Overview

Translate a goal description into a structured `tasks.md` that downstream agents can execute in parallel. The skill produces tasks that are:

- **Context-rich, not prescriptive** — each task explains the *why* and points at the right files, but does not spell out the *how*. The executing agent reads the code and decides the implementation.
- **Race-safe by construction** — every task declares the files it owns; no two tasks share a file. Parallel agents cannot collide.
- **Independently verifiable** — each task has acceptance criteria the agent can check without coordinating with siblings.
- **Sized for one agent** — small enough to be one focused unit of work, large enough that a complete vertical slice can land.

```
goal description (from user)
   │
   ├── Phase 0: Read project context
   ├── Phase 1: Decompose into candidate tasks
   ├── Phase 2: Group for race-safety (one file → one task)
   ├── Phase 3: Write each task with context + acceptance, NOT recipe
   ├── Phase 4: Sanity-check (file overlap, ordering, scope)
   └── Phase 5: Write tasks.md and report to user
```

The output is consumable by the `agent-committee` skill directly.

## When to Use

- The user describes a **goal** ("I want to add OAuth", "increase test coverage", "rewrite the cache layer") and asks for a plan, breakdown, or task list.
- The user says "/committee-tasks", "create tasks for agents", "break this down for the committee", "make a tasks.md".
- The user has a `SPEC.md` or similar and asks "what's left to ship this?".
- A goal is too big for one agent and you can foresee 3+ independent units of work.

## When NOT to Use

- Single-task work — just do it; no tasks.md needed.
- The user already has a tasks.md and just wants to execute it — go straight to `agent-committee`.
- Pure research questions ("how does X work?") — no tasks to author.
- The goal is so vague the user hasn't decided what they want — push back and help the user refine the idea or write a spec first.

## Inputs

**Required:**
- A goal description (from the user's message).

**Auto-discovered — read these in your own context before drafting:**
- `SPEC.md` / `spec.md` — what the project IS
- `README.md` — surface architecture, getting-started
- `AGENTS.md` / `CLAUDE.md` — house rules, conventions
- `Makefile` / `package.json` / `pyproject.toml` / equivalent — build & test commands
- The relevant source directory layout (use `ls` or `Explore` agent for this — don't read every file)

If the goal mentions specific files/modules, read those.

## Procedure

### Phase 0 — Read context

1. Run `git rev-parse --show-toplevel` to confirm the repo root.
2. Read the auto-discovery files above. Quote the relevant sections in your working notes — you'll need them for task descriptions.
3. List the source tree at one level deep (`ls src/`, etc.) to learn the module boundaries. Don't read every file — that's the executing agent's job.
4. If the codebase is large or the goal is broad, spawn an `Explore` agent (or a general-purpose search agent if `Explore` is unavailable) with a focused query: "Where does <thing the goal touches> live? Return file paths only." Use the result to anchor task scopes.

### Phase 1 — Decompose

Generate a flat list of candidate tasks. For each, jot:

- A 1-sentence statement of what the task accomplishes.
- The file(s) it would touch.
- Rough size estimate (lines, complexity — keep it informal).

Aim for tasks that are:

- **Small enough**: ~30 min to ~3 hours of agent work each. If a task feels bigger, split it.
- **Big enough**: a complete useful slice. "Rename one variable" is too small; combine with siblings.
- **Self-contained**: completing it leaves the project in a working, testable state.

Don't worry about ordering or grouping yet — just enumerate.

### Phase 2 — Group for race-safety

This is the **critical phase**. Two tasks that touch the same file CANNOT run in parallel; the agent-committee skill assumes file-level isolation.

1. Build a `file → tasks` map from your candidate list.
2. For every file with 2+ tasks: **merge those tasks into one**. Don't try to sequence them — that defeats parallelism. Combined tasks become one larger unit owned by one agent.
3. After merging, re-check sizes. If a merged task is now too big, see if you can split the underlying work along *different* file lines (e.g. extract a helper into a new file).
4. If a task genuinely needs to modify a file that another task also needs, the right answer is usually: rethink the boundary. Pull the shared concern into its own task that runs first (sequence it, record it in a `**Depends on.** T<x>.<y>` field on the dependent task, accept that this one is not parallelizable; the agent-committee skill launches dependent groups in ordered waves based on this field).

The output of this phase is a list where every task owns a disjoint set of files.

### Phase 3 — Write each task (context, not recipe)

For each task, produce a structured entry:

```markdown
### [ ] T<G>.<N> — <imperative title, ≤8 words>

**Context.** Why this task exists. What problem it solves or what value it delivers. 1–3 sentences. Reference the user's goal.

**Read first.** Pointers to relevant material. Examples:
- `SPEC.md` §<section name>
- `src/auth/session.go` — current session handling
- existing pattern: `src/auth/token_test.go` for the test style to match

**Acceptance.** How the agent knows the task is done. Observable behavior or measurable criteria. Examples:
- Endpoint returns 401 for missing tokens, 200 with valid Bearer
- Coverage of `func Foo` is ≥80%
- `make build` succeeds and binary size is unchanged ±5%

**Files in scope.** The exhaustive list of files this task may create or modify. Other files are off-limits.
- `src/auth/oauth.go` (new)
- `src/auth/oauth_test.go` (new)
- `src/auth/session.go` (modify)

**Constraints.** Optional: gotchas, conventions, what NOT to do. Examples:
- Don't introduce a new dependency; reuse `golang.org/x/oauth2`.
- Match the error-wrapping style in `src/auth/token.go`.
```

**Critical writing rules:**

- **DO NOT spell out implementation steps.** No "first do X, then Y, then Z". The executing agent reads the code and decides.
- **DO say what "good" looks like.** Acceptance criteria, observable behavior, metrics.
- **DO point at exemplars.** "Match the style of `existing_test.go`" beats "use table-driven subtests with t.Run".
- **DO surface known traps.** If a previous attempt failed for reason X, name it under Constraints.
- **Length per task: 8–20 lines.** If you're writing more, you're prescribing too much. If less, you haven't given enough context.

### Phase 4 — Sanity check

Before writing the file:

1. **File-overlap audit.** For every pair of tasks, confirm their "Files in scope" sets are disjoint. Print the audit result internally — if any overlap remains, go back to Phase 2.
2. **Acceptance audit.** For every task, can a reader determine "done" without reading other tasks? If not, rewrite.
3. **Recipe audit.** Re-read each task. If it reads like a how-to ("call X, then Y"), strip it down to context + acceptance. Trust the agent.
4. **Size audit.** Are any tasks one-liners? Merge with siblings if so. Are any monsters? Split.
5. **Goal-coverage audit.** Does the union of all tasks satisfy the user's stated goal? Anything missing?

### Phase 5 — Write tasks.md and report

1. Write `./tasks.md` (or wherever the user specified). Structure:

   ```markdown
   # <Goal title>

   <One-paragraph summary of the goal, copied/synthesized from the user's description.>

   **Context files:** <list of files/sections the agents should treat as authoritative>
   **Verification:** <how to verify the whole thing — usually a single command or short list>

   ---

   ## Priority 1 — <theme>

   ### [ ] T1.1 — ...
   ### [ ] T1.2 — ...

   ## Priority 2 — <theme>

   ### [ ] T2.1 — ...

   ---

   ## Acceptance for the whole goal

   <Final criterion. E.g. all priority-1 tasks done + full suite green + lint clean.>
   ```

2. **Report to the user**:
   - Number of tasks, grouped by priority/theme.
   - Which sub-goals were combined and why (file-overlap merges).
   - Any ambiguity you couldn't resolve and need user input on.
   - One sentence on next steps: "Run the agent-committee skill to execute, or edit tasks.md first."

## Hard-won writing rules

1. **Tasks are briefs, not scripts.** The agent's job is to figure out *how*. Your job is to define *what* and *why*. If you find yourself writing pseudocode, stop.
2. **Files-in-scope is the race contract.** Every task declares its file footprint; no two tasks overlap. This is not a suggestion; it's the only way parallel execution stays safe.
3. **"Acceptance" is observable, not subjective.** "Code is clean" is not acceptance. "Passes `golangci-lint run` with zero issues" is.
4. **Point to exemplars instead of explaining patterns.** "Match `src/foo/bar.go`'s error style" is shorter and clearer than three paragraphs about error handling.
5. **Don't bury the why.** A task with no Context section is a task an agent will misinterpret. The why constrains the how when ambiguity hits.
6. **Surface dependencies explicitly.** If T2.1 must run after T1.3, record it in a `**Depends on.** T1.3` field on T2.1 — and prefer not to need it (parallelism wants independent tasks).
7. **Keep titles imperative and short.** "Add OAuth login flow" beats "Implementation of OAuth-based authentication for user login".

## Output format reference

A complete task entry looks like this — copy this shape:

```markdown
### [ ] T2.1 — Add JWT validation to auth middleware

**Context.** The middleware currently accepts any Bearer token without validation, which is the open issue blocking the security review (see SPEC.md §7). Once this lands, every authenticated route gets real verification with no further wiring.

**Read first.**
- `SPEC.md` §7 "Authentication" for the validation rules
- `src/auth/middleware.go` — current pass-through implementation
- `src/auth/jwt.go` — existing JWT parser to reuse
- `src/auth/middleware_test.go` for the test style

**Acceptance.**
- Requests with no token, expired token, or wrong-signature token return 401.
- Requests with valid signed tokens reach the handler with claims in context.
- Existing middleware tests still pass.
- New tests cover the three failure modes above.

**Files in scope.**
- `src/auth/middleware.go` (modify)
- `src/auth/middleware_test.go` (modify)

**Constraints.**
- Don't add a JWT library — `src/auth/jwt.go` already imports one.
- Claim shape comes from `internal/claims/claims.go`; don't define a new type.
```

Note what's *not* there: no "step 1, step 2", no code snippets, no "use this regex". The agent reads middleware.go and decides.

## Failure modes

- **Over-prescription** — writing recipes instead of briefs. Caught in Phase 4 recipe audit. Strip to context + acceptance.
- **File overlap missed** — two tasks touch the same file, will collide under parallel execution. Phase 2 + Phase 4 audits catch this.
- **Vague acceptance** — "code is good", "tests pass" without saying which tests. Force concreteness.
- **Hidden ordering** — task implies it must run after another but doesn't say so. Surface dependencies under Context, or restructure to remove them.
- **Goal drift** — tasks add up to something other than what the user asked for. Phase 4 goal-coverage audit catches this.
- **Tasks too big** — one task is the whole goal. Re-split.
- **Tasks too small** — twenty 5-line tasks for what should be five. Merge.

## Companion skill

Once tasks.md is written, the `agent-committee` skill executes it: parallel implementer agents, peer review, discussion until consensus, parent-runtime verification. The two skills are designed to chain.
