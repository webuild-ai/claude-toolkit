# Rebase

Interactive git rebase with guided conflict resolution using clear explanations for ours, theirs, or both.

## Instructions

### 1. Check Current State

Before rebasing:

```bash
# Check current branch
git branch --show-current

# Check if working directory is clean
git status

# View commits to be rebased
git log --oneline main..HEAD
```

### 2. Start Rebase

```bash
# Rebase onto main
git rebase main

# Or rebase interactively
git rebase -i main
```

### 3. Handle Conflicts

When conflicts occur, Git will pause and show:

```
CONFLICT (content): Merge conflict in src/file.ts
```

#### View Conflicts

```bash
# See which files have conflicts
git status

# View conflict markers
cat src/file.ts
```

#### Conflict Markers Explanation

```typescript
<<<<<<< HEAD (ours - target branch: main)
const value = "version from main branch";
=======
const value = "version from feature branch";
>>>>>>> feature-branch (theirs - your changes)
```

**Understanding the terms**:
- **"ours"** (HEAD): The code from the branch you're rebasing ONTO (usually `main`)
- **"theirs"**: The code from your current branch that you're rebasing

### 4. Use AskUserQuestion for Conflict Resolution

When conflicts are detected, Claude will use AskUserQuestion to help you decide:

#### For Each Conflicted File

**Question**: "How would you like to resolve the conflict in `src/file.ts`?"

**Options**:

1. **Accept Ours (Keep target branch version)**
   - Description: "Use the version from the branch you're rebasing onto (e.g., main). This discards your changes in this file and keeps the target branch's version. Use this when the target branch has the correct/newer implementation."
   - Command: `git checkout --ours src/file.ts`

2. **Accept Theirs (Keep your changes)**
   - Description: "Use the version from your current branch (your changes). This discards the target branch's changes and keeps your implementation. Use this when your changes should take precedence."
   - Command: `git checkout --theirs src/file.ts`

3. **Accept Both (Merge both changes)**
   - Description: "Manually merge both versions together. This keeps changes from both branches. You'll need to edit the file to combine both implementations properly. Use this when both changes are important and can coexist."
   - Action: Open file in editor and manually merge

4. **View Diff First**
   - Description: "See a detailed comparison before deciding. This shows you exactly what changed in both versions."
   - Command: `git diff HEAD:src/file.ts feature-branch:src/file.ts`

#### Example Resolution Flow

```python
# Pseudocode for conflict resolution
if conflicts_detected:
    for file in conflicted_files:
        answer = ask_user_question(
            question=f"How to resolve conflict in {file}?",
            options=[
                {
                    "label": "Accept Ours (main branch)",
                    "description": "Keep the version from main branch, discard your changes"
                },
                {
                    "label": "Accept Theirs (your changes)",
                    "description": "Keep your version, discard main branch changes"
                },
                {
                    "label": "Merge Both Manually",
                    "description": "Edit file to combine both versions"
                },
                {
                    "label": "View Diff",
                    "description": "Show detailed comparison first"
                }
            ]
        )

        if answer == "Accept Ours":
            run("git checkout --ours {file}")
        elif answer == "Accept Theirs":
            run("git checkout --theirs {file}")
        elif answer == "Merge Both":
            open_editor(file)
            # User manually edits and saves
        elif answer == "View Diff":
            run("git diff HEAD:{file} feature-branch:{file}")
            # Then ask again
```

### 5. Complete Rebase

After resolving conflicts:

```bash
# Stage resolved files
git add src/file.ts

# Continue rebase
git rebase --continue

# If more conflicts, repeat resolution process
```

### 6. Abort if Needed

```bash
# Abort rebase and return to original state
git rebase --abort
```

### 7. Force Push (If Already Pushed)

```bash
# After successful rebase
git push --force-with-lease origin feature-branch
```

## Conflict Resolution Guide

### When to Use "Ours"

- Target branch has bug fixes you don't want to lose
- Target branch has newer, refactored code
- Your changes are experimental/outdated
- You want to align with team's latest work

### When to Use "Theirs"

- Your changes are the intended fix/feature
- You've thoroughly tested your implementation
- Target branch changes are unrelated
- Your changes supersede target branch

### When to "Merge Both"

- Both changes are independent and compatible
- Different parts of the same file changed
- Both implementations add value
- Changes address different concerns

### When to "View Diff"

- Conflict is complex
- Need to understand context
- Unsure which version is correct
- Changes affect critical code

## Common Rebase Scenarios

### Scenario 1: Simple Feature Branch
```bash
# Your feature is behind main
git checkout feature-branch
git rebase main

# Conflicts in config file
# Choose "Accept Theirs" to keep your feature config
```

### Scenario 2: Long-Running Branch
```bash
# Many conflicts from outdated branch
git rebase main

# For each conflict:
# - Review changes carefully
# - Often need "Merge Both" for complex cases
# - Test after each resolution
```

### Scenario 3: Refactoring Conflict
```bash
# Main refactored, your branch has new feature
git rebase main

# Conflict: function renamed in main, your branch adds to it
# Choose "View Diff" first
# Then "Merge Both" to apply your changes to refactored code
```

## Output Format

```markdown
# Rebase Summary

## Branch: feature/new-api
## Target: main
## Status: ✅ Completed

## Commits Rebased: 8
1. Add user authentication
2. Implement API endpoints
3. Add tests
4. Fix bug in login
5. Update documentation
6. Add error handling
7. Refactor validators
8. Update dependencies

## Conflicts Resolved: 3 files

### 1. src/api/auth.ts
**Resolution**: Accept Theirs (your changes)
**Reason**: Your authentication implementation is complete

### 2. src/config/database.ts
**Resolution**: Accept Ours (main branch)
**Reason**: Main has updated database config

### 3. src/utils/validators.ts
**Resolution**: Merged Both
**Reason**: Combined main's refactoring with your new validators

## Actions Required
- Test thoroughly before merging
- Force push to origin: `git push --force-with-lease`
- Create pull request

## Warnings
- ⚠️  Force push required (history rewritten)
- ⚠️  Test all functionality
- ⚠️  Verify CI passes
```

## Best Practices

- Rebase frequently to avoid large conflicts
- Never rebase public/shared branches
- Test after resolving conflicts
- Use `--force-with-lease` not `--force`
- Communicate with team about rebases
- Keep commits atomic for easier rebasing
- Use interactive rebase to clean history

## Common Pitfalls

❌ **Don't**:
- Rebase main branch
- Force push without `--force-with-lease`
- Rebase without clean working directory
- Ignore conflicts (they'll persist)
- Skip testing after rebase

✅ **Do**:
- Rebase feature branches
- Resolve conflicts carefully
- Test after each resolution
- Communicate with team
- Have backups of important work

## Notes

- Rebase rewrites history - use carefully
- "ours" and "theirs" are counterintuitive during rebase
- When in doubt, ask for help before resolving
- Use `git reflog` to recover if something goes wrong
