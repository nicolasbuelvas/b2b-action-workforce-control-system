# LinkedIn Inquirer Implementation - Complete 3-Step Workflow

## Summary
Implemented a fully functional LinkedIn inquirer interface with a complete 3-step outreach workflow. The LinkedIn inquirer now mirrors the website inquirer's UI/UX patterns while adapting the process for LinkedIn's 3-step requirements:

1. **Step 1: Outreach** - Send connection request with personalized message
2. **Step 2: Ask for Email** - Request email contact information  
3. **Step 3: Send Catalogue + Price List** - Send catalogue/pricing via LinkedIn message

The system allows inquirers to claim a task once and submit 3 separate screenshots (one for each step) before the task is marked complete and moves to audit.

---

## Changes Made

### Frontend

#### 1. LinkedIn Inquirer Tasks Page
**File:** `frontend/src/pages/inquiry/linkedin/LinkedinInquiryTasksPage.tsx`

**Complete Rewrite** - Transformed from a skeleton component into a fully functional page:

- **State Management:**
  - Added `currentStep` (1-3) to track workflow progress
  - Added template system with 3 different message templates per step
  - Added file upload state for screenshot proof

- **Category Filter:**
  - Loads user's assigned categories on mount
  - Auto-selects if only one category assigned
  - Category selector shows tasks only from selected category

- **Task List (Sidebar):**
  - Task cards show contact name, category, country
  - Displays status color (red=pending, yellow=in_progress, green=submitted)
  - Click to select and view details

- **Execution Flow (Main Panel):**
  - **Claim Task:** Display task info and claim button
  - **Workflow Progress Bar:** Visual indicator showing completed/active/pending steps
  - **Contact Details:** Read-only display of LinkedIn profile, contact name, country, language
  - **Action Instructions:** Context-specific guidance for current step
  - **Message Templates:** 3 templates per step with prev/next navigation
  - **File Upload:** Screenshot upload with preview, validation (500KB, PNG/JPG)
  - **Submit Button:** Dynamic text based on step number ("Submit Step 1 & Continue" vs "Complete Task")

- **Features:**
  - Resets file/template state between steps
  - Removes task from list after all 3 steps submitted
  - Shows duplicate screenshot warnings
  - Returns to step 1 if user cancels mid-workflow

#### 2. CSS Styling
**File:** `frontend/src/pages/inquiry/linkedin/LinkedinInquiryTasksPage.css`

**Complete Overhaul** - Replaced placeholder styles with professional CSS:

- **Workflow Progress Bar:** 
  - 3-step progress indicator with connected circles
  - Color coding: gray (pending) → blue (active) → green (completed)
  - Pulse animation on active step
  - Responsive layout

- **Card Sections:**
  - `card-section` base styling for all content areas
  - `.research-context` - 2-column grid for LinkedIn contact details
  - `.action-instructions` - Yellow instruction box
  - `.message-section` - Template selector and message fields
  - `.proof-section` - File upload zone with drag-hover styling

- **Interactive Elements:**
  - Blue primary buttons (#6366f1) with hover states
  - Template navigation arrows with state management
  - File upload with visual feedback
  - Image preview with border styling
  - Error/warning message styling

#### 3. API Updates
**File:** `frontend/src/api/inquiry.api.ts`

**Extended action types:**
```typescript
submitAction: async (
  inquiryTaskId: string,
  actionType: 'EMAIL' | 'LINKEDIN' | 'CALL' | 'LINKEDIN_OUTREACH' | 'LINKEDIN_EMAIL_REQUEST' | 'LINKEDIN_CATALOGUE',
  screenshot: File,
)
```

Added support for the 3 LinkedIn action types.

---

### Backend

#### 1. Inquiry Controller
**File:** `backend/src/modules/inquiry/inquiry.controller.ts`

**Updated validation:**
- Extended `validTypes` array to include:
  - `LINKEDIN_OUTREACH`
  - `LINKEDIN_EMAIL_REQUEST`
  - `LINKEDIN_CATALOGUE`

#### 2. Inquiry Service
**File:** `backend/src/modules/inquiry/inquiry.service.ts`

**Multi-step Logic Implementation:**

- **Action Type Mapping:**
  ```typescript
  let actionIndex = 1;
  if (dto.actionType === 'LINKEDIN_OUTREACH') actionIndex = 1;
  else if (dto.actionType === 'LINKEDIN_EMAIL_REQUEST') actionIndex = 2;
  else if (dto.actionType === 'LINKEDIN_CATALOGUE') actionIndex = 3;
  ```

- **Task Completion Logic:**
  - For LinkedIn tasks: Check if all 3 actions are completed before marking task COMPLETED
  - For website tasks: Mark COMPLETED after first submission (existing behavior)
  - Keeps task `IN_PROGRESS` while awaiting additional steps

- **Key Code:**
  ```typescript
  if (dto.actionType && dto.actionType.startsWith('LINKEDIN_')) {
    const allActions = await manager.getRepository(InquiryAction).find({
      where: { inquiryTaskId: task.id },
    });
    taskCompleted = allActions.length >= 3;
  }
  
  if (taskCompleted) {
    task.status = InquiryStatus.COMPLETED;
  } // else stays IN_PROGRESS for more steps
  ```

---

## Data Flow

### Task Lifecycle

```
1. Research Auditor approves LinkedIn research task
   ↓
2. Research task moves to COMPLETED status
   ↓
3. LinkedIn Inquirer loads /inquiry/tasks/linkedin
   ↓
4. System creates InquiryTask with platform='LINKEDIN'
   ↓
5. Inquirer claims task
   ↓
6. Inquirer submits Step 1 (Outreach) with screenshot
   → InquiryAction created with actionIndex=1
   → Task remains IN_PROGRESS
   ↓
7. Inquirer submits Step 2 (Email Request) with screenshot
   → InquiryAction created with actionIndex=2
   → Task remains IN_PROGRESS
   ↓
8. Inquirer submits Step 3 (Catalogue) with screenshot
   → InquiryAction created with actionIndex=3
   → Task count = 3, mark as COMPLETED
   ↓
9. LinkedIn Inquiry Auditor receives 3 submissions for review
```

### Database Tables Used

- **inquiry_tasks** - Main task record (platform field: 'LINKEDIN')
- **inquiry_actions** - Each action per step (actionIndex: 1, 2, 3)
- **inquiry_submission_snapshots** - Snapshot of submission data
- **screenshots** - Uploaded screenshot files

---

## Testing Checklist

- [ ] **Categories:** User can select category and only sees tasks from that category
- [ ] **Task Claim:** Clicking "Claim This Task" assigns task to user and shows Step 1 interface
- [ ] **Step 1 Outreach:**
  - [ ] Message templates load and can be navigated (prev/next)
  - [ ] Custom message content can be edited
  - [ ] Screenshot can be uploaded (with preview)
  - [ ] Submit button uploads file and moves to Step 2
  - [ ] Task remains IN_PROGRESS in database

- [ ] **Step 2 Email Request:**
  - [ ] Shows Step 2 instruction text
  - [ ] Message templates specific to Step 2 load
  - [ ] Screenshot upload works
  - [ ] Submit button moves to Step 3
  - [ ] Task still IN_PROGRESS

- [ ] **Step 3 Catalogue:**
  - [ ] Shows Step 3 instruction text
  - [ ] Message templates for catalogue delivery
  - [ ] Screenshot upload works
  - [ ] Submit button shows "Complete Task"
  - [ ] After submission, task removed from list and marked COMPLETED

- [ ] **Workflow Progress Bar:** Shows visual progress through 3 steps (active step highlighted in blue)
- [ ] **Contact Details:** LinkedIn URL, name, country, language display correctly from research submission
- [ ] **Error Handling:** Shows validation errors and submission errors appropriately
- [ ] **Duplicate Screenshots:** Warns if screenshot is duplicate but allows submission

---

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   └── inquiry/
│   │       └── linkedin/
│   │           ├── LinkedinInquiryTasksPage.tsx (COMPLETELY REWRITTEN)
│   │           └── LinkedinInquiryTasksPage.css (COMPLETELY REWRITTEN)
│   └── api/
│       └── inquiry.api.ts (EXTENDED)

backend/
├── src/
│   └── modules/
│       ├── inquiry/
│       │   ├── inquiry.controller.ts (UPDATED validation)
│       │   └── inquiry.service.ts (UPDATED multi-step logic)
```

---

## Key Features

✅ **3-Step Workflow:** Outreach → Email Request → Catalogue/Price List
✅ **Professional UI:** Matches website inquirer design with LinkedIn-specific context
✅ **Progress Tracking:** Visual progress bar showing completed/active/pending steps  
✅ **Message Templates:** 3 pre-written templates per step (editable)
✅ **Screenshot Proof:** One screenshot required per step, up to 500KB PNG/JPG
✅ **Category Filtering:** Only shows tasks from assigned categories
✅ **Smart Task Management:** Task remains available until all 3 steps submitted
✅ **Audit Integration:** Completed tasks move to LinkedIn Inquiry Auditor for review
✅ **Error Handling:** Validation, file size checks, duplicate screenshot warnings

---

## Next Steps (Optional Enhancements)

1. **LinkedIn Inquiry Auditor:** Build corresponding auditor page to review 3 submissions
2. **Cooldown Rules:** Implement cooldown between steps (e.g., 24h between Step 1 and Step 2)
3. **Real-time Validation:** Validate LinkedIn URLs match expected format
4. **Step Completion Indicators:** Show checkmarks for completed steps in task list
5. **Earnings Tracking:** Display potential earnings for completing full 3-step workflow

---

## Deployment Notes

- No database schema changes required (existing inquiry_tasks/inquiry_actions tables handle it)
- Backend handles both website (single-step) and LinkedIn (3-step) workflows automatically
- Frontend page is a complete replacement for old placeholder component
- CSS file is also a complete replacement (no conflicts with other pages)

---

## Questions or Issues?

If the LinkedIn inquirer tasks don't load:
1. Verify user has categories assigned in `user_categories` table
2. Verify research auditor marked research_tasks as COMPLETED (status)
3. Check browser console for API errors (should show 3 action types in logs)
4. Verify backend is running with latest changes to inquiry.service.ts

If screenshots aren't being saved:
1. Check uploads/ directory exists
2. Verify screenshots service is properly injected in inquiry service
3. Check file permissions on uploads folder
