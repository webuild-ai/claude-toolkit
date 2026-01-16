# PR Review

Perform a comprehensive code review checklist covering security, performance, maintainability, and best practices.

## Instructions

### 1. Initial Assessment

Review PR metadata and context:

- **PR title and description**: Clear and complete?
- **Size**: Is the PR reasonably sized (< 400 lines preferred)?
- **Linked issues**: Are related issues/tickets referenced?
- **CI/CD status**: Are all checks passing?

### 2. Code Quality Review

#### A. Readability and Maintainability

- [ ] **Code is self-documenting**: Variable and function names are clear
- [ ] **Comments explain "why" not "what"**: Complex logic is explained
- [ ] **Consistent style**: Follows project conventions
- [ ] **No code duplication**: DRY principle followed
- [ ] **Appropriate abstractions**: Not over-engineered or under-engineered
- [ ] **Error handling**: Errors are handled gracefully with meaningful messages

#### B. Logic and Correctness

- [ ] **Logic is sound**: No obvious bugs or edge cases missed
- [ ] **Null/undefined checks**: Proper validation of inputs
- [ ] **Boundary conditions**: Edge cases are handled
- [ ] **Resource cleanup**: No memory leaks or resource leaks
- [ ] **Concurrent access**: Thread-safety considered where needed
- [ ] **Data validation**: All inputs are validated

### 3. Security Review

#### A. Input Validation

- [ ] **SQL injection**: No direct SQL string concatenation
- [ ] **XSS prevention**: User input is properly escaped/sanitized
- [ ] **Command injection**: No unsanitized input in shell commands
- [ ] **Path traversal**: File paths are validated
- [ ] **CSRF protection**: State-changing operations are protected

#### B. Authentication and Authorization

- [ ] **Authentication required**: Protected endpoints require auth
- [ ] **Authorization checked**: Proper permission checks
- [ ] **Session management**: Secure session handling
- [ ] **Token validation**: JWT/tokens properly validated
- [ ] **Sensitive data**: No credentials in code or logs

#### C. Data Protection

- [ ] **Encryption**: Sensitive data encrypted at rest and in transit
- [ ] **PII handling**: Personal data properly protected
- [ ] **Secrets management**: No hardcoded secrets
- [ ] **Logging**: Sensitive data not logged
- [ ] **API keys**: Properly secured and rotated

### 4. Performance Review

- [ ] **Database queries**: Optimized, no N+1 queries
- [ ] **Caching**: Appropriate caching strategy
- [ ] **Large datasets**: Pagination or streaming used
- [ ] **Async operations**: Non-blocking where appropriate
- [ ] **Resource usage**: Memory and CPU efficient
- [ ] **External calls**: Timeouts and retries configured

### 5. Testing Review

- [ ] **Test coverage**: New code has adequate tests
- [ ] **Test quality**: Tests are meaningful and not trivial
- [ ] **Edge cases**: Tests cover boundary conditions
- [ ] **Integration tests**: Key workflows are integration tested
- [ ] **Mocking**: External dependencies are properly mocked
- [ ] **Test data**: Tests don't depend on production data

### 6. API and Interface Review

- [ ] **API design**: RESTful/consistent with existing APIs
- [ ] **Backward compatibility**: Existing clients won't break
- [ ] **Versioning**: API version updated if needed
- [ ] **Documentation**: OpenAPI/Swagger docs updated
- [ ] **Error responses**: Consistent error format
- [ ] **Rate limiting**: Considered for public endpoints

### 7. Database and Data Review

- [ ] **Schema changes**: Migrations included and tested
- [ ] **Indexes**: Appropriate indexes added
- [ ] **Constraints**: Data integrity constraints defined
- [ ] **Transactions**: ACID properties maintained
- [ ] **Data migration**: Existing data handled correctly

### 8. Infrastructure and Deployment

- [ ] **Environment config**: Environment-specific settings externalized
- [ ] **Docker/containers**: Dockerfile optimized
- [ ] **Dependencies**: New dependencies justified and vetted
- [ ] **Deployment notes**: Special deployment steps documented
- [ ] **Rollback plan**: Changes can be safely rolled back
- [ ] **Monitoring**: Appropriate logging and metrics added

### 9. Documentation Review

- [ ] **README updated**: Setup instructions current
- [ ] **API docs updated**: Endpoints documented
- [ ] **Code comments**: Complex logic explained
- [ ] **Architecture docs**: Significant changes documented
- [ ] **Migration guide**: Breaking changes documented

### 10. Multi-Cloud Considerations (if applicable)

- [ ] **Cloud agnostic**: Code doesn't lock into specific provider
- [ ] **Configuration**: Environment-specific configs externalized
- [ ] **Service abstractions**: Cloud services properly abstracted
- [ ] **Testing**: Tested in target environments

## Output Format

Provide feedback in this structure:

### ✅ Strengths

- What's done well
- Good practices observed

### 🔴 Critical Issues (Must Fix)

- Security vulnerabilities
- Logic errors
- Breaking changes without migration

### 🟡 Suggestions (Should Address)

- Performance improvements
- Code organization
- Test coverage gaps

### 💡 Nice to Haves (Optional)

- Code style improvements
- Additional documentation
- Future enhancements

### 📝 Questions

- Clarifications needed
- Design decisions to discuss

## Example Review Comments

### Good Comment

```
🔴 SQL Injection Risk (line 45)
The query is constructing SQL with string concatenation:
`query = f"SELECT * FROM users WHERE id = {user_id}"`

This is vulnerable to SQL injection. Please use parameterized queries:
`query = "SELECT * FROM users WHERE id = %s"; cursor.execute(query, (user_id,))`
```

### Good Comment

```
🟡 Performance Concern (line 112)
This loops through all users to find matches - O(n) complexity.
Consider adding a database index on the email field or using a hash map for lookups.

Suggested approach:
- Add index: `CREATE INDEX idx_users_email ON users(email);`
- Or use: `user_map = {u.email: u for u in users}` for in-memory lookups
```

### Good Comment

```
💡 Suggestion (line 67)
This error message could be more helpful for debugging:
`return {"error": "Invalid input"}`

Consider including what was invalid:
`return {"error": "Invalid input", "field": "email", "message": "Email format is invalid"}`
```

## Review Best Practices

1. **Be specific**: Reference line numbers and provide examples
2. **Be constructive**: Suggest solutions, don't just criticize
3. **Prioritize**: Distinguish between critical issues and suggestions
4. **Be respectful**: Remember there's a person on the other end
5. **Focus on code**: Review the code, not the coder
6. **Ask questions**: If something is unclear, ask for clarification
7. **Acknowledge good work**: Point out what's done well

## Time Management

- **Small PRs** (< 200 lines): 15-30 minutes
- **Medium PRs** (200-400 lines): 30-60 minutes
- **Large PRs** (> 400 lines): Request split into smaller PRs

Take breaks if reviewing for more than 60 minutes to maintain focus.

## Notes

- Use this checklist as a guide, not every item applies to every PR
- Adapt based on project needs and PR context
- Consider using GitHub review features for inline comments
- Run the code locally if logic is complex or critical
- Check if similar patterns exist elsewhere in the codebase
