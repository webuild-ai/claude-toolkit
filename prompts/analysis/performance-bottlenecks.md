# Performance Bottleneck Analysis

Patterns to identify performance issues in code.

## Database Performance

### N+1 Queries
```python
# Bad: N+1 queries
for user in users:  # 1 query
    orders = user.orders  # N queries

# Good: Eager loading
users = User.query.options(joinedload(User.orders)).all()  # 1 query
```

### Missing Indexes
- Check slow query logs
- Add indexes on frequently queried fields
- Index foreign keys
- Use composite indexes for multiple columns

### Large Result Sets
- Use pagination (LIMIT/OFFSET or cursor-based)
- Stream results for large datasets
- Consider caching frequently accessed data

## Algorithmic Issues

### Time Complexity
- O(n²) loops (nested iterations)
- Linear search in loops (use hash maps)
- Repeated calculations (memoize results)

### Memory Issues
- Loading entire dataset in memory
- Not releasing resources
- Memory leaks in long-running processes

## Frontend Performance

### Bundle Size
- Check for large dependencies
- Code splitting
- Tree shaking
- Lazy loading

### Rendering
- Unnecessary re-renders
- Large component trees
- Missing memoization
- Inefficient list rendering (missing keys)

## API Performance

### Synchronous Blocking
- Use async/await where appropriate
- Parallel requests instead of sequential
- Background jobs for long tasks

### Over-fetching
- GraphQL for precise data fetching
- API pagination
- Response compression

## Monitoring
- Use profilers (cProfile, Chrome DevTools)
- Track response times
- Monitor database query times
- Check memory usage
- Analyze bundle sizes
