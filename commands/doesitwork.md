---
description: Does it work? Quick health check for any feature - validates API endpoints, frontend-backend integration, test coverage, and suggests fixes.
---

# Does It Work? - Feature Health Check

**Quick Answer First**: Give a clear ✅ YES / ⚠️ PARTIAL / ❌ NO verdict at the top, then dive into details.

This skill checks if a feature actually works end-to-end. It validates API endpoints, frontend-backend integration, test coverage, identifies issues, and suggests specific fixes.

## Quick Start

**Usage**: `doesitwork [feature-name]`

**Examples**:
- `doesitwork validation packages`
- `doesitwork data import`
- `doesitwork training matrix`
- `doesitwork document workflow`

**What It Checks** (11-point inspection):
1. ✅ Feature identification & file mapping
2. ✅ **Log verification** (database, backend, frontend, related services)
3. ✅ API endpoint registration
4. ✅ Frontend-backend API alignment
5. ✅ Request/response model validation
6. ✅ Service implementation completeness
7. ✅ Templates & dependencies
8. ✅ Database schema (with actual database verification)
9. ✅ Test coverage
10. ✅ Error handling
11. ✅ Security & authorization

**Output Format**:
- **First**: Clear verdict (✅ YES / ⚠️ PARTIAL / ❌ NO)
- **Then**: Detailed findings with specific fixes

## Instructions

When a user asks "does it work?" for a feature, execute these checks systematically and **start your response with a clear verdict**.

**🚨 CRITICAL: Never Assume - Always Verify**
- **Don't assume it works** - perform proper checks and verification
- **Check logs** for database, backend, frontend, and related services (when available)
- **Get the whole picture** - some backend issues are not reliable without also checking the database
- **Verify actual behavior** - don't just check code structure, verify runtime behavior

### 1. Feature Identification

**Goal**: Figure out what we're actually checking.

Identify the feature/module to check:
- Extract feature name from user query
- Map to backend routers, services, and frontend pages
- Identify related database models and API endpoints

**Action**: Use codebase search to find all related files:
- Backend routers: `backend/app/routers/*.py`
- Backend services: `backend/app/services/*.py`
- Frontend pages: `frontend/pages/**/*.tsx`
- Database models: `backend/app/models.py`
- API contracts: `contracts/openapi.yaml`

### 2. Log Verification Check

**Goal**: Check actual runtime behavior through logs - don't assume it works based on code alone.

**🚨 CRITICAL**: Always check logs to verify actual behavior. Some issues only appear at runtime and won't be visible in code analysis alone.

**Check Logs For**:
- **Database logs**: Check for connection issues, query errors, migration problems
- **Backend logs**: Check for API errors, service failures, exception traces
- **Frontend logs**: Check for API call failures, rendering errors, console errors
- **Related services**: Check logs for any dependent services (Redis, ChromaDB, etc.)

**Commands to Check Logs**:
```bash
# Docker Compose logs (development)
make dev-live-logs  # View all service logs
docker compose logs backend  # Backend logs only
docker compose logs frontend  # Frontend logs only
docker compose logs db  # Database logs only

# Specific service logs
docker compose logs backend --tail=100  # Last 100 lines
docker compose logs backend --follow  # Follow logs in real-time

# Check for errors in logs
docker compose logs backend | grep -i error
docker compose logs frontend | grep -i error
docker compose logs db | grep -i error

# Check for specific feature-related logs
docker compose logs backend | grep -i "[feature_name]"
```

**What to Look For**:
- ❌ **Database connection errors**: Connection refused, authentication failures
- ❌ **Query errors**: SQL syntax errors, constraint violations, missing tables/columns
- ❌ **API errors**: 500 errors, exception traces, validation failures
- ❌ **Service errors**: Service initialization failures, dependency issues
- ❌ **Frontend errors**: API call failures, network errors, rendering crashes
- ⚠️ **Warnings**: Deprecation warnings, performance warnings, configuration warnings

**Database-Specific Checks**:
- **Connection status**: Verify database is accessible and connections are successful
- **Schema issues**: Check for missing tables, columns, indexes, or foreign keys
- **Migration status**: Verify migrations have been applied correctly
- **Query performance**: Look for slow queries or query timeouts
- **Transaction errors**: Check for deadlocks, rollbacks, or transaction failures

**Backend-Specific Checks**:
- **Startup errors**: Check if backend service started successfully
- **API endpoint errors**: Look for 404s, 500s, or validation errors
- **Service initialization**: Verify services are properly initialized
- **Dependency errors**: Check for missing dependencies or service unavailability
- **Exception traces**: Full stack traces for debugging

**Frontend-Specific Checks**:
- **API call failures**: Network errors, timeout errors, CORS issues
- **Rendering errors**: Component crashes, hydration errors
- **Console errors**: JavaScript errors, type errors, undefined references
- **Build errors**: Compilation errors, type errors, missing dependencies

**Integration with Other Checks**:
- **Cross-reference with code**: If logs show errors, trace back to code
- **Database + Backend correlation**: Backend errors often correlate with database issues
- **Frontend + Backend correlation**: Frontend API errors should match backend logs
- **Timeline analysis**: Check log timestamps to understand error sequence

**Report**:
- List all errors found in logs with timestamps
- Correlate log errors with code issues found in other checks
- Identify root causes based on log analysis
- Note any discrepancies between code structure and actual runtime behavior

**⚠️ Important**: Some backend issues are not reliable without also checking the database. Always verify:
- Database schema matches code expectations
- Database connections are working
- Queries execute successfully
- Migrations are applied correctly
- Data integrity constraints are satisfied

### 3. API Endpoint Registration Check

**Goal**: Make sure the API endpoints are actually accessible.

Verify that all API routers are properly registered in the main application:

**Check**:
- Use Grep tool to search for router registration in `main.py`
- Look for `include_router` calls with the feature router

**Verify**:
- Router is imported in `main.py`
- Router is registered with `app.include_router()`
- Router prefix matches frontend API calls
- Router tags are appropriate

**Report**: List all registered endpoints and their paths.

### 4. Frontend-Backend API Alignment

**Goal**: Make sure frontend and backend are talking to each other correctly.

Verify that frontend API calls match backend routes:

**Check**:
- Use Grep to find frontend API calls
- Use Grep to find backend route definitions
- Compare paths, methods, and data structures

**Verify**:
- Frontend API paths match backend route paths
- HTTP methods match (GET, POST, PUT, DELETE)
- Request payload structure matches backend Pydantic models
- Response structure matches frontend expectations

**Report**: Create alignment table showing frontend calls → backend routes.

### 5. Request/Response Model Validation

**Goal**: Make sure data structures match between frontend and backend.

Check that Pydantic models match frontend expectations:

**Check**:
- Backend request models in router file
- Frontend request payload construction
- Backend response models
- Frontend response handling

**Verify**:
- Required fields are present in both frontend and backend
- Field types match (string, number, boolean, etc.)
- Optional fields are handled correctly
- Validation rules are consistent

**Common Issues to Check**:
- ❌ **Pydantic + Form Data Conflict**: Endpoints mixing Pydantic models with `Form(...)` fields
- ❌ **Missing Required Fields**: Frontend not sending required fields
- ❌ **Type Mismatches**: String vs number, array vs object
- ❌ **Missing Response Models**: Endpoints without response_model specification

**Report**: List all request/response models and identify mismatches.

### 6. Service Implementation Check

**Goal**: Make sure the business logic is actually implemented (not just stubbed).

Verify that backend services are properly implemented:

**Check**:
- Use Glob to find service files
- Use Read to examine service implementation
- Check for proper error handling and session management

**Verify**:
- Service class exists and is properly initialized
- Service methods match router endpoint needs
- Error handling is implemented
- Database operations use proper session management
- Dependencies (OCR, external APIs) are checked for availability

**Report**: List service methods and their implementation status.

### 7. Template/Dependency Check

**Goal**: Make sure all required files and dependencies are present.

Verify that required templates, files, and dependencies exist:

**Check**:
- Template files (Jinja2, HTML, etc.)
- Configuration files
- External service dependencies (OpenAI, etc.)
- Required environment variables

**Verify**:
- Template files exist in expected locations
- Template rendering has fallback mechanisms
- Dependencies are properly imported
- Environment variables are checked before use

**Report**: List all dependencies and their availability status.

### 8. Database Schema Check

**Goal**: Make sure the database has what it needs.

**🚨 CRITICAL**: Always verify database state matches code expectations. Don't assume schema is correct - check actual database structure and data.

Verify that required database models and tables exist:

**Check**:
- Use Grep to find model definitions in `models.py`
- Use Bash to check for migrations
- Use Bash to verify actual database schema

**Verify**:
- Database models are defined
- Required fields are present
- Relationships are properly defined
- Migrations exist for schema changes

**Database Verification Commands**:
```bash
# Connect to database and verify schema
docker compose exec db psql -U innoqualis -d innoqualis -c "\dt"  # List all tables
docker compose exec db psql -U innoqualis -d innoqualis -c "\d [table_name]"  # Describe table structure
docker compose exec db psql -U innoqualis -d innoqualis -c "SELECT * FROM [table_name] LIMIT 5;"  # Check data

# Check migration status
docker compose exec backend alembic current  # Current migration version
docker compose exec backend alembic history  # Migration history

# Verify specific tables exist
docker compose exec db psql -U innoqualis -d innoqualis -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

**What to Verify**:
- ✅ Tables exist in database (don't assume - check actual database)
- ✅ Columns match model definitions (check column types, nullability)
- ✅ Indexes are created (check for performance-critical indexes)
- ✅ Foreign keys are properly set up (check constraint names and relationships)
- ✅ Data exists (if applicable, verify sample data is present)
- ✅ Migrations are applied (check alembic_version table)

**Report**:
- List database models and their fields
- Verify actual database schema matches code expectations
- Note any discrepancies between models and actual database structure
- Check for missing tables, columns, or relationships

### 9. Test Coverage Analysis

**Goal**: See if there are tests, and if they actually cover the feature.

Check test coverage for the feature:

**Check**:
- Use Glob to find test files
- Use Read to examine test implementation
- Check for unit, integration, and E2E tests

**Verify**:
- Unit tests exist for services
- Integration tests exist for API endpoints
- E2E tests exist for frontend flows
- Test coverage percentage (if available)

**Report**:
- List all test files
- Identify missing test coverage areas
- Suggest test files that should be created

### 10. Error Handling Check

**Goal**: Make sure errors are handled gracefully, not just crashing.

Verify proper error handling throughout the stack:

**Check**:
- Backend exception handling
- Frontend error boundaries
- API error responses
- User-friendly error messages

**Verify**:
- All error paths are handled
- Errors are logged appropriately
- Error messages are user-friendly
- Status codes are appropriate (400, 404, 500, etc.)

**Report**: List error handling patterns and identify gaps.

### 11. Security & Authorization Check

**Goal**: Make sure it's secure and properly protected.

Verify security and authorization:

**Check**:
- Authentication requirements
- Authorization checks (RBAC)
- Input validation
- SQL injection prevention
- XSS prevention

**Verify**:
- Endpoints require authentication
- Admin-only endpoints check for admin role
- User input is validated
- Sensitive data is not exposed

**Report**: List security measures and identify vulnerabilities.

## Execution Strategy

1. **Feature Discovery**: Use codebase search to find all related files
2. **Log Verification First**: Check logs for database, backend, frontend, and related services to get the whole picture
3. **Systematic Checks**: Execute each check in order
4. **Database Verification**: Always verify actual database state matches code expectations (don't assume)
5. **Issue Identification**: Track all findings by category, correlating code issues with log errors
6. **Impact Analysis**: Determine if fixes affect other functionality
7. **Fix Suggestions**: Provide specific fix recommendations based on actual runtime behavior

## Output Format

**CRITICAL**: Always start with a clear verdict at the top, then provide details.

After completing all checks, provide a comprehensive summary:

```markdown
## Does It Work? [Feature Name]

### 🎯 Quick Verdict
**Status**: ✅ YES, IT WORKS / ⚠️ PARTIALLY / ❌ NO, IT'S BROKEN

**TL;DR**: [One sentence summary - what works, what doesn't, what needs fixing]

---

### Feature Overview
- **Backend Router**: [backend/app/routers/[router].py](backend/app/routers/[router].py)
- **Backend Service**: [backend/app/services/[service].py](backend/app/services/[service].py)
- **Frontend Pages**: [frontend/pages/[path]/[page].tsx](frontend/pages/[path]/[page].tsx)
- **Database Models**: `[Model1]`, `[Model2]`

### Status Summary

| Check Category | Status | Issues | Details |
|----------------|--------|--------|---------|
| Log Verification | ✅/❌ | N | [Details] |
| API Registration | ✅/❌ | N | [Details] |
| Frontend-Backend Alignment | ✅/❌ | N | [Details] |
| Request/Response Models | ✅/❌ | N | [Details] |
| Service Implementation | ✅/❌ | N | [Details] |
| Templates/Dependencies | ✅/❌ | N | [Details] |
| Database Schema | ✅/❌ | N | [Details] |
| Test Coverage | ✅/❌ | N | [Details] |
| Error Handling | ✅/❌ | N | [Details] |
| Security/Authorization | ✅/❌ | N | [Details] |

### Critical Issues (Must Fix)

#### Issue 1: [Title]
- **Location**: [file.py:line](file.py#Lline)
- **Problem**: [Description]
- **Impact**: [What breaks]
- **Fix**: [Specific fix instructions]
- **Affects Existing Functionality**: ✅ Yes / ❌ No
- **Requires DB Changes**: ✅ Yes / ❌ No

### Warnings (Should Address)

#### Warning 1: [Title]
- **Location**: [file.py:line](file.py#Lline)
- **Problem**: [Description]
- **Impact**: [What's affected]
- **Fix**: [Suggested fix]

### Test Coverage Analysis

#### Existing Tests
- ✅ [backend/tests/test_[feature].py](backend/tests/test_[feature].py) - [Coverage description]
- ✅ [frontend/__tests__/[feature].test.tsx](frontend/__tests__/[feature].test.tsx) - [Coverage description]
- ✅ [frontend/e2e-tests/[feature].spec.ts](frontend/e2e-tests/[feature].spec.ts) - [Coverage description]

#### Missing Test Coverage
- ❌ Unit tests for [specific functionality]
- ❌ Integration tests for [specific endpoint]
- ❌ E2E tests for [specific user flow]

### Suggested Fixes

#### Fix 1: [Title]
**Files to Modify**:
- [backend/app/routers/[router].py](backend/app/routers/[router].py) (lines X-Y)
- [frontend/pages/[page].tsx](frontend/pages/[page].tsx) (lines X-Y)

**Changes Required**:
```python
# Before
[problematic code]

# After
[fixed code]
```

**Testing Required**:
- [ ] Unit test for [specific case]
- [ ] Integration test for [specific endpoint]
- [ ] E2E test for [specific flow]

**Impact Assessment**:
- **Affects Existing Functionality**: [Yes/No with explanation]
- **Requires DB Changes**: [Yes/No with explanation]
- **Breaking Changes**: [Yes/No with explanation]

### Database Changes Required

- [ ] Migration needed: [description]
- [ ] Model changes: [description]
- [ ] Data migration: [description]

### Overall Status

**Does It Work?**: ✅ YES / ⚠️ PARTIAL / ❌ NO

**Ready for Production**: ✅ YES / ❌ NO

**Confidence Level**: [High/Medium/Low] - [Why]

### Next Steps

1. [Priority 1 action item]
2. [Priority 2 action item]
3. [Priority 3 action item]

### Commands to Run

```bash
# Fix command 1
[command]

# Fix command 2
[command]

# Test after fixes
[test command]
```

### Files Requiring Manual Review

- [file1.py](file1.py) - [Reason]
- [file2.tsx](file2.tsx) - [Reason]
```

## Implementation Notes

- **Quick Answer First**: Always start with a clear ✅/⚠️/❌ verdict
- **Never Assume**: Don't assume it works - always verify through logs and actual runtime checks
- **Log Verification**: Always check logs for database, backend, frontend, and related services to get the whole picture
- **Database Verification**: Some backend issues are not reliable without also checking the database - always verify actual database state
- **Comprehensive**: Check both backend and frontend codebases, plus runtime behavior
- **Systematic**: Follow the check order for consistency
- **Actionable**: Provide specific file locations and line numbers with clickable links
- **Context-Aware**: Consider project-specific patterns (API URL conventions, data-testid requirements, etc.)
- **Impact-Aware**: Always assess if fixes affect existing functionality
- **Test-Focused**: Identify test coverage gaps and suggest test creation
- **User-Friendly**: Use plain language - explain what's broken and why, not just technical details
- **Runtime Verification**: Verify actual behavior, not just code structure

## Example Usage

```
doesitwork validation packages
doesitwork data import
doesitwork training matrix
doesitwork document approval workflow
```

## Common Issues Found

### 1. Pydantic + Form Data Conflict
**Symptom**: Endpoint mixes Pydantic model with `Form(...)` fields
**Example**:
```python
@router.post("/endpoint")
async def endpoint(
    request: RequestModel,  # ❌ Expects JSON
    file_id: str = Form(...)  # ❌ Expects FormData
):
```
**Fix**: Use all Form fields OR all JSON body

### 2. Missing Router Registration
**Symptom**: Router exists but not registered in `main.py`
**Fix**: Add `app.include_router(router, prefix="/api")` to `main.py`

### 3. API Path Mismatch
**Symptom**: Frontend calls `/api/feature` but backend route is `/feature`
**Fix**: Align prefix in router registration or frontend API calls

### 4. Missing Response Models
**Symptom**: Endpoint doesn't specify `response_model`
**Fix**: Add `response_model=ResponseModel` to route decorator

### 5. Missing Test Coverage
**Symptom**: Feature works but has no tests
**Fix**: Create unit, integration, and E2E tests

---

## Sources

- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Skills Created in Project Directory Instead of User Directory (WSL) · Issue #16165](https://github.com/anthropics/claude-code/issues/16165)
