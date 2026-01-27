# LinkedIn Inquirer Auditor - Database Error Fix

**Fixed At:** January 27, 2026, 9:15 AM  
**Status:** ✅ DEPLOYED AND ACTIVE

## Problem

The LinkedIn Inquirer Auditor page was showing a 500 Internal Server Error when loading pending submissions. The backend error indicated:

```
[Nest] ERROR [ExceptionsHandler] relation "linkedin_inquiry_tasks" does not exist
QueryFailedError: relation "linkedin_inquiry_tasks" does not exist
```

**Root Cause:** The backend service was attempting to query non-existent database tables:
- `linkedin_inquiry_tasks` (doesn't exist)
- `linkedin_action` (doesn't exist)
- `linkedin_submission_snapshots` (doesn't exist)

The actual data was stored in generic tables with a platform discriminator:
- `inquiry_tasks` (with `platform` column = 'LINKEDIN' or 'WEBSITE')
- `inquiry_actions` (stores actions for both platforms)
- `inquiry_submission_snapshots` (stores snapshots for both platforms)

## Solution Implemented

### File Modified
**[backend/src/modules/audit/audit.service.ts](backend/src/modules/audit/audit.service.ts)**

### Changes Made

#### 1. Fixed `getPendingLinkedInInquiry()` Method (Lines 337-404)
**Before:** Attempted to use non-existent `LinkedInInquiryTask`, `LinkedInAction`, `LinkedInSubmissionSnapshot` entities

**After:** 
- Uses `InquiryTask` repository with platform filter
- Query filters for `platform = 'LINKEDIN'` and `status = COMPLETED`
- Maps `inquiryActionId` (correct column name in snapshots)
- Maps action index to display type:
  - 1 → `LINKEDIN_OUTREACH`
  - 2 → `LINKEDIN_EMAIL_REQUEST`
  - 3 → `LINKEDIN_CATALOGUE`

```typescript
// Key fix: Using InquiryTask with platform filter instead of non-existent table
const tasks = await this.inquiryTaskRepo
  .createQueryBuilder('task')
  .where('task.status = :status', { status: InquiryStatus.COMPLETED })
  .andWhere('task.platform = :platform', { platform: 'LINKEDIN' })
  .andWhere('task.categoryId IN (:...categoryIds)', { categoryIds })
  .orderBy('task.createdAt', 'ASC')
  .getMany();
```

#### 2. Fixed `auditLinkedInInquiry()` Method (Lines 418-478)
**Before:** Used non-existent LinkedIn-specific entity enums (`LinkedInActionStatus`, `LinkedInInquiryStatus`)

**After:**
- Uses correct `InquiryAction` and `InquiryTask` repositories
- Uses standard string status values: `'APPROVED'`, `'REJECTED'`
- Added platform validation to ensure task is LINKEDIN
- Fixed snapshot query to use `inquiryActionId` column

```typescript
// Key fix: Platform validation and correct status enum usage
if (task.platform !== 'LINKEDIN') {
  throw new BadRequestException('Task is not a LinkedIn inquiry task');
}

// Using string status instead of non-existent enum
action.status = dto.decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
```

#### 3. Cleaned Up Imports (Lines 20-36)
Removed unused imports:
- ❌ `LinkedInInquiryTask`, `LinkedInInquiryStatus` (non-existent entity)
- ❌ `LinkedInAction`, `LinkedInActionStatus` (non-existent entity)
- ❌ `LinkedInSubmissionSnapshot` (non-existent entity)

Kept used imports:
- ✅ `InquiryTask`, `InquiryStatus` (actual entity)
- ✅ `InquiryAction` (actual entity)
- ✅ `InquirySubmissionSnapshot` (actual entity)

## Verification

### Compilation Status
✅ TypeScript compilation: 0 errors  
✅ Backend auto-reloaded with watch mode  
✅ All NestJS modules initialized successfully  

### Database Schema Verification
The fix now correctly uses these existing tables:
- `inquiry_tasks` - Contains both WEBSITE and LINKEDIN tasks (platform column discriminates)
- `inquiry_actions` - Contains actions for all inquiry types
- `inquiry_submission_snapshots` - Contains screenshots and metadata

### API Endpoints Verified
✅ `GET /audit/linkedin-inquiry/pending` - Now returns correct data structure  
✅ `POST /audit/linkedin-inquiry/:taskId/actions/:actionId` - Ready to process approvals/rejections

## Testing the Fix

**Step 1: Navigate to LinkedIn Auditor Page**
- Login as: `li_aud@test.com` / `password123`
- Navigate to: Audit Inquirer → LinkedIn

**Step 2: Verify Task Loading**
- Should see 1 pending LinkedIn inquiry task with 3 steps
- Category selector should show "Product A"

**Step 3: Test Timeline Expansion**
- Click the "+" button to expand each step
- Screenshots should display correctly

**Step 4: Test Approval**
- Click "Approve" on each of the 3 steps
- All actions should change to "APPROVED" status
- Task should disappear from list or change to APPROVED status

**Step 5: Monitor Backend Logs**
- No 500 errors in backend console
- Successful log entries for approval operations

## Real Data Verification

**Database Content (Confirmed):**
- ✅ 1 inquiry_task record with platform='LINKEDIN', status='COMPLETED'
- ✅ 3 inquiry_action records with actionindex=[1,2,3], all status='PENDING'
- ✅ 3 inquiry_submission_snapshot records with screenshots and is_duplicate flags

**User Credentials (Confirmed):**
- ✅ Auditor: `li_aud@test.com` with `linkedin_inquirer_auditor` role
- ✅ Worker: `li_inq@test.com` who submitted the tasks
- ✅ Categories: "Product A" assigned to auditor

## Architecture Notes

The system uses a **single table strategy with platform discriminator**:
- `inquiry_tasks.platform IN ('WEBSITE', 'LINKEDIN')`
- Both platform types use same entity/table structure
- Filtering by platform is done in query layer, not at entity level

This approach eliminates data duplication and maintains referential integrity.

## Files Status

| File | Status | Changes |
|------|--------|---------|
| [backend/src/modules/audit/audit.service.ts](backend/src/modules/audit/audit.service.ts) | ✅ FIXED | 3 method fixes, 16 import lines removed |
| [frontend/src/api/audit.api.ts](frontend/src/api/audit.api.ts) | ✅ OK | No changes needed |
| [frontend/src/pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage.tsx](frontend/src/pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage.tsx) | ✅ OK | Component ready |
| [frontend/src/pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage.css](frontend/src/pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage.css) | ✅ OK | Styling ready |

## Next Steps

1. **Refresh Browser** - Clear cache and reload http://localhost:5174
2. **Login** - Use `li_aud@test.com` / `password123`
3. **Navigate** - Go to Audit Inquirer → LinkedIn
4. **Test** - Verify task loading and approve/reject functionality
5. **Confirm** - Check database shows task status updated to APPROVED

---

**Time to Fix:** ~5 minutes  
**Root Cause:** Attempted to use non-existent LinkedIn-specific entities instead of generic inquiry entities with platform filter  
**Solution Complexity:** Low - Query rewrite with platform filter  
**Risk Level:** Very Low - No structural database changes, only query logic fixes
