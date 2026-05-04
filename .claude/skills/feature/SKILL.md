---
name: feature
description: >
  End-to-end feature delivery: Linear issue → spec → worktree → implementation → PR.
  One feature = one Linear issue = one worktree = one branch. Linear is the intention layer;
  GitHub↔Linear integration keeps state synced — this skill does not duplicate that tracking.
user-invocable: true
---

# /feature

End-to-end pipeline: Linear Issue → Spec → Worktree → Implementation → PR.

Input: `SEC-42`, issue identifier, Linear URL, or free-text description.

Read `.claude/models.yml` for model routing.

**Tracking principle:** Linear is the source of truth for issue state. The GitHub↔Linear integration auto-links PRs and syncs status via conventional commits and PR lifecycle. This skill does NOT mirror progress in Linear comments — it posts one immutable spec comment and lets the integration handle the rest.

---

## phase 0: resume check

1. **Schema verification** — Run `/sync-schema` auto-verification:
   - Read `.claude/stack.yml` → `schema` section. Not configured → skip silently.
   - If configured, check if `schema.md` is stale (files in `schema.paths` newer than `Last synced` date).
   - Stale or missing → run full `/sync-schema` before continuing.

2. Parse input:
   - Identifier like `SEC-42`, `LUI-19`, `[A-Z]+-\d+` → LINEAR_ID = identifier
   - Linear URL → extract LINEAR_ID
   - Free text → create issue in Phase 1

3. If LINEAR_ID exists, fetch via `mcp__linear-server__get_issue(id: LINEAR_ID)`.
   - Not found → `❌ Error: Issue LINEAR_ID not found in Linear.`
   - Store: ISSUE_TITLE, ISSUE_BODY, ISSUE_URL

4. Derive identifiers:
   - `SLUG` = kebab-case of issue title, max 40 chars
   - `BRANCH` = `feat/LINEAR_ID-SLUG`
   - `REPO_ROOT` = `git rev-parse --show-toplevel`
   - `WT_ROOT` = `REPO_ROOT/../.worktrees/BRANCH`

5. Check resumability:
   - Read `REPO_ROOT/.claude/memory/in-flight.yml` if it exists.
   - If it contains an entry for LINEAR_ID, load: `branch`, `phase`, `spec` (inline), `waves`.
   - `git worktree list | grep BRANCH` — if worktree exists, RESUME from recorded phase.
   - Otherwise continue to Phase 1.

---

## phase 1: intake

**Case A — Free-text (no LINEAR_ID):**
- `mcp__linear-server__list_teams()` → pick team
- `mcp__linear-server__save_issue(title, description, teamId)` → capture returned LINEAR_ID
- Derive SLUG, BRANCH, WT_ROOT

**Case B — Existing LINEAR_ID:** already loaded in Phase 0.

---

## phase 2: spec + user gate

1. Invoke **planner agent** (model: opus) with:
   - Linear issue title + body
   - `.claude/memory/architecture.md`
   - `.claude/memory/decisions/DEC-*.md`
   - `.claude/project.yml`

2. Planner returns structured spec:
   - **Scope** (1–3 sentences)
   - **Acceptance Criteria**
   - **Invariants Affected**
   - **Waves** (ordered task groups)
   - **Files** to create/modify
   - **Test Strategy**

3. **User gate — ONLY interactive gate in the pipeline:**
   - Print full spec.
   - Print: `Proceed with implementation? (yes/no)`
   - **NO** → `❌ Cancelled by user.` STOP.
   - **YES** → continue.

4. Post **one immutable Linear comment** with the full spec:
   ```
   mcp__linear-server__save_comment(issueId: LINEAR_ID, body: "## Spec

   **Branch:** `feat/LINEAR_ID-SLUG`

   ### Scope
   [...]

   ### Acceptance Criteria
   [...]

   ### Invariants Affected
   [...]

   ### Waves
   - Wave 1 — [name]: [tasks]
   - Wave 2 — [name]: [tasks]

   ### Files
   [...]

   ### Test Strategy
   [...]
   ")
   ```
   This comment is **never edited**. Progress will be reflected by the PR (auto-linked by the GitHub↔Linear integration).

5. Persist minimal resumability metadata to `REPO_ROOT/.claude/memory/in-flight.yml`:
   ```yaml
   LINEAR_ID:
     branch: feat/LINEAR_ID-SLUG
     team_id: TEAM_ID
     issue_url: ISSUE_URL
     phase: worktree
     waves:
       - name: Wave 1
         tasks:
           - { desc: "...", done: false }
   ```

---

## phase 3: worktree setup

1. Sync local main:
   ```
   git fetch origin && git switch main && git merge --ff-only origin/main
   ```
   Diverged → `❌ Error: Local main has diverged from origin. Resolve manually.`

2. Create worktree:
   ```
   mkdir -p REPO_ROOT/../.worktrees
   git worktree add WT_ROOT -b BRANCH origin/main
   ```

3. Update `in-flight.yml`: `phase: execution`.

No state files are copied into the worktree. Resumability lives in `REPO_ROOT/.claude/memory/in-flight.yml`.

---

## phase 4: execution (inside worktree)

### isolation rule — mandatory
- **ALL reads/writes use absolute paths under `WT_ROOT`**
- **NEVER read/write REPO_ROOT** (exception: `in-flight.yml` updates — do these before entering or after leaving the worktree context)
- **NEVER `cd` to REPO_ROOT**

### execution loop

For each wave in the spec:

1. **Builder agent** (model: sonnet) implements all tasks in the wave + runs tests.
2. PASS → mark wave done in `in-flight.yml`. FAIL → retry (max 2). 3rd failure:
   ```
   mcp__linear-server__save_comment(issueId: LINEAR_ID, body: "🚫 Blocked on [wave/task]: [error]")
   ```
   STOP.
3. Commit with conventional format — this is what the GitHub↔Linear integration reads:
   ```
   cd WT_ROOT && git add -A && git commit -m "feat(SLUG): wave N — [summary]

   Refs: LINEAR_ID"
   ```
4. Every 3 waves: `/summarize-context` (model: haiku).

**Do NOT post per-wave updates to Linear.** The integration infers activity from commits and PR state.

---

## phase 5: integration

1. Verify all waves marked done in `in-flight.yml`.

2. Final validation:
   - Read `WT_ROOT/.claude/stack.yml` for `validate` command + `exec_prefix`.
   - `cd WT_ROOT && {exec_prefix} {stack.commands.validate}` (fallback: `test` then `build`).
   - FAIL → create fix wave, return to Phase 4.

3. Push:
   ```
   cd WT_ROOT && git push -u origin BRANCH
   ```
   Rejected → `git pull --rebase origin BRANCH`, retry once.

4. Create PR (model: haiku):
   ```
   gh pr create --title "feat: ISSUE_TITLE" --body "Ref: LINEAR_ID — ISSUE_URL

   ## Summary
   [scope]

   ## Changes
   [files]

   ## Test plan
   [test strategy]
   " --head BRANCH --base main
   ```
   The GitHub↔Linear integration auto-attaches the PR to the issue and transitions state.

5. If the integration does NOT auto-transition to "In Review" within this run, fall back to:
   ```
   mcp__linear-server__list_issue_statuses(teamId: TEAM_ID)
   mcp__linear-server__save_issue(id: LINEAR_ID, stateId: IN_REVIEW_STATUS_ID)
   ```

6. Remove LINEAR_ID entry from `REPO_ROOT/.claude/memory/in-flight.yml`.

7. Output: `✅ Feature LINEAR_ID delivered. PR: PR_URL — merge when ready.`

Worktree is NOT removed (may need post-review fixes). Merging is the user's responsibility.

---

## error handling

| Error | Action |
|-------|--------|
| Linear issue not found | `❌ Error: Issue LINEAR_ID not found in Linear.` |
| MCP unavailable | `❌ Error: Linear MCP not reachable.` |
| Push rejected | `git pull --rebase origin BRANCH`, retry once |
| Wave fails 3× | Post blocker comment, STOP |
| Session interrupted | Re-invoke `/feature LINEAR_ID` — resumes via `in-flight.yml` |
| Worktree conflicts | `cd WT_ROOT && git rebase origin/main`, resolve manually |

---

## resumability

On re-invocation of `/feature LINEAR_ID`:

1. Read `REPO_ROOT/.claude/memory/in-flight.yml`.
2. No entry → run full pipeline from Phase 0.
3. Entry exists → jump to recorded `phase`:
   - `worktree` → Phase 3
   - `execution` → Phase 4 (skip completed waves via `done: true`)
   - `integration` → Phase 5

---

## conventions

- **One feature = one Linear issue = one worktree = one branch**
- Branch: `feat/LINEAR_ID-SLUG`
- Worktree: `REPO_ROOT/../.worktrees/feat/LINEAR_ID-SLUG`
- Commits: `feat(SLUG): description` — include `Refs: LINEAR_ID` trailer for integration
- PR body references the Linear issue identifier + URL
- **One Linear comment per feature**: the spec (immutable). Progress comes from the auto-linked PR.
- Resumability metadata: `REPO_ROOT/.claude/memory/in-flight.yml` only (no `project-state.md`, no `locks.md`, no archive step).
