# Env Sync

Sync and validate environment configurations across development, staging, and production environments.

## Instructions

### 1. List Environment Variables

```bash
# Development
cat .env.development

# Staging
cat .env.staging

# Production
cat .env.production
```

### 2. Compare Environments

```bash
# Compare dev vs staging
diff .env.development .env.staging

# Compare staging vs production
diff .env.staging .env.production
```

### 3. Validate Required Variables

```python
# validate_env.py
import os

REQUIRED_VARS = {
    "development": ["API_KEY", "DATABASE_URL", "LOG_LEVEL"],
    "staging": ["API_KEY", "DATABASE_URL", "LOG_LEVEL", "SENTRY_DSN"],
    "production": ["API_KEY", "DATABASE_URL", "LOG_LEVEL", "SENTRY_DSN", "CDN_URL"]
}

def validate_env(environment):
    missing = []
    for var in REQUIRED_VARS[environment]:
        if not os.getenv(var):
            missing.append(var)

    if missing:
        print(f"❌ Missing in {environment}: {', '.join(missing)}")
        return False

    print(f"✅ {environment} environment is valid")
    return True
```

### 4. Sync Variables

```bash
# Copy from staging to production (carefully!)
# Review differences first
diff .env.staging .env.production

# Add missing variables
# Update .env.production manually or with script
```

### 5. Use Environment Management Tools

#### AWS Systems Manager Parameter Store
```bash
# Get parameter
aws ssm get-parameter --name "/app/production/DATABASE_URL" --with-decryption

# Put parameter
aws ssm put-parameter --name "/app/production/API_KEY" --value "secret" --type SecureString
```

#### Secrets Manager
```bash
# Get secret
aws secretsmanager get-secret-value --secret-id prod/app/config

# Create secret
aws secretsmanager create-secret --name prod/app/config --secret-string file://config.json
```

## Output Format

```markdown
# Environment Sync Report

## Comparison: Development → Staging → Production

### Variables Status

| Variable | Dev | Staging | Prod | Status |
|----------|-----|---------|------|--------|
| API_KEY | ✅ | ✅ | ✅ | Synced |
| DATABASE_URL | ✅ | ✅ | ✅ | Different (expected) |
| LOG_LEVEL | DEBUG | INFO | INFO | ⚠️ Mismatch |
| SENTRY_DSN | ❌ | ✅ | ✅ | Missing in dev |
| CDN_URL | ❌ | ❌ | ✅ | Prod only (expected) |

### Issues Found

1. **LOG_LEVEL** different in dev (DEBUG) vs staging/prod (INFO)
   - Action: Document or sync

2. **SENTRY_DSN** missing in development
   - Action: Add for local error tracking

### Recommendations

1. Sync LOG_LEVEL across environments
2. Add SENTRY_DSN to development
3. Document environment-specific variables
4. Use secrets management service
```

## Best Practices

- Never commit .env files
- Use secrets management services
- Document required variables
- Validate in CI/CD
- Different values for different envs
- Rotate secrets regularly

## Notes

- Some variables should differ (URLs, log levels)
- Always use encryption for secrets
- Test after syncing
- Have rollback plan
