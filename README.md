# Claude Toolkit

A collection of tools, commands, and utilities for [Claude Code](https://github.com/anthropics/claude-code) and Claude workflows.

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/claude-toolkit.git
cd claude-toolkit
make install
```

## Commands

Personal slash commands for Claude Code.

| Command | Description |
|---------|-------------|
| `/sanitycheck` | Comprehensive pre-commit validation with 16 checks |

### /sanitycheck

Performs 16 comprehensive checks before committing:

| # | Check | Description |
|---|-------|-------------|
| 1 | Console Cleanup | Remove debug statements |
| 2 | Formatting | Verify code formatting (Prettier) |
| 3 | Exception/Logging | Validate error handling |
| 4 | Imports | Clean up unused/duplicate imports |
| 5 | Dead Code | Find unused code |
| 6 | Security | Scan for vulnerabilities, secrets, XSS |
| 7 | Accessibility | WCAG compliance checks |
| 8 | Git Workflow | Merge conflicts, secrets, conventions |
| 9 | Linting | ESLint + TypeScript checks |
| 10 | Dependency Audit | npm audit for vulnerabilities |
| 11 | TODO/FIXME | Track new comments |
| 12 | Environment Vars | Check env var handling |
| 13 | Lock File | package-lock.json consistency |
| 14 | Bundle Size | Check bundle size impact |
| 15 | Tests | Run tests, add if needed |
| 16 | Build | Verify successful build |

## Usage

Once installed, use commands in any Claude Code session:

```
/sanitycheck
```

### Auto-run Before Commits

Add to your `~/.claude/CLAUDE.md` to automatically run before every git commit:

```markdown
## Pre-Commit Requirements

### Sanity Check Before Commits
**ALWAYS** run the `/sanitycheck` command before creating any git commit, whether:
- Using `git commit` directly in terminal
- Using any git MCP tools
- Being asked to commit changes

This is a mandatory step - do not skip it.
```

## Structure

```
claude-toolkit/
├── commands/              # Slash commands for Claude Code
│   └── sanitycheck.md
├── Makefile               # Installation automation
└── README.md
```

## Make Targets

```bash
make install    # Install commands to ~/.claude/commands
make uninstall  # Remove installed commands
make list       # List available commands
make check      # Check installation status
make help       # Show help
```

## Contributing

Contributions welcome! This toolkit can include:

- **Commands** - Slash commands for Claude Code
- **Prompts** - Reusable prompt templates
- **Hooks** - Pre/post execution hooks
- **Configs** - Claude Code configuration examples
- **Scripts** - Helper scripts for Claude workflows

## License

MIT
