<div align="center">

# 💡 Examples

**Real-world usage examples and workflow patterns**

![Examples](https://img.shields.io/badge/Total-8_Examples-yellow?style=for-the-badge)

</div>

---

## 🎯 Purpose

This directory showcases:

- 📖 **Usage Examples** - How to use specific commands
- 🔄 **Workflows** - Multi-step processes
- 🔗 **Integrations** - Connect with external tools
- ✨ **Best Practices** - Real-world patterns

## 📚 Example Collection

### 🎯 Command Examples (3)

<table>
<tr>
<td width="33%">

#### [`sanitycheck-output.md`](commands/sanitycheck-output.md)
🔍 **Sanity Check Example**

Complete output showing:
- All 16 checks executed
- Pass/fail/warning statuses
- Actionable suggestions
- Final summary

</td>
<td width="33%">

#### [`pr-review-session.md`](commands/pr-review-session.md)
👀 **PR Review Walkthrough**

Full review session:
- Code quality assessment
- Security analysis
- Test coverage check
- Documentation review

</td>
<td width="33%">

#### [`test-generate-example.md`](commands/test-generate-example.md)
✅ **TDD Test Generation**

Test creation process:
- Feature analysis
- Test case design
- Implementation
- Coverage validation

</td>
</tr>
</table>

### 🔄 Workflow Examples (3)

<table>
<tr>
<td width="33%">

#### [`pre-commit-workflow.md`](workflows/pre-commit-workflow.md)
✨ **Pre-Commit Process**

```
Code Changes
    ↓
/sanitycheck (16 checks)
    ↓
Fix Issues
    ↓
/commit
    ↓
Push Changes
```

**Duration:** ~5 minutes
**Commands:** 2-3

</td>
<td width="33%">

#### [`new-feature-workflow.md`](workflows/new-feature-workflow.md)
🚀 **Feature Development**

```
Planning
    ↓
TDD (/test-generate)
    ↓
Implementation
    ↓
Quality Checks
    ↓
PR Creation
```

**Duration:** 1-2 days
**Commands:** 5-8

</td>
<td width="33%">

#### [`release-preparation.md`](workflows/release-preparation.md)
🏁 **Release Workflow**

```
Version Bump
    ↓
Dependencies
    ↓
Testing Suite
    ↓
Documentation
    ↓
Production Deploy
```

**Duration:** 4 hours
**Commands:** 8-12

</td>
</tr>
</table>

### 🔗 Integration Examples (2)

<table>
<tr>
<td width="50%">

#### [`github-actions-integration.md`](integrations/github-actions-integration.md)
⚙️ **CI/CD Integration**

Automate quality checks in GitHub Actions:

- **On PR**: Run sanitycheck equivalent
- **On Push**: Build & test validation
- **On Merge**: Deploy to staging

**Benefits:**
- ✅ Automated quality gates
- ⚡ Fast feedback (< 5 min)
- 💰 Free tier usage
- 📊 Visible results

</td>
<td width="50%">

#### [`slack-notifications.md`](integrations/slack-notifications.md)
💬 **Team Notifications**

Send PR summaries to Slack:

- **Trigger**: New PR created
- **Content**: Stats, changes, links
- **Action**: One-click review

**Benefits:**
- 👥 Team awareness
- 📈 Quick context
- 💬 Thread discussions
- ⚡ Real-time updates

</td>
</tr>
</table>

---

## 🚀 Using Examples

### Navigate by Use Case

<table>
<tr>
<td align="center">

#### 🆕 Getting Started
New to the toolkit?

Start with:
1. [sanitycheck-output.md](commands/sanitycheck-output.md)
2. [pre-commit-workflow.md](workflows/pre-commit-workflow.md)

</td>
<td align="center">

#### 🔧 Development
Building features?

Check out:
1. [new-feature-workflow.md](workflows/new-feature-workflow.md)
2. [test-generate-example.md](commands/test-generate-example.md)

</td>
<td align="center">

#### 🚀 Deployment
Preparing releases?

Review:
1. [release-preparation.md](workflows/release-preparation.md)
2. [github-actions-integration.md](integrations/github-actions-integration.md)

</td>
</tr>
</table>

### Copy & Adapt

Each example is designed to be:
- 📋 **Copy-paste ready** - Use as-is or modify
- 🎯 **Context-aware** - Includes scenarios
- 📚 **Educational** - Explains the why
- ⚡ **Action-oriented** - Shows outcomes

---

## 📖 Example Format

All examples follow this structure:

```markdown
# [Example Name]

## 🎯 Context
What problem or scenario does this address?

## 📋 Scenario Details
- Project type
- Team size
- Timeline
- Constraints

## 🔄 Process
Step-by-step walkthrough with:
- Commands executed
- Decisions made
- Issues encountered
- Solutions applied

## 📊 Results
Measurable outcomes:
- Time saved
- Quality metrics
- Team feedback

## 💡 Key Takeaways
Lessons learned and best practices

## 🔗 Related
- Similar examples
- Relevant commands
- External resources
```

---

## ✏️ Contributing Examples

### What Makes a Good Example?

<table>
<tr>
<td width="50%">

### ✅ Do Include

- **Real scenarios** from actual use
- **Specific metrics** and outcomes
- **Issues encountered** and solutions
- **Screenshots** (when helpful)
- **Timeline** and effort estimates
- **Team context** (size, setup)

</td>
<td width="50%">

### ❌ Avoid

- Overly simplified scenarios
- Vague descriptions
- Missing context
- Sensitive information
- Unrealistic expectations
- Single-step "examples"

</td>
</tr>
</table>

### Example Checklist

- [ ] Clear scenario description
- [ ] Step-by-step process
- [ ] Commands with outputs
- [ ] Measurable results
- [ ] Lessons learned
- [ ] Related resources linked
- [ ] Sensitive data removed

---

## 🌟 Popular Examples

### Most Referenced

| Example | Views | Category | Complexity |
|---------|-------|----------|------------|
| [pre-commit-workflow.md](workflows/pre-commit-workflow.md) | ⭐⭐⭐⭐⭐ | Workflow | Beginner |
| [sanitycheck-output.md](commands/sanitycheck-output.md) | ⭐⭐⭐⭐⭐ | Command | Beginner |
| [github-actions-integration.md](integrations/github-actions-integration.md) | ⭐⭐⭐⭐ | Integration | Intermediate |
| [new-feature-workflow.md](workflows/new-feature-workflow.md) | ⭐⭐⭐⭐ | Workflow | Intermediate |
| [release-preparation.md](workflows/release-preparation.md) | ⭐⭐⭐ | Workflow | Advanced |

---

## 🔗 Related Resources

<table>
<tr>
<td width="33%" align="center">

### 🎯 Commands
[View All Commands →](../commands/)

See what commands are used in examples

</td>
<td width="33%" align="center">

### 📝 Prompts
[Browse Prompts →](../prompts/)

Understand prompts referenced

</td>
<td width="33%" align="center">

### 📋 Schemas
[Check Schemas →](../schemas/)

Validate example outputs

</td>
</tr>
</table>

---

<div align="center">

[← Back to Main](../README.md) | [View Commands →](../commands/) | [Browse Prompts →](../prompts/)

**Made with ❤️ from real-world experience**

</div>
