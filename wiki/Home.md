# Welcome to Claude Toolkit

A comprehensive collection of commands, prompts, and utilities for [Claude Code](https://github.com/anthropics/claude-code).

[![Commands](https://img.shields.io/badge/Commands-25-brightgreen.svg)](Command-Reference)
[![Prompts](https://img.shields.io/badge/Prompts-8-orange.svg)](Command-Reference#prompts)
[![Schemas](https://img.shields.io/badge/Schemas-10-purple.svg)](Command-Reference#schemas)

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/webuild-ai/claude-toolkit.git
cd claude-toolkit

# Install all commands
make install

# Or install specific commands
make install-cmd CMD=sanitycheck
make install-cmd CMD=commit
```

### Verify Installation

```bash
# List all available commands
make list

# Check installation status
make check
```

### Using Commands

Once installed, commands are available in any Claude Code session:

```
/sanitycheck    # Run comprehensive pre-commit checks
/commit         # Create conventional commits
/pr-review      # Review pull requests
/test-coverage  # Analyze test coverage
```

## 📚 What's Inside

### 🎯 [Commands](Command-Reference)
25 specialized slash commands across 7 categories:
- **Git & PR Workflows** (5) - Commits, PRs, rebasing
- **Code Quality** (4) - Refactoring, dead code, type safety
- **Testing** (4) - Test generation, coverage, E2E
- **Documentation** (3) - API docs, READMEs, architecture
- **Development** (3) - Setup, dependencies, builds
- **Infrastructure** (4) - Terraform, Docker, env config
- **AI/Agent** (3) - Workflows, MCP servers, debugging

### 📝 [Prompts](Command-Reference#prompts)
8 reusable prompt templates:
- **Validation** - Security, multi-cloud, Terraform
- **Analysis** - Code smells, performance, Docker
- **Generation** - Tests, commit messages

### 📋 [Schemas](Command-Reference#schemas)
10 JSON schemas for:
- Command outputs
- Validation rules
- Configuration structures

### 💡 [Examples](Tutorials-and-Guides#examples)
8 real-world examples:
- Command outputs
- Multi-step workflows
- CI/CD integrations

## 🎓 Learning Path

### New Users
1. Start with [Getting Started](Tutorials-and-Guides#getting-started)
2. Try the [Pre-Commit Workflow](Tutorials-and-Guides#pre-commit-workflow)
3. Read [Frequently Asked Questions](FAQ-and-Troubleshooting)

### Experienced Users
1. Explore [Advanced Workflows](Tutorials-and-Guides#advanced-workflows)
2. Learn [Custom Command Creation](Tutorials-and-Guides#creating-commands)
3. Check [Best Practices](Tutorials-and-Guides#best-practices)

## 🔧 Configuration

### Shell Compatibility

Commands use `zsh -i -c "npm ..."` for npm commands. If using a different shell:

| Shell | Syntax |
|-------|--------|
| Bash | `bash -c "npm ..."` |
| Fish | `fish -c "npm ..."` |
| Direct | `npm ...` |

### Auto-run Sanitycheck

Add to `~/.claude/CLAUDE.md`:

```markdown
## Pre-Commit Requirements

### Sanity Check Before Commits
**ALWAYS** run `/sanitycheck` before creating any git commit.
```

## 🤝 Contributing

We welcome contributions! See:
- [Contributing Guidelines](https://github.com/webuild-ai/claude-toolkit/blob/main/CONTRIBUTING.md)
- [Creating Commands](Tutorials-and-Guides#creating-commands)
- [Code of Conduct](https://github.com/webuild-ai/claude-toolkit/blob/main/CODE_OF_CONDUCT.md)

## 📖 Documentation

- **[Command Reference](Command-Reference)** - Detailed command documentation
- **[Tutorials & Guides](Tutorials-and-Guides)** - Step-by-step tutorials
- **[FAQ](FAQ-and-Troubleshooting)** - Common questions and solutions
- **[Main Repository](https://github.com/webuild-ai/claude-toolkit)** - Source code

## 💬 Support

- **[Issues](https://github.com/webuild-ai/claude-toolkit/issues)** - Report bugs or request features
- **[Discussions](https://github.com/webuild-ai/claude-toolkit/discussions)** - Ask questions or share ideas

## 📄 License

MIT License - See [LICENSE](https://github.com/webuild-ai/claude-toolkit/blob/main/LICENSE) for details.

---

**Made with ❤️ for the Claude Code community**
