# API Docs

Generate and update OpenAPI/Swagger documentation for FastAPI and REST API endpoints.

## Instructions

### 1. For FastAPI (Python)

FastAPI auto-generates OpenAPI documentation. Enhance it with docstrings and metadata:

#### Add API Metadata

```python
# main.py or app.py
from fastapi import FastAPI

app = FastAPI(
    title="My API",
    description="Comprehensive API for managing users and resources",
    version="1.0.0",
    contact={
        "name": "API Support",
        "email": "support@example.com"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
    }
)
```

#### Document Endpoints

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

class User(BaseModel):
    """User model with validation."""
    id: str = Field(..., description="Unique user identifier")
    name: str = Field(..., min_length=1, max_length=100, description="User's full name")
    email: str = Field(..., description="User's email address")
    age: Optional[int] = Field(None, ge=0, le=150, description="User's age")

    class Config:
        schema_extra = {
            "example": {
                "id": "123",
                "name": "John Doe",
                "email": "john@example.com",
                "age": 30
            }
        }

@app.post(
    "/users",
    response_model=User,
    status_code=201,
    summary="Create a new user",
    description="Create a new user with the provided information. Email must be unique.",
    response_description="The created user object",
    tags=["users"]
)
async def create_user(user: User):
    """
    Create a new user with all the information:

    - **id**: Unique identifier
    - **name**: Full name (required, 1-100 chars)
    - **email**: Valid email address (required)
    - **age**: Age in years (optional, 0-150)

    Returns the created user object with all fields populated.

    Raises:
    - **409**: Email already exists
    - **422**: Validation error
    """
    # Implementation
    return user
```

#### Add Response Models

```python
from fastapi import status
from fastapi.responses import JSONResponse

@app.get(
    "/users/{user_id}",
    responses={
        200: {
            "description": "User found",
            "model": User
        },
        404: {
            "description": "User not found",
            "content": {
                "application/json": {
                    "example": {"detail": "User not found"}
                }
            }
        }
    }
)
async def get_user(user_id: str):
    """Retrieve a user by ID."""
    pass
```

#### Access Documentation

```bash
# Start FastAPI server
uv run uvicorn main:app --reload

# Open Swagger UI
open http://localhost:8000/docs

# Open ReDoc (alternative UI)
open http://localhost:8000/redoc

# Get OpenAPI JSON
curl http://localhost:8000/openapi.json > openapi.json
```

### 2. For Express/Node.js (TypeScript)

Use Swagger JSDoc or tsoa:

#### Using swagger-jsdoc

```bash
zsh -i -c "npm install swagger-jsdoc swagger-ui-express"
```

```typescript
// swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to API docs
};

export const specs = swaggerJsdoc(options);

// app.ts
import express from 'express';
import { specs } from './swagger';

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

```typescript
// routes/users.ts
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 */
router.post('/users', createUser);
```

### 3. Review and Enhance Documentation

Check that documentation includes:

#### Essential Elements
- [ ] **API title and description**: Clear overview
- [ ] **Version number**: Semantic versioning
- [ ] **Base URL**: Development and production endpoints
- [ ] **Authentication**: How to authenticate requests
- [ ] **All endpoints**: Complete list with methods
- [ ] **Request examples**: Sample requests for each endpoint
- [ ] **Response examples**: Sample responses including errors
- [ ] **Status codes**: All possible HTTP status codes
- [ ] **Error formats**: Consistent error response structure
- [ ] **Rate limits**: If applicable
- [ ] **Pagination**: Format for paginated responses

#### Quality Checks
- [ ] All models have descriptions
- [ ] All fields have types and descriptions
- [ ] Required fields are marked
- [ ] Examples are realistic and valid
- [ ] Error responses documented
- [ ] Authentication documented
- [ ] Deprecation notices for old endpoints

### 4. Generate Static Documentation

Export documentation for hosting:

#### FastAPI

```bash
# Get OpenAPI spec
curl http://localhost:8000/openapi.json > docs/openapi.json

# Generate static HTML (using redoc-cli)
zsh -i -c "npx @redocly/cli build-docs docs/openapi.json -o docs/index.html"

# Or use Swagger UI
zsh -i -c "npx swagger-ui-dist"
```

#### Using Stoplight or Redocly

```bash
# Install Redocly CLI
zsh -i -c "npm install -g @redocly/cli"

# Bundle OpenAPI spec
zsh -i -c "redocly bundle openapi.json -o dist/openapi-bundled.json"

# Generate beautiful docs
zsh -i -c "redocly build-docs openapi.json -o docs/"
```

### 5. Add Authentication Documentation

Document how to authenticate:

```python
# FastAPI with OAuth2
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/token", tags=["authentication"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login.

    Use this endpoint to get an access token:
    1. Send username and password
    2. Receive access token
    3. Use token in Authorization header: `Bearer <token>`

    The token expires after 30 minutes.
    """
    pass
```

### 6. Validate OpenAPI Spec

```bash
# Validate with Swagger CLI
zsh -i -c "npx @apidevtools/swagger-cli validate openapi.json"

# Validate with Redocly
zsh -i -c "redocly lint openapi.json"

# Check for breaking changes
zsh -i -c "redocly diff old-openapi.json new-openapi.json"
```

## Output Format

The command should produce/update:

1. **Interactive documentation** at `/docs` endpoint
2. **OpenAPI JSON/YAML** file
3. **README section** with API overview
4. **Examples** for common use cases

## Best Practices

- **Version your API**: Use `/v1/`, `/v2/` prefixes
- **Use consistent naming**: REST conventions (plural nouns)
- **Document errors**: Include all error codes and formats
- **Add examples**: Real-world request/response examples
- **Keep it updated**: Update docs with code changes
- **Test documentation**: Ensure examples actually work
- **Include authentication**: Clear auth instructions
- **Provide SDKs**: Link to client libraries if available

## Notes

- FastAPI generates OpenAPI 3.0 automatically
- Keep docstrings up-to-date with implementation
- Use Pydantic models for automatic validation docs
- Consider API versioning strategy from the start
- Host documentation publicly for external APIs
