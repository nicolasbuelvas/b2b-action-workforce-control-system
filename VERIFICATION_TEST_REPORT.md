# Inquiry Submission Flow - Verification Test Report

**Test Date:** January 24, 2026 03:00 AM  
**Tester:** Automated Verification Suite  
**Status:** IN PROGRESS

---

## Test Environment
- Backend: Running on port 3000 (development mode)
- Frontend: Running on port 5173 (development mode)
- Database: PostgreSQL via Docker
- Compilation: Both projects compiled successfully with 0 errors

---

## Pre-Test Database State

### Table Structure Verification
**cooldown_records table schema:**
```
Column          | Type                      | Nullable
----------------|---------------------------|----------
id              | uuid                      | not null
userId          | character varying         | not null
targetId        | character varying         | not null
categoryId      | character varying         | not null
actionType      | character varying         | not null ✓
actionCount     | integer                   | not null
cooldownStartedAt | timestamp with time zone | nullable
createdAt       | timestamp without time zone | not null
updatedAt       | timestamp without time zone | not null
```

**Key Finding:** actionType is NOT NULL in database (as required), and entity now includes this column.

---

## Test Cases

### Test 1: Submit with new screenshot (no duplicate)
**Expected:** 200 OK, action created, outreach record created, cooldown recorded with actionType
**Status:** PENDING
**Details:**
- Create inquiry task
- Claim task
- Upload unique screenshot
- Submit
- Check: Task removed from UI
- Check: cooldown_records has actionType set

### Test 2: Submit with duplicate screenshot
**Expected:** 200 OK, isDuplicate flag in response, task removed from UI, non-blocking yellow banner shown
**Status:** PENDING
**Details:**
- Claim inquiry task
- Upload screenshot for first time
- Submit successfully
- Upload same screenshot (same content/hash)
- Submit again
- Check: Server returns { screenshotDuplicate: true }
- Check: UI shows yellow banner "Screenshot accepted (duplicate)..."
- Check: cooldown_records created with duplicate actionType

### Test 3: Submit with existing pending action
**Expected:** 400 Bad Request "There is already a pending action"
**Status:** PENDING
**Details:**
- Claim task
- Upload screenshot
- Submit first time → 200 OK
- Try to submit again with different file before auditor approves
- Check: Backend returns 400 with message "There is already a pending action"
- Check: No new records created
- Check: Task state unchanged in database

### Test 4: Failed submit rollback (simulated via cooldown violation)
**Expected:** 400/403 error, task remains IN_PROGRESS, no partial records
**Status:** PENDING
**Details:**
- Claim task
- Make inquiry_action/outreach/cooldown record exist
- Set cooldown_records.cooldownStartedAt to future to force violation
- Try submit
- Check: Request fails with cooldown error
- Check: No new inquiry_action/outreach records created
- Check: Task still IN_PROGRESS in database
- Check: No dangling records left in transaction

### Test 5: Backend error messages returned to frontend
**Expected:** Frontend shows specific error message from backend
**Status:** PENDING
**Details:**
- Submit without file
- Check: Frontend shows "Screenshot file is required"
- Submit with invalid UUID
- Check: Frontend shows "inquiryTaskId must be a valid UUID"
- Submit with invalid actionType
- Check: Frontend shows "actionType must be one of: EMAIL, LINKEDIN, CALL"

### Test 6: Duplicate actionType in cooldown_records
**Expected:** All cooldown records have actionType set, no NULL values
**Status:** PENDING
**Details:**
```sql
SELECT COUNT(*) FROM cooldown_records WHERE actionType IS NULL;
-- Expected: 0 (no records with null actionType)
```

### Test 7: After failed submit, can retry with same file
**Expected:** User can select same file again and resubmit successfully
**Status:** PENDING
**Details:**
- Select task, upload file, submit
- Simulate failure (clear selected task)
- Re-select same task, upload same file
- Submit again
- Check: Second submit succeeds
- Check: No error about file state

### Test 8: Screenshot hash-based duplicate detection
**Expected:** Content-based duplicate detection (not filename-based)
**Status:** PENDING
**Details:**
- File1: screenshot.png (same content as below)
- File2: proof.png (same content as File1)
- Upload File1 as screenshot → 200 OK
- Upload File2 with same content → isDuplicate: true

### Test 9: Database transaction atomicity
**Expected:** On transaction rollback, no partial records remain
**Status:** PENDING
**Details:**
- Query before submit: inquiry_actions, outreach_records, cooldown_records count
- Force error after action created (e.g., permission error on outreach save)
- Check counts: should be same as before (rolled back)

### Test 10: Task status validation
**Expected:** Can't submit if task not IN_PROGRESS
**Status:** PENDING
**Details:**
- Take task (status → IN_PROGRESS)
- Manually set task.status = PENDING
- Try submit
- Check: Backend returns "Inquiry is not in progress"

### Test 11: Ownership validation
**Expected:** Can't submit task assigned to different user
**Status:** PENDING
**Details:**
- Claim task as UserA
- Manually set task.assignedToUserId = UserB (different user)
- Try submit as UserA
- Check: Backend returns "Not your inquiry task"

### Test 12: Logs for debugging
**Expected:** Comprehensive logs at each checkpoint
**Status:** PENDING
**Details:**
- Check backend logs for patterns:
  - [INQUIRY-SUBMIT] ========== REQUEST START =========
  - [SERVICE-SUBMIT] ========== START =========
  - [SERVICE-SUBMIT] Task found
  - [SERVICE-SUBMIT] Screenshot result: { screenshotId, isDuplicate }
  - [COOLDOWN] Cooldown record saved successfully
  - [SCREENSHOTS] Duplicate screenshot detected (if applicable)
  - [SERVICE-SUBMIT] ========== SUCCESS =========

---

## Logs Captured During Tests

### Backend Logs (Excerpt - Latest Session)
```
[Nest] 7036  - 24/01/2026, 3:03:21 a. m.     LOG [RouterExplorer] Mapped {/inquiry/submit, POST} route +7ms
[Nest] 7036  - 24/01/2026, 3:03:21 a. m.     LOG [NestApplication] Nest application successfully started +21ms
Backend running on port 3000 and ready for ngrok
```

**Status:** Backend started successfully, all routes mapped correctly.

---

## Code Changes Verification

### Screenshots Service ✓
- [x] Signature changed to return `{ screenshotId, isDuplicate, existingScreenshotId? }`
- [x] No longer throws on duplicate
- [x] Returns existing screenshot ID for duplicates
- [x] Logging added

### Inquiry Service ✓
- [x] DataSource injected
- [x] submitInquiry wrapped in transaction
- [x] Accepts screenshotResult object
- [x] Calls cooldownService.recordAction with actionType
- [x] Manager passed for transactional queries
- [x] Comprehensive logging at each step
- [x] Builds with 0 errors

### Cooldown Service ✓
- [x] recordAction accepts manager parameter
- [x] actionType validated before save
- [x] actionType included in record creation
- [x] Defensive error handling

### Inquiry Controller ✓
- [x] Validates inquiryTaskId is UUID
- [x] Validates actionType in enum
- [x] Validates file exists and has buffer
- [x] Returns precise error messages
- [x] Try-catch wrapper with logging
- [x] Builds with 0 errors

### Frontend ✓
- [x] Handles error.response.data.message from backend
- [x] Shows duplicate acceptance banner
- [x] Does not clear task state on error
- [x] Allows retry after failed submit
- [x] Builds with 0 errors

### CooldownRecord Entity ✓
- [x] Includes actionType column
- [x] Includes actionCount column
- [x] Index updated to include actionType

---

## Summary

**Implementation Status:** COMPLETE
- All code changes implemented
- All builds successful (backend 0 errors, frontend 0 errors)
- Both development servers running

**Testing Status:** Ready for manual verification
- Database schema verified (actionType NOT NULL exists)
- Logging infrastructure in place
- Error handling standardized
- Transaction support implemented

**Next Steps:**
1. Manual test each of 12 test cases
2. Capture logs for each scenario
3. Verify database state after each test
4. Document any issues found

---

## Manual Test Execution

To run tests, use:
```bash
# Backend
curl -X POST http://localhost:3000/inquiry/submit \
  -F "inquiryTaskId=<task-id>" \
  -F "actionType=EMAIL" \
  -F "screenshot=@<file>" \
  -H "Authorization: Bearer <token>"

# Frontend
1. Navigate to http://localhost:5173
2. Login as website_inquirer
3. Select inquiry task
4. Upload screenshot
5. Submit
```

---

**Test Report Generated:** 2026-01-24T03:05:00Z  
**Last Updated:** In Progress
