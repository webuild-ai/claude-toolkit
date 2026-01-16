# Refactor Check

Identify code smells and suggest refactoring opportunities to improve code quality and maintainability.

## Instructions

### 1. Scan for Code Smells

Systematically check for common code smell patterns across the codebase.

#### A. Bloaters

Code that has grown too large to handle effectively:

- [ ] **Long Method**: Functions/methods > 50 lines
- [ ] **Large Class**: Classes > 500 lines or too many responsibilities
- [ ] **Long Parameter List**: Functions with > 5 parameters
- [ ] **Data Clumps**: Same group of variables appearing together
- [ ] **Primitive Obsession**: Overuse of primitives instead of small objects

#### B. Object-Orientation Abusers

Solutions that don't fully exploit OO design:

- [ ] **Switch Statements**: Could be replaced with polymorphism
- [ ] **Temporary Field**: Fields only set in certain circumstances
- [ ] **Refused Bequest**: Subclass uses only some inherited methods
- [ ] **Alternative Classes with Different Interfaces**: Similar classes with different method names

#### C. Change Preventers

Patterns that make changes difficult:

- [ ] **Divergent Change**: One class changed for many reasons
- [ ] **Shotgun Surgery**: Small change requires changes in many classes
- [ ] **Parallel Inheritance**: Adding subclass requires adding another subclass

#### D. Dispensables

Unnecessary code that should be removed:

- [ ] **Comments**: Excessive comments explaining bad code
- [ ] **Duplicate Code**: Identical or very similar code segments
- [ ] **Lazy Class**: Classes that don't do enough to justify existence
- [ ] **Data Class**: Classes with only fields and getters/setters
- [ ] **Dead Code**: Unused variables, parameters, methods, classes
- [ ] **Speculative Generality**: Code added for "future" needs

#### E. Couplers

Excessive coupling between classes:

- [ ] **Feature Envy**: Method uses more features of another class
- [ ] **Inappropriate Intimacy**: Classes too dependent on each other
- [ ] **Message Chains**: Long chains like `a.b().c().d()`
- [ ] **Middle Man**: Class delegates most work to another class

### 2. Use Automated Tools

Run static analysis tools to detect code smells:

#### Python
```bash
# Complexity analysis
uv run radon cc . -a -nb

# Maintainability index
uv run radon mi .

# Code quality
uv run ruff check .

# Type checking
uv run mypy .
```

#### TypeScript/JavaScript
```bash
# Linting
zsh -i -c "npm run lint"

# Type checking
zsh -i -c "npx tsc --noEmit"

# Complexity metrics
zsh -i -c "npx complexity-report src/"
```

### 3. Analyze Each File

For each file with potential issues:

#### Review Metrics
- **Cyclomatic Complexity**: Functions with > 10 complexity score
- **Cognitive Complexity**: Functions hard to understand
- **Lines of Code**: Files > 500 lines, functions > 50 lines
- **Code Coverage**: Untested code is likely problematic
- **Dependencies**: Files with > 10 imports may be doing too much

#### Identify Patterns
- Repeated code blocks
- Similar function/class structures
- Common parameter patterns
- Nested conditionals (> 3 levels deep)
- Long parameter lists

### 4. Suggest Refactorings

For each code smell found, suggest specific refactoring techniques:

#### Extract Method
```python
# Before: Long method
def process_order(order):
    # 50 lines of code
    ...

# After: Extracted methods
def process_order(order):
    validate_order(order)
    calculate_total(order)
    apply_discounts(order)
    finalize_order(order)
```

#### Replace Conditional with Polymorphism
```python
# Before: Switch statement
def get_speed(vehicle_type):
    if vehicle_type == "car":
        return 60
    elif vehicle_type == "truck":
        return 40
    elif vehicle_type == "bike":
        return 20

# After: Polymorphism
class Vehicle:
    def get_speed(self): pass

class Car(Vehicle):
    def get_speed(self): return 60
```

#### Introduce Parameter Object
```python
# Before: Long parameter list
def create_user(name, email, age, address, city, country, postal_code):
    pass

# After: Parameter object
class UserInfo:
    def __init__(self, name, email, age, address):
        self.name = name
        self.email = email
        self.age = age
        self.address = address

def create_user(user_info: UserInfo):
    pass
```

#### Extract Class
```python
# Before: Large class
class Order:
    def __init__(self):
        self.items = []
        self.customer_name = ""
        self.customer_email = ""
        self.shipping_address = ""
        # ... 50 more fields and methods

# After: Extracted classes
class Customer:
    def __init__(self, name, email):
        self.name = name
        self.email = email

class ShippingAddress:
    def __init__(self, street, city, postal_code):
        ...

class Order:
    def __init__(self, customer: Customer, shipping: ShippingAddress):
        self.items = []
        self.customer = customer
        self.shipping = shipping
```

### 5. Prioritize Refactorings

Order refactoring opportunities by impact:

**High Priority** (Fix Soon):
- Duplicated code in critical paths
- Security vulnerabilities
- Performance bottlenecks
- Code preventing new features

**Medium Priority** (Plan to Fix):
- Complex methods making debugging difficult
- Classes with too many responsibilities
- Poor test coverage areas

**Low Priority** (Nice to Have):
- Naming improvements
- Comment cleanup
- Minor style issues

## Output Format

```markdown
# Refactoring Opportunities

## High Priority

### 1. Duplicate Authentication Logic (3 occurrences)
**Files**: `auth/login.py`, `auth/register.py`, `auth/reset.py`
**Issue**: Same JWT validation code repeated in 3 places
**Suggestion**: Extract to `auth/jwt_validator.py` shared module
**Impact**: Easier to maintain, fix bugs in one place
**Effort**: 1-2 hours

### 2. Large OrderProcessor Class (847 lines)
**File**: `services/order_processor.py`
**Issue**: Class handles order, payment, inventory, shipping
**Suggestion**: Extract separate classes:
- `OrderValidator`
- `PaymentProcessor`
- `InventoryManager`
- `ShippingCoordinator`
**Impact**: Better testability, single responsibility
**Effort**: 4-6 hours

## Medium Priority

### 3. Long Parameter Lists in create_user()
**File**: `models/user.py`
**Issue**: Function has 9 parameters
**Suggestion**: Introduce UserCreateRequest parameter object
**Impact**: Easier to extend, clearer API
**Effort**: 1 hour

## Low Priority

### 4. Speculative Generality in AbstractFactory
**File**: `utils/factory.py`
**Issue**: Complex factory pattern for only 2 concrete classes
**Suggestion**: Simplify to direct instantiation until more types added
**Impact**: Simpler code, easier to understand
**Effort**: 30 minutes

## Metrics Summary

- Files analyzed: 156
- Total code smells found: 23
- High priority: 5
- Medium priority: 12
- Low priority: 6
- Estimated total effort: 15-20 hours
- Potential lines reduced: ~1200 lines
```

## Tools Reference

### Python Tools
- **radon**: Complexity metrics
- **ruff**: Fast linter with many checks
- **mypy**: Type checking
- **vulture**: Find dead code
- **bandit**: Security issues

### TypeScript/JavaScript Tools
- **ESLint**: Linting with many rules
- **SonarQube**: Code quality platform
- **Code Climate**: Maintainability metrics
- **ts-prune**: Find unused exports

## Refactoring Best Practices

1. **Write tests first**: Ensure behavior doesn't change
2. **Small steps**: Refactor incrementally, commit often
3. **One smell at a time**: Don't mix multiple refactorings
4. **Run tests frequently**: After each small change
5. **Review with team**: Discuss proposed refactorings
6. **Don't over-engineer**: Refactor for current needs, not hypothetical future

## When NOT to Refactor

- No tests exist (write tests first)
- Near a major release (defer to next sprint)
- Code is temporary/experimental
- Effort significantly outweighs benefit
- Team doesn't have capacity

## Notes

- Focus on code that changes frequently - that's where refactoring pays off
- Use code coverage tools to find untested code
- Consider technical debt in sprint planning
- Track refactoring efforts and impact for future estimation
