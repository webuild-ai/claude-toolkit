# Test Pattern Generation

Patterns for generating comprehensive test cases.

## Test Structure

### Arrange-Act-Assert (AAA)
```python
def test_example():
    # Arrange: Setup
    user = User(name="John")

    # Act: Execute
    result = process_user(user)

    # Assert: Verify
    assert result.success is True
```

### Given-When-Then (BDD)
```typescript
test('should create user when valid data provided', () => {
    // Given: Initial state
    const userData = { name: 'John', email: 'john@example.com' };

    // When: Action
    const result = createUser(userData);

    // Then: Outcome
    expect(result.success).toBe(true);
});
```

## Test Coverage Patterns

### Happy Path
- Normal, expected usage
- Valid inputs
- Successful operations

### Edge Cases
- Boundary values (0, max, min)
- Empty inputs ([], {}, "")
- Null/undefined/None

### Error Cases
- Invalid inputs
- Missing required fields
- Type mismatches
- Out-of-range values

### State-Based Tests
- Test different initial states
- Verify state transitions
- Check final state

## Testing Patterns

### Parameterized Tests
```python
@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 4),
    (3, 6),
])
def test_double(input, expected):
    assert double(input) == expected
```

### Test Factories
```python
class UserFactory:
    @staticmethod
    def create(**overrides):
        defaults = {"name": "Test", "email": "test@example.com"}
        return User(**{**defaults, **overrides})
```

### Mocking External Dependencies
```python
@patch('service.external_api.call')
def test_with_mock(mock_call):
    mock_call.return_value = {"status": "success"}
    result = service.process()
    assert result is not None
```

## Test Types

### Unit Tests
- Test single function/method
- Mock all dependencies
- Fast execution (<1s)

### Integration Tests
- Test multiple components
- Use test database
- Verify interactions

### E2E Tests
- Test complete workflows
- Use real services (or close replicas)
- Verify business scenarios

## Best Practices
- One logical assert per test
- Clear test names (describe what/when/expected)
- Independent tests
- Fast execution
- Repeatable results
- No test interdependencies
