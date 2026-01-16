<div align="center">

# 🛠️ Claude Toolkit

**A comprehensive collection of commands, prompts, and utilities for [Claude Code](https://github.com/anthropics/claude-code)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Commands](https://img.shields.io/badge/Commands-25-brightgreen.svg)](#commands)
[![Prompts](https://img.shields.io/badge/Prompts-8-orange.svg)](#prompts)
[![Schemas](https://img.shields.io/badge/Schemas-10-purple.svg)](#schemas)

</div>

---

## 📦 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/claude-toolkit.git
cd claude-toolkit

# Install all commands
make install
```

## ⚡ Features

<table>
<tr>
<td width="25%">

### 🎯 Commands
25 specialized slash commands covering Git workflows, code quality, testing, documentation, and infrastructure

</td>
<td width="25%">

### 📝 Prompts
8 reusable prompt templates organized by purpose (validation, analysis, generation)

</td>
<td width="25%">

### 📋 Schemas
10 JSON schemas for validation and structured data definitions

</td>
<td width="25%">

### 💡 Examples
8 real-world examples showing workflows and integrations

</td>
</tr>
</table>

[→ View all commands](commands/) | [→ Browse prompts](prompts/) | [→ See examples](examples/) | [→ Check schemas](schemas/)

## 🚀 Usage Notes

### Shell Compatibility

> **Note:** Commands use `zsh -i -c "npm ..."` syntax for npm commands.

<details>
<summary><b>Using a different shell? Click here</b></summary>

<br>

| Shell | Syntax | Example |
|-------|--------|---------|
| **Zsh** (default) | `zsh -i -c "npm ..."` | `zsh -i -c "npm run lint"` |
| **Bash** | `bash -c "npm ..."` | `bash -c "npm run lint"` |
| **Fish** | `fish -c "npm ..."` | `fish -c "npm run lint"` |
| **Direct** | `npm ...` | `npm run lint` |

</details>

## 📂 Repository Structure

```
claude-toolkit/
├── 🎯 commands/           # 25 slash commands for Claude Code
│   ├── Git & PR Workflows (5)
│   ├── Code Quality & Refactoring (4)
│   ├── Testing & Quality (4)
│   ├── Documentation (3)
│   ├── Development Workflows (3)
│   ├── Infrastructure/DevOps (4)
│   └── AI/Agent Specific (3)
├── 📝 prompts/            # 8 reusable prompt templates
│   ├── validation/        # Security, multi-cloud, Terraform
│   ├── analysis/          # Code smells, performance, Docker
│   └── generation/        # Tests, commits
├── 💡 examples/           # 8 real-world examples
│   ├── commands/          # Command usage examples
│   ├── workflows/         # Multi-step workflows
│   └── integrations/      # GitHub Actions, Slack
├── 📋 schemas/            # 10 JSON schemas
│   ├── commands/          # Command result schemas
│   ├── validation/        # Validation rules
│   ├── config/            # Configuration schemas
│   └── outputs/           # Output formats
├── Makefile               # Installation automation
└── README.md
```

## 🔧 Make Targets

| Command | Description |
|---------|-------------|
| `make install` | 📥 Install all commands to `~/.claude/commands` |
| `make uninstall` | 🗑️ Remove installed commands |
| `make list` | 📋 List available commands |
| `make check` | ✅ Check installation status |
| `make help` | ❓ Show help message |

## 🌟 Highlights

### Featured Commands

| Command | Purpose |
|---------|---------|
| [`/sanitycheck`](commands/sanitycheck.md) | 🔍 Run 16 comprehensive pre-commit checks |
| [`/commit`](commands/commit.md) | 💬 Create conventional commits with proper formatting |
| [`/pr-review`](commands/pr-review.md) | 👀 Perform thorough code review checklist |
| [`/rebase`](commands/rebase.md) | 🔀 Interactive rebase with guided conflict resolution |
| [`/test-coverage`](commands/test-coverage.md) | 📊 Analyze test coverage and identify gaps |

[→ View all 25 commands](commands/README.md)

## 🤝 Contributing

Contributions are welcome! This toolkit accepts:

<table>
<tr>
<td>

**✨ Commands**
- Slash commands for Claude Code
- Workflow automation

</td>
<td>

**📝 Prompts**
- Reusable templates
- Best practices

</td>
<td>

**🔧 Utilities**
- Hooks & configs
- Helper scripts

</td>
<td>

**📚 Documentation**
- Examples & guides
- Integration patterns

</td>
</tr>
</table>

## 📄 License

MIT License - feel free to use and modify for your projects!

---

<div align="center">

**Made with ❤️ for the Claude Code community**

[Report Bug](https://github.com/YOUR_USERNAME/claude-toolkit/issues) · [Request Feature](https://github.com/YOUR_USERNAME/claude-toolkit/issues) · [Documentation](https://github.com/YOUR_USERNAME/claude-toolkit/wiki)

</div>
