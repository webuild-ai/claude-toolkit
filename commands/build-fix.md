# Build Fix

Diagnose and fix build errors across Python and TypeScript projects.

## Instructions

### 1. Run Build and Capture Errors

#### Python
```bash
# Check syntax
uv run python -m compileall .

# Type checking
uv run mypy .

# Build package
uv build
```

#### TypeScript
```bash
# Type checking
zsh -i -c "npx tsc --noEmit"

# Build
zsh -i -c "npm run build"
```

### 2. Common Python Build Errors

#### Import Errors
```python
# Error: ModuleNotFoundError: No module named 'fastapi'
# Fix: Install missing dependency
uv add fastapi

# Error: ImportError: cannot import name 'Foo' from 'module'
# Fix: Check if name exists, fix typo, or update import
```

#### Type Errors
```python
# Error: Incompatible types in assignment
# Fix: Add type annotations or use proper types
from typing import List

def process(items: List[str]) -> List[int]:
    return [len(item) for item in items]
```

#### Syntax Errors
```python
# Error: SyntaxError: invalid syntax
# Fix: Check for:
# - Missing colons
# - Mismatched parentheses/brackets
# - Invalid indentation
```

### 3. Common TypeScript Build Errors

#### Type Errors
```typescript
// Error: Type 'string | undefined' is not assignable to type 'string'
// Fix: Add null check
const name: string = user?.name ?? 'default';

// Error: Property 'foo' does not exist on type 'Bar'
// Fix: Add property or use correct type
interface Bar {
  foo: string;
}
```

#### Module Errors
```typescript
// Error: Cannot find module './component'
// Fix: Check file exists, extension correct
import { Component } from './component';  // Add .tsx if needed

// Error: Module has no exported member
// Fix: Check export exists
export interface User {  // Must be exported
  name: string;
}
```

### 4. Clear Caches

Build issues often resolve after clearing caches:

```bash
# Python
rm -rf __pycache__ .pytest_cache .mypy_cache
rm -rf dist/ build/ *.egg-info

# TypeScript
rm -rf node_modules dist .next
zsh -i -c "npm install"

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### 5. Check Dependencies

```bash
# Python: Verify all dependencies installed
uv sync

# TypeScript: Reinstall dependencies
rm -rf node_modules package-lock.json
zsh -i -c "npm install"

# Check for conflicting versions
zsh -i -c "npm ls"
```

### 6. Fix Common Patterns

#### Missing Dependencies
```bash
# Add missing packages
uv add package-name

# Or from error message
# Error: ModuleNotFoundError: No module named 'pydantic'
uv add pydantic
```

#### Version Conflicts
```bash
# Python: Update conflicting package
uv add "package>=2.0.0,<3.0.0"

# TypeScript: Resolve peer dependency
zsh -i -c "npm install package@compatible-version"
```

#### Path Issues
```typescript
// Use path aliases in tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

// Then import:
import { Component } from '@/components/Component';
```

### 7. Incremental Fix Process

1. **Fix first error**: Don't try to fix all at once
2. **Rebuild**: Check if error is gone
3. **Repeat**: Move to next error
4. **Test**: Run tests after each fix

## Output Format

```markdown
# Build Fix Report

## Build Status: ❌ FAILED → ✅ FIXED

## Errors Found: 8

### 1. Type Error in user.service.ts ✅ FIXED
**Error**:
```
src/services/user.service.ts:45:12 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.
```

**Fix**:
Added null check with nullish coalescing:
```typescript
const userName: string = user?.name ?? 'Unknown';
```

### 2. Missing Dependency ✅ FIXED
**Error**:
```
ModuleNotFoundError: No module named 'pydantic'
```

**Fix**:
```bash
uv add pydantic
```

### 3. Import Path Error ✅ FIXED
**Error**:
```
Cannot find module './Component'
```

**Fix**:
Changed import from `./Component` to `./Component.tsx`

## Actions Taken
1. Cleared TypeScript cache
2. Reinstalled node_modules
3. Fixed 6 type errors
4. Added 2 missing dependencies
5. Updated import paths

## Build Output
- Compilation: ✅ Success
- Type checking: ✅ No errors
- Tests: ✅ All passing (127/127)
- Bundle size: 2.4 MB (unchanged)

## Time to Fix: 15 minutes
```

## Best Practices

- Fix errors one at a time
- Clear caches first
- Check dependency versions
- Read error messages carefully
- Use TypeScript strict mode
- Keep dependencies updated
- Test after each fix

## Notes

- Most build errors are type or import issues
- Cache clearing fixes many mysterious errors
- Check tsconfig.json / pyproject.toml configuration
- Use IDE for better error detection
