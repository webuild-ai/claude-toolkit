# New Feature Development Workflow

Complete workflow from feature branch to production.

## Scenario

Implementing a new "Export to PDF" feature.

## Phase 1: Planning & Setup

### Create Feature Branch
```bash
git checkout -b feature/pdf-export
```

### Setup Validation
```bash
/setup-validate
```
- Dependencies: ✅ All installed
- Environment: ✅ Variables set
- Database: ✅ Connection successful

## Phase 2: Test-Driven Development

### Generate Tests First
```bash
/test-generate
```
Generate tests for:
- PDF generation service
- Export API endpoint
- File storage handling

### Implement Feature
Write code to make tests pass:
- Install pdf generation library
- Create export service
- Add API endpoint
- Add UI button

### Test Coverage
```bash
/test-coverage
```
Result: 92% coverage for new code ✅

## Phase 3: Code Quality

### Type Safety
```bash
/type-safety
```
Fix 2 type issues in export types ✅

### Refactoring
```bash
/refactor-check
```
No major issues ✅

### Dead Code
```bash
/dead-code
```
Remove unused imports ✅

## Phase 4: Pre-Commit Validation

### Sanity Check
```bash
/sanitycheck
```
Result: 15/16 passed, 1 warning (bundle size increased 200KB)

### Build Check
```bash
/build-fix
```
Build successful ✅

## Phase 5: Commit & PR

### Create Commit
```bash
/commit
```
```
feat: add PDF export functionality

- Implement PDF generation service
- Add export API endpoint
- Add export button to UI
- Include comprehensive tests (18 test cases)

Closes #456
```

### Push and Create PR
```bash
git push origin feature/pdf-export

/milestone-pr
```

PR includes:
- Feature description
- Testing checklist
- Screenshots
- Documentation updates

## Phase 6: Code Review

### PR Review
```bash
/pr-review
```

Reviewer feedback:
- ✅ Code quality good
- ⚠️ Consider adding export format options (future enhancement)
- ✅ Tests comprehensive
- ✅ Security validated

Approved ✅

## Phase 7: Merge & Deploy

### Merge to Main
```bash
git checkout main
git merge feature/pdf-export
git push origin main
```

### CI/CD Pipeline
1. Tests run ✅
2. Build succeeds ✅
3. Deploy to staging ✅
4. E2E tests on staging ✅
5. Deploy to production ✅

### Post-Deployment
- Monitor error rates ✅
- Check performance ✅
- Verify feature works ✅

## Summary

**Timeline**:
- Development: 1 day
- Testing: 2 hours
- Review: 1 hour
- Deployment: 30 min
- Total: ~1.5 days

**Quality Metrics**:
- Test coverage: 92%
- Type safety: 100%
- No security issues
- Build successful
- Zero production errors

**Result**: ✅ Feature successfully deployed
