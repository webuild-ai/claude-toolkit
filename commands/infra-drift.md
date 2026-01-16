# Infra Drift

Detect infrastructure drift and configuration inconsistencies between actual state and desired state.

## Instructions

### 1. Detect Drift with Terraform

```bash
# Refresh state to detect drift
terraform refresh

# Show differences
terraform plan -detailed-exitcode

# Exit codes:
# 0 = No changes
# 1 = Error
# 2 = Changes detected (drift)
```

### 2. Identify Drifted Resources

```bash
# List all resources
terraform state list

# Check specific resource
terraform state show aws_instance.example

# Compare with actual AWS state
aws ec2 describe-instances --instance-ids i-1234567890abcdef0
```

### 3. Analyze Drift

Common drift causes:
- Manual changes in console
- Auto-scaling modifications
- External automation tools
- Security group updates
- Tag modifications

### 4. Fix Drift

#### Option A: Update Code to Match Reality
```bash
# Import manual changes into Terraform
terraform import aws_instance.example i-1234567890abcdef0

# Update your .tf files to match
```

#### Option B: Revert to Desired State
```bash
# Apply to fix drift
terraform apply

# This will revert manual changes
```

### 5. Prevent Drift

```bash
# Enable CloudTrail for audit
# Set up AWS Config rules
# Use IAM policies to prevent manual changes
# Regular drift detection in CI/CD
```

### 6. Automated Drift Detection

```yaml
# .github/workflows/drift-detection.yml
name: Infrastructure Drift Detection

on:
  schedule:
    - cron: '0 0 * * *'  # Daily

jobs:
  detect-drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Terraform Init
        run: terraform init

      - name: Detect Drift
        run: |
          terraform plan -detailed-exitcode
        continue-on-error: true

      - name: Report Drift
        if: failure()
        run: |
          echo "::warning::Infrastructure drift detected!"
```

## Output Format

```markdown
# Infrastructure Drift Report

## Status: ⚠️ DRIFT DETECTED

## Drifted Resources: 3

### 1. aws_security_group.api
**Type**: Manual modification
**Changed**: 2026-01-15 14:32 UTC
**Difference**:
- Ingress rule added: 0.0.0.0/0:443 (not in Terraform)
- Tag "Environment" changed: "production" → "prod"

**Action**: Update Terraform or revert change

### 2. aws_instance.web_server
**Type**: Auto-scaling modification
**Changed**: 2026-01-16 03:15 UTC
**Difference**:
- Instance type: t3.medium → t3.large (manual upgrade)

**Action**: Update Terraform to reflect new instance type

### 3. aws_s3_bucket.assets
**Type**: Configuration drift
**Changed**: 2026-01-14 10:20 UTC
**Difference**:
- Versioning enabled (not in Terraform)
- Lifecycle rule added

**Action**: Import configuration into Terraform

## Summary
- Total resources: 45
- Drifted: 3 (6.7%)
- In sync: 42
- Last checked: 2026-01-16 09:00 UTC

## Recommendations
1. Review and address drifted resources
2. Implement change control policies
3. Enable CloudTrail for audit logging
4. Run drift detection daily
5. Restrict console access for production
```

## Best Practices

- Run drift detection regularly
- Audit manual changes
- Use read-only console access
- Automate infrastructure changes
- Document exceptions
- Alert on drift
- Fix drift promptly

## Notes

- Drift is normal for auto-scaled resources
- Some drift is intentional (security patches)
- Document allowed manual changes
- Use AWS Config for continuous monitoring
