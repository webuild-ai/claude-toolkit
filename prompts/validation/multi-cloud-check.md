# Multi-Cloud Compatibility Check

Validate code works across AWS and Azure cloud environments.

## Check Cloud-Agnostic Patterns

### 1. Storage Abstraction
- Use unified interface for S3/Azure Blob Storage
- Don't hardcode bucket/container names
- Abstract file operations

### 2. Database Connections
- Support both RDS and Azure SQL
- Use connection strings from environment
- Abstract database-specific features

### 3. Authentication
- Support IAM and Azure AD
- Use OAuth2/OIDC standards
- Abstract auth providers

### 4. Environment Configuration
- Use environment variables for cloud-specific configs
- Support multiple cloud configurations
- Document cloud-specific requirements

## Validation Points

- [ ] No hardcoded AWS/Azure-specific values
- [ ] Cloud provider selected via environment variable
- [ ] Service abstractions exist for: Storage, Auth, Database, Queue
- [ ] Configuration externalized
- [ ] Tests run against both cloud mocks
- [ ] Documentation covers both clouds
