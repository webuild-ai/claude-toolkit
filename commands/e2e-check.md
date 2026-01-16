# E2E Check

Validate end-to-end workflows and integration points to ensure the complete system functions correctly from the user's perspective.

## Instructions

### 1. Identify Critical User Workflows

Map out key user journeys that must work:

**E-commerce Example**:
- Browse products → Add to cart → Checkout → Payment → Confirmation
- User registration → Email verification → Profile setup
- Search products → Filter results → View details → Add review

**SaaS Application**:
- Sign up → Onboarding → Create project → Invite team → Complete first task
- Login → Dashboard → View analytics → Export report
- Configure settings → Test integration → Deploy

**AI Agent Platform**:
- Create workflow → Configure agents → Test locally → Deploy → Monitor execution
- Manage users → Assign roles → Test permissions → Audit logs

### 2. Choose E2E Testing Approach

Select appropriate tools for your stack:

#### Web Applications (Frontend)

**Playwright** (Recommended):
```bash
# Install
zsh -i -c "npm install --save-dev @playwright/test"
zsh -i -c "npx playwright install"

# Run tests
zsh -i -c "npx playwright test"

# Run with UI
zsh -i -c "npx playwright test --ui"

# Debug mode
zsh -i -c "npx playwright test --debug"
```

**Cypress** (Alternative):
```bash
zsh -i -c "npm install --save-dev cypress"
zsh -i -c "npx cypress open"
```

#### API Workflows

**Python (requests + pytest)**:
```bash
uv add --dev requests pytest
uv run pytest tests/e2e/
```

**TypeScript (supertest)**:
```bash
zsh -i -c "npm install --save-dev supertest @types/supertest"
```

### 3. Write E2E Test Scenarios

#### A. Complete User Flow (Playwright)

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('complete purchase from product page to confirmation', async ({ page }) => {
    // 1. Navigate to product page
    await page.goto('/products/laptop-123');
    await expect(page.locator('h1')).toContainText('Gaming Laptop');

    // 2. Add to cart
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('.cart-badge')).toContainText('1');

    // 3. Go to cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('.cart-item')).toBeVisible();

    // 4. Proceed to checkout
    await page.click('[data-testid="checkout-button"]');

    // 5. Fill shipping address
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="city"]', 'New York');
    await page.selectOption('[name="country"]', 'US');
    await page.fill('[name="zip"]', '10001');
    await page.click('[data-testid="continue-to-payment"]');

    // 6. Enter payment details (use test card)
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="cardExpiry"]', '12/25');
    await page.fill('[name="cardCvc"]', '123');
    await page.fill('[name="cardName"]', 'John Doe');

    // 7. Complete purchase
    await page.click('[data-testid="place-order"]');

    // 8. Verify confirmation
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('h1')).toContainText('Thank you');
    await expect(page.locator('.order-number')).toBeVisible();

    // 9. Verify email sent (check test inbox or mock)
    // In real scenario: verify confirmation email
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    // Setup: Add item to cart and proceed to payment
    await page.goto('/cart');
    await page.click('[data-testid="checkout-button"]');
    // ... fill address ...

    // Use test card that triggers decline
    await page.fill('[name="cardNumber"]', '4000000000000002');
    await page.click('[data-testid="place-order"]');

    // Verify error handling
    await expect(page.locator('.error-message'))
      .toContainText('payment declined');
    await expect(page).toHaveURL(/\/checkout/);  // Still on checkout page
  });
});
```

#### B. API Integration Flow (Python)

```python
# tests/e2e/test_user_workflow.py
import pytest
import requests

BASE_URL = "http://localhost:8000"

class TestUserWorkflow:
    """E2E test for complete user registration and usage workflow."""

    def test_user_registration_to_api_usage(self):
        """Test complete flow: register → verify → login → use API."""

        # 1. Register new user
        register_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": "test@example.com",
                "password": "SecurePass123!",
                "name": "Test User"
            }
        )
        assert register_response.status_code == 201
        user_data = register_response.json()
        assert "userId" in user_data

        # 2. Verify email (simulate clicking verification link)
        verification_token = user_data["verificationToken"]
        verify_response = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"token": verification_token}
        )
        assert verify_response.status_code == 200

        # 3. Login to get access token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "SecurePass123!"
            }
        )
        assert login_response.status_code == 200
        tokens = login_response.json()
        access_token = tokens["accessToken"]

        # 4. Use API with authenticated request
        headers = {"Authorization": f"Bearer {access_token}"}

        # Create a resource
        create_response = requests.post(
            f"{BASE_URL}/api/projects",
            headers=headers,
            json={"name": "Test Project", "description": "E2E Test"}
        )
        assert create_response.status_code == 201
        project = create_response.json()

        # Retrieve the resource
        get_response = requests.get(
            f"{BASE_URL}/api/projects/{project['id']}",
            headers=headers
        )
        assert get_response.status_code == 200
        retrieved_project = get_response.json()
        assert retrieved_project["name"] == "Test Project"

        # Update the resource
        update_response = requests.patch(
            f"{BASE_URL}/api/projects/{project['id']}",
            headers=headers,
            json={"name": "Updated Project"}
        )
        assert update_response.status_code == 200

        # Delete the resource
        delete_response = requests.delete(
            f"{BASE_URL}/api/projects/{project['id']}",
            headers=headers
        )
        assert delete_response.status_code == 204

        # Verify deletion
        get_deleted = requests.get(
            f"{BASE_URL}/api/projects/{project['id']}",
            headers=headers
        )
        assert get_deleted.status_code == 404
```

### 4. Test Integration Points

#### Database Integration

```python
def test_workflow_with_database_consistency():
    """Verify data consistency across database operations."""

    # Create order
    order = create_order(user_id="123", items=[...])

    # Verify in database
    from database import get_connection
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = %s", (order.id,))
        db_order = cursor.fetchone()
        assert db_order is not None
        assert db_order['status'] == 'pending'

    # Process order
    process_order(order.id)

    # Verify updated
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = %s", (order.id,))
        db_order = cursor.fetchone()
        assert db_order['status'] == 'completed'
```

#### External API Integration

```typescript
// Mock external API for E2E tests
import nock from 'nock';

describe('Payment Gateway Integration', () => {
  it('should process payment through gateway', async () => {
    // Mock external payment API
    nock('https://api.payment-gateway.com')
      .post('/charges')
      .reply(200, {
        id: 'ch_123',
        status: 'succeeded',
        amount: 10000
      });

    // Execute workflow
    const result = await processPayment({
      amount: 100.00,
      currency: 'USD',
      cardToken: 'tok_visa'
    });

    // Verify result
    expect(result.success).toBe(true);
    expect(result.chargeId).toBe('ch_123');
  });
});
```

### 5. Test Cross-Service Workflows

For microservices or multi-service architectures:

```python
def test_multi_service_workflow():
    """Test workflow spanning multiple services."""

    # 1. Create user in Auth service
    auth_response = requests.post(
        "http://auth-service/users",
        json={"email": "test@example.com"}
    )
    user_id = auth_response.json()["id"]

    # 2. Create profile in Profile service
    profile_response = requests.post(
        "http://profile-service/profiles",
        json={"userId": user_id, "displayName": "Test"}
    )
    assert profile_response.status_code == 201

    # 3. Trigger notification via Notification service
    notif_response = requests.post(
        "http://notification-service/send",
        json={
            "userId": user_id,
            "type": "welcome",
            "channel": "email"
        }
    )
    assert notif_response.status_code == 200

    # 4. Verify all services updated correctly
    user = requests.get(f"http://auth-service/users/{user_id}").json()
    profile = requests.get(f"http://profile-service/users/{user_id}/profile").json()

    assert user["hasProfile"] is True
    assert profile["displayName"] == "Test"
```

### 6. Setup and Teardown

Ensure clean test environment:

```typescript
// Playwright setup
import { test as base } from '@playwright/test';

const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('[type="submit"]');
    await page.waitForURL('/dashboard');

    // Use the authenticated page in test
    await use(page);

    // Teardown: Logout
    await page.click('[data-testid="logout"]');
  }
});

test('should access protected resource', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/protected');
  await expect(authenticatedPage.locator('h1')).toContainText('Protected');
});
```

```python
# Pytest fixtures for E2E setup/teardown
import pytest

@pytest.fixture(scope="function")
def clean_database():
    """Clean database before and after test."""
    # Setup: Clean database
    from database import reset_test_database
    reset_test_database()

    yield

    # Teardown: Clean again
    reset_test_database()

@pytest.fixture(scope="function")
def test_user(clean_database):
    """Create test user for E2E tests."""
    user = create_user(email="test@example.com", password="password")
    return user

def test_user_workflow(test_user, clean_database):
    """Test with clean database and test user."""
    # Test code here
    pass
```

### 7. Run E2E Tests

```bash
# Playwright
zsh -i -c "npx playwright test"
zsh -i -c "npx playwright test --project=chromium"  # Specific browser
zsh -i -c "npx playwright test --grep @smoke"  # Tagged tests
zsh -i -c "npx playwright test --headed"  # See browser

# Pytest E2E
uv run pytest tests/e2e/ -v
uv run pytest tests/e2e/ -m "smoke"  # Marked tests
uv run pytest tests/e2e/ -k "checkout"  # Name matching

# With reports
zsh -i -c "npx playwright test --reporter=html"
uv run pytest tests/e2e/ --html=report.html
```

### 8. E2E in CI/CD

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Start application
        run: npm run start &

      - name: Wait for app
        run: npx wait-on http://localhost:3000

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Output Format

```markdown
# E2E Test Results

## Summary
- Total workflows tested: 8
- Passed: 7
- Failed: 1
- Duration: 3m 45s

## Critical Workflows ✅

### 1. User Registration & Onboarding
**Status**: ✅ PASSED
**Duration**: 28s
**Steps**:
- Navigate to signup page ✓
- Fill registration form ✓
- Verify email (simulated) ✓
- Complete onboarding ✓
- Redirect to dashboard ✓

### 2. Product Purchase Flow
**Status**: ✅ PASSED
**Duration**: 45s
**Steps**:
- Browse products ✓
- Add to cart ✓
- Checkout ✓
- Payment (test card) ✓
- Order confirmation ✓
- Email sent ✓

### 3. API Integration Workflow
**Status**: ✅ PASSED
**Duration**: 12s
**Steps**:
- Authenticate ✓
- Create resource ✓
- Read resource ✓
- Update resource ✓
- Delete resource ✓

## Failed Workflows ❌

### 4. Password Reset Flow
**Status**: ❌ FAILED
**Duration**: 22s (timed out)
**Error**:
```
TimeoutError: Waiting for element '[data-testid="reset-link"]' timed out after 30000ms
  at tests/e2e/auth.spec.ts:45:23
```

**Steps**:
- Navigate to forgot password page ✓
- Enter email ✓
- Submit form ✓
- Check email for reset link ❌ (timeout)

**Issue**: Email service not responding in test environment
**Action Required**: Configure mock email service for E2E tests

## Integration Points Tested

### Database
- User CRUD operations ✅
- Transaction consistency ✅
- Foreign key constraints ✅

### External APIs
- Payment gateway (mocked) ✅
- Email service ❌ (needs mock)
- Analytics service ✅

### Microservices
- Auth ↔ Profile service ✅
- Auth ↔ Notification service ⚠️ (occasional timeout)
- Profile ↔ Storage service ✅

## Performance Metrics

| Workflow | P50 | P95 | P99 | Status |
|----------|-----|-----|-----|--------|
| Registration | 2.1s | 3.4s | 4.2s | ✅ |
| Login | 0.8s | 1.2s | 1.8s | ✅ |
| Checkout | 4.5s | 6.8s | 8.9s | ⚠️ Slow |
| Dashboard Load | 1.2s | 2.1s | 2.9s | ✅ |

**Note**: Checkout workflow exceeds 5s target at P50

## Recommendations

1. **Fix email service** in test environment
2. **Investigate checkout performance** - P50 at 4.5s (target: < 3s)
3. **Add retry logic** for microservice communication
4. **Increase test coverage** for error scenarios
5. **Setup visual regression testing** for UI changes
```

## E2E Testing Best Practices

1. **Test real user scenarios**, not implementation details
2. **Keep tests independent** - each test should standalone
3. **Use test data factories** for consistent setup
4. **Mock external services** (payment gateways, email)
5. **Run in CI/CD** to catch regressions early
6. **Use page objects** to reduce duplication
7. **Take screenshots** on failure for debugging
8. **Balance coverage** - focus on critical paths (not everything)
9. **Run tests in parallel** when possible
10. **Monitor test flakiness** and fix unstable tests

## Notes

- E2E tests are slower - reserve for critical paths
- Complement with unit and integration tests
- Use smoke tests for quick sanity checks
- Consider visual regression testing for UI
- Keep E2E test suite maintainable (< 30 min runtime)
