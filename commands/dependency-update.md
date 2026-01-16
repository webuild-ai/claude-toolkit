# Dependency Update

Update dependencies safely with compatibility checks and testing.

## Instructions

### 1. Check for Updates

#### Python
```bash
# Check outdated packages
uv pip list --outdated

# Show what would be updated
uv sync --upgrade --dry-run
```

#### TypeScript/JavaScript
```bash
# Check outdated packages
zsh -i -c "npm outdated"

# Check for major updates
zsh -i -c "npx npm-check-updates"
```

### 2. Review Changes

For each outdated package:
- Check CHANGELOG for breaking changes
- Review migration guides
- Check GitHub issues for known problems
- Verify license hasn't changed

### 3. Update Strategy

#### Patch Updates (0.0.X) - Safe
```bash
# Python: Auto-update patches
uv sync --upgrade

# TypeScript: Update patches only
zsh -i -c "npm update"
```

#### Minor Updates (0.X.0) - Usually Safe
```bash
# Update specific package
uv add package@latest

# Or in package.json, change:
# "package": "^1.2.0" → "^1.3.0"
zsh -i -c "npm install"
```

#### Major Updates (X.0.0) - Review Carefully
```bash
# Update one at a time
uv add "package>=2.0.0"

# Test thoroughly before next update
```

### 4. Update Process

1. **Create branch**:
   ```bash
   git checkout -b chore/update-dependencies
   ```

2. **Update lock file**:
   ```bash
   # Python
   uv lock --upgrade

   # TypeScript
   zsh -i -c "npm install"
   ```

3. **Run tests**:
   ```bash
   # Python
   uv run pytest

   # TypeScript
   zsh -i -c "npm test"
   ```

4. **Run linter**:
   ```bash
   # Python
   uv run ruff check .

   # TypeScript
   zsh -i -c "npm run lint"
   ```

5. **Test application**:
   ```bash
   # Start app and manually test
   uv run main.py
   # or
   zsh -i -c "npm run dev"
   ```

6. **Commit and PR**:
   ```bash
   git add pyproject.toml uv.lock
   # or: git add package.json package-lock.json
   git commit -m "chore: update dependencies

   - Update fastapi 0.104.0 → 0.105.0
   - Update pydantic 2.4.0 → 2.5.0
   - All tests passing"
   ```

### 5. Handle Breaking Changes

If tests fail after update:

1. **Check migration guide**
2. **Update code** for new API
3. **Add tests** for new behavior
4. **Document changes** in PR

### 6. Security Updates (Priority)

```bash
# Python: Check for security issues
uv pip audit

# Fix security vulnerabilities immediately
uv add "vulnerable-package>=safe-version"

# TypeScript
zsh -i -c "npm audit fix"

# For breaking changes
zsh -i -c "npm audit fix --force"
```

### 7. Automated Updates

Setup Dependabot or Renovate:

```.github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
```

## Output Format

```markdown
# Dependency Update Report

## Summary
- Total dependencies: 67
- Outdated: 12
- Security vulnerabilities: 2 (HIGH priority)
- Updates applied: 10
- Tests: ✅ All passing

## Security Updates (Urgent)
1. `requests` 2.28.0 → 2.31.0 (CVE-2023-32681)
2. `cryptography` 38.0.4 → 41.0.0 (CVE-2023-38325)

## Major Updates (Breaking Changes)
1. `fastapi` 0.95.0 → 0.104.0
   - Migration: Update `@app.get()` to new format
   - Status: ✅ Updated and tested

## Minor Updates (Compatible)
1. `pydantic` 1.10.2 → 1.10.13
2. `httpx` 0.24.0 → 0.24.1
3. `pytest` 7.3.0 → 7.4.3

## Skipped Updates
1. `sqlalchemy` 1.4.x → 2.0.x (major rewrite, defer to v2.0 milestone)

## Testing Results
- Unit tests: 245/245 passed ✅
- Integration tests: 34/34 passed ✅
- E2E tests: 12/12 passed ✅
- Build: Successful ✅

## Next Steps
- Monitor for issues in production
- Schedule sqlalchemy 2.0 upgrade for next sprint
- Enable automated security updates
```

## Best Practices

- Update regularly (weekly/monthly)
- Update one major version at a time
- Run full test suite after updates
- Check CI/CD passes before merging
- Update dev dependencies too
- Document breaking changes
- Keep lock files in version control

## Notes

- Security updates should be immediate
- Test in staging before production
- Have rollback plan ready
- Monitor logs after deployment
