# Docker Image Optimization

Patterns for optimizing Docker images for size and build speed.

## Size Optimization

### Use Smaller Base Images
- `alpine` instead of `latest`
- `slim` variants for Debian
- Distroless images for production

### Multi-Stage Builds
- Build stage with full tools
- Runtime stage with minimal dependencies
- Copy only necessary artifacts

### Minimize Layers
- Combine RUN commands
- Clean up in same layer
- Remove package manager caches

### .dockerignore
- Exclude development files
- Exclude version control
- Exclude documentation
- Exclude tests (if not needed)

## Build Speed Optimization

### Cache Optimization
- Copy dependency files first
- Install dependencies before code
- Leverage BuildKit cache mounts

### Parallel Builds
- Use BuildKit for parallel stages
- Enable buildkit: `DOCKER_BUILDKIT=1`

## Security

### Non-Root User
- Create and use non-root user
- Set appropriate file permissions

### Minimal Attack Surface
- Remove unnecessary tools
- Use specific image tags (not `latest`)
- Scan for vulnerabilities

### Secrets
- Use BuildKit secrets
- Don't hardcode credentials
- Don't copy .env files

## Best Practices

1. Order matters: least changing to most changing
2. Use .dockerignore liberally
3. Run security scans
4. Pin all versions
5. Clean up in same RUN layer
6. Use health checks
7. Set resource limits
8. Use labels for metadata
