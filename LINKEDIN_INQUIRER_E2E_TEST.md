# LinkedIn Inquirer 3-Step Workflow - End-to-End Testing Guide

## ✅ Status
- ✅ Frontend: Running on http://localhost:5174
- ✅ Backend: Running on port 3000 (npm run start:dev)
- ✅ LinkedinInquiryTasksPage.tsx: **FIXED - 0 TypeScript Errors**
- ⏳ Ready for: End-to-end testing

---

## Test Scenario: Complete 3-Step LinkedIn Outreach

### Prerequisites
- 1 Sub-Admin user (role: sub-admin)
- 1 Researcher user (assigned to sub-admin)
- 1 Research Auditor user (role: research_auditor)
- 1 LinkedIn Inquirer user (role: inquiry_executor, assigned to LinkedIn category)
- 1 Inquiry Auditor user (role: inquiry_auditor)

---

## Step 1: Sub-Admin Creates LinkedIn Research Task

1. Log in as **Sub-Admin**
2. Navigate to **Research Tasks** → **Create New Task**
3. Fill in the form:
   - **Type:** LinkedIn Research
   - **Research Type:** LinkedIn Profile Research
   - **Target Type:** LINKEDIN_PROFILE
   - **Contact Name:** "John Smith"
   - **LinkedIn URL:** "https://www.linkedin.com/in/johnsmith/"
   - **Country:** "United States"
   - **Language:** "English"
   - **Description:** "Research John's background and skills"
   - **Assigned To:** Select the Researcher user
   - **Category:** "LinkedIn Research" (or whatever category your LinkedIn inquirer is assigned to)
4. Click **Create Task**
5. **Verify:** Research task created with status: **PENDING RESEARCH**

---

## Step 2: Researcher Submits Research

1. Log in as **Researcher**
2. Navigate to **My Tasks** → **Research Tasks**
3. Find the task created in Step 1
4. Click to open task
5. Fill research submission:
   - **Submission:** "John Smith has 15+ years in software development, specializing in cloud architecture..."
   - **Upload Screenshot:** (Optional - LinkedIn profile screenshot)
6. Click **Submit**
7. **Verify:** Research task moves to status: **PENDING AUDIT**

---

## Step 3: Research Auditor Approves

1. Log in as **Research Auditor**
2. Navigate to **Research Tasks** → **Audit Queue**
3. Find the task from Step 2
4. Review the submission
5. Click **Approve**
6. **Verify:** 
   - Research task status: **COMPLETED**
   - ⚠️ **Check Database:** A new `InquiryTask` record should be auto-created with:
     - `platform`: 'LINKEDIN'
     - `status`: 'IN_PROGRESS'
     - `claimedBy`: null (not claimed yet)
     - Linked to the approved ResearchTask

---

## Step 4: LinkedIn Inquirer Views Assigned Tasks

1. Log in as **LinkedIn Inquirer**
2. Navigate to **Inquiry Tasks** → **LinkedIn Inquiries**
3. **Verify UI Elements:**
   - ✅ Category filter dropdown showing "LinkedIn Research" (if assigned)
   - ✅ Task list sidebar showing contact "John Smith"
   - ✅ Task status indicator (should be yellow "in_progress")
   - ✅ Main panel shows "Select a task to begin"

4. **Click on "John Smith" task**
5. **Verify Task Details Panel:**
   - ✅ Contact name: "John Smith"
   - ✅ LinkedIn URL: "https://www.linkedin.com/in/johnsmith/"
   - ✅ Country: "United States"
   - ✅ Language: "English"
   - ✅ Research submission details displayed
   - ✅ **Claim This Task** button visible

---

## Step 5: LinkedIn Inquirer Claims Task

1. Click **Claim This Task**
2. **Verify:**
   - ✅ Button changes to show workflow progress
   - ✅ Task card in sidebar now shows claimed status
   - ✅ Main panel transitions to Step 1 interface

---

## Step 6: LinkedIn Inquirer Completes Step 1 - Outreach

1. **Verify Step 1 UI:**
   - ✅ Progress bar shows Step 1 (blue/active), Steps 2-3 (gray/pending)
   - ✅ Title: "Step 1: Outreach"
   - ✅ Instructions: "Send connection request to [Contact Name]"
   - ✅ Message templates section with 3 templates (prev/next navigation)
   - ✅ Template options like:
     - "Hi [Name], I've been impressed by your work in [Field]..."
     - "Looking to connect with professionals in [Industry]..."
     - "Great to see your background in [Specialty]..."

2. **Select a template** (or customize the message)
3. **Upload screenshot:**
   - Click in upload zone
   - Select a PNG/JPG file (max 500KB)
   - Should show preview
4. Click **Submit Step 1 & Continue**
5. **Verify in Browser:**
   - ✅ Progress bar updates: Step 1 now green (completed)
   - ✅ Step 2 now active (blue)
   - ✅ File upload and message reset for Step 2
6. **Verify in Database:**
   - ✅ New `InquiryAction` record created with:
     - `actionType`: 'LINKEDIN_OUTREACH'
     - `actionIndex`: 1
     - `inquiryTaskId`: [task id]
     - `status`: 'SUBMITTED'
     - `screenshotUrl`: [uploaded file path]

---

## Step 7: LinkedIn Inquirer Completes Step 2 - Email Request

1. **Verify Step 2 UI:**
   - ✅ Title: "Step 2: Ask for Email"
   - ✅ Instructions: "Request email contact in a follow-up message"
   - ✅ New set of 3 message templates specific to Step 2
   - ✅ Template options like:
     - "Would you be open to sharing your email for professional connections?"
     - "Could we connect via email for [specific topic]?"
     - "I'd love to discuss [topic] - would email work better?"

2. **Select a template** (or customize)
3. **Upload screenshot** of the message asking for email
4. Click **Submit Step 2 & Continue**
5. **Verify:**
   - ✅ Progress bar: Step 1 + 2 green, Step 3 blue/active
   - ✅ File and message reset for Step 3
6. **Database:**
   - ✅ Second `InquiryAction` record with:
     - `actionType`: 'LINKEDIN_EMAIL_REQUEST'
     - `actionIndex`: 2

---

## Step 8: LinkedIn Inquirer Completes Step 3 - Send Catalogue

1. **Verify Step 3 UI:**
   - ✅ Title: "Step 3: Send Catalogue"
   - ✅ Instructions: "Share catalogue/price list via LinkedIn message"
   - ✅ Final set of 3 message templates
   - ✅ Template options like:
     - "Here's our catalogue with our latest offerings..."
     - "Attached is the comprehensive product range we work with..."
     - "Please find our complete service package below..."

2. **Select a template** (or customize)
3. **Upload screenshot** of catalogue/price list message
4. Click **Complete Task**
5. **Verify in Frontend:**
   - ✅ Progress bar: All 3 steps green (completed)
   - ✅ Task disappears from task list sidebar
   - ✅ Main panel returns to "Select a task to begin"
   - ✅ No more tasks assigned (if this was the only one)

---

## Step 9: Verify Database State

Run these queries to verify data integrity:

```sql
-- Check InquiryTask status
SELECT 
  it.id,
  it.platform,
  it.status,
  it.claimed_by,
  COUNT(ia.id) as action_count
FROM inquiry_tasks it
LEFT JOIN inquiry_actions ia ON it.id = ia.inquiry_task_id
WHERE it.platform = 'LINKEDIN'
GROUP BY it.id, it.platform, it.status, it.claimed_by;

-- Should return: status='COMPLETED', action_count=3

-- Check all InquiryActions for this task
SELECT 
  id,
  action_type,
  action_index,
  status,
  screenshot_url,
  created_at
FROM inquiry_actions
WHERE inquiry_task_id = '[task_id_from_above]'
ORDER BY action_index ASC;

-- Should return 3 rows:
-- Row 1: action_type='LINKEDIN_OUTREACH', action_index=1, status='SUBMITTED'
-- Row 2: action_type='LINKEDIN_EMAIL_REQUEST', action_index=2, status='SUBMITTED'
-- Row 3: action_type='LINKEDIN_CATALOGUE', action_index=3, status='SUBMITTED'
```

---

## Step 10: Inquiry Auditor Reviews Submissions

1. Log in as **Inquiry Auditor**
2. Navigate to **Inquiry Tasks** → **Audit Queue**
3. **Find the LinkedIn task** (should now appear with status COMPLETED)
4. Click to review
5. **Verify:**
   - ✅ All 3 submissions displayed with step labels
   - ✅ Screenshots visible for each step
   - ✅ Original message templates shown
   - ✅ Research context (contact details) displayed
   - ✅ Option to approve/reject all 3 submissions

6. Click **Approve All** (or individual approval)
7. **Verify:**
   - ✅ Task marked as APPROVED
   - ✅ Inquiry executor can see earnings confirmation
   - ✅ Research auditor workflow complete

---

## Troubleshooting Checklist

### Frontend Issues

**Problem:** LinkedIn Inquiries page shows blank/loading
- Check: Browser console for errors
- Check: API endpoint http://localhost:3000/api/inquiry/tasks/linkedin accessible
- Check: User has categories assigned in database

**Problem:** "No LinkedIn inquiries assigned yet"
- Check: User's assigned categories match task categories
- Check: InquiryTask exists in database with correct category
- Check: Task status is IN_PROGRESS

**Problem:** File upload fails
- Check: File size < 500KB
- Check: File format is PNG or JPG
- Check: uploads/ directory exists and is writable
- Check: No special characters in filename

**Problem:** Submit button disabled
- Check: Message is not empty
- Check: File is uploaded and preview shows
- Check: No validation errors shown

### Backend Issues

**Problem:** 404 on inquiry submission endpoint
- Check: Backend is running (npm run start:dev)
- Check: inquiry.controller.ts has POST /submit-action route
- Check: Action types include LINKEDIN_OUTREACH, LINKEDIN_EMAIL_REQUEST, LINKEDIN_CATALOGUE

**Problem:** Task doesn't move to COMPLETED after Step 3
- Check: inquiry.service.ts has the multi-step logic (checking actionCount >= 3)
- Check: Database trigger for InquiryAction creation
- Check: No validation errors in backend logs

**Problem:** actionIndex is 0 or null in database
- Check: inquiry.service.ts correctly maps action types to indices (lines ~343-346)
- Check: SQL INSERT includes actionIndex value
- Check: No migration dropped actionIndex column

### Database Issues

**Problem:** InquiryTask not created when research approved
- Check: ResearchTask status set to COMPLETED
- Check: research.service.ts has trigger to create InquiryTask
- Check: No constraint violations (foreign keys, NOT NULL)

**Problem:** Screenshots not saving
- Check: uploads/screenshots/ directory exists
- Check: File permissions (readable/writable)
- Check: Disk space available
- Check: No antivirus blocking file writes

---

## Expected Behavior Summary

| Step | Action | Expected Result | Database Change |
|------|--------|-----------------|-----------------|
| 1 | Sub-admin creates LinkedIn research | Task appears in researcher queue | ResearchTask created (PENDING_RESEARCH) |
| 2 | Researcher submits research | Task moves to audit | ResearchTask→PENDING_AUDIT |
| 3 | Auditor approves research | InquiryTask auto-created for inquirer | InquiryTask created (IN_PROGRESS), ResearchTask→COMPLETED |
| 4 | Inquirer claims task | UI shows Step 1 interface | InquiryTask.claimed_by set |
| 5 | Inquirer submits Step 1 | UI progresses to Step 2 | InquiryAction #1 (actionIndex=1) created |
| 6 | Inquirer submits Step 2 | UI progresses to Step 3 | InquiryAction #2 (actionIndex=2) created |
| 7 | Inquirer submits Step 3 | Task disappears, moves to auditor | InquiryAction #3 (actionIndex=3) created, InquiryTask→COMPLETED |
| 8 | Auditor reviews | Shows 3 steps with screenshots | InquiryTask→APPROVED |

---

## Critical Files to Monitor

During testing, watch these files for errors:

1. **Frontend Compilation:**
   - Terminal: npm run dev output
   - Browser Console: Any JavaScript errors

2. **Backend Logs:**
   - Terminal: npm run start:dev output
   - Should see POST requests for each step
   - No 4xx or 5xx errors

3. **Database:**
   - Run verification queries after each step
   - Check inquiry_actions and inquiry_tasks tables

---

## Success Criteria ✅

All of the following must be true for the implementation to be considered successful:

1. ✅ Sub-admin can create LinkedIn research task
2. ✅ Researcher can submit and research flows to auditor
3. ✅ Research auditor can approve
4. ✅ InquiryTask auto-created in database
5. ✅ LinkedIn inquirer sees task in assigned category
6. ✅ Inquirer can claim task
7. ✅ Step 1: Outreach - Upload screenshot, progress bar updates
8. ✅ Step 2: Email Request - Upload screenshot, progress bar updates
9. ✅ Step 3: Catalogue - Upload screenshot, task marked COMPLETED
10. ✅ Database shows 3 InquiryAction records with correct actionIndex values
11. ✅ Task disappears from inquirer view after Step 3
12. ✅ Task appears in inquiry auditor queue for final review
13. ✅ Inquiry auditor can see all 3 submissions with screenshots
14. ✅ No errors in browser console or backend logs

---

## Next Steps (If Successful)

1. Deploy to staging environment
2. Test with real user base
3. Monitor database for data integrity
4. Implement cooldown period between steps (optional)
5. Add earnings tracking display (optional)

---

## Notes

- File uploads are stored in `backend/uploads/screenshots/`
- Each submission creates a unique screenshot record
- Original message templates preserved in database
- Task completion is atomic - all 3 actions required
- Screenshots are required for each step (not optional)

