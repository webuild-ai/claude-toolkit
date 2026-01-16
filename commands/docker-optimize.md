# Docker Optimize

Optimize Dockerfiles for faster build times, smaller image sizes, and better security.

## Instructions

### 1. Use Multi-Stage Builds

```dockerfile
# Before: Single stage (larger image)
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "dist/index.js"]

# After: Multi-stage (smaller image)
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

### 2. Optimize Layer Caching

```dockerfile
# Bad: Changes to code invalidate dependency install
COPY . .
RUN npm install

# Good: Dependencies cached separately
COPY package*.json ./
RUN npm ci
COPY . .
```

### 3. Use Smaller Base Images

```dockerfile
# Large: 900MB
FROM node:18

# Medium: 180MB
FROM node:18-slim

# Small: 120MB
FROM node:18-alpine
```

### 4. Minimize Layers

```dockerfile
# Bad: Many layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get clean

# Good: Combined layers
RUN apt-get update && \
    apt-get install -y curl git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 5. Use .dockerignore

```.dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.vscode
*.md
.DS_Store
dist
coverage
```

### 6. Security Best Practices

```dockerfile
# Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
USER nodejs

# Use specific versions (not 'latest')
FROM node:18.16.0-alpine

# Remove unnecessary packages
RUN apk add --no-cache python3 && \
    apk del python3
```

### 7. Python Optimization

```dockerfile
# Optimized Python Dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --no-dev

# Copy application
COPY . .

# Final stage
FROM python:3.11-slim
WORKDIR /app

# Copy from builder
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app /app

# Activate venv
ENV PATH="/app/.venv/bin:$PATH"

# Run as non-root
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

CMD ["python", "main.py"]
```

## Output Format

```markdown
# Docker Optimization Report

## Before Optimization
- Image size: 1.2 GB
- Build time: 5m 30s
- Layers: 23
- Vulnerabilities: 45 (12 HIGH)

## After Optimization
- Image size: 180 MB (-85%)
- Build time: 1m 20s (-76%)
- Layers: 8 (-65%)
- Vulnerabilities: 2 (0 HIGH)

## Changes Applied

### 1. Multi-stage Build ✅
- Separated build and runtime stages
- Only production dependencies in final image

### 2. Base Image ✅
- Changed from `node:18` to `node:18-alpine`
- Reduced size by 780 MB

### 3. Layer Optimization ✅
- Combined RUN commands
- Reduced layers from 23 to 8
- Improved cache hit rate

### 4. .dockerignore ✅
- Added comprehensive ignore file
- Excluded development files
- Reduced build context by 60%

### 5. Security ✅
- Added non-root user
- Pinned base image version
- Removed 43 vulnerabilities
```

## Best Practices

- Use multi-stage builds
- Choose appropriate base images
- Optimize layer caching
- Use .dockerignore
- Run as non-root user
- Pin versions
- Clean up in same layer
- Scan for vulnerabilities

## Notes

- Smaller images deploy faster
- Better caching speeds up CI/CD
- Alpine images are smallest but may have compatibility issues
- Test thoroughly after optimization
