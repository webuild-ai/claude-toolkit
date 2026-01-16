# Type Safety

Improve TypeScript type safety and fix type errors to catch bugs at compile-time rather than runtime.

## Instructions

### 1. Enable Strict Type Checking

Configure TypeScript with strict mode for maximum type safety.

#### Update tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,                           // Enable all strict checks
    "noImplicitAny": true,                    // Error on implicit 'any'
    "strictNullChecks": true,                 // null/undefined handling
    "strictFunctionTypes": true,              // Function type checking
    "strictBindCallApply": true,              // Strict bind/call/apply
    "strictPropertyInitialization": true,     // Class property initialization
    "noImplicitThis": true,                   // Error on implicit 'this'
    "alwaysStrict": true,                     // Parse in strict mode

    "noUnusedLocals": true,                   // Error on unused variables
    "noUnusedParameters": true,               // Error on unused parameters
    "noImplicitReturns": true,                // All code paths return
    "noFallthroughCasesInSwitch": true,       // Switch case fallthrough
    "noUncheckedIndexedAccess": true,         // Check array/object access
    "noPropertyAccessFromIndexSignature": true, // Explicit index access

    "exactOptionalPropertyTypes": true,       // Strict optional properties
    "noImplicitOverride": true,               // Explicit override keyword
    "allowUnusedLabels": false,               // Error on unused labels
    "allowUnreachableCode": false             // Error on unreachable code
  }
}
```

### 2. Run Type Checker

Check for type errors:

```bash
# Full type check
zsh -i -c "npx tsc --noEmit"

# Watch mode for development
zsh -i -c "npx tsc --noEmit --watch"

# Type check specific files
zsh -i -c "npx tsc --noEmit src/components/UserProfile.tsx"
```

### 3. Fix Common Type Issues

#### A. Implicit Any

**Problem**: Variables without type annotations default to `any`

```typescript
// Before: Implicit any
function processUser(data) {  // Error: Parameter 'data' implicitly has an 'any' type
  return data.name;
}

// After: Explicit types
interface User {
  name: string;
  email: string;
}

function processUser(data: User): string {
  return data.name;
}
```

#### B. Null/Undefined Checks

**Problem**: Not handling null/undefined cases

```typescript
// Before: Potential null reference
function getUserName(user: User | null) {
  return user.name;  // Error: Object is possibly 'null'
}

// After: Proper null checking
function getUserName(user: User | null): string | null {
  return user?.name ?? null;
}

// Or with guard
function getUserName(user: User | null): string {
  if (!user) {
    throw new Error("User is null");
  }
  return user.name;
}
```

#### C. Array/Object Access

**Problem**: Unsafe indexed access

```typescript
// Before: Unchecked access
function getFirstUser(users: User[]) {
  return users[0].name;  // Error: Object is possibly 'undefined'
}

// After: Safe access
function getFirstUser(users: User[]): string | undefined {
  return users[0]?.name;
}

// Or with validation
function getFirstUser(users: User[]): string {
  if (users.length === 0) {
    throw new Error("No users found");
  }
  return users[0].name;
}
```

#### D. Any Type Usage

**Problem**: Overuse of `any` type

```typescript
// Before: any defeats type checking
function processData(data: any): any {
  return data.process();
}

// After: Proper types or generics
interface ProcessableData {
  process(): ProcessedResult;
}

function processData(data: ProcessableData): ProcessedResult {
  return data.process();
}

// Or use generics
function processData<T extends { process(): R }, R>(data: T): R {
  return data.process();
}
```

#### E. Type Assertions

**Problem**: Unsafe type assertions

```typescript
// Before: Unsafe assertion
const user = data as User;  // Dangerous if data isn't actually a User

// After: Type guards
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'email' in data &&
    typeof (data as User).name === 'string' &&
    typeof (data as User).email === 'string'
  );
}

const user = isUser(data) ? data : throw new Error("Invalid user data");
```

#### F. Function Return Types

**Problem**: Missing return types

```typescript
// Before: Inferred return type
function calculateTotal(items) {  // Return type unclear
  return items.reduce((sum, item) => sum + item.price, 0);
}

// After: Explicit return type
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### G. Optional vs Undefined

**Problem**: Confusion between optional and potentially undefined

```typescript
// Before: Unclear optionality
interface User {
  name: string;
  email: string | undefined;  // Can be explicitly set to undefined
}

// After: Use optional properties
interface User {
  name: string;
  email?: string;  // May or may not exist (cleaner API)
}

// Or if undefined is intentional:
interface User {
  name: string;
  email: string | null;  // Explicitly can be null
}
```

### 4. Add Type Definitions

#### For Third-Party Libraries

```bash
# Install type definitions
zsh -i -c "npm install --save-dev @types/node @types/react @types/lodash"
```

#### Create Custom Type Definitions

```typescript
// types/custom.d.ts
declare module 'untyped-package' {
  export function doSomething(param: string): Promise<void>;
}

// Global type augmentation
declare global {
  interface Window {
    customProperty: string;
  }
}
```

### 5. Use Utility Types

Leverage TypeScript's built-in utility types:

```typescript
// Partial: Make all properties optional
type PartialUser = Partial<User>;
const updates: PartialUser = { name: "New Name" };

// Required: Make all properties required
type RequiredUser = Required<User>;

// Pick: Select specific properties
type UserProfile = Pick<User, 'name' | 'email'>;

// Omit: Exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;

// Record: Create type with specific keys
type UserMap = Record<string, User>;

// ReturnType: Get function return type
type UserResult = ReturnType<typeof getUser>;

// Awaited: Unwrap Promise type
type UserData = Awaited<Promise<User>>;
```

### 6. Improve Type Inference

Help TypeScript infer types better:

```typescript
// Const assertions
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
} as const;  // Type is readonly with literal types

// Discriminated unions
type Success = { status: 'success'; data: Data };
type Error = { status: 'error'; message: string };
type Result = Success | Error;

function handleResult(result: Result) {
  if (result.status === 'success') {
    console.log(result.data);  // TypeScript knows it's Success
  } else {
    console.log(result.message);  // TypeScript knows it's Error
  }
}

// Template literal types
type EventName = `on${Capitalize<string>}`;
const event: EventName = "onClick";  // Valid
```

### 7. Type Narrowing

Use type guards effectively:

```typescript
// typeof guard
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();  // TypeScript knows it's string
  }
  return value.toFixed(2);  // TypeScript knows it's number
}

// instanceof guard
if (error instanceof Error) {
  console.log(error.message);
}

// in operator
if ('email' in user) {
  console.log(user.email);
}

// Custom type guards
function isError(value: unknown): value is Error {
  return value instanceof Error;
}
```

## Output Format

```markdown
# Type Safety Report

## Summary
- Files checked: 156
- Type errors found: 47
- Implicit any: 23
- Null safety issues: 15
- Unsafe assertions: 9
- Severity: 12 critical, 35 warnings

## Critical Issues (Must Fix)

### 1. Implicit Any in API Handler
**File**: `src/api/users.ts:45`
**Issue**: Parameter 'request' implicitly has an 'any' type
```typescript
// Current
function handleRequest(request) {
  return request.body.userId;
}

// Fix
interface UserRequest {
  body: {
    userId: string;
  };
}

function handleRequest(request: UserRequest): string {
  return request.body.userId;
}
```

### 2. Unsafe Null Access
**File**: `src/components/UserProfile.tsx:78`
**Issue**: Object is possibly 'null'
```typescript
// Current
const userName = user.profile.name;  // user.profile might be null

// Fix
const userName = user.profile?.name ?? 'Unknown';
```

## Warnings (Should Fix)

### 3. Missing Return Type
**File**: `src/utils/calculations.ts:23`
**Issue**: Function lacks explicit return type
```typescript
// Current
function calculateDiscount(price, discount) {  // any, any
  return price * (1 - discount);
}

// Fix
function calculateDiscount(price: number, discount: number): number {
  return price * (1 - discount);
}
```

## Suggestions

### 4. Use Discriminated Unions
**File**: `src/types/api.ts`
**Current**: Using optional properties for API responses
**Suggestion**: Use discriminated unions for better type safety
```typescript
// Before
interface ApiResponse {
  data?: User;
  error?: string;
}

// After
type ApiResponse =
  | { success: true; data: User }
  | { success: false; error: string };
```

## Missing Type Definitions

The following packages need type definitions:
- `legacy-lib` → Install `@types/legacy-lib`
- `custom-plugin` → Create custom type definition

## TypeScript Configuration Improvements

Recommended tsconfig.json updates:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Progress Tracking

| Category | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| Implicit Any | 23 | 0 | 23 |
| Null Safety | 15 | 0 | 15 |
| Unsafe Assertions | 9 | 0 | 9 |
| **Total** | **47** | **0** | **47** |
```

## Best Practices

1. **Prefer interfaces over types** for object shapes (better error messages)
2. **Use strict mode** always
3. **Avoid any** - use `unknown` if type is truly unknown
4. **Prefer type inference** over explicit types when obvious
5. **Use readonly** for immutable data
6. **Leverage utility types** instead of manual type manipulation
7. **Document complex types** with JSDoc comments

## Incremental Adoption

If enabling strict mode all at once is overwhelming:

1. Start with `noImplicitAny`
2. Add `strictNullChecks`
3. Enable other strict flags one by one
4. Fix errors in most-used files first
5. Gradually expand to entire codebase

## Notes

- Type safety improvements compound over time
- Stricter types catch bugs before they reach production
- Better types improve IDE autocomplete and refactoring
- Consider type coverage metrics (use `type-coverage` package)
- Balance strictness with pragmatism in legacy codebases
