# Conventional Commits Format

Guidelines for writing consistent, meaningful commit messages.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style/formatting (no logic change)
- **refactor**: Code restructuring (no behavior change)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes
- **build**: Build system changes
- **revert**: Revert a previous commit

## Scope (Optional)

Component or module affected:
- `feat(auth):` - Authentication module
- `fix(api):` - API changes
- `docs(readme):` - README updates

## Subject

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Max 50 characters

## Body (Optional)

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line

## Footer (Optional)

- Reference issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: description`

## Examples

### Simple Feature
```
feat: add user authentication

Implement JWT-based authentication with refresh tokens.
Includes login, logout, and token refresh endpoints.

Closes #456
```

### Bug Fix
```
fix: resolve memory leak in chat agent

Memory was not being released after conversation completion.
Added proper cleanup in agent termination.

Fixes #789
```

### Breaking Change
```
feat!: change API response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case.
Update all API clients to use new format.

Migration guide: docs/migration-v2.md
```

### Documentation
```
docs: update installation instructions

Add troubleshooting section for common setup issues.
Include Windows-specific installation steps.
```

## Benefits

- Automated changelog generation
- Semantic versioning automation
- Better git history readability
- Easier to understand project changes
- CI/CD trigger rules (e.g., deploy on `feat`)
