# Asksomeone Command Output Example

Example output from running `/asksomeone` to generate a stakeholder report.

## Scenario

A developer is investigating a bug where document approval isn't working correctly. They need to communicate the issue to product stakeholders and get clarification on expected behavior.

## Command

```
/asksomeone The document approval workflow isn't showing the approval button for some users
```

## Output

```markdown
## Issue Report: Document Approval Button Missing for Some Users

### Executive Summary

Some users cannot see the "Approve Document" button when viewing documents that are ready for approval. This prevents them from completing the approval workflow, which may be blocking document processing for affected teams. We need clarification on which user roles should have approval permissions.

---

### What's Happening

#### Current Behavior
When certain users navigate to a document with status "Pending Approval", they see the document details but the green "Approve Document" button is not visible. They can view the document content but cannot take any approval action.

**Example**: A Quality Assurance team member opens document DOC-2024-001 which shows "Pending Approval" status, but they only see "View" and "Download" buttons - no approval option.

#### Expected Behavior
Users with appropriate permissions should see the "Approve Document" button when viewing documents that are pending their approval. The button should be clearly visible and allow them to complete the approval process.

#### The Gap
The system appears to be hiding the approval button based on user permissions, but it's unclear which roles should have approval rights. Some users who previously could approve documents can no longer do so.

---

### Where to Check This (Visual References)

#### Location 1: Document Details Page

**Page**: Documents > [Select Document] > Document Details
**Look for**: "Approve Document" button (green button, top right of page)
**Where**: Action buttons area, above the document preview section
**Steps to find**:
1. Navigate to "Documents" in the main navigation menu
2. Filter by status "Pending Approval"
3. Click on any document in the list
4. Look at the top right corner for action buttons

**What to verify**:
- [ ] Is the "Approve Document" button visible?
- [ ] What other buttons are shown? (View, Download, Edit, etc.)
- [ ] What is the user's role shown in the top navigation?

**Screenshot guidance**: Capture the full document details page showing the action buttons area and the user's role/name in the header.

---

#### Location 2: User Permissions Page (Admin Only)

**Page**: Admin > User Management > [Select User] > Permissions
**Look for**: "Document Approval" permission checkbox or role assignment
**Where**: Permissions section, under "Document Management" category
**Steps to find**:
1. Navigate to "Admin" in the main navigation
2. Click "User Management"
3. Search for an affected user
4. Click "Edit" or "View Permissions"
5. Look for document-related permissions

**What to verify**:
- [ ] Is there a "Document Approval" permission?
- [ ] Which roles have this permission enabled?
- [ ] Has this permission changed recently?

---

### Who Is Affected

#### End Users
- **Impact**: Users cannot complete document approvals, causing workflow delays
- **User Roles**: Quality Assurance team, Document Reviewers, potentially Department Managers
- **Frequency**: Consistent - affected users never see the button

#### Business Processes
- **Workflow Impact**: Document approval workflow is blocked for affected users
- **Process Blockers**: Documents cannot proceed to "Approved" status without manual intervention
- **Timeline Impact**: May be blocking compliance deadlines if approval documents are time-sensitive

#### Data & Compliance
- **Data Integrity**: No data loss, but approval timestamps may be delayed
- **Compliance Risk**: If regulatory documents require timely approval, delays could cause compliance issues
- **Audit Impact**: Audit trail will show delayed approvals or approvals by different users than intended

---

### Questions for Clarification

#### About Expected Behavior
1. **Question**: Which user roles should be able to approve documents?
   - **Context**: Currently unclear which roles have approval permissions. Need to define the complete list.
   - **Options**: QA Team only? QA + Managers? Anyone in the document's department?

2. **Question**: Should document approval be limited to specific document types?
   - **Context**: Some documents may require different approval workflows
   - **Options**: All documents same workflow? Different workflows per type?

#### About User Experience
1. **Question**: If a user doesn't have approval permission, should they see a disabled button or no button at all?
   - **Context**: Current behavior hides the button entirely, which may confuse users

#### About Business Rules
1. **Question**: Can a document creator approve their own document?
   - **Context**: Some compliance requirements prevent self-approval

2. **Question**: Is there a hierarchy of approvers (e.g., manager must approve before director)?
   - **Context**: Need to understand if sequential approval is required

#### About Priority & Timeline
1. **Question**: How urgent is this issue? Are there documents currently blocked?
   - **Context**: Need to prioritize fix based on business impact

---

### Next Steps

**For Stakeholders**:
1. [ ] Review the visual references and verify the issue on your account
2. [ ] Answer the clarification questions about approval permissions
3. [ ] Identify any documents currently blocked by this issue
4. [ ] Confirm priority level (Critical/High/Medium/Low)

**For Developers**:
1. [ ] Wait for stakeholder responses to permission questions
2. [ ] Review current RBAC implementation for document approval
3. [ ] Implement fix based on clarified requirements
4. [ ] Add tests for approval permission scenarios

---

### Additional Context (For Developers)

*This section is for developers only - not included in stakeholder communication*

**Technical Details**:
- **Feature/Module**: Document Workflow / Approval System
- **Files Involved**:
  - `backend/app/routers/documents.py` (approval endpoint)
  - `backend/app/services/document_service.py` (approval logic)
  - `frontend/pages/documents/[id].tsx` (button visibility)
- **API Endpoints**:
  - `POST /api/documents/{id}/approve`
  - `GET /api/documents/{id}` (includes `can_approve` field)
- **Database Tables**: `documents`, `document_approvals`, `user_roles`, `role_permissions`

**Related Issues**:
- Check if recent RBAC changes affected document permissions
- Review commit history for permission-related changes

**Similar Patterns**:
- Training approval workflow (working correctly)
- CAPA approval workflow (working correctly)
```

## Analysis

This example shows:
- Clear executive summary in plain language (no technical jargon)
- Visual UI references with specific navigation steps
- Verification checklists for stakeholders
- Well-structured questions organized by category
- Separate technical context for developers
- Actionable next steps for both stakeholders and developers
