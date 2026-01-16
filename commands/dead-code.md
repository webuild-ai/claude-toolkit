# Dead Code

Find and safely remove unused code, imports, and dependencies to improve maintainability and reduce bundle size.

## Instructions

### 1. Identify Dead Code Categories

Dead code includes:

- **Unused imports**: Imported modules/packages never used
- **Unused variables**: Declared but never read
- **Unused functions/methods**: Defined but never called
- **Unused classes**: Defined but never instantiated
- **Unused parameters**: Function parameters never referenced
- **Unreachable code**: Code after return/break/continue statements
- **Commented-out code**: Old code left in comments
- **Unused dependencies**: Package dependencies not imported anywhere

### 2. Use Automated Tools

#### Python

```bash
# Find unused code
uv run vulture . --min-confidence 80

# Find unused imports
uv run autoflake --check --remove-unused-variables --remove-all-unused-imports -r .

# Check with ruff
uv run ruff check . --select F401,F841

# Type checker can find some unused code
uv run mypy .
```

#### TypeScript/JavaScript

```bash
# Find unused exports
zsh -i -c "npx ts-prune"

# ESLint unused vars
zsh -i -c "npx eslint . --ext .ts,.tsx,.js,.jsx"

# Find unused dependencies
zsh -i -c "npx depcheck"

# TypeScript compiler can find some unused code
zsh -i -c "npx tsc --noUnusedLocals --noUnusedParameters --noEmit"
```

### 3. Manual Review

Automated tools may miss or flag false positives. Manually review:

#### Check Test Files
- Ensure removal won't break tests
- Test utilities might be used only in tests

#### Check Dynamic Usage
- Code called via reflection/introspection
- Configuration-driven behavior
- Plugin systems
- API endpoints (may be used by external clients)

#### Check Documentation Examples
- Code in README examples
- Tutorial code
- API documentation

### 4. Safe Removal Process

Follow this process to avoid breaking changes:

#### Step 1: Run Full Test Suite
```bash
# Python
uv run pytest

# TypeScript
zsh -i -c "npm test"
```

#### Step 2: Remove Dead Code

For each category:

**Unused Imports (Safe)**
```python
# Before
import os
import sys  # unused
from typing import Dict, List  # Dict unused

# After
import os
from typing import List
```

**Unused Variables (Safe)**
```python
# Before
def process_data(data):
    result = calculate(data)
    temp = intermediate_step(result)  # never used
    return result

# After
def process_data(data):
    result = calculate(data)
    return result
```

**Unused Functions (Caution)**
```python
# Check git history: was it ever used?
git log -p --all -S 'function_name'

# Check for string references (dynamic calls)
grep -r "function_name" .

# If truly unused, remove:
def unused_function():  # DELETE
    pass
```

**Unreachable Code (Safe)**
```python
# Before
def check_status(status):
    if status == "active":
        return True
    else:
        return False
    print("This never executes")  # unreachable

# After
def check_status(status):
    if status == "active":
        return True
    else:
        return False
```

**Commented Code (Safe)**
```python
# Before
def process():
    # old_implementation()  # DELETE THIS
    # if legacy_mode:      # AND THIS
    #     handle_legacy()  # AND THIS
    new_implementation()

# After
def process():
    new_implementation()
```

#### Step 3: Run Tests Again
```bash
# Ensure nothing broke
# Python
uv run pytest

# TypeScript
zsh -i -c "npm test"
```

#### Step 4: Check Build
```bash
# Python
uv run python -m compileall .

# TypeScript
zsh -i -c "npm run build"
```

#### Step 5: Commit Changes
```bash
git add .
git commit -m "refactor: remove dead code

- Remove unused imports and variables
- Delete unreachable code
- Clean up commented-out code
"
```

### 5. Remove Unused Dependencies

#### Check Unused Packages

**Python**
```bash
# List installed packages
uv pip list

# Find which imports are used
grep -r "^import \|^from " --include="*.py" . | cut -d: -f2 | sort -u

# Compare with requirements/pyproject.toml
```

**TypeScript/JavaScript**
```bash
# Find unused dependencies
zsh -i -c "npx depcheck"

# Remove unused dependency
zsh -i -c "npm uninstall <package-name>"
```

#### Verify Removal

After removing dependencies:

```bash
# Clear caches
# Python
rm -rf .venv __pycache__ .pytest_cache

# JavaScript
rm -rf node_modules package-lock.json
zsh -i -c "npm install"

# Run tests
# Python
uv sync
uv run pytest

# JavaScript
zsh -i -c "npm test"
```

### 6. Measure Impact

Track improvements from dead code removal:

#### Bundle Size
```bash
# Before removal
ls -lh dist/bundle.js

# After removal
ls -lh dist/bundle.js
# Calculate difference
```

#### Lines of Code
```bash
# Before
cloc src/

# After
cloc src/
# Calculate difference
```

## Output Format

```markdown
# Dead Code Removal Report

## Summary
- Files analyzed: 234
- Dead code instances found: 47
- Safe to remove: 42
- Requires review: 5
- Estimated LOC reduction: 1,245 lines

## Unused Imports (23 instances)

### Can Remove Immediately
1. `src/auth/login.py` - `import jwt` (line 3) - never used
2. `src/api/users.py` - `from typing import Dict` (line 5) - Dict never used
3. `src/utils/helpers.py` - `import re` (line 2) - never used
...

**Command to remove**:
```bash
uv run autoflake --in-place --remove-unused-variables --remove-all-unused-imports src/auth/login.py src/api/users.py src/utils/helpers.py
```

## Unused Variables (12 instances)

### Can Remove Immediately
1. `src/services/processor.py:45` - variable `temp_result` declared but never used
2. `src/models/user.py:23` - variable `cache` declared but never used
...

## Unused Functions (8 instances)

### Can Remove (Never Called)
1. `src/utils/legacy.py:convert_old_format()` - No references found, added 2 years ago
2. `src/helpers/string.py:deprecated_sanitize()` - Replaced by new implementation

### Requires Review (Possible External Usage)
1. `src/api/webhooks.py:handle_legacy_webhook()` - May be called by external systems
2. `src/utils/export.py:export_to_csv()` - Check if used in CLI tools

## Unreachable Code (3 instances)

1. `src/handlers/error.py:78` - Code after return statement
2. `src/routes/api.py:145` - Code in else after all branches return

## Commented Code (15 instances)

Blocks of commented-out code found in:
- `src/legacy/adapter.py` (lines 23-45) - 22 lines
- `src/services/payment.py` (lines 67-89) - 23 lines
- `tests/integration/test_api.py` (lines 102-134) - 33 lines

**Recommendation**: Remove all (safely preserved in git history)

## Unused Dependencies (5 packages)

### Python (requirements.txt)
1. `requests-cache==0.9.0` - Never imported
2. `python-dateutil==2.8.2` - Redundant (pandas includes it)

### JavaScript (package.json)
1. `lodash` - Replaced by native methods
2. `moment` - Replaced by date-fns
3. `jquery` - Not used in modern React app

**Commands**:
```bash
# Python
uv remove requests-cache python-dateutil

# JavaScript
zsh -i -c "npm uninstall lodash moment jquery"
```

## Impact Analysis

### Before Removal
- Total lines: 45,678
- Files: 234
- Dependencies: 67
- Bundle size: 2.4 MB

### After Removal (Estimated)
- Total lines: 44,433 (-2.7%)
- Files: 232 (-2)
- Dependencies: 62 (-7.5%)
- Bundle size: 2.1 MB (-12.5%)

## Removal Plan

### Phase 1: Safe Removals (30 min)
1. Remove unused imports (automated)
2. Remove unused variables (automated)
3. Remove unreachable code
4. Remove commented code

### Phase 2: Review Required (1 hour)
1. Review potentially external-facing functions
2. Check dynamic imports/calls
3. Verify API backwards compatibility
4. Review with team if uncertain

### Phase 3: Dependencies (30 min)
1. Remove unused dependencies
2. Test thoroughly
3. Update lock files
4. Verify build succeeds

### Phase 4: Verification (30 min)
1. Run full test suite
2. Run build
3. Test in staging environment
4. Monitor for errors

Total estimated time: 2-3 hours
```

## Safety Checklist

Before removing code:

- [ ] Code is truly unused (not just low usage)
- [ ] No dynamic imports or reflection usage
- [ ] Not part of public API
- [ ] Not used in external systems
- [ ] Not referenced in documentation/examples
- [ ] Checked git history for usage context
- [ ] Full test suite passes
- [ ] Team reviewed for edge cases

## False Positives to Watch For

Common cases where tools incorrectly flag "dead" code:

1. **Decorators**: Functions used as decorators
2. **Metaclasses**: Classes used in `metaclass=`
3. **Type hints**: Types only used in annotations
4. **Protocols**: Protocol classes (duck typing)
5. **Fixtures**: Pytest fixtures that appear unused
6. **Magic methods**: `__str__`, `__repr__`, etc.
7. **Plugin interfaces**: Implementation of plugin APIs
8. **CLI commands**: Commands registered dynamically
9. **Serialization fields**: Fields used by marshmallow/pydantic
10. **Template variables**: Used in Jinja2/Django templates

## Notes

- Preserve git history by keeping commits focused
- Don't remove code that might be temporarily unused
- Be extra careful with public APIs
- Consider deprecation warnings before removal
- Dead code removal should be a regular maintenance task
