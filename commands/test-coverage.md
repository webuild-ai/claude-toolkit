# Test Coverage

Analyze test coverage and identify gaps requiring additional tests to improve code reliability.

## Instructions

### 1. Run Coverage Analysis

Generate coverage reports for your codebase:

#### Python

```bash
# Run tests with coverage
uv run pytest --cov=src --cov=api --cov-report=html --cov-report=term

# Generate XML report (for CI/CD)
uv run pytest --cov=src --cov-report=xml

# Show missing lines
uv run pytest --cov=src --cov-report=term-missing

# Coverage for specific module
uv run pytest tests/test_user.py --cov=services.user_service
```

#### TypeScript/JavaScript

```bash
# Run tests with coverage (Jest)
zsh -i -c "npm test -- --coverage"

# Generate HTML report
zsh -i -c "npm test -- --coverage --coverageReporters=html"

# Watch mode with coverage
zsh -i -c "npm test -- --coverage --watch"

# Coverage for specific file
zsh -i -c "npm test -- --coverage --collectCoverageFrom='src/services/userService.ts'"
```

### 2. Analyze Coverage Metrics

Understand the four main coverage types:

#### A. Line Coverage

Percentage of code lines executed:

```python
def calculate_discount(price, discount_rate):
    if discount_rate > 1:  # Line covered by test
        raise ValueError("Rate too high")  # Line NOT covered
    return price * (1 - discount_rate)  # Line covered
```

**Coverage**: 66% (2 out of 3 lines executed)

#### B. Branch Coverage

Percentage of code branches (if/else) tested:

```python
def get_status(value):
    if value > 100:  # Branch 1: value > 100 ✓
        return "high"  # Covered
    else:  # Branch 2: value <= 100 ✗
        return "low"  # NOT covered
```

**Branch Coverage**: 50% (1 out of 2 branches tested)

#### C. Function Coverage

Percentage of functions called:

```python
def used_function():  # Called in tests ✓
    pass

def unused_function():  # Never called ✗
    pass
```

**Function Coverage**: 50%

#### D. Statement Coverage

Individual statements executed (similar to line coverage).

### 3. Identify Coverage Gaps

Review the coverage report to find:

#### Critical Uncovered Code

**High Priority** (Must Cover):
- Authentication/authorization logic
- Payment processing
- Data validation
- Security checks
- Error handling in critical paths
- Database transactions

**Medium Priority** (Should Cover):
- Business logic
- API endpoints
- Data transformations
- Configuration parsing
- User input processing

**Low Priority** (Nice to Cover):
- Logging statements
- Simple getters/setters
- Trivial utility functions
- UI presentation logic (test manually)

### 4. Examine Uncovered Lines

For each uncovered section, determine why:

#### A. Error Paths

```python
# Uncovered: Error case not tested
def process_payment(amount):
    if amount < 0:
        raise ValueError("Amount must be positive")  # ⚠️ Uncovered
    return charge_card(amount)

# Add test:
def test_process_payment_negative_amount():
    with pytest.raises(ValueError):
        process_payment(-10)
```

#### B. Edge Cases

```python
# Uncovered: Boundary condition not tested
def categorize_age(age):
    if age < 0:
        return "invalid"  # ⚠️ Uncovered
    if age < 18:
        return "minor"
    return "adult"

# Add test:
def test_categorize_negative_age():
    assert categorize_age(-5) == "invalid"
```

#### C. Rare Conditions

```python
# Uncovered: Uncommon scenario
def handle_response(response):
    if response.status == 200:
        return response.json()
    elif response.status == 404:
        return None
    else:
        raise APIError("Unexpected status")  # ⚠️ Uncovered (500, 503, etc.)

# Add test:
def test_handle_response_server_error():
    response = Mock(status=500)
    with pytest.raises(APIError):
        handle_response(response)
```

#### D. Dead Code

```python
# Uncovered: Never executed code
def legacy_function():
    pass  # ⚠️ No tests because never called

# Either:
# 1. Add tests if function is needed
# 2. Remove function if truly unused (see /dead-code command)
```

### 5. Set Coverage Targets

Establish realistic coverage goals:

#### Recommended Targets

**Project-wide**:
- Minimum: 70%
- Good: 80%
- Excellent: 90%+
- Note: 100% is often impractical and not necessarily better

**Module-specific**:
- Core business logic: 90%+
- API endpoints: 85%+
- Utilities: 80%+
- UI components: 60%+ (complement with E2E tests)
- Configuration/setup: 50%+

#### Track Over Time

```bash
# Save coverage badge
# Python: Generate with coverage-badge
uv run coverage-badge -o coverage.svg

# Track in CI/CD
# Fail build if coverage drops below threshold
uv run pytest --cov=src --cov-fail-under=80
```

### 6. Generate Missing Tests

For each uncovered section, write tests:

#### Example: Uncovered Error Handling

```python
# Coverage report shows line 45 uncovered
def withdraw(account, amount):
    if amount > account.balance:
        raise InsufficientFundsError()  # Line 45: ⚠️ Uncovered
    account.balance -= amount
    return account

# Add test to cover line 45
def test_withdraw_insufficient_funds():
    account = Account(balance=100)
    with pytest.raises(InsufficientFundsError):
        withdraw(account, 150)  # Now line 45 is covered ✓
```

### 7. Review Coverage Report

#### HTML Report (Recommended)

```bash
# Python: Open HTML report
uv run pytest --cov=src --cov-report=html
open htmlcov/index.html

# TypeScript: Open coverage report
zsh -i -c "npm test -- --coverage"
open coverage/index.html
```

**In the HTML report, look for:**
- Red lines: Not executed
- Yellow/orange lines: Partially covered (branches)
- Green lines: Fully covered

#### Terminal Report

```bash
# Python: Detailed terminal output
uv run pytest --cov=src --cov-report=term-missing

# Output shows:
# Name                    Stmts   Miss  Cover   Missing
# -----------------------------------------------------
# src/user.py               45      8    82%   23-25, 67, 89-91
# src/payment.py            67     15    78%   34-38, 56, 78-85
```

### 8. Exclude Irrelevant Code

Some code doesn't need coverage:

#### Coverage Configuration

**Python** (.coveragerc or pyproject.toml):

```ini
[tool.coverage.run]
omit =
    */tests/*
    */migrations/*
    */venv/*
    */node_modules/*
    */conftest.py
    */__init__.py

[tool.coverage.report]
exclude_lines =
    # Don't require coverage for:
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
    @abstractmethod
```

**TypeScript** (jest.config.js):

```javascript
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/index.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 75,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Output Format

```markdown
# Test Coverage Analysis Report

## Summary

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Lines | 78.5% | 80% | ⚠️ Below target |
| Branches | 72.3% | 75% | ⚠️ Below target |
| Functions | 85.2% | 85% | ✅ Met |
| Statements | 78.1% | 80% | ⚠️ Below target |

**Overall Status**: Needs Improvement
**Missing**: ~245 lines uncovered (out of 1,134 total)

## Coverage by Module

| Module | Lines | Branches | Functions | Priority |
|--------|-------|----------|-----------|----------|
| src/auth/ | 92% | 88% | 95% | ✅ Good |
| src/payment/ | 65% | 58% | 70% | 🔴 Critical |
| src/api/ | 81% | 75% | 85% | ✅ Good |
| src/utils/ | 72% | 68% | 78% | ⚠️ Improve |
| src/models/ | 88% | 82% | 90% | ✅ Good |

## Critical Gaps (Fix Immediately)

### 1. Payment Processing - Error Handling
**File**: `src/payment/processor.py`
**Lines**: 45-52 (8 lines uncovered)
**Issue**: Exception handling for failed transactions not tested
**Impact**: High - Could miss payment failures in production
**Priority**: 🔴 Critical

**Missing Tests**:
```python
def test_process_payment_network_error():
    """Test payment failure due to network error."""
    with patch('payment.gateway.charge') as mock:
        mock.side_effect = NetworkError()
        with pytest.raises(PaymentError):
            process_payment(amount=100)

def test_process_payment_declined_card():
    """Test payment failure due to card decline."""
    with patch('payment.gateway.charge') as mock:
        mock.side_effect = CardDeclinedError()
        with pytest.raises(PaymentError) as exc:
            process_payment(amount=100)
        assert 'declined' in str(exc.value).lower()
```

### 2. User Authentication - Rate Limiting
**File**: `src/auth/login.py`
**Lines**: 67-71 (5 lines uncovered)
**Issue**: Rate limiting logic not tested
**Impact**: High - Security feature untested
**Priority**: 🔴 Critical

**Missing Test**:
```python
def test_login_rate_limit_exceeded():
    """Test login rejection after too many attempts."""
    user = User(email="test@example.com")
    # Attempt login 5 times (rate limit)
    for _ in range(5):
        attempt_login(user.email, "wrong_password")

    # 6th attempt should be rate limited
    with pytest.raises(RateLimitError):
        attempt_login(user.email, "wrong_password")
```

## Medium Priority Gaps

### 3. Data Validation - Edge Cases
**File**: `src/models/user.py`
**Lines**: 23-27, 45 (6 lines uncovered)
**Issue**: Boundary validation not tested
**Impact**: Medium - Could allow invalid data
**Priority**: ⚠️ Should Fix

**Missing Tests**: Age validation (negative, zero, extremely large values)

### 4. API Endpoints - Error Responses
**File**: `src/api/users.py`
**Lines**: 89-95 (7 lines uncovered)
**Issue**: 400/500 error responses not tested
**Impact**: Medium - Error handling verification
**Priority**: ⚠️ Should Fix

## Low Priority Gaps

### 5. Utility Functions
**File**: `src/utils/formatters.py`
**Lines**: Various (12 lines uncovered)
**Issue**: Simple formatting functions not fully tested
**Impact**: Low - Simple logic, low risk
**Priority**: 💡 Nice to Have

## Unreachable Code

The following code is flagged as uncovered but may be unreachable:

**File**: `src/legacy/adapter.py` (lines 45-67)
**Recommendation**: Consider removing dead code (use `/dead-code` command)

## Coverage Trend

| Date | Coverage | Change |
|------|----------|--------|
| 2026-01-10 | 76.2% | - |
| 2026-01-13 | 77.8% | +1.6% |
| 2026-01-16 | 78.5% | +0.7% |

**Progress**: Improving (target: 80% by end of month)

## Action Plan

### Phase 1: Critical Fixes (1-2 days)
1. Add payment error handling tests
2. Add authentication rate limiting tests
3. Target: Reach 82% coverage

### Phase 2: Medium Priority (3-4 days)
1. Add data validation edge case tests
2. Add API error response tests
3. Target: Reach 85% coverage

### Phase 3: Low Priority (1 week)
1. Add utility function tests
2. Review and remove dead code
3. Target: Reach 88% coverage

## Commands to Run

```bash
# Generate current coverage
uv run pytest --cov=src --cov-report=html --cov-report=term-missing

# Run tests for specific uncovered modules
uv run pytest tests/test_payment.py --cov=src/payment --cov-report=term-missing

# Check if coverage meets threshold
uv run pytest --cov=src --cov-fail-under=80
```

## Coverage Best Practices

✅ **Do**:
- Focus on critical business logic
- Test error handling and edge cases
- Aim for meaningful tests, not just coverage
- Review coverage reports regularly
- Set realistic, module-specific targets

❌ **Don't**:
- Chase 100% coverage blindly
- Write tests just to increase percentage
- Test trivial code (getters/setters)
- Ignore branch coverage
- Let coverage reports replace code reviews
```

## Coverage Tools

### Python
- **coverage.py**: Standard Python coverage tool
- **pytest-cov**: Pytest plugin for coverage
- **coverage-badge**: Generate coverage badges
- **diff-cover**: Coverage for changed lines only

### TypeScript/JavaScript
- **Jest**: Built-in coverage with Istanbul
- **c8**: Fast native V8 coverage
- **nyc**: Istanbul CLI for non-Jest projects
- **codecov**: Coverage tracking service

## Notes

- Coverage is a guide, not a goal
- 80% coverage with quality tests > 95% with meaningless tests
- Complement with manual testing and code reviews
- Use coverage to find gaps, not to evaluate developers
- Consider mutation testing for true test quality assessment
