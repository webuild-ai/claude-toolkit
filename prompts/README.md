<div align="center">

# 📝 Prompts

**Reusable prompt templates and building blocks for Claude workflows**

![Prompts](https://img.shields.io/badge/Total-8_Prompts-orange?style=for-the-badge)

</div>

---

## 🎯 Purpose

Modular prompt components that can be:

- 🔄 **Referenced** by multiple commands
- 🧩 **Composed** together for complex workflows
- ⚙️ **Customized** for specific use cases
- 🤝 **Shared** across Claude Code sessions

## 📂 Prompt Library

### 🔒 Validation Prompts (3)

<table>
<tr>
<td width="33%">

#### [`security-scan.md`](validation/security-scan.md)
🛡️ **Security Scanning**
- OWASP Top 10 checks
- Secret detection
- Vulnerability patterns

</td>
<td width="33%">

#### [`multi-cloud-check.md`](validation/multi-cloud-check.md)
☁️ **Multi-Cloud Validation**
- AWS compatibility
- Azure compatibility
- Cross-cloud patterns

</td>
<td width="33%">

#### [`terraform-best-practices.md`](validation/terraform-best-practices.md)
🏗️ **Terraform Standards**
- Module structure
- State management
- Security hardening

</td>
</tr>
</table>

### 🔍 Analysis Prompts (3)

<table>
<tr>
<td width="33%">

#### [`code-smell-patterns.md`](analysis/code-smell-patterns.md)
👃 **Code Smell Detection**
- Complexity indicators
- Anti-patterns
- Refactoring targets

</td>
<td width="33%">

#### [`performance-bottlenecks.md`](analysis/performance-bottlenecks.md)
⚡ **Performance Analysis**
- Hotspot identification
- Memory patterns
- Optimization opportunities

</td>
<td width="33%">

#### [`docker-optimization.md`](analysis/docker-optimization.md)
🐳 **Docker Optimization**
- Image size reduction
- Layer optimization
- Security hardening

</td>
</tr>
</table>

### ✨ Generation Prompts (2)

<table>
<tr>
<td width="50%">

#### [`test-patterns.md`](generation/test-patterns.md)
🧪 **Test Generation**
- TDD principles
- Test case patterns
- Coverage strategies

</td>
<td width="50%">

#### [`conventional-commits.md`](generation/conventional-commits.md)
💬 **Commit Format**
- Conventional commit spec
- Message templates
- Best practices

</td>
</tr>
</table>

---

## 🚀 Usage

### In Commands

Reference prompts using relative paths:

```markdown
# In a command file
Follow the security scanning guidelines in:
../prompts/validation/security-scan.md
```

### In CLAUDE.md

Include prompt snippets in your global or project-specific CLAUDE.md:

```markdown
## Security Standards

{{include:prompts/validation/security-scan.md}}

## Performance Guidelines

{{include:prompts/analysis/performance-bottlenecks.md}}
```

### Composing Prompts

Combine multiple prompts for comprehensive checks:

```markdown
# In a command
1. Apply security-scan.md checks
2. Apply code-smell-patterns.md analysis
3. Apply terraform-best-practices.md validation
```

---

## ✏️ Creating New Prompts

### Prompt Template

```markdown
# [Prompt Name]

## Purpose
Clear, single-sentence description of what this prompt does.

## Context
When and why to use this prompt.

## Instructions
Step-by-step guidance for applying this prompt.

## Patterns to Check
- Pattern 1
- Pattern 2
- Pattern 3

## Good Examples
✅ Example of correct implementation

## Bad Examples
❌ Example of anti-pattern

## Related Prompts
- [Other related prompts]
```

### Best Practices

| ✅ Do | ❌ Don't |
|------|---------|
| Keep single-purpose | Mix multiple concerns |
| Include examples | Use vague descriptions |
| Make composable | Create dependencies |
| Document inputs/outputs | Assume context |

---

## 🔗 Related Resources

<table>
<tr>
<td width="33%" align="center">

### 🎯 Commands
[View Commands →](../commands/)

Use prompts in commands

</td>
<td width="33%" align="center">

### 💡 Examples
[See Examples →](../examples/)

See prompts in action

</td>
<td width="33%" align="center">

### 📋 Schemas
[View Schemas →](../schemas/)

Validate prompt outputs

</td>
</tr>
</table>

---

<div align="center">

[← Back to Main](../README.md) | [View Commands →](../commands/) | [See Examples →](../examples/)

**Made with ❤️ for modular, reusable prompts**

</div>
