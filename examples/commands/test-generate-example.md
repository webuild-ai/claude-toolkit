# Test Generation Example

Example of using `/test-generate` to create tests for a function using TDD principles.

## Scenario

Developer has written a `calculateDiscount` function and wants comprehensive tests.

## Function to Test

```python
# src/pricing/discounts.py
def calculate_discount(price: float, discount_rate: float, customer_tier: str = "standard") -> float:
    """Calculate discounted price based on rate and customer tier."""
    if discount_rate < 0 or discount_rate > 1:
        raise ValueError("Discount rate must be between 0 and 1")

    if price < 0:
        raise ValueError("Price cannot be negative")

    # Tier multipliers
    tier_multipliers = {
        "standard": 1.0,
        "premium": 1.2,
        "vip": 1.5
    }

    if customer_tier not in tier_multipliers:
        raise ValueError(f"Invalid customer tier: {customer_tier}")

    effective_rate = discount_rate * tier_multipliers[customer_tier]
    effective_rate = min(effective_rate, 1.0)  # Cap at 100%

    return round(price * (1 - effective_rate), 2)
```

## Command

```
/test-generate src/pricing/discounts.py::calculate_discount
```

## Generated Tests

```python
# tests/test_discounts.py
import pytest
from src.pricing.discounts import calculate_discount

class TestCalculateDiscount:
    """Comprehensive tests for calculate_discount function."""

    # Happy Path Tests
    def test_standard_customer_basic_discount(self):
        """Should apply discount for standard customer."""
        result = calculate_discount(100.0, 0.2, "standard")
        assert result == 80.0

    def test_premium_customer_enhanced_discount(self):
        """Should apply 1.2x discount multiplier for premium customers."""
        # 20% discount * 1.2 = 24% effective discount
        result = calculate_discount(100.0, 0.2, "premium")
        assert result == 76.0

    def test_vip_customer_maximum_discount(self):
        """Should apply 1.5x discount multiplier for VIP customers."""
        # 20% discount * 1.5 = 30% effective discount
        result = calculate_discount(100.0, 0.2, "vip")
        assert result == 70.0

    def test_default_tier_is_standard(self):
        """Should default to standard tier when not specified."""
        result = calculate_discount(100.0, 0.2)
        assert result == 80.0

    # Edge Cases
    def test_zero_discount(self):
        """Should return original price with zero discount."""
        result = calculate_discount(100.0, 0.0)
        assert result == 100.0

    def test_zero_price(self):
        """Should handle zero price correctly."""
        result = calculate_discount(0.0, 0.2)
        assert result == 0.0

    def test_full_discount_standard(self):
        """Should handle 100% discount for standard customer."""
        result = calculate_discount(100.0, 1.0, "standard")
        assert result == 0.0

    def test_vip_discount_capped_at_100_percent(self):
        """Should cap VIP discount at 100% (not over 100%)."""
        # 80% discount * 1.5 = 120%, but capped at 100%
        result = calculate_discount(100.0, 0.8, "vip")
        assert result == 0.0

    def test_small_price_rounding(self):
        """Should round result to 2 decimal places."""
        result = calculate_discount(10.99, 0.333, "standard")
        assert result == 7.33  # Not 7.329333...

    # Boundary Tests
    @pytest.mark.parametrize("price", [0.01, 1.0, 100.0, 999999.99])
    def test_various_price_ranges(self, price):
        """Should handle various price ranges correctly."""
        result = calculate_discount(price, 0.1)
        expected = round(price * 0.9, 2)
        assert result == expected

    @pytest.mark.parametrize("rate", [0.0, 0.1, 0.5, 0.9, 1.0])
    def test_valid_discount_rates(self, rate):
        """Should accept all valid discount rates (0 to 1)."""
        result = calculate_discount(100.0, rate)
        assert 0 <= result <= 100.0

    # Error Cases
    def test_negative_price_raises_error(self):
        """Should raise ValueError for negative price."""
        with pytest.raises(ValueError) as exc:
            calculate_discount(-10.0, 0.2)
        assert "negative" in str(exc.value).lower()

    def test_negative_discount_rate_raises_error(self):
        """Should raise ValueError for negative discount rate."""
        with pytest.raises(ValueError) as exc:
            calculate_discount(100.0, -0.1)
        assert "between 0 and 1" in str(exc.value)

    def test_discount_rate_over_one_raises_error(self):
        """Should raise ValueError for discount rate > 1."""
        with pytest.raises(ValueError) as exc:
            calculate_discount(100.0, 1.5)
        assert "between 0 and 1" in str(exc.value)

    def test_invalid_customer_tier_raises_error(self):
        """Should raise ValueError for invalid customer tier."""
        with pytest.raises(ValueError) as exc:
            calculate_discount(100.0, 0.2, "platinum")
        assert "Invalid customer tier" in str(exc.value)

    # Integration-style Tests
    def test_realistic_shopping_scenario(self):
        """Should handle realistic e-commerce scenario."""
        # VIP customer buying $250 item with 15% discount
        result = calculate_discount(250.0, 0.15, "vip")
        # 15% * 1.5 = 22.5% effective discount
        # 250 * (1 - 0.225) = 193.75
        assert result == 193.75

    def test_bulk_discount_scenario(self):
        """Should handle bulk purchase discount."""
        # Premium customer with 30% bulk discount
        result = calculate_discount(1000.0, 0.30, "premium")
        # 30% * 1.2 = 36% effective discount
        assert result == 640.0

## Test Execution

```bash
# Run all tests
pytest tests/test_discounts.py -v

# Run with coverage
pytest tests/test_discounts.py --cov=src.pricing.discounts --cov-report=term-missing

# Expected output:
# tests/test_discounts.py::TestCalculateDiscount::test_standard_customer_basic_discount PASSED
# tests/test_discounts.py::TestCalculateDiscount::test_premium_customer_enhanced_discount PASSED
# ... (all 18 tests)
# ================== 18 passed in 0.12s ==================
# Coverage: 100%
```

## Coverage Analysis

```
Name                          Stmts   Miss  Cover   Missing
-----------------------------------------------------------
src/pricing/discounts.py         20      0   100%
-----------------------------------------------------------
TOTAL                            20      0   100%
```

## Summary

Generated tests cover:
- ✅ Happy path (3 tests)
- ✅ Edge cases (6 tests)
- ✅ Boundary values (2 parameterized tests)
- ✅ Error cases (4 tests)
- ✅ Integration scenarios (2 tests)
- ✅ 100% code coverage
- ✅ All branches tested

**Total**: 18 test cases ensuring comprehensive coverage.
```

## Analysis

This example demonstrates:
- TDD approach with comprehensive test generation
- Tests organized by type (happy path, edge cases, errors)
- Clear test names describing behavior
- Parameterized tests for multiple scenarios
- 100% code coverage achieved
- Real-world integration test scenarios
