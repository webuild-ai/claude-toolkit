# Sanity Check - Pre-Commit Validation

Perform a comprehensive sanity check before committing code. Run through each section systematically and report findings.

## Instructions

Execute the following checks in order. For each section, report issues found and fix them when possible.

### 1. Console Statement Cleanup

Scan changed files for debug statements that should be removed:
- `console.log()` statements (unless intentionally kept for production logging)
- `console.debug()` statements
- `console.warn()` used for debugging (not actual warnings)
- `debugger` statements
- Commented-out console statements that should be fully removed

### 2. Formatting Check

Verify code formatting is consistent:
```bash
zsh -i -c "npm run format"
```

Check for formatting issues:
- Inconsistent indentation
- Missing or extra whitespace
- Line length violations
- Trailing whitespace

**Post-Formatting Verification (High Priority):**
After running the formatter, verify no new changes were introduced:
```bash
git status --short
```
- If the formatter modified any files, those changes MUST be staged before continuing
- Common formatting changes include: trailing whitespace removal, line ending normalization, indent fixes
- Do NOT proceed with sanitycheck if formatter introduced unstaged changes
- Stage formatting changes immediately: `git add <modified-files>`

### 3. Exception and Logging Review

Review recent changes for proper exception handling and logging:
- Ensure all try/catch blocks have meaningful error handling (not empty catches)
- Verify errors are logged with appropriate context (file, function, relevant data)
- Check that sensitive data is not logged (passwords, tokens, PII)
- Ensure error messages are descriptive and actionable
- Verify logging levels are appropriate (error vs warn vs info vs debug)

**Clear-text Logging of Sensitive Information (High Priority):**
- Trace data flow from sensitive sources (Pydantic Settings models, config classes, auth objects) through exception handlers
- Check if exception messages could expose sensitive field values when caught and logged
- Look for patterns like `except Exception as e: print(f"...{e}")` or `logger.error(f"...{e}")` where `e` may contain sensitive config
- Identify Settings/Config classes with sensitive fields (password, secret, token, key, credential) and ensure their string representations don't expose values
- Check if `__repr__` or `__str__` methods of config objects could leak secrets when logged in exceptions

**Log Injection Prevention (High Priority):**
- Detect user-controlled input being logged without sanitization
- Look for log statements containing: request parameters, URL paths, headers, form data, query strings, tool names, user IDs
- Ensure user-provided values are sanitized before logging by removing/escaping: `\r`, `\n`, and other control characters
- Check for patterns like `logger.info(f"...{user_input}...")` without prior sanitization
- Recommend sanitization pattern: `safe_value = str(value).replace("\r", "").replace("\n", "")`

### 4. Import Review

Check all imports in modified files:
- Remove unused imports
- Ensure imports are properly organized (external packages, then internal modules)
- Check for circular dependencies
- Verify no duplicate imports exist
- Ensure relative vs absolute imports are consistent with project conventions

### 5. Dead Code Detection

Scan for dead code in the codebase:
- Identify unused variables and functions
- Find unreachable code paths
- Detect commented-out code blocks that should be removed
- Look for unused exports
- Check for deprecated code that should be cleaned up

### 6. Security Checks

Perform security analysis on changed files:
- Check for hardcoded secrets, API keys, or credentials
- Look for potential XSS vulnerabilities (unescaped user input)
- Identify SQL injection risks
- Check for unsafe use of eval(), innerHTML, or dangerouslySetInnerHTML
- Verify proper input validation and sanitization
- Check for exposed sensitive routes or endpoints
- Review any new dependencies for known vulnerabilities

**PostMessage Origin Verification (High Priority - Frontend):**
- Detect `window.addEventListener("message", ...)` or `addEventListener("message", ...)` handlers
- Verify handler checks `event.origin` against an expected/allowed origin before processing
- Verify handler optionally validates `event.source` matches expected window (e.g., popup reference)
- Flag handlers that access `event.data` without prior origin validation
- Recommended pattern:
  ```javascript
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== expectedOrigin) return;
    if (event.source !== expectedSource) return;
    // Now safe to process event.data
  };
  ```

**OAuth/Popup Security (Medium Priority):**
- When OAuth flows use popup windows, ensure:
  - The expected origin is derived from the OAuth URL (e.g., `new URL(authUrl).origin`)
  - Message handlers validate both `event.origin` and `event.source`
  - Popup references are properly tracked and validated

**API Input Validation (Medium Priority):**
- Check that route handlers validate and sanitize path parameters, query params, and request bodies
- Ensure user-controlled values used in file paths, database queries, or shell commands are validated
- Look for path traversal vulnerabilities (`../` in file paths from user input)

### 7. Accessibility (a11y) Review

Check for accessibility compliance in UI components:
- Ensure all interactive elements have proper ARIA labels
- Verify images have alt text
- Check for proper heading hierarchy
- Ensure color contrast meets WCAG standards
- Verify keyboard navigation works correctly
- Check for focus indicators on interactive elements
- Ensure form inputs have associated labels

### 8. Git Workflow Checks

Run applicable git workflow validations locally:
- Check for merge conflicts markers (`<<<<<<<`, `=======`, `>>>>>>>`)
- Verify no .env files or secrets are staged
- Ensure commit messages follow conventional commit format
- Check branch naming conventions
- Verify no large binary files are being committed
- Run any pre-commit hooks defined in husky configuration

### 9. Linting

Run the project's linting tools:
```bash
zsh -i -c "npm run lint:check"
```

If linting fails, run the auto-fix:
```bash
zsh -i -c "npm run lint"
```

**Post-Linting Verification:**
If auto-fix was run, verify no new changes were introduced:
```bash
git status --short
```
- If the linter modified any files, those changes MUST be staged before continuing
- Stage linting fixes immediately: `git add <modified-files>`

Also run type checking:
```bash
zsh -i -c "npm run typecheck"
```

### 10. Dependency Audit

Check for security vulnerabilities in dependencies:
```bash
zsh -i -c "npm audit"
```

Review findings:
- Critical and high severity issues should be addressed before commit
- Document any accepted risks for lower severity issues
- Check if updates are available for vulnerable packages

### 11. TODO/FIXME Review

Scan for new TODO/FIXME comments in changed files:
- Ensure new TODOs have associated issue/ticket numbers
- Check if any existing TODOs should be resolved in this commit
- Verify FIXME items are not being committed to production code
- Flag any HACK or TEMP comments that should be addressed

### 12. Environment Variable Validation

Check environment variable handling:
- Verify new env vars are documented in README or .env.example
- Ensure no env vars are hardcoded with real values
- Check that all required env vars have fallbacks or clear error messages
- Verify sensitive env vars are not exposed to client-side code

### 13. Lock File Sync

If package.json was modified, verify lock file consistency:
```bash
zsh -i -c "npm install --package-lock-only"
```

Check:
- package-lock.json is in sync with package.json
- No unexpected dependency changes
- Lock file is committed alongside package.json changes

**Post-Install Verification:**
After running npm install, verify lock file changes are staged:
```bash
git status --short
```
- If package-lock.json was modified, it MUST be staged before continuing
- Stage lock file changes: `git add package-lock.json` (or pnpm-lock.yaml, yarn.lock, etc.)

### 14. Bundle Size Impact

For frontend changes, consider bundle size impact:
- Check if new dependencies significantly increase bundle size
- Verify dynamic imports are used for large optional features
- Look for opportunities to tree-shake unused code
- Consider lazy loading for heavy components

### 15. Tests

Run the test suite and ensure all tests pass:
```bash
zsh -i -c "npm test -- --run"
```

For changed files, evaluate if additional tests are needed:
- New functions should have unit tests
- Bug fixes should have regression tests
- Edge cases should be covered
- Integration points should be tested

If new tests are needed, create them and ensure they are robust:
- Tests should be deterministic (no flaky tests)
- Tests should be independent (not rely on other test state)
- Tests should have meaningful assertions
- Tests should cover both happy path and error cases

### 16. Build Verification

Verify the project builds successfully:
```bash
zsh -i -c "npm run build"
```

Check for:
- Build warnings that should be addressed
- Bundle size changes
- Missing assets or resources

### 17. Security Review

Perform a dedicated security review using the `/security-review` command:
- Conduct a thorough security analysis of all changed code
- Identify potential security vulnerabilities and attack vectors
- Review authentication and authorization implementations
- Check for data exposure risks and sensitive information handling
- Validate input sanitization and output encoding
- Assess cryptographic usage and secure communication

### 18. Final Code Review

Run a comprehensive code review using the `/review` command to catch any remaining issues:
- This will perform an in-depth analysis of all changed code
- Review for code quality, best practices, and potential improvements
- Identify any patterns or anti-patterns that may have been missed
- Check for consistency with the existing codebase
- Verify documentation and comments are adequate

## Output Format

After completing all checks, provide a summary:

```
## Sanity Check Summary

| Category                  | Status | Issues |
|---------------------------|--------|--------|
| Console Cleanup           | ✅/❌   | N      |
| Formatting                | ✅/❌   | N      |
| Exception/Logging         | ✅/❌   | N      |
| Imports                   | ✅/❌   | N      |
| Dead Code                 | ✅/❌   | N      |
| Security                  | ✅/❌   | N      |
| Accessibility             | ✅/❌   | N      |
| Git Workflow              | ✅/❌   | N      |
| Linting                   | ✅/❌   | N      |
| Dependency Audit          | ✅/❌   | N      |
| TODO/FIXME                | ✅/❌   | N      |
| Environment Variables     | ✅/❌   | N      |
| Lock File                 | ✅/❌   | N      |
| Bundle Size               | ✅/❌   | N      |
| Tests                     | ✅/❌   | N      |
| Build                     | ✅/❌   | N      |
| Security Review           | ✅/❌   | N      |
| Final Code Review         | ✅/❌   | N      |

### Critical Issues (Must Fix)
- [List any blocking issues]

### Warnings (Should Address)
- [List any warnings]

### Suggestions (Nice to Have)
- [List any suggestions]

**Overall Status: READY TO COMMIT / NEEDS FIXES / BLOCKED**
```
