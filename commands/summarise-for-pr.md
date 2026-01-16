# Summarise for PR

Generate a comprehensive PR summary suitable for team notifications (Slack, Discord, etc.) based on git changes.

## Instructions

### 1. Gather Git Information

Extract the following information from the current branch:

- **Branch name**: Get current branch name and parse for conventional commit format (feat/, fix/, chore/, etc.)
- **PR title**: Extract from branch name or latest commit message
- **Base branch**: Default to `main` or use specified base
- **Commit count**: Number of commits since base branch
- **File changes**: Count files changed (excluding lock files)
- **Line changes**: Calculate insertions and deletions

### 2. Parse Branch Name

Support conventional commit formats in branch names:

```
feat/TICKET-123-description
fix:bug-description
chore-update-dependencies
```

Extract:
- Prefix (feat, fix, chore, docs, style, refactor, test, build, ci, perf)
- Ticket number (if present)
- Description (replace hyphens/underscores with spaces)

### 3. Exclude Lock Files

When calculating statistics, exclude common lock files:

- `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- `Gemfile.lock`, `composer.lock`, `poetry.lock`
- `Cargo.lock`, `Pipfile.lock`, `go.sum`
- `mix.lock`, `packages.lock.json`, `shrinkwrap.yaml`

### 4. Calculate Statistics

```bash
# Commit count
git rev-list --count <base>..<branch>

# Files changed (excluding lock files)
git diff <base>..<branch> --numstat | grep -v -E "<lock-file-pattern>" | wc -l

# Insertions
git diff <base>..<branch> --numstat | grep -v -E "<lock-file-pattern>" | awk '{add+=$1} END {print add}'

# Deletions
git diff <base>..<branch> --numstat | grep -v -E "<lock-file-pattern>" | awk '{del+=$2} END {print del}'
```

### 5. Format Output

Generate a summary in this format:

```
[NEW PR] - <title>

Commits: <count>
Files changed: <count>
Insertions: +<count> / Deletions: -<count>
```

## Output Format

```
[NEW PR] - feat: IN-487 Implement message regeneration with attempt navigation

Commits: 24
Files changed: 37
Insertions: +4802 / Deletions: -627
```

## Usage Examples

```bash
# Summarize current branch against main
/summarise-for-pr

# Summarize against different base
/summarise-for-pr develop

# Summarize specific branch
/summarise-for-pr feature-branch main
```

## Notes

- Automatically formats conventional commit prefixes
- Handles ticket numbers in branch names
- Provides clean statistics for team communication
- Useful for Slack/Discord PR announcement bots
