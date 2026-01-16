# Setup Validate

Validate development environment setup including dependencies, environment variables, and credentials.

## Instructions

### 1. Check Prerequisites

Verify required tools are installed:

```bash
# Check versions
node --version  # Should be 18+
python --version  # Should be 3.10+
git --version
docker --version

# Check package managers
npm --version
uv --version

# Check cloud CLIs (if needed)
aws --version
gcloud --version
terraform --version
```

### 2. Validate Dependencies

#### Python

```bash
# Check if dependencies are installed
uv sync --check

# List installed packages
uv pip list

# Check for security vulnerabilities
uv pip audit

# Verify specific packages
uv pip show fastapi pydantic
```

#### TypeScript/JavaScript

```bash
# Check if node_modules is up-to-date
zsh -i -c "npm ci --dry-run"

# Audit for vulnerabilities
zsh -i -c "npm audit"

# Check for outdated packages
zsh -i -c "npm outdated"
```

### 3. Validate Environment Variables

Check required environment variables exist:

```python
# validate_env.py
import os
import sys

REQUIRED_VARS = [
    "API_KEY",
    "DATABASE_URL",
    "SECRET_KEY"
]

OPTIONAL_VARS = [
    "LOG_LEVEL",
    "PORT"
]

missing = [var for var in REQUIRED_VARS if not os.getenv(var)]

if missing:
    print(f"❌ Missing required environment variables: {', '.join(missing)}")
    sys.exit(1)

print("✅ All required environment variables are set")

# Check optional
for var in OPTIONAL_VARS:
    if not os.getenv(var):
        print(f"⚠️  Optional variable {var} not set (using default)")
```

### 4. Validate Configuration Files

```bash
# Check required files exist
required_files=(
    ".env"
    "package.json"  # or pyproject.toml
    "tsconfig.json"  # or setup.py
)

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo "✅ All required files present"
```

### 5. Test Database Connection

```python
# test_db.py
from database import get_connection

try:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1")
    result = cursor.fetchone()
    assert result[0] == 1
    print("✅ Database connection successful")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    sys.exit(1)
```

### 6. Validate API Credentials

```bash
# Test AWS credentials
aws sts get-caller-identity

# Test API keys
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/health
```

### 7. Run Health Checks

```bash
# Start services
docker-compose up -d

# Check all services are running
docker-compose ps

# Run health check endpoint
curl http://localhost:8000/health
```

## Output Format

```markdown
# Environment Setup Validation

## System Requirements ✅
- Node.js: 18.16.0 ✅
- Python: 3.11.4 ✅
- Docker: 24.0.5 ✅
- Git: 2.40.0 ✅

## Dependencies ✅
- Python packages: 45 installed, all up-to-date
- npm packages: 234 installed, 2 outdated (non-critical)
- Security audit: No vulnerabilities found

## Environment Variables ✅
- API_KEY: Set ✅
- DATABASE_URL: Set ✅
- SECRET_KEY: Set ✅
- LOG_LEVEL: Not set ⚠️ (using default: INFO)

## Configuration Files ✅
- .env: Present ✅
- pyproject.toml: Present ✅
- docker-compose.yml: Present ✅

## Services ✅
- Database connection: Successful ✅
- Redis connection: Successful ✅
- API health check: Healthy ✅

## Warnings ⚠️
- LOG_LEVEL not set (using default)
- 2 npm packages have minor updates available

## Ready to Start Development ✅
All critical checks passed. Run `npm run dev` or `uv run main.py` to start.
```

## Best Practices

- Run validation before starting development
- Include in CI/CD pipeline
- Update validation script as requirements change
- Provide clear error messages with solutions
- Automate fixes where possible

## Notes

- Store validation script in project root
- Run after cloning repository
- Re-run after pulling major changes
- Document all requirements in README
