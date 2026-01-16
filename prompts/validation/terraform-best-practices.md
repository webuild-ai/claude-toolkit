# Terraform Best Practices

Guidelines for writing maintainable, secure Terraform code.

## Best Practices

### 1. Module Versioning
- Always pin module versions
- Use semantic versioning
- Test before upgrading

### 2. State Management
- Use remote state (S3 + DynamoDB)
- Enable state locking
- Never commit state files

### 3. Variable Management
- Use variables for all configurable values
- Provide descriptions
- Set appropriate defaults
- Use validation rules

### 4. Resource Naming
- Use consistent naming conventions
- Include environment in names
- Use name_prefix for unique names

### 5. Security
- Don't hardcode secrets
- Use AWS Secrets Manager / Azure Key Vault
- Enable encryption
- Follow least privilege principle

### 6. Documentation
- Comment complex logic
- Use README for modules
- Document outputs
- Include examples

### 7. Organization
- Separate environments (dev/staging/prod)
- Use workspaces or separate directories
- Keep modules focused and reusable
- Organize by service/component
