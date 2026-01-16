# Command Reference

Complete reference for all 25 commands, 8 prompts, 10 schemas, and 8 examples.

## Table of Contents

- [Commands by Category](#commands-by-category)
  - [Git & PR Workflows](#git--pr-workflows)
  - [Code Quality & Refactoring](#code-quality--refactoring)
  - [Testing & Quality](#testing--quality)
  - [Documentation](#documentation)
  - [Development Workflows](#development-workflows)
  - [Infrastructure/DevOps](#infrastructuredevops)
  - [AI/Agent Specific](#aiagent-specific)
- [Prompts](#prompts)
- [Schemas](#schemas)
- [Examples](#examples)

---

## Commands by Category

### Git & PR Workflows

#### `/summarise-for-pr`
Generate PR summaries for Slack/Discord notifications.

**Use Case**: Team notifications
**When to Use**: Creating PRs, posting to team channels
**What It Does**:
- Calculates commit count, files changed, lines added/removed
- Excludes lock files from statistics
- Generates formatted summary for messaging platforms

**Example Output**:
```
New PR: feat: Add authentication system
Commits: 12 | Files: 18 | +420 / -85
Author: @developer
```

---

#### `/commit`
Create well-formatted conventional commits.

**Use Case**: Clean commit history
**When to Use**: Before every git commit
**What It Does**:
- Reviews staged changes
- Suggests commit type (feat, fix, docs, etc.)
- Generates conventional commit message
- Uses HEREDOC format for multi-line messages

**Commit Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code restructuring
- `test` - Test changes
- `chore` - Maintenance

**Example**:
```bash
feat: add user authentication

Implement JWT-based authentication:
- Add token validation middleware
- Create user session management
- Add authorization decorators
```

---

#### `/milestone-pr`
Create comprehensive milestone/release PRs.

**Use Case**: Release management
**When to Use**: Preparing major releases
**What It Does**:
- Aggregates all changes since last release
- Groups commits by type
- Generates detailed changelog
- Creates testing checklist

---

#### `/pr-review`
Perform detailed code review checklist.

**Use Case**: Code quality assurance
**When to Use**: Reviewing pull requests
**Review Areas**:
1. Code quality & structure
2. Security vulnerabilities
3. Performance implications
4. Test coverage
5. Documentation completeness

---

#### `/rebase`
Interactive rebase with guided conflict resolution.

**Use Case**: Merge conflict resolution
**When to Use**: Rebasing feature branches
**What It Does**:
- Guides through rebase process
- Explains "ours" vs "theirs" in rebase context
- Uses AskUserQuestion for conflict resolution
- Provides three resolution options per conflict

**Conflict Options**:
- **Accept Ours** - Keep target branch version
- **Accept Theirs** - Keep your changes
- **Accept Both** - Manually merge both versions

---

### Code Quality & Refactoring

#### `/refactor-check`
Identify code smells and refactoring opportunities.

**Use Case**: Code health maintenance
**Checks For**:
- Long functions/methods (> 50 lines)
- High cyclomatic complexity
- Duplicated code blocks
- God objects/classes
- Inappropriate intimacy between classes

---

#### `/dead-code`
Find and remove unused code and dependencies.

**Use Case**: Codebase cleanup
**What It Finds**:
- Unused imports
- Unreferenced functions/variables
- Unused npm packages
- Dead code branches

---

#### `/type-safety`
Improve TypeScript type safety and fix errors.

**Use Case**: Type safety improvements
**What It Does**:
- Runs TypeScript compiler checks
- Identifies `any` types that should be specific
- Suggests proper type definitions
- Fixes common type errors

---

#### `/naming-review`
Review and improve naming conventions.

**Use Case**: Code readability
**Checks**:
- Variable naming consistency
- Function naming clarity
- Class/interface naming conventions
- Constant naming (UPPER_CASE)

---

### Testing & Quality

#### `/test-generate`
Generate test cases using TDD principles.

**Use Case**: Test creation
**What It Does**:
- Analyzes code to test
- Generates test cases for happy paths
- Adds edge case tests
- Creates mock/stub examples

---

#### `/test-coverage`
Analyze test coverage and identify gaps.

**Use Case**: Coverage analysis
**Reports On**:
- Line coverage percentage
- Branch coverage
- Function coverage
- Uncovered code sections

---

#### `/e2e-check`
Validate end-to-end workflows.

**Use Case**: Integration testing
**Validates**:
- User workflows
- API integrations
- Database connections
- External service dependencies

---

#### `/sanitycheck`
Comprehensive pre-commit validation (16 checks).

**Use Case**: Pre-commit validation
**16 Checks**:
1. Console Cleanup - Remove debug statements
2. Formatting - Verify Prettier
3. Exception/Logging - Validate error handling
4. Imports - Clean unused imports
5. Dead Code - Remove unused code
6. Security - Scan vulnerabilities, secrets
7. Accessibility - WCAG compliance
8. Git Workflow - Check conflicts, secrets
9. Linting - ESLint/TypeScript
10. Dependency Audit - npm audit
11. TODO/FIXME - Track new comments
12. Environment Vars - Verify handling
13. Lock File - Consistency check
14. Bundle Size - Monitor impact
15. Tests - Run test suite
16. Build - Verify production build

**Output Format**:
```
✅ READY TO COMMIT (16/16 checks passed)

Summary:
- 12 checks passed
- 3 checks with warnings (non-blocking)
- 1 check skipped (not applicable)
- 0 checks failed
```

---

### Documentation

#### `/api-docs`
Generate/update OpenAPI/Swagger documentation.

**Use Case**: API documentation
**What It Does**:
- Scans API routes
- Generates OpenAPI 3.0 spec
- Documents request/response schemas
- Adds example requests

---

#### `/readme-update`
Update README with recent changes.

**Use Case**: Keep docs fresh
**Updates**:
- Recent changes section
- Feature list
- Installation instructions
- Usage examples

---

#### `/architecture-doc`
Generate architecture documentation.

**Use Case**: System design documentation
**Creates**:
- System architecture diagrams
- Component relationships
- Data flow documentation
- Technology stack overview

---

### Development Workflows

#### `/setup-validate`
Validate development environment setup.

**Use Case**: Onboarding/troubleshooting
**Validates**:
- Required dependencies installed
- Environment variables set
- Configuration files present
- Database connections working

---

#### `/dependency-update`
Update dependencies safely.

**Use Case**: Dependency management
**What It Does**:
- Checks for outdated packages
- Reviews breaking changes
- Tests after updates
- Generates update summary

---

#### `/build-fix`
Diagnose and fix build errors.

**Use Case**: Build troubleshooting
**Checks**:
- Compilation errors
- Missing dependencies
- Configuration issues
- Path resolution problems

---

### Infrastructure/DevOps

#### `/terraform-validate`
Validate Terraform configurations.

**Use Case**: IaC validation
**Validates**:
- Syntax correctness
- Module usage
- Resource naming
- Security best practices

---

#### `/infra-drift`
Detect infrastructure drift.

**Use Case**: Drift detection
**Compares**:
- Terraform state vs actual resources
- Configuration vs deployed state
- Identifies manual changes

---

#### `/docker-optimize`
Optimize Dockerfiles.

**Use Case**: Container optimization
**Optimizes**:
- Layer caching
- Image size reduction
- Security hardening
- Multi-stage builds

---

#### `/env-sync`
Sync and validate environment configurations.

**Use Case**: Config management
**Validates**:
- .env files across environments
- Required variables present
- No duplicate keys
- Sensitive data handling

---

### AI/Agent Specific

#### `/workflow-validate`
Validate AutoGen YAML workflows.

**Use Case**: Workflow validation
**Checks**:
- YAML syntax
- Agent definitions
- Task dependencies
- Communication patterns

---

#### `/mcp-server-scaffold`
Scaffold new MCP server.

**Use Case**: MCP development
**Creates**:
- Server boilerplate
- Tool definitions
- Resource handlers
- Example prompts

---

#### `/agent-debug`
Debug agent communication.

**Use Case**: Agent debugging
**Debugs**:
- Message passing
- State transitions
- Error handling
- Performance issues

---

## Prompts

Reusable prompt templates for common patterns.

### Validation Prompts

#### `security-scan.md`
OWASP Top 10 security checks, secret detection, vulnerability patterns.

#### `multi-cloud-check.md`
AWS and Azure compatibility validation, cross-cloud patterns.

#### `terraform-best-practices.md`
Module structure, state management, security hardening.

### Analysis Prompts

#### `code-smell-patterns.md`
Complexity indicators, anti-patterns, refactoring targets.

#### `performance-bottlenecks.md`
Hotspot identification, memory patterns, optimization opportunities.

#### `docker-optimization.md`
Image size reduction, layer optimization, security hardening.

### Generation Prompts

#### `test-patterns.md`
TDD principles, test case patterns, coverage strategies.

#### `conventional-commits.md`
Conventional commit spec, message templates, best practices.

---

## Schemas

JSON Schema Draft-07 definitions for validation.

### Command Schemas
- `sanitycheck-result.schema.json` - Sanity check output format
- `pr-review-result.schema.json` - PR review results
- `test-coverage-report.schema.json` - Coverage data
- `terraform-validation.schema.json` - Terraform validation results

### Validation Schemas
- `workflow-spec.schema.json` - AutoGen workflow structure
- `env-config.schema.json` - Environment configuration
- `dockerfile.schema.json` - Dockerfile structure

### Config Schemas
- `command-config.schema.json` - Command configuration
- `multi-tenant.schema.json` - Multi-tenant setup

### Output Schemas
- `check-result.schema.json` - Generic check result format

---

## Examples

Real-world usage examples and workflows.

### Command Examples
- **sanitycheck-output.md** - Complete sanitycheck run output
- **pr-review-session.md** - Full PR review walkthrough
- **test-generate-example.md** - TDD test generation process

### Workflow Examples
- **pre-commit-workflow.md** - Pre-commit validation process (~5 min)
- **new-feature-workflow.md** - Feature development (1-2 days)
- **release-preparation.md** - Release workflow (4 hours)

### Integration Examples
- **github-actions-integration.md** - CI/CD automation
- **slack-notifications.md** - Team notification setup

---

## Quick Reference

### Most Used Commands
1. `/sanitycheck` - Pre-commit validation
2. `/commit` - Create commits
3. `/test-coverage` - Check test coverage
4. `/pr-review` - Review PRs
5. `/build-fix` - Fix build issues

### Command Patterns
```bash
# Install commands
make install
make install-cmd CMD=sanitycheck

# Use commands in Claude Code
/sanitycheck
/commit
/test-coverage

# Check installation
make check
make list
```

---

**[← Back to Home](Home) | [Tutorials & Guides →](Tutorials-and-Guides) | [FAQ →](FAQ-and-Troubleshooting)**
