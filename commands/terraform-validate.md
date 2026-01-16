# Terraform Validate

Validate Terraform configurations and module usage for infrastructure as code.

## Instructions

### 1. Format Check

```bash
# Check formatting
terraform fmt -check -recursive

# Auto-format
terraform fmt -recursive
```

### 2. Validate Syntax

```bash
# Initialize (downloads providers)
terraform init

# Validate configuration
terraform validate

# Output:
# Success! The configuration is valid.
```

### 3. Lint with tflint

```bash
# Install tflint
brew install tflint
# or
curl -s https://raw.githubusercontent.com/terraform-linters/tflint/master/install_linux.sh | bash

# Run linter
tflint --init
tflint

# With specific rules
tflint --enable-rule=terraform_deprecated_interpolation
```

### 4. Security Scan

```bash
# Using Checkov
pip install checkov
checkov -d .

# Using tfsec
brew install tfsec
tfsec .

# Using Terrascan
brew install terrascan
terrascan scan
```

### 5. Plan and Review

```bash
# Generate plan
terraform plan -out=tfplan

# Show plan in detail
terraform show tfplan

# Show JSON for analysis
terraform show -json tfplan > plan.json
```

### 6. Validate Module Usage

Check modules follow best practices:

```hcl
# Good: Pinned version
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"
  ...
}

# Bad: No version (uses latest)
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  ...
}
```

### 7. Check State

```bash
# List resources in state
terraform state list

# Show specific resource
terraform state show aws_instance.example

# Validate state consistency
terraform refresh
```

## Output Format

```markdown
# Terraform Validation Report

## Format Check ✅
- All files formatted correctly
- No formatting changes needed

## Syntax Validation ✅
- Configuration is valid
- No syntax errors found

## Security Scan ⚠️
- Total checks: 156
- Passed: 145
- Failed: 11 (8 MEDIUM, 3 LOW)

### Security Issues Found

1. **MEDIUM**: S3 bucket versioning not enabled
   File: `modules/storage/main.tf:23`
   Fix: Add `versioning { enabled = true }`

2. **MEDIUM**: Security group allows ingress from 0.0.0.0/0
   File: `modules/network/security.tf:15`
   Fix: Restrict to specific IP ranges

## Best Practice Violations

1. Module version not pinned (vpc module)
2. Hard-coded values should use variables
3. Missing descriptions on variables

## Plan Summary
- Resources to add: 12
- Resources to change: 3
- Resources to destroy: 0

## Estimated Costs
- Current: $450/month
- After changes: $480/month (+$30)

## Recommendations
1. Pin all module versions
2. Enable S3 versioning
3. Restrict security group rules
4. Add variable descriptions
```

## Best Practices

- Pin module versions
- Use variables, not hard-coded values
- Enable state locking (S3 + DynamoDB)
- Use workspaces for environments
- Tag all resources
- Run security scans
- Review plans before applying
- Use modules for reusability

## Notes

- Always validate before applying
- Run security scans in CI/CD
- Keep Terraform version updated
- Use remote state for teams
- Document infrastructure decisions
