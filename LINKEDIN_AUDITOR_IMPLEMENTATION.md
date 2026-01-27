# LinkedIn Inquirer Auditor Implementation - Complete

## Overview
Implemented a fully functional LinkedIn inquirer auditor page that displays pending 3-step inquiry submissions for review. The auditor can select a category, review all 3 actions (Outreach, Email Request, Catalogue), and approve or reject individual steps. The implementation follows the same pattern as the website inquirer auditor but adapted for LinkedIn's multi-step workflow.

## Changes Made

### 1. Backend API (Already Implemented)
**File: `backend/src/modules/audit/audit.controller.ts`**
- Endpoint: `GET /audit/linkedin-inquiry/pending` → fetches pending LinkedIn inquiry tasks for auditor's assigned categories
- Endpoint: `POST /audit/linkedin-inquiry/:taskId/actions/:actionId` → audits individual actions with APPROVED/REJECTED decision

**File: `backend/src/modules/audit/audit.service.ts`**
- Method `getPendingLinkedInInquiry()`: Retrieves COMPLETED inquiry tasks from auditor's categories, enriches with:
  - Worker details (name, email, userId)
  - Category name
  - All 3 actions with their status, screenshot URLs, and duplicate detection flags
  - Task creation timestamp
- Method `auditLinkedInInquiry()`: Processes approval/rejection of individual actions, auto-updates task status to APPROVED if all 3 actions approved, or REJECTED if any action rejected

### 2. Frontend API Client
**File: `frontend/src/api/audit.api.ts`**
Added new interfaces:
```typescript
interface LinkedInInquiryAction {
  id: string;
  actionType: string;  // LINKEDIN_OUTREACH, LINKEDIN_EMAIL_REQUEST, LINKEDIN_CATALOGUE
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  screenshotUrl: string | null;
  isDuplicate: boolean;
}

interface PendingLinkedInInquirySubmission {
  id: string;
  categoryId: string;
  categoryName: string;
  assignedToUserId: string;
  workerName: string;
  workerEmail: string;
  targetId: string;
  status: string;
  createdAt: string;
  actions: LinkedInInquiryAction[];
}
```

Added API methods:
```typescript
getPendingLinkedInInquiry(): Promise<PendingLinkedInInquirySubmission[]>
auditLinkedInInquiry(taskId: string, actionId: string, decision: AuditDecision): Promise<any>
```

### 3. Frontend UI Component
**File: `frontend/src/pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage.tsx`**
Complete implementation with:
- Category selector (auto-loads single category or prompts if multiple assigned)
- Pagination controls (Previous/Next buttons showing current position)
- Submission card displaying:
  - Worker information (name, email, user ID)
  - Task information (task ID, category name, status)
  - **Multi-action timeline** showing all 3 steps with:
    - Color-coded status dots (amber=PENDING, green=APPROVED, red=REJECTED)
    - Duplicate detection warnings (⚠️ badge if screenshot flagged as duplicate)
    - Expand/collapse buttons to review individual steps
  - Screenshot viewer with click-to-open-in-new-tab functionality
  - Approve/Reject buttons (disabled until action is expanded/selected)
- Refresh mechanism after each audit action to pull latest task state
- Proper error handling and loading states

**Key Features:**
- Auto-selects first action for expansion
- Dynamically maps action types to display labels:
  - LINKEDIN_OUTREACH → "Step 1: LinkedIn Outreach"
  - LINKEDIN_EMAIL_REQUEST → "Step 2: Email Request"
  - LINKEDIN_CATALOGUE → "Step 3: Catalogue Request"
- Timeline visualization showing step progression
- Duplicate detection (non-blocking but flagged to auditor)
- Task navigation after approval (automatically shows next pending task or empty state)

### 4. Frontend Styling
**File: `frontend/src/pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage.css`**
Complete CSS redesign with:
- Blue gradient background (LinkedIn brand colors)
- Card-based layout with elevation on hover
- Timeline visualization with connecting dots
- Status badges with contextual colors (amber/green/red)
- Action buttons with proper disabled states
- Screenshot container with zoom-capable image viewer
- Responsive design matching website auditor aesthetic

Color Scheme:
- Primary: Cyan (#0ea5e9) for highlights and active states
- Status: Amber (#f59e0b) for PENDING, Green (#10b981) for APPROVED, Red (#ef4444) for REJECTED
- Text: Dark slate (#0f172a) for headings, Stone (#475569) for labels
- Background: Light blue (#f0f9ff) with gradient to Light gray (#f1f5f9)

## Workflow

### Auditor Perspective
1. **Login**: Use credentials for linkedin_inquirer_auditor role (e.g., li_aud@test.com)
2. **Category Selection**: If assigned multiple categories, select one; if single category, auto-select
3. **View Pending Tasks**: See all COMPLETED inquiry tasks awaiting audit
4. **Review Task**: Task card shows worker info, all 3 steps in timeline format
5. **Review Individual Steps**:
   - Click "+" to expand a step
   - View screenshot evidence
   - Check for duplicate flag (system detection)
   - Click Approve or Reject
6. **Task Progression**:
   - If all 3 steps approved → task status becomes APPROVED
   - If any step rejected → task status becomes REJECTED
   - Task disappears from pending list after decision

### Step Approval Logic
- **All Approved**: All 3 actions marked APPROVED → inquiry_task status = APPROVED
- **Any Rejected**: Any action marked REJECTED → inquiry_task status = REJECTED
- **Duplicate Handling**: System-detected duplicates are flagged but not blocking; auditor can still approve if deemed genuine

## Database State

**inquiry_tasks table:**
- `id`: Task unique identifier
- `platform`: LINKEDIN (identifies as LinkedIn workflow)
- `status`: COMPLETED (ready for audit), APPROVED (passed audit), REJECTED (failed audit)
- `assignedToUserId`: Worker who performed the actions
- `categoryId`: Category of task

**inquiry_actions table:**
- `id`: Action unique identifier
- `taskid`: References the inquiry_task
- `actionindex`: 1, 2, or 3 (step number)
- `status`: PENDING (awaiting audit), APPROVED, REJECTED
- `performedbyuserid`: Worker who performed step

**inquiry_submission_snapshot table:**
- `actionid`: References inquiry_action
- `screenshotpath`: Path to evidence image
- `isduplicate`: System-detected duplicate flag

## Testing

### Quick Test Steps
1. **Start services**: `npm run start:dev` (backend), `npm run dev` (frontend)
2. **Login as auditor**: li_aud@test.com / password123
3. **Navigate**: Click LinkedIn Inquiry Auditor in sidebar
4. **Select category**: Choose "Product A" if prompted
5. **Review task**: Should see the submitted LinkedIn inquiry with 3-step timeline
6. **Expand steps**: Click "+" on each step to view screenshot
7. **Approve/Reject**: Click action buttons to audit individual steps
8. **Verify progression**: After final step decision, task should disappear or show status change

### API Testing
```bash
# Get pending LinkedIn audits
curl -H "Authorization: Bearer {token}" http://localhost:3000/audit/linkedin-inquiry/pending

# Approve a specific action
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"decision":"APPROVED"}' \
  http://localhost:3000/audit/linkedin-inquiry/{taskId}/actions/{actionId}
```

## Comparison with Website Auditor

| Feature | Website Auditor | LinkedIn Auditor |
|---------|-----------------|------------------|
| Submissions | Single EMAIL action | 3 sequential actions |
| Review Model | One-step validation | Multi-step timeline |
| Decision | Single approve/reject | Per-action approve/reject |
| Task Completion | All at once | After all 3 actions decided |
| UI Layout | Flat form layout | Timeline visualization |
| Screenshots | Single image viewer | 3 separate evidence images |
| Category Selection | Same logic | Same logic |
| Pagination | Same Previous/Next buttons | Same Previous/Next buttons |

## Performance Considerations

- **Lazy Loading**: Screenshots only loaded when action expanded
- **Efficient API**: Single endpoint fetches all actions for task
- **State Management**: Task refresh after each audit minimizes inconsistencies
- **Timeline Rendering**: O(n) where n = 3 (fixed), so no scaling issues

## Error Handling

- **No Categories Assigned**: Displays informative message
- **API Failures**: Shows error toast with backend message
- **Missing Screenshots**: Shows placeholder "No screenshot available"
- **Disabled States**: Buttons properly disabled until ready for interaction

## Future Enhancements

1. **Batch Actions**: Approve/reject multiple steps at once
2. **Comments**: Add auditor notes to decision
3. **Assignment**: Reassign rejected tasks to other workers
4. **Analytics**: Show auditor performance stats
5. **Filters**: Filter by status, date range, worker
6. **Export**: Download audit logs as CSV/PDF
7. **Notifications**: Alert worker of decision via email
8. **Appeal**: Allow worker to contest rejection

## Files Modified

1. `frontend/src/api/audit.api.ts` - API client interfaces and methods
2. `frontend/src/pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage.tsx` - Component logic
3. `frontend/src/pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage.css` - Component styling

## Deployment Notes

- No database migrations required (backend already supports LinkedIn inquiry audit)
- Frontend requires fresh build to include new component (Vite will auto-reload during dev)
- Role `linkedin_inquirer_auditor` must be assigned in admin panel for users to access this page
- Category assignments required; users with no categories will see "No categories assigned" message

## Testing Checklist

- [ ] Login as linkedin_inquirer_auditor
- [ ] Category selector appears if multiple categories assigned
- [ ] Pending tasks load and display with correct worker/category info
- [ ] Timeline shows all 3 steps with correct action types
- [ ] Expand/collapse functionality works for each step
- [ ] Screenshots load and open in new tab
- [ ] Duplicate flags display for flagged actions
- [ ] Approve button works and removes task from list
- [ ] Reject button works and removes task from list
- [ ] Task status updates correctly in database
- [ ] All 3 actions approved → inquiry_task status = APPROVED
- [ ] Any action rejected → inquiry_task status = REJECTED
- [ ] Navigation to next task works after decision
- [ ] Empty state displays when no pending tasks
- [ ] Category filter works if multiple categories
