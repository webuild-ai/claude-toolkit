# PR Review Session Example

Example of using `/pr-review` to perform comprehensive code review on a pull request.

## Scenario

Reviewing a PR that adds a new payment processing feature.

## Command

```
/pr-review
```

## PR Information

- **Title**: feat: Add Stripe payment integration
- **Files Changed**: 12
- **Lines**: +450 / -20
- **Branch**: feature/stripe-payment

## Review Output

```markdown
# Code Review: Stripe Payment Integration

## ✅ Strengths

1. Well-structured code with clear separation of concerns
2. Comprehensive test coverage (95% for new code)
3. Good error handling throughout
4. Clear commit history with conventional commits
5. Updated documentation and examples

## 🔴 Critical Issues (Must Fix)

### 1. SQL Injection Risk (Line src/payments/processor.py:45)

**Issue**: Query using string formatting
```python
query = f"SELECT * FROM transactions WHERE user_id = {user_id}"
```

**Severity**: CRITICAL

**Recommendation**:
```python
query = "SELECT * FROM transactions WHERE user_id = %s"
cursor.execute(query, (user_id,))
```

### 2. Hardcoded API Key (Line config/stripe.py:12)

**Issue**: Stripe API key hardcoded in source
```python
STRIPE_API_KEY = "sk_test_1234567890abcdef"
```

**Severity**: CRITICAL

**Recommendation**:
```python
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")
if not STRIPE_API_KEY:
    raise ValueError("STRIPE_API_KEY environment variable required")
```

## 🟡 Suggestions (Should Address)

### 3. Missing Input Validation (Line src/payments/api.py:78)

**Issue**: Amount not validated before processing
```typescript
async function processPayment(amount: number) {
    return stripe.charges.create({ amount });
}
```

**Priority**: Should Fix

**Recommendation**:
```typescript
async function processPayment(amount: number) {
    if (amount <= 0) {
        throw new Error("Amount must be positive");
    }
    if (amount > 1000000) {  // $10,000 limit
        throw new Error("Amount exceeds maximum");
    }
    return stripe.charges.create({ amount });
}
```

### 4. Error Messages Too Verbose (Line src/payments/processor.py:89)

**Issue**: Stripe error details exposed to user
```python
except stripe.error.CardError as e:
    return {"error": str(e)}  # Exposes internal details
```

**Priority**: Should Fix

**Recommendation**:
```python
except stripe.error.CardError as e:
    logger.error(f"Card error: {e}")
    return {"error": "Payment failed. Please check your card details."}
```

### 5. Missing Transaction Logging (Line src/payments/processor.py:120)

**Issue**: Successful payments not logged for audit trail

**Priority**: Should Fix

**Recommendation**: Add logging for all payment attempts (success and failure)

## 💡 Nice to Haves (Optional)

### 6. Consider Retry Logic

The payment processing could benefit from automatic retry logic for transient failures.

### 7. Add Webhook Signature Verification

Current webhook handler doesn't verify Stripe signatures. Consider adding for production.

## 📝 Questions

1. What's the expected transaction volume? Should we add rate limiting?
2. Are there plans for handling refunds in this PR or future work?
3. Should we support payment methods beyond cards (ACH, etc.)?
4. What's the rollback plan if deployment fails?

---

## Overall Assessment: ⚠️ REQUEST CHANGES

### Summary

Good implementation of Stripe integration with comprehensive tests. However, there are 2 critical security issues that must be addressed before merging:
1. SQL injection vulnerability
2. Hardcoded API key

Once these are fixed, the PR will be ready to merge.

### Approval Criteria

- [ ] Fix SQL injection vulnerability
- [ ] Move API key to environment variable
- [ ] Add input validation for payment amount
- [ ] Improve error messages (don't expose internal details)
- [ ] Add transaction audit logging

### Estimated Time to Address

- Critical fixes: 30 minutes
- Suggested improvements: 1-2 hours
- Total: 2-3 hours

### Next Steps

1. Address critical issues immediately
2. Push fixes to same branch
3. Re-request review when ready
4. Consider suggestions for follow-up PR if time-constrained
```

## Analysis

This review demonstrates:
- Clear categorization of issues by severity
- Specific line numbers and code examples
- Actionable recommendations with code samples
- Mix of critical security issues and improvements
- Questions to clarify requirements
- Clear approval criteria
