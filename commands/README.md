<div align="center">

# 🎯 Commands

**Slash commands that extend Claude Code with specialized workflows**

![Commands](https://img.shields.io/badge/Total-25_Commands-brightgreen?style=for-the-badge)

</div>

---

## 📚 Command Categories

<details open>
<summary><h3>🔀 Git & PR Workflows (5 commands)</h3></summary>

| Command | Description | Quick Action |
|---------|-------------|--------------|
| `/summarise-for-pr` | 📢 Generate PR summaries for Slack/Discord notifications | Team notifications |
| `/commit` | 💬 Create well-formatted conventional commits | Clean commit history |
| `/milestone-pr` | 🏁 Create comprehensive milestone/release PRs | Release management |
| `/pr-review` | 👀 Perform detailed code review checklist | Code quality |
| `/rebase` | 🔀 Interactive rebase with guided conflict resolution | Merge conflicts |

</details>

<details open>
<summary><h3>✨ Code Quality & Refactoring (4 commands)</h3></summary>

| Command | Description | Quick Action |
|---------|-------------|--------------|
| `/refactor-check` | 🔍 Identify code smells and refactoring opportunities | Code health |
| `/dead-code` | 🗑️ Find and remove unused code and dependencies | Clean codebase |
| `/type-safety` | 🛡️ Improve TypeScript type safety and fix errors | Type safety |
| `/naming-review` | 📝 Review and improve naming conventions | Readability |

</details>

<details open>
<summary><h3>🧪 Testing & Quality (4 commands)</h3></summary>

| Command | Description | Quick Action |
|---------|-------------|--------------|
| `/test-generate` | ✅ Generate test cases using TDD principles | Test coverage |
| `/test-coverage` | 📊 Analyze test coverage and identify gaps | Coverage analysis |
| `/e2e-check` | 🔄 Validate end-to-end workflows and integrations | Integration testing |
| `/sanitycheck` | 🔍 Comprehensive pre-commit validation (16 checks) | Pre-commit |

</details>

<details>
<summary><h3>📖 Documentation (3 commands)</h3></summary>

| Command | Description | Quick Action |
|---------|-------------|--------------|
| `/api-docs` | 📚 Generate/update OpenAPI/Swagger documentation | API docs |
| `/readme-update` | 📝 Update README with recent changes and examples | Keep docs fresh |
| `/architecture-doc` | 🏗️ Generate architecture documentation and diagrams | System design |

</details>

<details>
<summary><h3>⚙️ Development Workflows (3 commands)</h3></summary>

| Command | Description | Quick Action |
|---------|-------------|--------------|
| `/setup-validate` | ✅ Validate development environment setup | Onboarding |
| `/dependency-update` | 📦 Update dependencies safely with compatibility checks | Dependency management |
| `/build-fix` | 🔧 Diagnose and fix build errors | Build troubleshooting |

</details>

<details>
<summary><h3>🏗️ Infrastructure/DevOps (4 commands)</h3></summary>

| Command | Description | Quick Action |
|---------|-------------|--------------|
| `/terraform-validate` | ☁️ Validate Terraform configurations and modules | IaC validation |
| `/infra-drift` | 🔍 Detect infrastructure drift and inconsistencies | Drift detection |
| `/docker-optimize` | 🐳 Optimize Dockerfiles for size and security | Container optimization |
| `/env-sync` | 🔄 Sync and validate environment configurations | Config management |

</details>

<details>
<summary><h3>🤖 AI/Agent Specific (3 commands)</h3></summary>

| Command | Description | Quick Action |
|---------|-------------|--------------|
| `/workflow-validate` | ✅ Validate AutoGen YAML workflow specifications | Workflow validation |
| `/mcp-server-scaffold` | 🏗️ Scaffold new MCP server with best practices | MCP development |
| `/agent-debug` | 🐛 Debug agent communication and workflow issues | Agent debugging |

</details>

## 🔍 Spotlight: /sanitycheck

<div align="center">

**The most comprehensive pre-commit validation command**

![Checks](https://img.shields.io/badge/Checks-16-blue?style=flat-square)
![Categories](https://img.shields.io/badge/Categories-8-green?style=flat-square)

</div>

### 16 Comprehensive Checks

<table>
<tr>
<td width="50%">

#### 🧹 Code Quality (1-5)
1. **Console Cleanup** - Remove debug statements
2. **Formatting** - Verify Prettier formatting
3. **Exception/Logging** - Validate error handling
4. **Imports** - Clean up unused imports
5. **Dead Code** - Remove unused code

#### 🔒 Security & Best Practices (6-8)
6. **Security** - Scan vulnerabilities, secrets, XSS
7. **Accessibility** - WCAG compliance checks
8. **Git Workflow** - Check conflicts, secrets

</td>
<td width="50%">

#### ⚡ Build & Dependencies (9-14)
9. **Linting** - ESLint and TypeScript checks
10. **Dependency Audit** - npm audit scan
11. **TODO/FIXME** - Track new comments
12. **Environment Vars** - Verify env handling
13. **Lock File** - Check consistency
14. **Bundle Size** - Monitor bundle impact

#### ✅ Testing & Deployment (15-16)
15. **Tests** - Run test suite
16. **Build** - Verify production build

</td>
</tr>
</table>

### 🚀 Quick Start

```bash
# In any Claude Code session
/sanitycheck
```

### ⚙️ Auto-run Before Commits

Add to your `~/.claude/CLAUDE.md`:

```markdown
## Pre-Commit Requirements

### Sanity Check Before Commits
**ALWAYS** run `/sanitycheck` before creating any git commit.

This applies to:
✓ Direct `git commit` commands
✓ Git MCP tools
✓ Any commit requests

This is mandatory - never skip it.
```

---

## 📝 Creating New Commands

Commands are markdown files with structured instructions for Claude.

### Command Structure

```
command-name.md
├── 📌 Title & Purpose
├── 🎯 Instructions (numbered steps)
├── 🔧 Tools to use
└── 📋 Output format
```

### Template

```markdown
# Command Name

Brief description of what this command does.

## Instructions

1. **Step One**
   - Detailed instruction
   - What to check

2. **Step Two**
   - Another instruction
   - Expected outcome

## Output Format

How results should be presented.
```

### Best Practices

✅ Clear, actionable steps
✅ Numbered instructions
✅ Code blocks with syntax highlighting
✅ Expected outcomes documented
✅ Error handling included

See [`sanitycheck.md`](sanitycheck.md) as a comprehensive example.

---

<div align="center">

[← Back to Main](../README.md) | [View Prompts →](../prompts/) | [See Examples →](../examples/)

</div>
