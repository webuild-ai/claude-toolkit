# GitHub Actions Integration

Example of integrating Claude Toolkit commands with GitHub Actions CI/CD.

## Scenario

Automate code quality checks in CI/CD pipeline using toolkit commands.

## GitHub Actions Workflow

```yaml
# .github/workflows/quality-checks.yml
name: Code Quality Checks

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run Sanity Check
        run: |
          # Install claude-toolkit
          git clone https://github.com/webuild-ai/claude-toolkit.git /tmp/toolkit

          # Run sanitycheck equivalent checks
          npm run lint
          npm test -- --coverage
          npm run build

      - name: Type Check
        run: npx tsc --noEmit

      - name: Security Audit
        run: npm audit --audit-level=high

      - name: Check Bundle Size
        run: |
          npm run build
          SIZE=$(du -sh dist | cut -f1)
          echo "Bundle size: $SIZE"
          # Fail if over 3MB
          if [ $(du -s dist | cut -f1) -gt 3145728 ]; then
            echo "Bundle size exceeds 3MB limit"
            exit 1
          fi

      - name: Dead Code Detection
        run: npx ts-prune

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  terraform-validate:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, 'infra:') || contains(github.event.head_commit.message, 'terraform')
    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Terraform Format Check
        run: terraform fmt -check -recursive

      - name: Terraform Validate
        run: |
          terraform init
          terraform validate

      - name: Security Scan
        run: |
          # Install tfsec
          curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash
          tfsec .

  docker-optimize:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, 'docker') || github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker Image
        run: docker build -t app:test .

      - name: Check Image Size
        run: |
          SIZE=$(docker images app:test --format "{{.Size}}")
          echo "Image size: $SIZE"

      - name: Scan for Vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'app:test'
          severity: 'CRITICAL,HIGH'

  comment-pr:
    runs-on: ubuntu-latest
    needs: [quality-check, terraform-validate, docker-optimize]
    if: github.event_name == 'pull_request'
    steps:
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ All quality checks passed! Ready for review.'
            })
```

## Example Run Output

```
✓ quality-check (2m 34s)
  ✓ Setup Node.js (12s)
  ✓ Install dependencies (45s)
  ✓ Run Sanity Check (1m 15s)
    - Linting: ✅ 0 errors
    - Tests: ✅ 245/245 passed
    - Coverage: ✅ 84%
    - Build: ✅ successful
  ✓ Type Check (8s)
    - TypeScript: ✅ 0 errors
  ✓ Security Audit (5s)
    - Vulnerabilities: ✅ 0 high/critical
  ✓ Check Bundle Size (9s)
    - Bundle: ✅ 2.3 MB (under 3MB limit)

✓ terraform-validate (1m 12s)
  ✓ Format Check: ✅ All files formatted
  ✓ Validate: ✅ Configuration valid
  ✓ Security Scan: ⚠️ 2 medium issues found

✓ docker-optimize (2m 45s)
  ✓ Build: ✅ Image built (180 MB)
  ✓ Vulnerability Scan: ✅ 0 critical/high

✅ comment-pr
  Posted comment to PR #123
```

## Benefits

1. **Automated Quality Gates**: Catches issues before merge
2. **Consistent Checks**: Same checks run for all PRs
3. **Fast Feedback**: Results in < 5 minutes
4. **Cost Effective**: Uses GitHub Actions free tier
5. **Transparent**: Results visible in PR

## Conditional Checks

Run specific checks based on changes:
- Terraform checks only for infrastructure changes
- Docker checks only for Dockerfile changes
- Full suite for all code changes

## Notifications

- PR comments with results
- Slack notifications for failures
- Email alerts for critical issues

## Notes

- Customize timeouts for larger projects
- Cache dependencies to speed up runs
- Use matrix strategy for multiple Node/Python versions
- Consider using reusable workflows for complex projects
