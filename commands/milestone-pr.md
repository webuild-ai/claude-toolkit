# Milestone PR

Create a comprehensive pull request for milestone completion with detailed documentation and testing checklist.

## Instructions

### 1. Pre-PR Checklist

Before creating the milestone PR, ensure:

```bash
# All changes committed
git status

# Latest changes pushed
git push origin <feature-branch>

# Tests passing
# Run project-specific test command (npm test, pytest, etc.)

# Linting passing
# Run project-specific linter (eslint, ruff, etc.)
```

### 2. Draft PR Summary

Create a comprehensive summary covering:

- **Overview**: Brief description of milestone achievements
- **Key changes**: Major features/improvements delivered
- **Technical approach**: High-level architecture decisions
- **Impact**: What this enables or improves

### 3. Organize Changes by Component

Group changes logically:

```
### Core Engine Updates
- `src/engine/agent.py`: Added memory management
- `src/engine/workflow.py`: Enhanced validation logic

### API Enhancements
- `api/routes/workflow.py`: New validation endpoints
- `api/models/workflow.py`: Updated data models

### Testing & Documentation
- Added comprehensive test suite
- Updated API documentation
```

### 4. Create Testing Checklist

Include thorough testing verification:

```
- [x] Unit tests for all new components
- [x] Integration tests for API endpoints
- [x] End-to-end workflow execution tests
- [x] Performance benchmarks
- [x] Security validation
- [x] Cross-browser/environment testing (if applicable)
```

### 5. Document Deployment Considerations

Important for reviewers and deployers:

- Environment variable changes
- Database migrations required
- Breaking changes (if any)
- Backward compatibility notes
- Configuration updates needed
- Performance considerations

### 6. Create PR with GitHub CLI

```bash
gh pr create \
  --title "Milestone: <Descriptive Title>" \
  --body "$(cat <<'EOF'
## Summary

[Comprehensive overview of milestone achievements]

## Changes Made

### Component Area 1
- Specific file changes and purpose

### Component Area 2
- Specific file changes and purpose

## Testing Performed

- [x] Test category 1
- [x] Test category 2
- [x] Test category 3

## Deployment Notes

- Environment variables: [list changes]
- Database: [migration notes]
- Breaking changes: [none/describe]
- Compatibility: [backward compatible/notes]

## Related Issues

Closes #XXX, #XXX

## Screenshots/Demos

[If applicable - UI changes, performance graphs, etc.]

## Checklist

- [x] Code follows project style guidelines
- [x] Self-review completed
- [x] Tests added/updated
- [x] Documentation updated
- [x] No security vulnerabilities introduced
- [x] Performance impact assessed
EOF
)"
```

## PR Template Structure

### Required Sections

1. **Summary** - Clear overview of what was accomplished
2. **Changes Made** - Organized by component/module
3. **Testing Performed** - Comprehensive test checklist
4. **Deployment Notes** - Critical deployment information
5. **Related Issues** - Link to issues/tickets
6. **Checklist** - Quality assurance checks

### Optional Sections

- **Screenshots/Demos** - Visual changes or performance data
- **Migration Guide** - For breaking changes
- **Rollback Plan** - How to revert if needed
- **Performance Metrics** - Before/after comparisons
- **Security Considerations** - Security impact analysis

## Title Format Examples

```
Milestone: Agent Platform Workflow Enhancement
Milestone: Multi-Cloud Configuration Support
Milestone: Performance Optimization Phase 1
Milestone: RBAC System Integration Complete
Milestone: Real-time Analytics Dashboard
```

## Quality Checks Before Creating PR

```bash
# Run linting
# Python: uv run ruff check --fix && uv run ruff format .
# TypeScript: npm run lint && npm run format

# Run tests
# Python: uv run pytest
# TypeScript: npm test

# Check for uncommitted changes
git status

# Review diff one more time
git diff main...HEAD
```

## Example Milestone PR

```markdown
# Milestone: Agent Platform Workflow Enhancement

## Summary

This milestone implements comprehensive workflow management enhancements for the agent platform, delivering improved validation, error handling, and monitoring capabilities. The changes enable more robust workflow execution with better observability and debugging support.

## Changes Made

### Core Engine Updates
- `src/pathway_engine/agents/chat_agent.py`: Added conversation memory management with configurable context windows
- `src/pathway_engine/workflow.py`: Implemented YAML schema validation and dependency checking
- `src/pathway_engine/compiler.py`: Enhanced error handling with detailed stack traces

### API Enhancements
- `api/routers/workflow.py`: New validation endpoints for pre-execution workflow checks
- `api/models/workflow.py`: Updated data models to support new validation schema
- `api/auth/workflow_auth.py`: Enhanced RBAC integration for workflow operations

### Infrastructure
- `docker/Dockerfile`: Optimized build process, reducing image size by 40%
- `terraform/ecs.tf`: Updated task definitions for increased memory allocation

### Testing & Documentation
- Added 150+ unit tests achieving 95% coverage
- Integration tests for all new API endpoints
- Updated OpenAPI documentation
- Added troubleshooting guide for common workflow issues

## Testing Performed

- [x] Unit tests for all new components (150+ tests, 95% coverage)
- [x] Integration tests for API endpoints (all passing)
- [x] End-to-end workflow execution tests (10+ scenarios)
- [x] RBAC permission validation (all roles tested)
- [x] Memory management stress tests (1000+ concurrent workflows)
- [x] Performance benchmarks (p95 latency < 200ms)
- [x] Security scan (no vulnerabilities found)

## Deployment Notes

### Environment Variables
- Add `WORKFLOW_VALIDATION_ENABLED=true` for validation features
- Set `MAX_WORKFLOW_MEMORY_MB=2048` for memory limits

### Database
- No schema changes required
- Existing workflows are fully compatible

### Breaking Changes
- None - fully backward compatible with existing workflows

### Performance Impact
- Workflow validation adds ~50ms to startup time
- Memory usage increased by ~100MB per instance
- Overall system throughput improved by 15%

## Related Issues

Closes #123, #145, #167, #189

## Metrics

**Before**:
- Workflow startup time: 1.2s (p95)
- Memory per workflow: 150MB avg
- Failed validations: 12% of runs

**After**:
- Workflow startup time: 0.9s (p95)
- Memory per workflow: 130MB avg
- Failed validations: 2% of runs (caught pre-execution)

## Checklist

- [x] Code follows project style guidelines (ruff + black)
- [x] Self-review completed with senior engineer
- [x] Tests added/updated (150+ new tests)
- [x] Documentation updated (API docs, troubleshooting guide)
- [x] No security vulnerabilities introduced (scanned with safety)
- [x] Performance impact assessed (15% improvement)
- [x] Backward compatibility verified
- [x] Deployment runbook updated
```

## Notes

- Milestone PRs should represent complete, deployable units of work
- Include metrics/data to demonstrate impact
- Be thorough but concise - reviewers need to understand quickly
- Link all related issues and documentation
- Consider the reviewer's perspective - what would they need to know?
