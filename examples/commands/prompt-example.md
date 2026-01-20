# Prompt Command Output Example

Example output from running `/prompt` to improve a vague request and identify solution paths.

## Scenario

A developer has a vague request about adding caching to their application. They run the prompt improvement command to clarify requirements and get actionable solution paths.

## Command

```
/prompt Add caching to improve performance
```

## Output

```markdown
## Prompt Improvement & Problem Verification

### Original Prompt Analysis

**User Input**: "Add caching to improve performance"

**Intent Identified**: Performance Optimization / Feature Request

**Key Entities Extracted**:
- Feature/Component: Caching system (unspecified type)
- Files: Unknown - needs discovery
- Endpoints/Routes: Unknown - needs identification
- Models/Data Structures: Unknown

**Ambiguities Found**:
1. What type of caching? (In-memory, Redis, CDN, browser cache)
2. What needs to be cached? (API responses, database queries, static assets, computed values)
3. What's the current performance problem? (Slow queries, high latency, repeated computations)
4. What are the performance targets? (Response time, cache hit rate, memory limits)

**Missing Context**:
- [ ] Current performance metrics (baseline)
- [ ] Target performance metrics (goals)
- [ ] Infrastructure constraints (Redis available? Memory limits?)
- [ ] Cache invalidation requirements
- [ ] Data freshness requirements (how stale is acceptable?)

**Implicit Requirements**:
- **Cache Invalidation**: Data changes need to invalidate cache
- **Memory Management**: Cache shouldn't grow unbounded
- **Consistency**: Cached data should be reasonably fresh
- **Monitoring**: Should be able to track cache effectiveness

---

### Improved Prompt Versions

#### Version 1: Comprehensive (Recommended)
"Implement Redis-based caching for the `/api/documents` and `/api/users` endpoints to reduce database load and improve response times. Cache GET requests for 5 minutes with automatic invalidation on POST/PUT/DELETE. Target: reduce p95 latency from 800ms to under 200ms. Must include cache hit/miss metrics for monitoring. Redis is available at `redis://localhost:6379`."

**Why This Is Better**:
- Specifies caching technology (Redis)
- Identifies specific endpoints to cache
- Defines TTL (5 minutes)
- Includes invalidation strategy
- Sets measurable performance targets
- Notes infrastructure availability

#### Version 2: Concise
"Add Redis caching to slow API endpoints (`/api/documents`, `/api/users`) with 5-minute TTL and invalidation on writes. Target: <200ms p95 latency."

**When to Use**: When requirements are clear and you need quick implementation

#### Version 3: Detailed Technical
"Implement a caching layer using Redis for read-heavy API endpoints. Requirements: (1) Cache all GET requests to `/api/documents/*` and `/api/users/*` with configurable TTL (default 5 min), (2) Implement cache-aside pattern with lazy loading, (3) Invalidate cache entries on corresponding POST/PUT/DELETE operations using cache tags, (4) Add cache headers for browser caching (ETag, Cache-Control), (5) Implement circuit breaker for Redis failures (fallback to no-cache), (6) Add Prometheus metrics for cache hits/misses/latency. Performance targets: p95 latency <200ms, cache hit rate >80%."

**When to Use**: Complex implementations, architectural decisions, team handoffs

---

### Problem Verification Results

**Problem Status**: VERIFIED

**Current State**:
- **Feature Exists**: No - no caching currently implemented
- **Is Broken**: N/A - feature doesn't exist yet
- **Error Messages**: N/A
- **Affected Files**: Identified below

**Context Gathered**:
- **Source Files**:
  - [backend/app/routers/documents.py](backend/app/routers/documents.py) - Document API endpoints
  - [backend/app/routers/users.py](backend/app/routers/users.py) - User API endpoints
  - [backend/app/services/document_service.py](backend/app/services/document_service.py) - Document business logic
  - [backend/app/services/user_service.py](backend/app/services/user_service.py) - User business logic
- **Configuration**:
  - [backend/app/config.py](backend/app/config.py) - App configuration (no Redis config found)
  - [docker-compose.yml](docker-compose.yml) - Redis service not configured
- **Dependencies**:
  - `redis` package not in requirements.txt
  - No caching utilities found

**Problem Scope**:
- **Affected Components**: API layer, potentially service layer
- **User Impact**: Slow page loads, poor user experience
- **System Impact**: High database load on repeated queries
- **Data Impact**: None - caching is read-through

---

### Solution Paths Identified

#### Path 1: Redis Caching (Recommended) - Proper Fix

**Approach**: Implement Redis-based caching with automatic invalidation

**Complexity**: Medium

**Pros**:
- Shared cache across multiple app instances
- Persistent cache survives restarts
- Industry standard, well-documented
- Supports cache tags for grouped invalidation
- Built-in TTL and eviction policies

**Cons**:
- Requires Redis infrastructure
- Additional operational complexity
- Network latency for cache operations

**Best For**: Production systems, multi-instance deployments, shared caching needs

**Risk Level**: Low

**Impact on Existing Code**:
- **Files Modified**: 4-6 files
- **Breaking Changes**: No
- **Data Schema Changes**: No
- **API/Interface Changes**: No (transparent caching)

**Actionable Steps**:

1. **Prerequisites**
   - [ ] Add Redis to docker-compose.yml
   - [ ] Add `redis` and `aioredis` to requirements.txt
   - [ ] Add Redis configuration to config.py

2. **Step 1: Add Redis Infrastructure**
   - **File**: [docker-compose.yml](docker-compose.yml)
   - **Action**: Add Redis service
   - **Code**:
     ```yaml
     # Add to services section
     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
       volumes:
         - redis_data:/data
     ```
   - **Verification**: `docker compose up redis` and `redis-cli ping`
   - **Rollback**: Remove redis service from docker-compose.yml

3. **Step 2: Create Caching Utility**
   - **File**: [backend/app/utils/cache.py](backend/app/utils/cache.py) (new file)
   - **Action**: Create reusable caching decorator
   - **Code**:
     ```python
     import redis
     import json
     from functools import wraps
     from app.config import settings

     redis_client = redis.Redis.from_url(settings.REDIS_URL)

     def cached(ttl_seconds: int = 300, prefix: str = ""):
         def decorator(func):
             @wraps(func)
             async def wrapper(*args, **kwargs):
                 cache_key = f"{prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
                 cached_value = redis_client.get(cache_key)
                 if cached_value:
                     return json.loads(cached_value)
                 result = await func(*args, **kwargs)
                 redis_client.setex(cache_key, ttl_seconds, json.dumps(result))
                 return result
             return wrapper
         return decorator

     def invalidate_cache(prefix: str):
         for key in redis_client.scan_iter(f"{prefix}:*"):
             redis_client.delete(key)
     ```
   - **Verification**: Unit test the decorator
   - **Rollback**: Delete the file

4. **Step 3: Apply Caching to Endpoints**
   - **File**: [backend/app/routers/documents.py](backend/app/routers/documents.py)
   - **Action**: Add caching decorator to GET endpoints
   - **Code**:
     ```python
     from app.utils.cache import cached, invalidate_cache

     @router.get("/documents")
     @cached(ttl_seconds=300, prefix="documents")
     async def list_documents(db: Session = Depends(get_db)):
         return document_service.list_all(db)

     @router.post("/documents")
     async def create_document(...):
         result = document_service.create(db, document)
         invalidate_cache("documents")  # Invalidate on write
         return result
     ```
   - **Verification**: Check cache hits in Redis, measure latency
   - **Rollback**: Remove decorator and invalidation calls

5. **Testing Required**:
   - [ ] Unit test: Cache decorator with mocked Redis
   - [ ] Integration test: Verify cache invalidation
   - [ ] E2E test: Verify response times improved
   - [ ] Load test: Verify cache under concurrent requests

6. **Verification Checklist**:
   - [ ] Redis connection established
   - [ ] GET requests are cached
   - [ ] POST/PUT/DELETE invalidate cache
   - [ ] Cache TTL works correctly
   - [ ] Fallback works if Redis is down

**Dependencies**: Redis must be running

---

#### Path 2: In-Memory Caching (functools.lru_cache) - Quick Fix

**Approach**: Use Python's built-in LRU cache for simple caching

**Complexity**: Low

**Pros**:
- No additional infrastructure
- Very fast (no network)
- Simple to implement
- Built into Python

**Cons**:
- Not shared across instances
- Lost on restart
- Memory bound to application
- No TTL (only LRU eviction)

**Best For**: Single-instance apps, development, simple use cases

**Risk Level**: Low

**Actionable Steps**:

1. **Step 1: Add LRU Cache to Service Methods**
   - **File**: [backend/app/services/document_service.py](backend/app/services/document_service.py)
   - **Code**:
     ```python
     from functools import lru_cache
     from datetime import datetime, timedelta

     class DocumentService:
         _cache_time = None

         @lru_cache(maxsize=100)
         def _get_documents_cached(self, cache_key: str):
             # Actual database query
             return self.db.query(Document).all()

         def list_all(self, db):
             # Simple time-based invalidation
             cache_key = datetime.now().strftime("%Y%m%d%H%M")  # 1-min granularity
             return self._get_documents_cached(cache_key)

         def invalidate_cache(self):
             self._get_documents_cached.cache_clear()
     ```
   - **Verification**: Check `cache_info()` for hits/misses

---

#### Path 3: HTTP Caching Headers - Browser/CDN Caching

**Approach**: Add Cache-Control headers for browser and CDN caching

**Complexity**: Low

**Pros**:
- Reduces server load completely for cached requests
- Works with CDNs automatically
- No server-side state
- Standards-based

**Cons**:
- Less control over invalidation
- Only works for GET requests
- Client must respect headers

**Best For**: Static or semi-static data, CDN integration

**Risk Level**: Low

**Actionable Steps**:

1. **Step 1: Add Cache Headers to Responses**
   - **File**: [backend/app/routers/documents.py](backend/app/routers/documents.py)
   - **Code**:
     ```python
     from fastapi import Response

     @router.get("/documents")
     async def list_documents(response: Response, db: Session = Depends(get_db)):
         response.headers["Cache-Control"] = "public, max-age=300"
         response.headers["ETag"] = generate_etag(documents)
         return document_service.list_all(db)
     ```

---

### Solution Comparison Matrix

| Solution | Complexity | Risk | Performance Gain | Best For |
|----------|------------|------|------------------|----------|
| Path 1: Redis | Medium | Low | High | Production, multi-instance |
| Path 2: LRU Cache | Low | Low | Medium | Single instance, dev |
| Path 3: HTTP Headers | Low | Low | High* | Static data, CDN |

*Depends on client/CDN support

---

### Recommended Implementation Roadmap

**Recommended Path**: Path 1 (Redis) - Best for production systems

**Implementation Sequence**:

#### Phase 1: Preparation
- [ ] Add Redis to infrastructure
- [ ] Add dependencies to requirements.txt
- [ ] Add Redis configuration

#### Phase 2: Core Implementation
- [ ] Create caching utility module
- [ ] Add caching to document endpoints
- [ ] Add caching to user endpoints
- [ ] Implement cache invalidation

#### Phase 3: Testing & Validation
- [ ] Write unit tests for cache utility
- [ ] Write integration tests for invalidation
- [ ] Run load tests to measure improvement
- [ ] Monitor cache hit rates

#### Phase 4: Documentation & Cleanup
- [ ] Document caching strategy
- [ ] Add monitoring dashboards
- [ ] Update API documentation

**Milestones**:
- **Milestone 1**: Redis running, basic caching working
- **Milestone 2**: All target endpoints cached with invalidation
- **Milestone 3**: Monitoring and metrics in place

**Critical Path**: Redis setup -> Cache utility -> Apply to endpoints -> Test

**Parallel Work**: Documentation can be done alongside implementation

---

### Next Steps

**Immediate Actions**:
1. Decide on caching approach (Redis recommended for production)
2. Add Redis to docker-compose.yml
3. Start with one endpoint, validate, then expand

**Commands to Run**:
```bash
# Add Redis to docker-compose
docker compose up -d redis

# Verify Redis is running
docker compose exec redis redis-cli ping

# Install Python dependencies
pip install redis aioredis

# Run tests after implementation
pytest backend/tests/test_cache.py -v
```

**Files to Review**:
- [backend/app/config.py](backend/app/config.py) - Add REDIS_URL setting
- [docker-compose.yml](docker-compose.yml) - Add Redis service
- [requirements.txt](requirements.txt) - Add redis package

**Questions to Answer**:
- [ ] Is Redis already available in your infrastructure?
- [ ] What's the acceptable cache staleness (TTL)?
- [ ] Are there any endpoints that should NOT be cached?
```

## Analysis

This example shows:
- Original prompt analyzed for ambiguities
- Multiple improved prompt versions (comprehensive, concise, detailed)
- Problem verification with codebase context
- Three distinct solution paths with pros/cons
- Detailed actionable steps for recommended path
- Comparison matrix for decision making
- Clear implementation roadmap with phases
