# Claude Code Personal Commands

A collection of personal slash commands for [Claude Code](https://github.com/anthropics/claude-code).

## Available Commands

| Command | Description |
|---------|-------------|
| `/sanitycheck` | Comprehensive pre-commit validation with 16 checks including linting, tests, security, accessibility, and more |

## Installation

### Quick Install

```bash
make install
```

### Manual Install

Copy the command files to your Claude Code personal commands directory:

```bash
mkdir -p ~/.claude/commands
cp *.md ~/.claude/commands/ 2>/dev/null || true
# Exclude README from commands
rm -f ~/.claude/commands/README.md
```

## Uninstall

```bash
make uninstall
```

## Usage

Once installed, use the commands in any Claude Code session:

```
/sanitycheck
```

## Adding to Pre-Commit Workflow

To automatically run `/sanitycheck` before every git commit, add the following to your `~/.claude/CLAUDE.md`:

```markdown
## Pre-Commit Requirements

### Sanity Check Before Commits
**ALWAYS** run the `/sanitycheck` command before creating any git commit, whether:
- Using `git commit` directly in terminal
- Using any git MCP tools
- Being asked to commit changes

This is a mandatory step - do not skip it. The sanity check ensures code quality, security, and consistency before any code is committed.
```

## Command Details

### /sanitycheck

Performs 16 comprehensive checks before committing:

1. **Console Statement Cleanup** - Remove debug statements
2. **Formatting Check** - Verify code formatting (Prettier)
3. **Exception and Logging Review** - Validate error handling
4. **Import Review** - Clean up unused/duplicate imports
5. **Dead Code Detection** - Find unused code
6. **Security Checks** - Scan for vulnerabilities, secrets, XSS
7. **Accessibility (a11y) Review** - WCAG compliance
8. **Git Workflow Checks** - Merge conflicts, secrets, conventions
9. **Linting** - ESLint + TypeScript checks
10. **Dependency Audit** - npm audit for vulnerabilities
11. **TODO/FIXME Review** - Track new comments
12. **Environment Variable Validation** - Check env var handling
13. **Lock File Sync** - package-lock.json consistency
14. **Bundle Size Impact** - Check bundle size changes
15. **Tests** - Run tests, add if needed
16. **Build Verification** - Verify successful build

## Contributing

Feel free to add new commands! Each command should be a markdown file with instructions for Claude Code to follow.

## License

MIT
