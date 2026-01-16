# Architecture Doc

Generate architecture documentation and diagrams to communicate system design.

## Instructions

### 1. Document System Overview

Provide high-level architecture description:

```markdown
# System Architecture

## Overview

[Project Name] is a [type] system that [core purpose].

### Key Components

- **Frontend**: React/TypeScript SPA
- **API**: FastAPI/Python REST API
- **Database**: PostgreSQL for persistent data
- **Cache**: Redis for session/cache
- **Queue**: RabbitMQ for async tasks
- **Storage**: AWS S3 for file storage

### Design Principles

- Microservices architecture
- Event-driven communication
- Horizontal scalability
- Separation of concerns
```

### 2. Create Component Diagrams

Use Mermaid, PlantUML, or diagrams.net:

#### Mermaid Example

```markdown
\`\`\`mermaid
graph TB
    User[User] --> LB[Load Balancer]
    LB --> API1[API Server 1]
    LB --> API2[API Server 2]
    API1 --> DB[(PostgreSQL)]
    API2 --> DB
    API1 --> Cache[(Redis)]
    API2 --> Cache
    API1 --> Queue[Message Queue]
    API2 --> Queue
    Queue --> Worker1[Worker 1]
    Queue --> Worker2[Worker 2]
\`\`\`
```

### 3. Document Data Flow

Explain how data moves through the system:

```markdown
## Data Flow

### User Registration Flow

1. User submits registration form
2. Frontend validates input
3. POST request to `/api/auth/register`
4. API validates and hashes password
5. User created in database
6. Verification email queued
7. Response returned to frontend
8. Worker sends verification email

\`\`\`mermaid
sequenceDiagram
    User->>+Frontend: Fill registration form
    Frontend->>+API: POST /api/auth/register
    API->>+Database: INSERT user
    Database-->>-API: User created
    API->>+Queue: Queue verification email
    API-->>-Frontend: 201 Created
    Frontend-->>-User: Show success message
    Queue->>+Worker: Process email task
    Worker->>+EmailService: Send email
    EmailService-->>-Worker: Email sent
\`\`\`
```

### 4. Document Key Design Decisions

Use Architecture Decision Records (ADRs):

```markdown
## Architecture Decisions

### ADR-001: Use PostgreSQL for Primary Database

**Status**: Accepted

**Context**:
We need a reliable, ACID-compliant database for user and transactional data.

**Decision**:
Use PostgreSQL 14+ as primary database.

**Consequences**:
- **Positive**:
  - Strong ACID guarantees
  - Rich feature set (JSONB, full-text search)
  - Mature ecosystem
  - Good performance for our scale

- **Negative**:
  - Vertical scaling limits
  - More complex than NoSQL for some use cases

**Alternatives Considered**:
- MongoDB: Less structure, eventual consistency
- MySQL: Considered but PostgreSQL has better JSON support
```

### 5. Document API Architecture

```markdown
## API Architecture

### REST API Design

- Base URL: `https://api.example.com/v1`
- Authentication: JWT Bearer tokens
- Format: JSON
- Versioning: URL path (`/v1/`, `/v2/`)

### Endpoints Structure

\`\`\`
/api/v1/
├── /auth/
│   ├── /login
│   ├── /register
│   └── /refresh
├── /users/
│   ├── /
│   ├── /:id
│   └── /:id/profile
└── /projects/
    ├── /
    ├── /:id
    └── /:id/members
\`\`\`

### Error Handling

All errors follow consistent format:
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
\`\`\`
```

### 6. Document Security Architecture

```markdown
## Security

### Authentication Flow

1. User logs in with credentials
2. Server validates credentials
3. JWT token issued (30 min expiry)
4. Refresh token issued (7 days)
5. Client includes token in Authorization header

### Data Protection

- **At Rest**: AES-256 encryption for sensitive data
- **In Transit**: TLS 1.3 for all connections
- **Passwords**: Bcrypt with salt (cost factor 12)
- **Secrets**: AWS Secrets Manager

### Security Headers

\`\`\`
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
\`\`\`
```

### 7. Document Deployment Architecture

```markdown
## Deployment

### Infrastructure

- **Cloud**: AWS
- **Compute**: ECS Fargate containers
- **Database**: RDS PostgreSQL Multi-AZ
- **Cache**: ElastiCache Redis
- **CDN**: CloudFront
- **DNS**: Route53

### Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local development | http://localhost:3000 |
| Staging | Pre-production testing | https://staging.example.com |
| Production | Live system | https://example.com |

### CI/CD Pipeline

\`\`\`mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C{Tests Pass?}
    C -->|Yes| D[Build Docker Image]
    C -->|No| E[Notify Developer]
    D --> F[Push to ECR]
    F --> G[Deploy to Staging]
    G --> H{Manual Approval}
    H -->|Approved| I[Deploy to Production]
    H -->|Rejected| E
\`\`\`
```

### 8. Generate Diagrams

Use tools to create visual diagrams:

```bash
# Using PlantUML
zsh -i -c "npm install -g node-plantuml"
cat architecture.puml | puml generate > architecture.png

# Using Mermaid CLI
zsh -i -c "npm install -g @mermaid-js/mermaid-cli"
mmdc -i architecture.mmd -o architecture.png
```

## Output Format

Complete architecture documentation including:
1. System overview
2. Component diagrams
3. Data flow diagrams
4. Sequence diagrams
5. Design decisions (ADRs)
6. Security architecture
7. Deployment architecture

## Notes

- Keep diagrams up-to-date with code changes
- Use standard diagram formats (C4, UML)
- Focus on "why" not just "what"
- Document trade-offs and alternatives
- Version control architecture docs with code
