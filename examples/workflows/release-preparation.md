# Release Preparation Workflow

Multi-step workflow for preparing a production release.

## Scenario

Team is ready to release v2.1.0 with new features and bug fixes.

## Workflow

### 1. Version Bump and Changelog
```bash
# Update version in package.json / pyproject.toml
# Update CHANGELOG.md with release notes
```

### 2. Dependency Updates
```bash
/dependency-update
```
- Updated 5 packages
- Fixed 2 security vulnerabilities
- All tests passing

### 3. Full Test Suite
```bash
/test-coverage
/e2e-check
```
- Unit tests: 245/245 ✅
- Integration tests: 34/34 ✅
- E2E tests: 12/12 ✅
- Coverage: 86% ✅

### 4. Build Validation
```bash
/build-fix
npm run build:production
```
- TypeScript: No errors ✅
- Bundle size: 2.1 MB ✅
- Build time: 31s ✅

### 5. Documentation Update
```bash
/readme-update
/api-docs
```
- README updated with v2.1.0 changes
- API docs regenerated
- Migration guide created

### 6. Create Release Branch
```bash
git checkout -b release/v2.1.0
git push origin release/v2.1.0
```

### 7. Final Sanitycheck
```bash
/sanitycheck
```
Result: ✅ READY TO COMMIT (16/16 checks passed)

### 8. Create Release PR
```bash
/milestone-pr
```
Creates PR with:
- Complete changelog
- Testing checklist
- Deployment notes
- Rollback plan

### 9. Deploy to Staging
```bash
# After PR approval
git merge release/v2.1.0
# CI/CD deploys to staging
```

### 10. Staging Validation
- Smoke tests on staging ✅
- Performance tests ✅
- Security scan ✅

### 11. Production Deployment
```bash
# Tag release
git tag v2.1.0
git push origin v2.1.0

# CI/CD deploys to production
```

### 12. Post-Release Monitoring
- Check error rates
- Monitor performance metrics
- Verify new features working

## Timeline

- Preparation: 2 hours
- Testing: 1 hour
- Staging deployment: 30 min
- Production deployment: 30 min
- Total: 4 hours

## Checklist

- [ ] Version bumped
- [ ] CHANGELOG updated
- [ ] Dependencies updated
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Release branch created
- [ ] PR reviewed and approved
- [ ] Staged and validated
- [ ] Production deployed
- [ ] Monitoring confirmed

## Result

✅ v2.1.0 successfully released to production
