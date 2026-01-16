# Security Scan Prompt

Check code for common security vulnerabilities based on OWASP Top 10.

## Security Checks

### 1. Injection Vulnerabilities

**SQL Injection:**
- Check for string concatenation in SQL queries
- Verify use of parameterized queries or ORM
- Look for raw SQL execution

**Command Injection:**
- Check for unsanitized input in shell commands
- Verify use of safe exec methods
- Look for `eval()`, `exec()`, `subprocess.call()` with user input

**Code Injection:**
- Check for `eval()` with user input
- Verify no dynamic code execution from untrusted sources

### 2. Broken Authentication

- Check password storage (must be hashed with bcrypt/argon2)
- Verify session management (secure cookies, timeout)
- Check for hardcoded credentials
- Verify MFA implementation if applicable

### 3. Sensitive Data Exposure

- Check for secrets in code (API keys, passwords)
- Verify encryption for sensitive data (at rest and in transit)
- Check logging doesn't expose sensitive information
- Verify no PII in URLs or logs

### 4. XML External Entities (XXE)

- Check XML parsing configuration
- Verify external entities are disabled
- Use safe XML parsers

### 5. Broken Access Control

- Check authentication on protected routes
- Verify authorization checks (user can only access own data)
- Check for IDOR vulnerabilities
- Verify role-based access control

### 6. Security Misconfiguration

- Check for debug mode in production
- Verify security headers (CSP, HSTS, X-Frame-Options)
- Check default credentials not used
- Verify error messages don't leak information

### 7. Cross-Site Scripting (XSS)

- Check user input is escaped/sanitized
- Verify Content-Security-Policy headers
- Check for DOM-based XSS
- Use safe rendering methods (textContent vs innerHTML)

### 8. Insecure Deserialization

- Check pickle/marshal usage (Python)
- Verify JSON parsing is safe
- Don't deserialize untrusted data

### 9. Using Components with Known Vulnerabilities

- Run `npm audit` or `pip audit`
- Check dependencies are up-to-date
- Verify no critical vulnerabilities

### 10. Insufficient Logging and Monitoring

- Check authentication failures are logged
- Verify security events are monitored
- Check logs don't contain sensitive data

## Tools to Use

- **Bandit** (Python): `bandit -r .`
- **Safety** (Python): `safety check`
- **npm audit** (JavaScript): `npm audit`
- **Snyk**: `snyk test`
- **SonarQube**: Full security analysis

## Output Format

Report findings with:
- Severity (Critical, High, Medium, Low)
- Location (file:line)
- Issue description
- Remediation steps
- Code examples (before/after)
