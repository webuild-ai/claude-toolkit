# Tutorials & Guides

Step-by-step tutorials and practical guides for using Claude Toolkit effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Essential Workflows](#essential-workflows)
  - [Pre-Commit Workflow](#pre-commit-workflow)
  - [Feature Development](#feature-development)
  - [Code Review Process](#code-review-process)
- [Advanced Workflows](#advanced-workflows)
  - [Release Preparation](#release-preparation)
  - [Infrastructure Changes](#infrastructure-changes)
- [Creating Custom Content](#creating-custom-content)
  - [Creating Commands](#creating-commands)
  - [Creating Prompts](#creating-prompts)
  - [Creating Schemas](#creating-schemas)
- [Integration Guides](#integration-guides)
  - [GitHub Actions](#github-actions)
  - [Slack Notifications](#slack-notifications)
- [Best Practices](#best-practices)

---

## Getting Started

### First Time Setup

**1. Clone and Install**
```bash
# Clone the repository
git clone https://github.com/webuild-ai/claude-toolkit.git
cd claude-toolkit

# Install all commands
make install
```

**2. Verify Installation**
```bash
# Check what's installed
make check

# List available commands
make list
```

**3. Try Your First Command**
Start a Claude Code session and try:
```
/sanitycheck
```

**4. Configure Auto-run (Optional)**
Add to `~/.claude/CLAUDE.md`:
```markdown
## Pre-Commit Requirements
**ALWAYS** run `/sanitycheck` before creating any git commit.
```

---

## Essential Workflows

### Pre-Commit Workflow

**Duration**: ~5 minutes
**Goal**: Ensure code quality before committing

**Step 1: Make Code Changes**
Edit your code as needed.

**Step 2: Run Sanity Check**
```
/sanitycheck
```

**What It Checks** (16 items):
- Code quality (console logs, formatting, imports, dead code)
- Security (vulnerabilities, secrets, XSS risks)
- Build & dependencies (linting, npm audit, lock files, bundle size)
- Testing & deployment (tests, production build)

**Step 3: Fix Any Issues**
If checks fail:
```
❌ ISSUES FOUND (14/16 checks passed, 2 failed)

Failed Checks:
- Security: Found 2 console.log statements
- Tests: 3 test failures

Suggestions:
1. Remove console.log from src/auth.ts:42 and src/api.ts:18
2. Fix failing tests in tests/auth.test.ts
```

**Step 4: Re-run After Fixes**
```
/sanitycheck
```

**Step 5: Create Commit**
Once all checks pass:
```
/commit
```

Claude will:
- Review your changes
- Suggest commit type
- Draft commit message
- Create the commit

**Step 6: Push Changes**
```bash
git push
```

**Complete Example**:
```bash
# 1. Make changes
vim src/auth.ts

# 2. In Claude Code session
/sanitycheck   # ✅ All checks pass

# 3. Create commit
/commit        # Creates: "feat: add JWT authentication"

# 4. Push
git push
```

---

### Feature Development

**Duration**: 1-2 days
**Goal**: Implement a new feature following TDD

**Phase 1: Planning**

**Step 1: Validate Environment**
```
/setup-validate
```

Checks:
- Dependencies installed
- Environment variables set
- Database connections working

**Step 2: Create Feature Branch**
```bash
git checkout -b feature/user-notifications
```

**Phase 2: Test-Driven Development**

**Step 3: Generate Tests First**
```
/test-generate
```

Describe your feature:
> "User notification system with email and push notifications, including preferences and scheduling"

Claude generates:
- Unit tests for notification service
- Integration tests for delivery
- Mock examples

**Step 4: Implement Feature**
Write code to make tests pass.

**Step 5: Check Coverage**
```
/test-coverage
```

```
Coverage Report:
- Lines: 92%
- Branches: 87%
- Functions: 95%

Uncovered:
- src/notifications/scheduler.ts: lines 45-52 (error handling)
```

**Phase 3: Code Quality**

**Step 6: Type Safety Check**
```
/type-safety
```

Fixes any TypeScript issues.

**Step 7: Refactoring Check**
```
/refactor-check
```

Identifies:
- Long functions
- Code duplication
- Complexity issues

**Step 8: Dead Code Removal**
```
/dead-code
```

**Phase 4: Pre-Commit**

**Step 9: Run Sanity Check**
```
/sanitycheck
```

**Step 10: Create Commit**
```
/commit
```

```
feat: add user notification system

Implement comprehensive notification system:
- Email and push notification support
- User preference management
- Notification scheduling
- Delivery tracking
- 18 test cases added (92% coverage)

Closes #123
```

**Phase 5: PR Creation**

**Step 11: Push and Create PR**
```bash
git push -u origin feature/user-notifications
```

```
/milestone-pr
```

Claude creates PR with:
- Feature description
- Testing checklist
- Screenshots (if UI)
- Documentation updates

---

### Code Review Process

**Duration**: 30-60 minutes
**Goal**: Thoroughly review a pull request

**Step 1: Checkout PR**
```bash
gh pr checkout 456
```

**Step 2: Run PR Review**
```
/pr-review
```

**Review Areas**:

1. **Code Quality**
   - Structure and organization
   - Naming conventions
   - Code duplication

2. **Security**
   - SQL injection risks
   - XSS vulnerabilities
   - Exposed secrets
   - Authentication/authorization

3. **Performance**
   - N+1 queries
   - Unnecessary loops
   - Memory leaks

4. **Testing**
   - Test coverage adequate?
   - Edge cases covered?
   - Integration tests present?

5. **Documentation**
   - README updated?
   - API docs current?
   - Comments where needed?

**Step 3: Check Test Coverage**
```
/test-coverage
```

**Step 4: Leave Review Comments**
Based on findings, add comments in GitHub.

**Step 5: Approve or Request Changes**
```bash
# If approved
gh pr review --approve -b "LGTM! Great work on the test coverage."

# If changes needed
gh pr review --request-changes -b "Please address the security concerns mentioned."
```

---

## Advanced Workflows

### Release Preparation

**Duration**: 4 hours
**Goal**: Prepare v2.1.0 for production

**Step 1: Update Version & Changelog**
```bash
# Update package.json
npm version 2.1.0

# Update CHANGELOG.md
```

**Step 2: Update Dependencies**
```
/dependency-update
```

**Step 3: Full Test Suite**
```
/test-coverage
/e2e-check
```

**Step 4: Build Validation**
```
/build-fix
npm run build:production
```

**Step 5: Update Documentation**
```
/readme-update
/api-docs
```

**Step 6: Create Release Branch**
```bash
git checkout -b release/v2.1.0
```

**Step 7: Final Sanity Check**
```
/sanitycheck
```

**Step 8: Create Release PR**
```
/milestone-pr
```

**Step 9: Deploy to Staging**
After PR approval:
```bash
git merge release/v2.1.0
# CI/CD deploys to staging
```

**Step 10: Staging Validation**
- Run smoke tests
- Check performance
- Verify new features

**Step 11: Production Deployment**
```bash
git tag v2.1.0
git push origin v2.1.0
# CI/CD deploys to production
```

**Step 12: Monitor**
Watch error rates, performance metrics, user feedback.

---

### Infrastructure Changes

**Duration**: 2-3 hours
**Goal**: Deploy Terraform changes safely

**Step 1: Validate Terraform**
```
/terraform-validate
```

Checks:
- Syntax correctness
- Module usage
- Security issues
- Best practices

**Step 2: Check for Drift**
```
/infra-drift
```

Identifies manual changes that differ from Terraform state.

**Step 3: Plan Changes**
```bash
terraform plan -out=tfplan
```

Review the plan carefully.

**Step 4: Optimize Docker Images** (if applicable)
```
/docker-optimize
```

**Step 5: Validate Environment Config**
```
/env-sync
```

**Step 6: Apply Changes**
```bash
terraform apply tfplan
```

**Step 7: Verify Deployment**
Check that infrastructure changes are working as expected.

---

## Creating Custom Content

### Creating Commands

**Command Structure**:
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

**Example: Create `/api-test` Command**

**1. Create File**
```bash
cd commands
touch api-test.md
```

**2. Write Content**
```markdown
# API Test

Test all API endpoints for correctness and performance.

## Instructions

### 1. Discover Endpoints

Scan the codebase for API route definitions:
- FastAPI routes in Python
- Express routes in TypeScript
- Look for @app.get, @app.post, router.get, etc.

### 2. Generate Test Cases

For each endpoint:
- Test successful requests (200 responses)
- Test validation errors (400 responses)
- Test authentication (401/403 responses)
- Test not found (404 responses)

### 3. Performance Testing

Run basic load tests:
- 100 requests per endpoint
- Measure average response time
- Identify slow endpoints (> 500ms)

### 4. Security Testing

Check for:
- SQL injection vulnerabilities
- XSS risks in responses
- Authentication bypass attempts

## Output Format

\```
API Test Results:
- Total Endpoints: 24
- Tests Passed: 96/100
- Failed Tests: 4
- Average Response Time: 145ms

Failed Tests:
- POST /api/users (validation error handling)
- GET /api/reports/:id (performance > 1s)
\```
```

**3. Install Command**
```bash
make install-cmd CMD=api-test
```

**4. Test Command**
```
/api-test
```

---

### Creating Prompts

Prompts are reusable templates that commands can reference.

**Prompt Structure**:
```markdown
# [Prompt Name]

## Purpose
What this prompt does.

## Context
When to use it.

## Instructions
Step-by-step guidance.

## Patterns to Check
- Pattern 1
- Pattern 2

## Good Examples
✅ Correct implementation

## Bad Examples
❌ Anti-pattern
```

**Example: Create Database Query Optimization Prompt**

**1. Create File**
```bash
mkdir -p prompts/analysis
touch prompts/analysis/database-optimization.md
```

**2. Write Content**
```markdown
# Database Query Optimization

## Purpose
Identify and fix inefficient database queries that cause performance issues.

## Context
Use when experiencing slow API responses or high database CPU usage.

## Instructions

### 1. Identify N+1 Queries
Look for patterns where a query is executed inside a loop.

### 2. Check for Missing Indexes
Find queries on non-indexed columns.

### 3. Review JOIN Operations
Check for unnecessary JOINs or missing FOREIGN KEY indexes.

### 4. Analyze Query Complexity
Identify queries with:
- Subqueries that could be JOINs
- Multiple OR conditions
- Functions in WHERE clauses

## Patterns to Check

### N+1 Query Pattern (Bad)
```python
users = db.query(User).all()
for user in users:
    posts = db.query(Post).filter(Post.user_id == user.id).all()
```

### Optimized Version (Good)
```python
users = db.query(User).options(joinedload(User.posts)).all()
```

## Good Examples

✅ Using database indexes:
```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

✅ Batch loading:
```python
user_ids = [1, 2, 3, 4, 5]
posts = db.query(Post).filter(Post.user_id.in_(user_ids)).all()
```

## Bad Examples

❌ Function in WHERE clause:
```sql
SELECT * FROM users WHERE LOWER(email) = 'test@example.com';
```

❌ SELECT * with large tables:
```sql
SELECT * FROM posts;  -- Bad: retrieves all columns
```
```

**3. Reference in Commands**
Commands can now reference this prompt:
```markdown
## Instructions
1. Apply the database optimization patterns from ../prompts/analysis/database-optimization.md
```

---

### Creating Schemas

Schemas validate command outputs and configurations.

**Schema Structure**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://github.com/webuild-ai/claude-toolkit/schemas/my-schema.v1.json",
  "title": "My Schema",
  "description": "Description",
  "type": "object",
  "properties": {
    "field": {
      "type": "string",
      "description": "Field description"
    }
  },
  "required": ["field"]
}
```

---

## Integration Guides

### GitHub Actions

**Automate Quality Checks in CI/CD**

**1. Create Workflow File**
```bash
mkdir -p .github/workflows
touch .github/workflows/quality-checks.yml
```

**2. Add Workflow**
```yaml
name: Code Quality Checks

on:
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm ci

      - name: Run Linting
        run: npm run lint

      - name: Run Tests
        run: npm test -- --coverage

      - name: Check Bundle Size
        run: |
          npm run build
          SIZE=$(du -sh dist | cut -f1)
          echo "Bundle size: $SIZE"
```

**3. Commit and Push**
```bash
git add .github/workflows/quality-checks.yml
git commit -m "ci: add quality checks workflow"
git push
```

---

### Slack Notifications

**Send PR Summaries to Slack**

**1. Create Slack Webhook**
- Go to https://api.slack.com/apps
- Create app and enable Incoming Webhooks
- Copy webhook URL

**2. Add GitHub Secret**
```bash
gh secret set SLACK_WEBHOOK_URL
# Paste webhook URL
```

**3. Create Workflow**
```yaml
name: PR Slack Notification

on:
  pull_request:
    types: [opened]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Send to Slack
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          curl -X POST $SLACK_WEBHOOK_URL \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "New PR: ${{ github.event.pull_request.title }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*<${{ github.event.pull_request.html_url }}|${{ github.event.pull_request.title }}>*\nAuthor: ${{ github.event.pull_request.user.login }}"
                  }
                }
              ]
            }'
```

---

## Best Practices

### Command Usage

**✅ Do**:
- Run `/sanitycheck` before every commit
- Use `/test-coverage` to maintain coverage
- Run `/pr-review` on all pull requests
- Update documentation with `/readme-update`

**❌ Don't**:
- Skip sanity checks to save time
- Commit without reviewing changes
- Merge PRs without code review
- Ignore test failures

### Workflow Organization

**✅ Do**:
- Follow consistent Git workflow
- Create feature branches for new work
- Keep commits focused and atomic
- Write descriptive commit messages

**❌ Don't**:
- Commit directly to main
- Mix unrelated changes in one commit
- Use vague commit messages
- Leave broken code in commits

### Code Quality

**✅ Do**:
- Write tests first (TDD)
- Refactor regularly
- Remove dead code promptly
- Keep functions small and focused

**❌ Don't**:
- Skip writing tests
- Accumulate technical debt
- Leave commented-out code
- Create God objects/functions

---

**[← Back to Home](Home) | [← Command Reference](Command-Reference) | [FAQ →](FAQ-and-Troubleshooting)**
