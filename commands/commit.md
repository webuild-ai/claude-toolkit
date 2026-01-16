# Commit

Create well-formatted git commits following conventional commit standards with proper attribution.

## Instructions

### 1. Review Changes

Before committing, understand what's being committed:

```bash
# Check modified files
git status

# Review changes
git diff

# Check staged changes
git diff --staged
```

### 2. Stage Files Selectively

**IMPORTANT**: Stage only specific files needed for this commit (avoid `git add .`):

```bash
# Add specific files
git add src/component.ts api/router.py

# Add by pattern if needed
git add src/**/*.ts
```

### 3. Write Commit Message

Follow conventional commit format:

**Structure**:
```
<type>: <brief description> (50 chars max)

<detailed description>:
- Specific change 1
- Specific change 2
- Specific change 3
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting (no logic change)
- `refactor`: Code restructuring (no behavior change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

### 4. Create Commit

Use HEREDOC format for multi-line messages:

```bash
git commit -m "$(cat <<'EOF'
feat: add workflow validation system

Implement comprehensive workflow validation for agent platform:
- Add YAML schema validation for workflow configurations
- Create workflow dependency checker
- Add runtime validation for agent communication patterns
EOF
)"
```

### 5. Verify Commit

```bash
# Check commit was created
git log -1

# Verify files included
git show --stat
```

## Commit Message Guidelines

### Good Examples

**Feature Addition**:
```
feat: add user authentication middleware

Implement JWT-based authentication:
- Add token validation middleware
- Create user session management
- Add authorization decorators for protected routes
```

**Bug Fix**:
```
fix: resolve memory leak in ChatAgent

- Fix conversation context not being properly cleared
- Add proper cleanup in agent termination
- Update memory management tests
```

**Documentation**:
```
docs: update API documentation

- Add examples for workflow execution endpoints
- Update authentication requirements
- Fix typos in agent configuration guide
```

**Refactoring**:
```
refactor: extract database connection logic

- Move connection handling to separate module
- Simplify retry logic
- Add connection pooling
```

### Bad Examples

❌ `git commit -m "fixed stuff"`
❌ `git commit -m "WIP"`
❌ `git commit -m "updates"`
❌ `git commit -m "asdfasdf"`

## Commit Checklist

Before committing:

- [ ] Only relevant files are staged
- [ ] Commit message follows conventional format
- [ ] First line is under 50 characters
- [ ] Detailed description explains the "why"
- [ ] No temporary/debug files included
- [ ] No sensitive data (secrets, credentials)
- [ ] Attribution is to the human developer

## Push Changes

After committing:

```bash
# Push to remote
git push

# Push new branch
git push -u origin <branch-name>
```

## Notes

- Keep commits focused on a single logical change
- Write commit messages for future developers (including future you)
- Consider running `/sanitycheck` before committing
- Avoid amending commits that have been pushed to shared branches
