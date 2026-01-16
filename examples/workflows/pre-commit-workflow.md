# Pre-Commit Workflow Example

Complete workflow for validating code before committing using multiple commands.

## Scenario

Developer has completed a feature and wants to ensure code quality before committing and creating a PR.

## Workflow Steps

### Step 1: Sanity Check

```bash
/sanitycheck
```

**Result**: ✅ All checks passed (14/14), 2 warnings

Warnings:
- 3 new TODO comments (acceptable)
- 1 npm package has minor update available (non-blocking)

### Step 2: Run Tests and Check Coverage

```bash
/test-coverage
```

**Result**: ⚠️ Coverage at 78% (target: 80%)

**Gap Identified**:
- `src/api/webhooks.ts` - New webhook handler has no tests

**Action**: Generate tests for webhook handler

```bash
/test-generate src/api/webhooks.ts
```

**Generated**: 12 test cases for webhook validation, processing, and error handling

**Re-run coverage**:
```bash
npm test -- --coverage
```

**New Result**: ✅ Coverage now at 84%

### Step 3: Code Quality Review

```bash
/refactor-check
```

**Result**: ⚠️ Found 2 refactoring opportunities

1. **Long method in payment processor** (120 lines)
   - Suggestion: Extract payment validation logic

2. **Duplicate code in API handlers** (3 occurrences)
   - Suggestion: Create shared middleware for auth checks

**Decision**: Address in follow-up PR (current PR focused on webhook feature)

### Step 4: Type Safety Check

```bash
/type-safety
```

**Result**: ⚠️ 3 type issues found

Issues:
1. Implicit any in webhook payload
2. Missing null check in user lookup
3. Unsafe type assertion in response handler

**Action**: Fix all type issues

```bash
# Fixed issues
git add src/api/webhooks.ts src/services/users.ts
```

**Re-run**: ✅ All type checks pass

### Step 5: Dead Code Removal

```bash
/dead-code
```

**Result**: ✅ No dead code found

### Step 6: Security Scan

Use security prompt:
```bash
# Check for security issues
bandit -r src/
npm audit
```

**Result**: ✅ No vulnerabilities found

### Step 7: Build Verification

```bash
/build-fix
```

**Result**: ✅ Build successful

```bash
# Build output
✓ TypeScript compilation: 0 errors
✓ Bundle size: 2.4 MB (within limit)
✓ Build time: 28s
```

### Step 8: Create Commit

```bash
/commit
```

**Generated commit**:
```bash
git add .
git commit -m "$(cat <<'EOF'
feat: add Stripe webhook handler

Implement webhook endpoint for payment events:
- Validate webhook signatures
- Process payment.succeeded events
- Handle payment.failed events
- Add comprehensive tests (12 test cases)
- Fix type safety issues in related code

Coverage increased from 78% to 84%

Closes #234
EOF
)"
```

### Step 9: PR Summary

```bash
/summarise-for-pr
```

**Output**:
```
[NEW PR] - feat: Add Stripe webhook handler

Commits: 1
Files changed: 8
Insertions: +320 / Deletions: -12
```

### Step 10: Final Sanity Check

```bash
/sanitycheck
```

**Result**: ✅ READY TO COMMIT

**Final Status**:
- All checks passed
- Test coverage: 84% (above 80% target)
- No type errors
- No security issues
- Build successful

## Complete Workflow Summary

### Time Breakdown
1. Initial sanitycheck: 2 min
2. Test generation: 5 min
3. Fix type issues: 3 min
4. Final checks: 2 min
**Total**: ~12 minutes

### Issues Found and Fixed
- ❌ → ✅ Test coverage gap (generated 12 tests)
- ❌ → ✅ 3 type safety issues
- ⚠️ 2 refactoring opportunities (deferred to follow-up)

### Final State
- ✅ All automated checks passed
- ✅ Test coverage above target
- ✅ No security vulnerabilities
- ✅ Type-safe code
- ✅ Build successful
- ✅ Ready for code review

## Push and Create PR

```bash
git push origin feature/stripe-webhooks

gh pr create --title "feat: Add Stripe webhook handler" --body "$(cat <<'EOF'
## Summary

Implements webhook endpoint for processing Stripe payment events with comprehensive validation and error handling.

## Changes
- Add webhook signature validation
- Process payment success/failure events
- Add 12 test cases (84% coverage)
- Fix type safety issues

## Testing
- Unit tests: 12/12 passing
- Integration tests: Manual testing with Stripe CLI
- Security: Webhook signature validation

## Checklist
- [x] Tests added
- [x] Types updated
- [x] Security validated
- [x] Documentation updated

Closes #234
EOF
)"
```

## Best Practices Demonstrated

1. **Incremental validation**: Check different aspects separately
2. **Fix as you go**: Address issues immediately
3. **Test coverage**: Ensure adequate testing
4. **Type safety**: Catch errors at compile time
5. **Security**: Validate for vulnerabilities
6. **Documentation**: Clear commit messages and PR descriptions

## Notes

- Total workflow time: ~15 minutes (including fixes)
- Found and fixed 5 issues before committing
- Code quality significantly improved
- Ready for team review with confidence
