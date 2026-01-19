---
description: Generate a non-technical stakeholder report - creates a clear, readable explanation of issues for devs to share with stakeholders, including UI visual identifiers for manual verification.
---

# Ask Someone - Stakeholder Communication Report

**Purpose**: Generate a clear, non-technical report about an issue or question that developers can share with stakeholders, product managers, or business users. The report explains the issue in plain language, includes visual UI references for manual verification, and helps developers make informed decisions about next steps.

## Quick Start

**Usage**: `asksomeone [issue description or question]`

**Examples**:
- `asksomeone The document approval workflow isn't working as expected`
- `asksomeone Users are reporting that training assignments aren't showing up`
- `asksomeone Should we allow bulk deletion of deviations?`
- `asksomeone The validation package export is missing some data`

**What It Generates** (5-section report):
1. ✅ Issue summary in plain language
2. ✅ Current behavior vs expected behavior
3. ✅ Visual UI references for manual checking
4. ✅ Impact assessment (who/what is affected)
5. ✅ Questions for stakeholder clarification

**Output Format**:
- **First**: Executive summary (one paragraph)
- **Then**: Detailed sections with UI references
- **Finally**: Specific questions for stakeholder input

## Instructions

When a user provides an issue or question, generate a stakeholder-friendly report that explains the situation clearly and includes actionable verification steps.

### Phase 1: Issue Understanding & Context Gathering

**Goal**: Understand the issue thoroughly before explaining it to stakeholders.

#### 1.1 Extract Core Issue

Identify what the issue/question is about:
- **Bug Report**: Something isn't working as expected
- **Feature Question**: Uncertainty about requirements or behavior
- **Design Decision**: Need stakeholder input on approach
- **Data Issue**: Missing, incorrect, or unexpected data
- **Workflow Problem**: Process isn't functioning correctly
- **Performance Concern**: System is slow or unresponsive
- **User Experience Issue**: Confusing or problematic UI/UX

**Action**: Categorize the issue type and extract key details.

#### 1.2 Gather Technical Context

Understand the technical details (for internal reference, not for stakeholder report):
- **Feature/Module**: Which part of the system is involved?
- **User Journey**: What user flow is affected?
- **Data Flow**: What data is involved?
- **Integration Points**: What systems/components interact?
- **Error Details**: What errors or unexpected behaviors occur?

**Action**: Use codebase search to understand the technical context:
- Use Grep tool to find related code patterns
- Use Glob tool to find UI components and pages
- Use Read tool to examine relevant files
- Search for API endpoints in backend routers

#### 1.3 Identify Stakeholder Impact

Determine who is affected:
- **End Users**: Which user roles are impacted?
- **Business Process**: Which business processes are disrupted?
- **Compliance**: Are regulatory requirements affected?
- **Data Integrity**: Is data accuracy compromised?
- **Timeline**: Is this blocking critical work?

**Action**: Map the issue to stakeholder concerns.

### Phase 2: Plain Language Translation

**Goal**: Convert technical details into clear, non-technical language.

#### 2.1 Issue Summary

Create a one-paragraph summary that:
- Explains what the issue is in plain language
- Avoids technical jargon (no "API", "endpoint", "database", "frontend/backend")
- Focuses on user impact and business value
- Is concise and scannable

**Language Guidelines**:
- ✅ **Use**: "The system", "users", "documents", "workflow", "reports"
- ❌ **Avoid**: "API endpoint", "database query", "frontend component", "backend service", "Pydantic model"

**Example Transformations**:
- ❌ "The `/api/documents/{id}/approve` endpoint is returning 404"
- ✅ "When users try to approve documents, the system can't find the document"

- ❌ "The frontend component isn't handling the null response from the backend"
- ✅ "The approval screen shows an error instead of the document details"

#### 2.2 Current vs Expected Behavior

Describe both what's happening now and what should happen:
- **Current Behavior**: What users actually see/experience
- **Expected Behavior**: What users should see/experience
- **Gap Analysis**: What's the difference?

**Format**: Use clear before/after descriptions.

### Phase 3: Visual UI References

**Goal**: Provide specific UI locations and visual identifiers for manual verification.

#### 3.1 Identify UI Locations

Find the relevant UI components and pages:
- **Page/Route**: Which page is affected?
- **Component**: Which UI element is involved?
- **Visual Elements**: Buttons, forms, tables, modals, etc.

**Action**: Search codebase for UI components using Glob and Grep tools.

#### 3.2 Create Visual Reference Guide

For each UI location, provide:
- **Page Name**: Exact page name from navigation or URL
- **Visual Identifier**: Button text, form label, table header, icon description
- **Location Description**: Where on the page (top, sidebar, main content, modal)
- **Step-by-Step Navigation**: How to get to this screen

**Visual Reference Format**:
```
📍 Location: [Page Name]
🔍 Look for: [Button text / Form label / Table header / Icon description]
📍 Where: [Top navigation / Sidebar / Main content area / Modal popup]
📝 Steps to find:
1. [Navigation step]
2. [Navigation step]
3. [Action to take]
```

**Example**:
```
📍 Location: Document Approval Page
🔍 Look for: "Approve Document" button (green button, top right)
📍 Where: Main content area, above the document preview
📝 Steps to find:
1. Navigate to "Documents" in the main menu
2. Click on a document with status "Pending Approval"
3. Look for the green "Approve Document" button at the top right
```

#### 3.3 Manual Verification Checklist

Create a checklist for stakeholders to verify:
- **What to Check**: Specific UI elements or behaviors
- **What to Look For**: Expected vs actual appearance/behavior
- **How to Test**: Simple steps to reproduce or verify

**Format**: Simple checkbox list with clear instructions.

### Phase 4: Impact Assessment

**Goal**: Explain who and what is affected in business terms.

#### 4.1 User Impact

Describe impact on different user roles:
- **End Users**: How does this affect daily work?
- **Administrators**: What admin tasks are impacted?
- **Managers**: What reporting/oversight is affected?
- **External Users**: Are external stakeholders impacted?

**Format**: Role-based impact statements.

#### 4.2 Business Process Impact

Explain process disruptions:
- **Workflow Blockers**: What processes can't proceed?
- **Data Accuracy**: Is data integrity compromised?
- **Compliance**: Are regulatory requirements at risk?
- **Timeline**: Is this blocking critical deadlines?

**Format**: Process-focused impact statements.

#### 4.3 System Impact

Describe technical impact (in plain language):
- **Performance**: Is the system slower?
- **Reliability**: Is the system unstable?
- **Data Loss**: Is any data missing or incorrect?
- **Feature Availability**: Are features unavailable?

**Format**: System-focused impact statements (avoid technical jargon).

### Phase 5: Questions for Stakeholder Clarification

**Goal**: Generate specific questions to help developers make informed decisions.

#### 5.1 Requirement Clarification Questions

Questions about what should happen:
- **Expected Behavior**: What is the correct behavior?
- **Business Rules**: What business rules should apply?
- **User Expectations**: What do users expect to see?
- **Priority**: How urgent is this?

**Format**: Direct questions with context.

#### 5.2 Design Decision Questions

Questions about approach or implementation:
- **Feature Scope**: Should this work differently?
- **User Experience**: Is the current UX acceptable?
- **Data Handling**: How should data be displayed/stored?
- **Workflow**: Should the process be different?

**Format**: Decision-focused questions.

#### 5.3 Verification Questions

Questions to confirm understanding:
- **Reproducibility**: Can stakeholders reproduce the issue?
- **Frequency**: How often does this occur?
- **User Reports**: Are users reporting this issue?
- **Workarounds**: Are users using workarounds?

**Format**: Confirmation questions.

## Execution Strategy

1. **Understand Issue**: Extract core issue and gather technical context
2. **Translate to Plain Language**: Convert technical details to stakeholder-friendly language
3. **Identify UI References**: Find UI components and create visual reference guide
4. **Assess Impact**: Determine who and what is affected
5. **Generate Questions**: Create specific questions for stakeholder input
6. **Format Report**: Structure the report for easy reading and action

## Output Format

After completing all phases, provide a comprehensive stakeholder report:

```markdown
## Issue Report: [Issue Title]

### 📋 Executive Summary

[One paragraph explaining the issue in plain language, focusing on user impact and business value. No technical jargon.]

---

### 🔍 What's Happening

#### Current Behavior
[Describe what users are currently experiencing in plain language. Focus on what they see and experience, not technical details.]

**Example**: "When users try to approve a document, they see an error message saying 'Document not found' instead of the approval screen."

#### Expected Behavior
[Describe what should happen in plain language. Focus on the desired user experience.]

**Example**: "Users should be able to click 'Approve Document' and see a confirmation screen where they can add comments and submit their approval."

#### The Gap
[Explain the difference between current and expected behavior in simple terms.]

**Example**: "The system cannot find the document when users try to approve it, even though the document exists and is visible in the document list."

---

### 👀 Where to Check This (Visual References)

[For each UI location involved, provide visual reference guide:]

#### Location 1: [Page/Feature Name]

📍 **Page**: [Exact page name from navigation]
🔍 **Look for**: [Button text / Form label / Table header / Icon description]
📍 **Where**: [Top navigation / Sidebar / Main content area / Modal popup]
📝 **Steps to find**:
1. [Navigation step 1]
2. [Navigation step 2]
3. [Action to take]

**What to verify**:
- [ ] [Checkbox item 1: What to look for]
- [ ] [Checkbox item 2: What to look for]
- [ ] [Checkbox item 3: What to look for]

**Screenshot guidance**: [If helpful, describe what a screenshot should show]

---

#### Location 2: [Another Page/Feature]

[Same format as Location 1]

---

### 📊 Who Is Affected

#### End Users
- **Impact**: [How this affects daily work for end users]
- **User Roles**: [Which roles are affected: Users, QA Team, Administrators, etc.]
- **Frequency**: [How often this occurs: Always, Sometimes, Rarely]

#### Business Processes
- **Workflow Impact**: [Which workflows are disrupted]
- **Process Blockers**: [What processes can't proceed]
- **Timeline Impact**: [Is this blocking critical work?]

#### Data & Compliance
- **Data Integrity**: [Is data accuracy compromised?]
- **Compliance Risk**: [Are regulatory requirements at risk?]
- **Audit Impact**: [Are audit trails affected?]

---

### ❓ Questions for Clarification

[Generate specific questions to help developers make informed decisions:]

#### About Expected Behavior
1. **Question**: [Specific question about what should happen]
   - **Context**: [Why this question matters]
   - **Options**: [If applicable, list possible answers]

2. **Question**: [Another question]
   - **Context**: [Why this question matters]

#### About User Experience
1. **Question**: [Question about UX/UI]
   - **Context**: [Why this question matters]

#### About Business Rules
1. **Question**: [Question about business logic]
   - **Context**: [Why this question matters]

#### About Priority & Timeline
1. **Question**: [Question about urgency]
   - **Context**: [Why this question matters]

---

### 🎯 Next Steps

**For Stakeholders**:
1. [ ] Review the visual references and verify the issue
2. [ ] Answer the clarification questions
3. [ ] Confirm priority and timeline expectations

**For Developers**:
1. [ ] Wait for stakeholder responses to clarification questions
2. [ ] Review stakeholder feedback and replan approach
3. [ ] Implement solution based on clarified requirements

---

### 📝 Additional Context (For Developers)

*[This section is for developers only - not included in stakeholder report]*

**Technical Details**:
- **Feature/Module**: [Technical feature name]
- **Files Involved**: [Key files]
- **API Endpoints**: [If applicable]
- **Database Tables**: [If applicable]

**Related Issues**:
- [Link to related issues or discussions]

**Similar Patterns**:
- [Reference to similar features that work correctly]
```

## Implementation Notes

- **Plain Language First**: Always prioritize clarity over technical accuracy in stakeholder-facing content
- **Visual References Critical**: Include specific UI locations and visual identifiers for manual verification
- **Actionable Questions**: Generate specific, answerable questions that help make decisions
- **Context-Aware**: Use codebase search to understand UI structure and find visual elements
- **User-Focused**: Frame everything from the user's perspective, not the system's
- **Business Value**: Connect technical issues to business impact
- **Generic Approach**: Structure should work for any type of issue (bugs, questions, design decisions)
- **Scannable Format**: Use clear headings, bullet points, and visual markers (📍, 🔍, etc.)
- **Verification Checklist**: Include checkboxes for stakeholders to verify issues manually
- **Developer Notes**: Include technical context in a separate section for developers

## Example Usage

```
asksomeone The document approval workflow isn't working as expected
asksomeone Users are reporting that training assignments aren't showing up
asksomeone Should we allow bulk deletion of deviations?
asksomeone The validation package export is missing some data
asksomeone The audit trail isn't recording all actions
asksomeone Users can't find the CAPA assignment feature
```

## Common Issue Types & Templates

### Bug Report Template

**Focus Areas**:
- What users see vs what they should see
- Visual references to error messages or broken UI
- Steps to reproduce in plain language
- Impact on user workflows

### Feature Question Template

**Focus Areas**:
- Current behavior description
- Uncertainty about requirements
- Options for different approaches
- Questions about business rules

### Design Decision Template

**Focus Areas**:
- Current implementation
- Alternative approaches
- Trade-offs in plain language
- Questions about user preferences

### Data Issue Template

**Focus Areas**:
- What data is missing/incorrect
- Where data should appear in UI
- Impact on reports or workflows
- Questions about data requirements

## Visual Reference Best Practices

### UI Element Identification

**Buttons**:
- Use exact button text: "Approve Document", "Save Changes", "Delete Item"
- Include color/style if distinctive: "green button", "red delete button"
- Note location: "top right", "bottom of form", "in the action menu"

**Forms**:
- Use form labels: "Document Title field", "Status dropdown"
- Include field types: "text input", "dropdown menu", "date picker"
- Note required fields: "required field marked with asterisk"

**Tables/Lists**:
- Use column headers: "Status column", "Created Date column"
- Include row identifiers: "row with document ID 12345"
- Note sorting/filtering: "sortable column header", "filter dropdown"

**Modals/Dialogs**:
- Use modal title: "Confirm Deletion dialog"
- Include button text: "Cancel button", "Confirm button"
- Note trigger: "appears when clicking Delete"

### Navigation Paths

**Always include**:
1. Starting point (home page, main menu)
2. Navigation steps (menu items, links)
3. Final destination (page, section, feature)
4. Action to take (button click, form submission)

**Example**:
```
📝 Steps to find:
1. Click "Documents" in the main navigation menu (top of page)
2. Click on any document in the list (opens document details)
3. Look for the "Actions" dropdown menu (top right of page)
4. Click "Approve" from the dropdown menu
```

## Language Transformation Guide

### Technical → Plain Language

| Technical Term | Plain Language Alternative |
|----------------|---------------------------|
| API endpoint | System connection / Feature |
| Database query | Data retrieval / Looking up information |
| Frontend component | Screen element / Page section |
| Backend service | System process / Background task |
| Pydantic model | Data structure / Information format |
| HTTP 404 error | Can't find / Not found |
| HTTP 500 error | System error / Something went wrong |
| Database constraint | Business rule / Validation rule |
| Authentication | Login / Sign in |
| Authorization | Permissions / Access rights |
| Migration | Database update / Schema change |

### User-Focused Language

**Instead of**: "The API endpoint returns null"
**Use**: "The system doesn't show any information"

**Instead of**: "Database constraint violation"
**Use**: "The system won't allow this because it conflicts with existing information"

**Instead of**: "Frontend component not rendering"
**Use**: "The page doesn't display the expected content"

**Instead of**: "Backend service throwing exception"
**Use**: "The system encounters an error when processing this request"
