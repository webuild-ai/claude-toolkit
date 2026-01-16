# Test Generate

Generate test cases based on TDD (Test-Driven Development) principles for better code coverage and reliability.

## Instructions

### 1. Identify Code to Test

Determine what needs testing:

- **New features**: Write tests before implementation (TDD)
- **Bug fixes**: Write tests reproducing the bug first
- **Uncovered code**: Use coverage reports to find gaps
- **Critical paths**: User authentication, payment processing, data validation
- **Complex logic**: Algorithms, calculations, business rules

### 2. Choose Test Type

Select appropriate test level:

#### Unit Tests
- Test individual functions/methods in isolation
- Mock external dependencies
- Fast execution (< 1s per test)
- High coverage of edge cases

#### Integration Tests
- Test multiple components together
- Use real or test databases
- Verify APIs and data flow
- Moderate execution time

#### End-to-End Tests
- Test complete user workflows
- Use actual UI and services
- Verify business scenarios
- Slower execution

### 3. Follow TDD Process

#### Red-Green-Refactor Cycle

1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

```python
# Step 1: RED - Write failing test
def test_calculate_discount():
    result = calculate_discount(100, 0.2)
    assert result == 80

# Step 2: GREEN - Make it pass
def calculate_discount(price, discount_rate):
    return price * (1 - discount_rate)

# Step 3: REFACTOR - Improve if needed
def calculate_discount(price: float, discount_rate: float) -> float:
    """Calculate price after discount."""
    if not 0 <= discount_rate <= 1:
        raise ValueError("Discount rate must be between 0 and 1")
    return round(price * (1 - discount_rate), 2)

# Add more tests for edge cases
def test_calculate_discount_invalid_rate():
    with pytest.raises(ValueError):
        calculate_discount(100, 1.5)
```

### 4. Generate Test Cases

For each function/method, generate tests covering:

#### A. Happy Path

Normal, expected usage:

```python
def test_create_user_success():
    """Test creating a user with valid data."""
    user = create_user(
        name="John Doe",
        email="john@example.com",
        age=30
    )
    assert user.name == "John Doe"
    assert user.email == "john@example.com"
    assert user.age == 30
```

#### B. Edge Cases

Boundary conditions:

```python
def test_calculate_discount_zero_price():
    """Test discount calculation with zero price."""
    result = calculate_discount(0, 0.2)
    assert result == 0

def test_calculate_discount_zero_rate():
    """Test discount calculation with zero discount."""
    result = calculate_discount(100, 0)
    assert result == 100

def test_calculate_discount_full_discount():
    """Test discount calculation with 100% discount."""
    result = calculate_discount(100, 1.0)
    assert result == 0
```

#### C. Error Cases

Invalid inputs and exceptions:

```python
def test_create_user_invalid_email():
    """Test creating user with invalid email format."""
    with pytest.raises(ValidationError) as exc:
        create_user(name="John", email="invalid", age=30)
    assert "Invalid email format" in str(exc.value)

def test_create_user_negative_age():
    """Test creating user with negative age."""
    with pytest.raises(ValueError) as exc:
        create_user(name="John", email="john@example.com", age=-5)
    assert "Age must be positive" in str(exc.value)
```

#### D. Null/Empty Cases

```typescript
describe('processUserData', () => {
  it('should handle null user', () => {
    expect(() => processUserData(null)).toThrow('User cannot be null');
  });

  it('should handle empty user object', () => {
    expect(() => processUserData({})).toThrow('Invalid user data');
  });

  it('should handle user with missing fields', () => {
    const user = { name: 'John' };  // missing email
    expect(() => processUserData(user)).toThrow('Email is required');
  });
});
```

### 5. Use Test Patterns

#### Arrange-Act-Assert (AAA)

```python
def test_user_authentication():
    # Arrange: Set up test data and dependencies
    user = User(username="john", password_hash=hash_password("secret"))
    auth_service = AuthenticationService()

    # Act: Execute the code being tested
    result = auth_service.authenticate(user, "secret")

    # Assert: Verify the outcome
    assert result.is_authenticated
    assert result.user_id == user.id
```

#### Given-When-Then (BDD Style)

```typescript
describe('User Registration', () => {
  it('should create user account when valid data provided', () => {
    // Given: A new user with valid data
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!'
    };

    // When: Registering the user
    const result = registerUser(userData);

    // Then: User account is created
    expect(result.success).toBe(true);
    expect(result.user.email).toBe('john@example.com');
    expect(result.user.passwordHash).toBeDefined();
    expect(result.user.passwordHash).not.toBe('SecurePass123!');
  });
});
```

### 6. Mock External Dependencies

#### Python (pytest with unittest.mock)

```python
from unittest.mock import Mock, patch

def test_fetch_user_from_api():
    # Mock HTTP client
    mock_client = Mock()
    mock_client.get.return_value = {
        'id': '123',
        'name': 'John Doe'
    }

    # Inject mock
    service = UserService(http_client=mock_client)
    user = service.fetch_user('123')

    # Verify
    assert user.name == 'John Doe'
    mock_client.get.assert_called_once_with('/users/123')

@patch('services.database.connect')
def test_save_user_to_database(mock_connect):
    """Test saving user with mocked database."""
    mock_db = Mock()
    mock_connect.return_value = mock_db

    user = User(name="John", email="john@example.com")
    save_user(user)

    mock_db.execute.assert_called_once()
```

#### TypeScript (Jest)

```typescript
import { jest } from '@jest/globals';

describe('UserService', () => {
  it('should fetch user from API', async () => {
    // Mock HTTP client
    const mockFetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ id: '123', name: 'John Doe' })
    });
    global.fetch = mockFetch;

    const service = new UserService();
    const user = await service.getUser('123');

    expect(user.name).toBe('John Doe');
    expect(mockFetch).toHaveBeenCalledWith('/api/users/123');
  });
});
```

### 7. Test Data Builders

Create reusable test data factories:

#### Python

```python
# tests/factories.py
class UserFactory:
    @staticmethod
    def create(
        name: str = "Test User",
        email: str = "test@example.com",
        age: int = 25,
        **kwargs
    ) -> User:
        defaults = {
            "name": name,
            "email": email,
            "age": age
        }
        defaults.update(kwargs)
        return User(**defaults)

# Usage in tests
def test_admin_user():
    admin = UserFactory.create(role="admin", permissions=["all"])
    assert admin.is_admin()

def test_regular_user():
    user = UserFactory.create()  # Uses defaults
    assert not user.is_admin()
```

#### TypeScript

```typescript
// tests/factories.ts
export class UserFactory {
  static create(overrides?: Partial<User>): User {
    return {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
      ...overrides
    };
  }
}

// Usage in tests
describe('User operations', () => {
  it('should validate admin user', () => {
    const admin = UserFactory.create({ role: 'admin' });
    expect(admin.isAdmin()).toBe(true);
  });
});
```

### 8. Parameterized Tests

Test multiple scenarios with same logic:

#### Python (pytest)

```python
import pytest

@pytest.mark.parametrize("price,discount,expected", [
    (100, 0.1, 90),
    (100, 0.5, 50),
    (100, 1.0, 0),
    (50, 0.2, 40),
    (0, 0.5, 0),
])
def test_calculate_discount_scenarios(price, discount, expected):
    result = calculate_discount(price, discount)
    assert result == expected
```

#### TypeScript (Jest)

```typescript
describe.each([
  [100, 0.1, 90],
  [100, 0.5, 50],
  [100, 1.0, 0],
  [50, 0.2, 40],
  [0, 0.5, 0],
])('calculateDiscount(%d, %f)', (price, discount, expected) => {
  it(`should return ${expected}`, () => {
    expect(calculateDiscount(price, discount)).toBe(expected);
  });
});
```

### 9. Run Tests

#### Python

```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/test_user.py

# Run specific test
uv run pytest tests/test_user.py::test_create_user_success

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Run in watch mode
uv run pytest-watch
```

#### TypeScript

```bash
# Run all tests
zsh -i -c "npm test"

# Run specific test file
zsh -i -c "npm test user.test.ts"

# Run in watch mode
zsh -i -c "npm test -- --watch"

# Run with coverage
zsh -i -c "npm test -- --coverage"
```

## Output Format

```markdown
# Generated Tests for UserService

## Summary
- Functions analyzed: 8
- Tests generated: 24
- Test types: 16 unit, 5 integration, 3 e2e
- Coverage estimate: 85%

## Unit Tests Generated

### test_create_user.py

\`\`\`python
import pytest
from services.user_service import create_user
from models.user import User
from exceptions import ValidationError

class TestCreateUser:
    """Tests for create_user function."""

    def test_create_user_with_valid_data(self):
        """Should create user with valid input."""
        # Arrange
        user_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "age": 30
        }

        # Act
        user = create_user(**user_data)

        # Assert
        assert isinstance(user, User)
        assert user.name == "John Doe"
        assert user.email == "john@example.com"
        assert user.age == 30
        assert user.id is not None
        assert user.created_at is not None

    def test_create_user_with_invalid_email(self):
        """Should raise ValidationError for invalid email."""
        with pytest.raises(ValidationError) as exc:
            create_user(name="John", email="invalid-email", age=30)
        assert "email" in str(exc.value).lower()

    def test_create_user_with_negative_age(self):
        """Should raise ValueError for negative age."""
        with pytest.raises(ValueError) as exc:
            create_user(name="John", email="john@example.com", age=-5)
        assert "age" in str(exc.value).lower()

    def test_create_user_with_empty_name(self):
        """Should raise ValidationError for empty name."""
        with pytest.raises(ValidationError):
            create_user(name="", email="john@example.com", age=30)

    @pytest.mark.parametrize("age", [0, 1, 18, 100, 150])
    def test_create_user_with_boundary_ages(self, age):
        """Should accept boundary age values."""
        user = create_user(
            name="John",
            email=f"john{age}@example.com",
            age=age
        )
        assert user.age == age
\`\`\`

### Usage

Run these tests:
\`\`\`bash
uv run pytest tests/test_create_user.py -v
\`\`\`

Expected output:
\`\`\`
tests/test_create_user.py::TestCreateUser::test_create_user_with_valid_data PASSED
tests/test_create_user.py::TestCreateUser::test_create_user_with_invalid_email PASSED
tests/test_create_user.py::TestCreateUser::test_create_user_with_negative_age PASSED
tests/test_create_user.py::TestCreateUser::test_create_user_with_empty_name PASSED
tests/test_create_user.py::TestCreateUser::test_create_user_with_boundary_ages[0] PASSED
tests/test_create_user.py::TestCreateUser::test_create_user_with_boundary_ages[1] PASSED
tests/test_create_user.py::TestCreateUser::test_create_user_with_boundary_ages[18] PASSED
tests/test_create_user.py::TestCreateUser::test_create_user_with_boundary_ages[100] PASSED
tests/test_create_user.py::TestCreateUser::test_create_user_with_boundary_ages[150] PASSED

9 passed in 0.34s
\`\`\`
```

## Test Generation Checklist

For each function, ensure tests cover:

- [ ] Happy path with valid inputs
- [ ] Invalid inputs (raise appropriate errors)
- [ ] Null/None/undefined inputs
- [ ] Empty collections ([], {}, "")
- [ ] Boundary values (0, max, min)
- [ ] Edge cases specific to domain
- [ ] Error messages are descriptive
- [ ] Mocks for external dependencies
- [ ] Cleanup/teardown if needed

## Best Practices

1. **One assertion per test** (when possible)
2. **Test behavior, not implementation**
3. **Use descriptive test names**
4. **Keep tests independent**
5. **Fast execution** (< 1s for unit tests)
6. **Repeatable** (same result every time)
7. **Self-validating** (pass/fail, no manual check)

## Notes

- TDD leads to better design and fewer bugs
- Write tests for public APIs, not internal implementation
- Use code coverage as a guide, not a goal
- 100% coverage doesn't mean bug-free code
- Focus testing effort on critical and complex code
