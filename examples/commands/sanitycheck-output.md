# Sanitycheck Command Output Example

Example output from running `/sanitycheck` before committing code.

## Scenario

User has made changes to authentication system and wants to commit. They run `/sanitycheck` to validate everything before committing.

## Command

```
/sanitycheck
```

## Output

```markdown
# Sanity Check Results

## 1. Console Cleanup ✅ PASS
No debug console statements found

## 2. Formatting ✅ PASS
All files properly formatted (Prettier)

## 3. Exception/Logging ✅ PASS
Error handling implemented correctly
- Try/catch blocks have meaningful error messages
- No silent error swallowing

## 4. Imports ✅ PASS
All imports used, no duplicates

## 5. Dead Code ✅ PASS
No unused variables or functions detected

## 6. Security ⚠️ WARNING
Found 1 potential issue:
- auth/login.py:45 - Consider rate limiting login attempts

## 7. Accessibility ✅ PASS
All form inputs have labels
ARIA attributes properly used

## 8. Git Workflow ✅ PASS
No merge conflicts
No secrets in commits
Branch naming follows convention

## 9. Linting ✅ PASS
ESLint: 0 errors, 0 warnings
TypeScript: No type errors

## 10. Dependency Audit ✅ PASS
npm audit: 0 vulnerabilities

## 11. TODO/FIXME ⚠️ WARNING
2 new TODO comments added:
- src/auth/mfa.ts:67 - TODO: Implement backup codes
- src/api/users.ts:102 - FIXME: Optimize database query

## 12. Environment Vars ✅ PASS
All required environment variables set
- API_KEY: ✓
- DATABASE_URL: ✓
- SECRET_KEY: ✓

## 13. Lock File ✅ PASS
package-lock.json in sync with package.json

## 14. Bundle Size ✅ PASS
Bundle size: 2.3 MB (within limit of 3 MB)
Change: +12 KB

## 15. Tests ✅ PASS
Test suite: 127/127 passing
Coverage: 84% (target: 80%)

## 16. Build ✅ PASS
Production build successful
Build time: 34s

---

## Summary

✅ **READY TO COMMIT**

- **Passed**: 14 checks
- **Warnings**: 2 (should address)
- **Failed**: 0

### Warnings to Address:
1. Consider adding rate limiting to login endpoint
2. Review new TODO/FIXME comments

### Recommendation:
Code is ready to commit. Consider addressing warnings in follow-up commits.

**Next steps:**
```bash
git add .
git commit -m "feat: add MFA support to authentication

- Implement two-factor authentication
- Add backup codes (TODO for next PR)
- Update user model with MFA fields
- Add tests for MFA flow"
```
```

## Analysis

This successful check shows:
- Most checks passed (14/16)
- 2 warnings identified (non-blocking)
- Specific actionable feedback
- Clear next steps provided
- Ready to commit safely
