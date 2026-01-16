# Naming Review

Review and improve variable, function, class, and file naming conventions for better code readability and maintainability.

## Instructions

### 1. Review Naming Conventions

Check that names follow established patterns for the project's language and framework.

#### General Principles

- **Clear and Descriptive**: Names should explain purpose without comments
- **Consistent**: Follow the same patterns throughout codebase
- **Pronounceable**: Easy to say in conversations
- **Searchable**: Avoid single-letter names (except loop indices)
- **No Abbreviations**: Unless widely known (HTTP, API, URL)
- **Context Appropriate**: Include enough context, not too much

### 2. Language-Specific Conventions

#### Python (PEP 8)

```python
# Variables and functions: snake_case
user_count = 10
def calculate_total_price():
    pass

# Classes: PascalCase
class UserProfile:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3
API_ENDPOINT = "https://api.example.com"

# Private: Leading underscore
def _internal_helper():
    pass

# Protected (convention): Single underscore
class BaseClass:
    def _protected_method(self):
        pass

# Name mangling: Double underscore
class MyClass:
    def __private_method(self):
        pass

# Module: lowercase with underscores
# file: data_processor.py
```

#### TypeScript/JavaScript

```typescript
// Variables and functions: camelCase
let userCount = 10;
function calculateTotalPrice() {}

// Classes: PascalCase
class UserProfile {}

// Interfaces: PascalCase (with or without 'I' prefix, be consistent)
interface User {}
// or
interface IUser {}

// Type aliases: PascalCase
type UserId = string;

// Constants: UPPER_SNAKE_CASE or camelCase
const MAX_RETRY_COUNT = 3;
const apiEndpoint = "https://api.example.com";  // If immutable object

// Private: # prefix (modern) or _ convention
class MyClass {
  #privateField: string;
  _conventionPrivate: string;
}

// Enums: PascalCase for enum and values
enum UserRole {
  Admin = 'ADMIN',
  User = 'USER'
}

// Files: kebab-case or camelCase
// file: user-profile.ts or userProfile.ts
```

### 3. Specific Naming Patterns

#### A. Boolean Variables

Should ask a question:

```typescript
// Good
isActive, hasPermission, canEdit, shouldUpdate
wasDeleted, willExpire, didComplete

// Bad
active, permission, edit, update
deleted, expire, complete
```

#### B. Functions/Methods

Should be verbs or verb phrases:

```typescript
// Good: Actions
function calculateTotal() {}
function fetchUserData() {}
function saveToDatabase() {}
function validateInput() {}

// Good: Queries (return boolean)
function isValid() {}
function hasAccess() {}
function canProceed() {}

// Good: Getters/Setters
function getUserName() {}
function setUserEmail() {}

// Bad: Nouns or unclear
function total() {}  // Calculate? Get? Set?
function user() {}  // What about user?
function data() {}  // Too vague
```

#### C. Classes

Should be nouns or noun phrases:

```typescript
// Good
class UserProfile {}
class DataProcessor {}
class AuthenticationService {}
class PaymentGateway {}
class ValidationError {}

// Bad
class Manage {}  // Too vague
class DoStuff {}  // Not descriptive
class Process {}  // Verb, not noun
class Utils {}  // Generic utility dumping ground
```

#### D. Collections

Should be plural:

```typescript
// Good
const users = [];
const orderItems = [];
const errorMessages = [];

// Bad
const userList = [];  // 'List' is redundant
const arrayOfUsers = [];  // Type in name
```

#### E. Don't Encode Type in Name

```typescript
// Bad
const userString = "John";
const priceInteger = 100;
const userArray = [];
const userObject = {};

// Good
const userName = "John";
const price = 100;
const users = [];
const user = {};
```

### 4. Identify Naming Issues

Scan code for common naming problems:

#### Single Letter Names (Except Loops)

```python
# Bad
def process(d, u, p):
    return d * u + p

# Good
def calculate_price(discount: float, unit_price: float, quantity: int) -> float:
    return discount * unit_price * quantity

# Acceptable in loops
for i, item in enumerate(items):
    for j in range(len(matrix[i])):
        process(matrix[i][j])
```

#### Abbreviations and Acronyms

```typescript
// Bad
function procUsrData(usr, cfg) {
  const res = calc(usr.val);
  return fmt(res);
}

// Good
function processUserData(user: User, config: Config) {
  const result = calculate(user.value);
  return format(result);
}

// Acceptable: Well-known abbreviations
const apiUrl = "https://api.example.com";  // API is widely known
const httpClient = new HttpClient();  // HTTP is standard
const userId = user.id;  // ID is clear
```

#### Meaningless Names

```python
# Bad
def foo(data1, data2):
    temp = data1 + data2
    thing = temp * 2
    return thing

# Good
def calculate_total_with_bonus(base_amount: float, bonus: float) -> float:
    subtotal = base_amount + bonus
    total_with_doubling = subtotal * 2
    return total_with_doubling
```

#### Too Generic

```typescript
// Bad
class Manager {}  // Manager of what?
function process() {}  // Process what?
const data = {};  // What kind of data?
const result = calculate();  // Result of what?

// Good
class UserManager {}
function processPayment() {}
const userData = {};
const totalPrice = calculate();
```

#### Inconsistent Naming

```python
# Bad: Inconsistent patterns
def get_user():
    pass

def fetchOrder():  # Different pattern
    pass

def retrieve_product():  # Yet another pattern
    pass

# Good: Consistent pattern
def get_user():
    pass

def get_order():
    pass

def get_product():
    pass
```

### 5. Refactor Names

For each naming issue found, suggest better names:

#### Create Renaming Script

```python
# Example: Rename variable across project
import re
import os

old_name = "usr"
new_name = "user"

for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(".py"):
            # Use IDE refactoring instead when possible
            # This is for illustration
            pass
```

#### Use IDE Refactoring

Most IDEs support safe renaming:

- **VSCode**: F2 or Right-click → Rename Symbol
- **PyCharm**: Shift+F6
- **IntelliJ**: Shift+F6

This ensures all references are updated.

### 6. Create Naming Guidelines

Document project-specific naming conventions:

```markdown
# Project Naming Conventions

## Python
- Variables/Functions: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private: `_leading_underscore`

## TypeScript
- Variables/Functions: `camelCase`
- Classes/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Enums: `PascalCase`

## Files
- Python: `snake_case.py`
- TypeScript: `kebab-case.ts` or `PascalCase.tsx` for components

## Domain-Specific
- User IDs: Always use `userId`, not `uid`, `user_id`, or `id`
- Timestamps: Use `createdAt`, `updatedAt` (not `created`, `modified`)
- API responses: `ApiResponse` suffix for types

## Prohibited
- Single letters (except i, j, k in loops)
- Hungarian notation (strName, intCount)
- Generic names (data, info, temp, stuff)
```

## Output Format

```markdown
# Naming Review Report

## Summary
- Files reviewed: 87
- Naming issues found: 124
- Critical issues: 12
- Inconsistencies: 45
- Minor improvements: 67

## Critical Issues (Fix Now)

### 1. Single Letter Function Parameters
**File**: `src/services/payment.py:45`
**Current**: `def process(a, b, c):`
**Issue**: Parameters 'a', 'b', 'c' are not descriptive
**Suggestion**:
```python
def process_payment(
    amount: Decimal,
    currency: str,
    payment_method: PaymentMethod
) -> PaymentResult:
```

### 2. Misleading Boolean Name
**File**: `src/models/user.ts:23`
**Current**: `active: boolean`
**Issue**: Not clear if it's asking a question
**Suggestion**: `isActive: boolean` or `hasActiveStatus: boolean`

### 3. Abbreviated Class Name
**File**: `src/utils/validation.py:12`
**Current**: `class UsrValidator:`
**Issue**: 'Usr' is abbreviated
**Suggestion**: `class UserValidator:`

## Inconsistencies (Standardize)

### 4. Mixed Fetch/Get Pattern
**Files**: Multiple files
**Issue**: Some functions use 'get', others use 'fetch' for same operation
**Occurrences**:
- `getUserById()` - auth.ts
- `fetchUserById()` - api.ts
- `retrieveUserById()` - db.ts
**Suggestion**: Standardize on `getUser` pattern throughout

### 5. Inconsistent ID Naming
**Files**: Multiple files
**Issue**: User IDs referred to differently
**Variants found**:
- `userId` (47 occurrences)
- `user_id` (23 occurrences)
- `uid` (15 occurrences)
- `id` (89 occurrences in User context)
**Suggestion**: Standardize on `userId` everywhere

## Minor Improvements (Nice to Have)

### 6. Generic Variable Name
**File**: `src/handlers/order.py:67`
**Current**: `data = process(order)`
**Suggestion**: `processed_order = process_order(order)`

### 7. Type in Variable Name
**File**: `src/components/UserList.tsx:34`
**Current**: `const userArray = [];`
**Suggestion**: `const users = [];`

## Renaming Plan

### Phase 1: Critical Renames (2 hours)
Use IDE refactoring to rename:
1. `process` → `process_payment` (payment.py)
2. `UsrValidator` → `UserValidator` (validation.py)
3. `active` → `isActive` (all boolean flags)

### Phase 2: Standardization (3 hours)
1. Standardize fetch/get pattern to 'get'
2. Unify all user ID references to `userId`
3. Remove type suffixes (Array, String, etc.)

### Phase 3: Minor Improvements (2 hours)
1. Rename generic 'data' variables
2. Expand abbreviations
3. Improve function verb choices

Total estimated time: 7 hours

## Automated Fixes

Can be automated with search/replace:
```bash
# Example: Rename usr → user (careful with this!)
grep -rl "\\busr\\b" src/ | xargs sed -i '' 's/\\busr\\b/user/g'
```

**Recommendation**: Use IDE refactoring instead for safety

## Before/After Examples

### Example 1: Function with unclear params
```python
# Before
def calc(a, b, c, d):
    return (a * b) + (c * d)

# After
def calculate_total_price(
    quantity: int,
    unit_price: Decimal,
    tax_rate: Decimal,
    shipping: Decimal
) -> Decimal:
    return (quantity * unit_price) + (tax_rate * shipping)
```

### Example 2: Boolean naming
```typescript
// Before
interface User {
  active: boolean;
  verified: boolean;
  premium: boolean;
}

// After
interface User {
  isActive: boolean;
  isVerified: boolean;
  hasPremiumSubscription: boolean;
}
```

### Example 3: Consistent patterns
```python
# Before: Inconsistent
def get_user():
    pass

def fetchOrder():
    pass

def retrieveProduct():
    pass

# After: Consistent
def get_user():
    pass

def get_order():
    pass

def get_product():
    pass
```

## Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Avg name length | 8.3 chars | 14.2 chars | +71% |
| Single letter vars | 34 | 0 | -100% |
| Abbreviations | 67 | 5 | -92% |
| Inconsistent patterns | 45 | 0 | -100% |
```

## Naming Checklist

For each new name, verify:

- [ ] Describes what, not how
- [ ] Pronounceable in conversation
- [ ] Searchable (not a common word)
- [ ] Not an abbreviation (unless standard)
- [ ] Follows language conventions
- [ ] Consistent with similar code
- [ ] Appropriate length (not too short, not too long)
- [ ] No type encoding in name
- [ ] Boolean names ask yes/no question
- [ ] Function names start with verb
- [ ] Class names are nouns

## Notes

- Good names reduce the need for comments
- Consistent naming reduces cognitive load
- Invest time in naming - you'll read code more than write it
- When in doubt, prefer clarity over brevity
- Update names as understanding of the domain improves
