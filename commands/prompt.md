---
description: Improve prompts and verify problems - analyzes user messages for clarity, identifies missing context, verifies problem statements, and provides multiple actionable solution paths with specific steps.
---

# Prompt Improvement & Problem Verification

**Purpose**: Analyze and improve user prompts/messages, verify problem statements thoroughly, identify missing context, and provide multiple actionable solution paths with specific implementation steps.

## Quick Start

**Usage**: `prompt [your message or problem description]`

**Examples**:
- `prompt I need to add user authentication`
- `prompt The file upload is failing`
- `prompt How do I implement caching?`
- `prompt Fix the API endpoint that's returning 404`

**What It Does** (5-phase analysis):
1. ✅ Prompt analysis & clarity assessment
2. ✅ Problem verification & context gathering
3. ✅ Multiple solution path identification
4. ✅ Actionable step generation
5. ✅ Implementation roadmap creation

**Output Format**:
- **First**: Improved prompt versions
- **Then**: Problem verification results
- **Finally**: Multiple solution paths with actionable steps

## Instructions

When a user provides a prompt or problem description, execute these phases systematically to improve clarity, verify the problem, and provide actionable solutions.

### Phase 1: Prompt Analysis & Clarity Assessment

**Goal**: Understand what the user is asking and identify ambiguities.

#### 1.1 Extract Core Intent

Identify the primary goal:
- **Feature Request**: Adding new functionality
- **Bug Fix**: Resolving existing issues
- **Question**: Seeking information or guidance
- **Refactoring**: Improving existing code
- **Integration**: Connecting systems/components
- **Performance**: Optimizing speed/resource usage
- **Security**: Addressing vulnerabilities
- **Testing**: Adding or fixing tests

**Action**: Categorize the prompt type and extract key entities (features, files, endpoints, etc.)

#### 1.2 Identify Ambiguities

Check for unclear aspects:
- **Vague Requirements**: "make it better", "fix the bug", "add feature"
- **Missing Context**: No file paths, no error messages, no specific behavior
- **Unclear Scope**: "all documents" vs "specific document type"
- **Missing Constraints**: No performance requirements, no compatibility needs
- **Ambiguous Success Criteria**: How do we know it's done?
- **Unspecified Edge Cases**: What about errors, empty states, boundaries?

**Action**: List all ambiguities found in the original prompt.

#### 1.3 Extract Implicit Requirements

Identify what the user likely means but didn't state:
- **Related Features**: What other features might be affected?
- **User Journey**: What's the complete user flow?
- **Data Dependencies**: What data structures are involved?
- **Integration Points**: What systems/components interact?
- **Business Rules**: What validation/business logic rules apply?

**Action**: Use codebase search to understand context and extract implicit requirements.

### Phase 2: Problem Verification & Context Gathering

**Goal**: Verify the problem actually exists and gather all relevant context.

#### 2.1 Problem Existence Verification

Verify if the problem is real:
- **Check Current State**: Does the feature exist? Is it broken?
- **Reproduce Issue**: Can we identify the specific failure point?
- **Check Related Code**: Are there similar implementations?
- **Review Recent Changes**: Did recent commits break something?

**Action**:
- Use Grep to search for related code patterns
- Use Glob to find relevant files
- Use Read to examine specific files
- Use Bash with git commands to check recent changes

#### 2.2 Context Gathering

Collect all relevant information:
- **File Locations**: Where is the relevant code?
- **Error Messages**: What errors are occurring?
- **API Endpoints**: What endpoints/routes are involved? (if applicable)
- **Data Models**: What data structures are used?
- **Dependencies**: What services/components are required?
- **Test Coverage**: What tests exist or are missing?
- **Configuration**: What config files or environment variables are involved?

**Action**: Use systematic codebase search to gather comprehensive context.

#### 2.3 Problem Scope Definition

Define the exact problem scope:
- **Affected Components**: List all files/components involved
- **User Impact**: Who is affected and how?
- **System Impact**: What systems are affected?
- **Data Impact**: What data is involved?
- **Timeline**: Is this urgent? Blocking?

**Action**: Create a comprehensive scope map of the problem.

### Phase 3: Multiple Solution Path Identification

**Goal**: Identify different approaches to solve the problem.

#### 3.1 Solution Approach Analysis

For each potential solution, analyze:
- **Complexity**: Simple vs complex implementation
- **Impact**: What existing functionality is affected?
- **Risk**: High vs low risk of breaking things
- **Performance**: Fast vs slow solution
- **Maintainability**: Easy vs hard to maintain
- **Compliance**: Does it meet project requirements/standards?
- **Testing**: Easy vs hard to test

**Action**: Identify 2-4 different solution approaches with pros/cons.

#### 3.2 Solution Path Categorization

Categorize solutions by approach type:
- **Quick Fix**: Fast, minimal changes, temporary solution
- **Proper Fix**: Complete, well-tested, permanent solution
- **Refactor First**: Improve code structure, then fix
- **Incremental**: Break into smaller steps, implement gradually
- **Alternative Approach**: Different architecture/pattern

**Action**: Categorize each solution path and explain when to use it.

### Phase 4: Actionable Step Generation

**Goal**: Create specific, executable steps for each solution path.

#### 4.1 Step Breakdown

For each solution path, create:
- **Prerequisites**: What needs to be in place first?
- **Step-by-Step Actions**: Specific code changes, file modifications
- **Verification Steps**: How to test each step
- **Rollback Plan**: How to undo if something goes wrong
- **Dependencies**: What other changes are required?

**Action**: Generate detailed step-by-step instructions for each path.

#### 4.2 Code Examples

Provide concrete code examples:
- **Before/After**: Show current code and proposed changes
- **File Locations**: Exact files and line numbers
- **API Changes**: Request/response examples (if applicable)
- **Data Schema Changes**: Schema modifications if needed
- **Test Examples**: How to test the changes

**Action**: Include specific code snippets for each major step.

### Phase 5: Implementation Roadmap

**Goal**: Create a prioritized implementation plan.

#### 5.1 Priority Ranking

Rank solutions by:
- **Urgency**: How quickly is this needed?
- **Impact**: How many users are affected?
- **Risk**: What's the risk of breaking things?
- **Dependencies**: What needs to happen first?

**Action**: Create priority matrix for all solution paths.

#### 5.2 Implementation Sequence

Define the order of implementation:
- **Phase 1**: Foundation/preparation
- **Phase 2**: Core implementation
- **Phase 3**: Testing/validation
- **Phase 4**: Documentation/cleanup

**Action**: Create timeline with milestones for each solution path.

## Execution Strategy

1. **Parse Input**: Extract intent, entities, and requirements from user prompt
2. **Analyze Clarity**: Identify ambiguities and missing context
3. **Verify Problem**: Confirm problem exists and gather context
4. **Identify Solutions**: Find multiple solution approaches
5. **Generate Steps**: Create actionable steps for each solution
6. **Create Roadmap**: Prioritize and sequence implementation

## Output Format

After completing all phases, provide a comprehensive analysis:

```markdown
## Prompt Improvement & Problem Verification

### 📝 Original Prompt Analysis

**User Input**: "[original prompt]"

**Intent Identified**: [Feature Request / Bug Fix / Question / etc.]

**Key Entities Extracted**:
- Feature/Component: [feature name]
- Files: [file paths]
- Endpoints/Routes: [API endpoints or routes]
- Models/Data Structures: [data models or structures]

**Ambiguities Found**:
1. ❌ [Specific ambiguity - what's unclear]
2. ❌ [Another ambiguity]
3. ⚠️ [Potential issue]

**Missing Context**:
- [ ] [What information is missing]
- [ ] [What needs clarification]

**Implicit Requirements**:
- [Requirement 1]: [Why it's needed]
- [Requirement 2]: [Why it's needed]

---

### ✅ Improved Prompt Versions

#### Version 1: Comprehensive (Recommended)
"[Improved prompt with all context, specific requirements, success criteria]"

**Why This Is Better**:
- Includes specific file paths
- Defines success criteria
- Specifies edge cases
- Provides error context

#### Version 2: Concise
"[Shorter version with essential details]"

**When to Use**: Quick fixes, well-understood problems

#### Version 3: Detailed Technical
"[Very detailed version with technical specifications]"

**When to Use**: Complex implementations, architectural changes

---

### 🔍 Problem Verification Results

**Problem Status**: ✅ VERIFIED / ⚠️ PARTIALLY VERIFIED / ❌ NOT FOUND

**Current State**:
- **Feature Exists**: ✅ Yes / ❌ No / ⚠️ Partial
- **Is Broken**: ✅ Yes / ❌ No / ⚠️ Unknown
- **Error Messages**: [List of errors found]
- **Affected Files**: [List of files]

**Context Gathered**:
- **Source Files**:
  - [path/to/file1.ext](path/to/file1.ext) - [Purpose]
  - [path/to/file2.ext](path/to/file2.ext) - [Purpose]
- **Component Files**:
  - [path/to/component1.ext](path/to/component1.ext) - [Purpose]
  - [path/to/component2.ext](path/to/component2.ext) - [Purpose]
- **Data Models**:
  - `[Model1]` - [Fields and relationships]
  - `[Model2]` - [Fields and relationships]
- **API Endpoints/Routes** (if applicable):
  - `GET /api/[endpoint]` - [Current behavior]
  - `POST /api/[endpoint]` - [Current behavior]
  - Or route patterns: `[route pattern]` - [Current behavior]
- **Configuration**:
  - [config/file.ext](config/file.ext) - [Purpose]

**Problem Scope**:
- **Affected Components**: [List]
- **User Impact**: [Description]
- **System Impact**: [Description]
- **Data Impact**: [Description]

---

### 🛤️ Solution Paths Identified

#### Path 1: [Solution Name] - [Quick Fix / Proper Fix / Refactor / etc.]

**Approach**: [Description of approach]

**Complexity**: ⭐ Low / ⭐⭐ Medium / ⭐⭐⭐ High

**Pros**:
- ✅ [Advantage 1]
- ✅ [Advantage 2]

**Cons**:
- ❌ [Disadvantage 1]
- ❌ [Disadvantage 2]

**Best For**: [When to use this approach]

**Risk Level**: 🟢 Low / 🟡 Medium / 🔴 High

**Impact on Existing Code**:
- **Files Modified**: [List]
- **Breaking Changes**: ✅ Yes / ❌ No
- **Data Schema Changes**: ✅ Yes / ❌ No
- **API/Interface Changes**: ✅ Yes / ❌ No

**Actionable Steps**:

1. **Prerequisites**
   - [ ] [Prerequisite 1]
   - [ ] [Prerequisite 2]

2. **Step 1: [Action Name]**
   - **File**: [path/to/file.ext](path/to/file.ext)
   - **Action**: [Specific change]
   - **Code**:
     ```[language]
     // Before
     [current code]

     // After
     [new code]
     ```
   - **Verification**: [How to test this step]
   - **Rollback**: [How to undo]

3. **Step 2: [Action Name]**
   - [Similar structure]

4. **Testing Required**:
   - [ ] Unit test: [Test description]
   - [ ] Integration test: [Test description]
   - [ ] E2E test: [Test description]

5. **Verification Checklist**:
   - [ ] [Verification item 1]
   - [ ] [Verification item 2]

**Dependencies**: [What needs to be done first]

---

#### Path 2: [Solution Name] - [Different Approach]

[Same structure as Path 1]

---

#### Path 3: [Solution Name] - [Alternative Approach]

[Same structure as Path 1]

---

### 📊 Solution Comparison Matrix

| Solution | Complexity | Risk | Impact | Best For |
|----------|------------|------|--------|----------|
| Path 1 | ⭐ | 🟢 | High | [Scenario] |
| Path 2 | ⭐⭐ | 🟡 | Medium | [Scenario] |
| Path 3 | ⭐⭐⭐ | 🔴 | Low | [Scenario] |

---

### 🗺️ Recommended Implementation Roadmap

**Recommended Path**: [Path X] - [Why this is recommended]

**Implementation Sequence**:

#### Phase 1: Preparation
- [ ] [Task 1]
- [ ] [Task 2]

#### Phase 2: Core Implementation
- [ ] [Task 1]
- [ ] [Task 2]

#### Phase 3: Testing & Validation
- [ ] [Task 1]
- [ ] [Task 2]

#### Phase 4: Documentation & Cleanup
- [ ] [Task 1]
- [ ] [Task 2]

**Milestones**:
- ✅ **Milestone 1**: [Description]
- ✅ **Milestone 2**: [Description]

**Critical Path**: [What must be done in sequence]

**Parallel Work**: [What can be done simultaneously]

---

### 🎯 Next Steps

**Immediate Actions**:
1. [Priority 1 action]
2. [Priority 2 action]
3. [Priority 3 action]

**Commands to Run**:
```bash
# Command 1: [Purpose]
[command]

# Command 2: [Purpose]
[command]
```

**Files to Review**:
- [path/to/file1.ext](path/to/file1.ext) - [Reason]
- [path/to/file2.ext](path/to/file2.ext) - [Reason]

**Questions to Answer**:
- [ ] [Question 1]
- [ ] [Question 2]

---

### 📚 Additional Context

**Related Documentation**:
- [Link to relevant docs]
- [Link to related specs]

**Similar Implementations**:
- [path/to/similar1.ext](path/to/similar1.ext) - [How it's similar]
- [path/to/similar2.ext](path/to/similar2.ext) - [How it's similar]

**Reference Patterns**:
- [Pattern 1]: [Where it's used]
- [Pattern 2]: [Where it's used]
```

## Implementation Notes

- **Comprehensive Analysis**: Always analyze the prompt thoroughly before providing solutions
- **Multiple Options**: Always provide at least 2-3 different solution paths when applicable
- **Actionable Steps**: Every step should be specific, executable, and verifiable
- **Context-Aware**: Use codebase search to understand existing patterns and implementations
- **Risk Assessment**: Always assess risk and impact for each solution
- **Verification**: Include verification steps for each action
- **Rollback Plans**: Provide rollback instructions for risky changes
- **Priority Guidance**: Help user choose the best path for their situation
- **Clickable Links**: Use markdown link syntax for all file references

## Example Usage

```
prompt I need to add user authentication
prompt The file upload is failing with 500 error
prompt How do I implement caching?
prompt Fix the API endpoint that's returning 404
prompt Add validation to the form
prompt Refactor the authentication module
prompt Optimize database queries
```

## Common Prompt Improvement Patterns

### Pattern 1: Vague Feature Request
**Original**: "Add user management"
**Improved**: "Add user management feature with CRUD operations for user accounts, including role assignment, email validation, and password reset functionality. Should integrate with existing authentication system in `src/auth/auth.js` and use the User model from `src/models/User.js`. Success criteria: All CRUD operations work, roles are properly enforced, and password reset emails are sent."

### Pattern 2: Bug Report Without Context
**Original**: "The upload is broken"
**Improved**: "File upload endpoint `/api/upload` is returning 500 Internal Server Error when uploading files larger than 10MB. Error occurs in `src/routes/upload.js` at line 45. Error message: 'File size exceeds limit'. Need to either increase file size limit in configuration or provide better error message to users. Reproducible with any file >10MB."

### Pattern 3: Missing Success Criteria
**Original**: "Make the form better"
**Improved**: "Improve the registration form at `src/components/RegistrationForm.jsx` to include: (1) Real-time validation with error messages, (2) Auto-save draft every 30 seconds, (3) Better mobile responsiveness, (4) Progress indicator showing completion percentage. Success criteria: Form should pass all accessibility checks, have <2s load time, and reduce user-reported form errors by 50%."

### Pattern 4: Unclear Scope
**Original**: "Fix the tests"
**Improved**: "Fix failing integration tests in `tests/integration/api.test.js`. Specifically, test 'should handle user creation' is failing due to missing mock for email service. Need to add proper mock in `tests/mocks/emailService.js` and ensure all API-related tests pass. Test failure message: 'Cannot read property send of undefined'."

## Verification Checklist

Before providing the final output, verify:
- [ ] Prompt has been analyzed for ambiguities
- [ ] Problem has been verified to exist
- [ ] Context has been gathered from codebase
- [ ] Multiple solution paths have been identified
- [ ] Each path has actionable steps
- [ ] Code examples are provided
- [ ] Risk assessment is included
- [ ] Verification steps are included
- [ ] Rollback plans are provided for risky changes
- [ ] All file references use markdown link syntax
