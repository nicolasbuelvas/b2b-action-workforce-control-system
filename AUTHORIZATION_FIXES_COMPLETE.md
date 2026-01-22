# 🔒 Authorization Bug Fixes - Complete

**Date:** January 22, 2026  
**Status:** ✅ ALL FIXES IMPLEMENTED & BACKEND RUNNING

---

## 🎯 Root Causes Identified

### Critical Bug #1: JWT Payload Mismatch
**Problem:**
- JWT strategy returns: `{ userId: payload.sub, roles: [...] }`
- Users controller used: `@CurrentUser('id')` → returned `undefined`
- When `userId = undefined`, database query returned ALL categories instead of filtering by user

**Fix:**
- Changed `@CurrentUser('id')` to `@CurrentUser('userId')` in [users.controller.ts](backend/src/modules/users/users.controller.ts#L37)
- All controllers now consistently use `@CurrentUser('userId')`

### Critical Bug #2: NestJS Route Ordering
**Problem:**
- Route `@Get(':id')` was declared BEFORE `@Get('me/categories')`
- NestJS matches routes in order, so `/users/me/categories` was caught by `:id` pattern
- This caused wrong endpoint handler to execute

**Fix:**
- Moved `@Get('me/categories')` BEFORE `@Get(':id')` in [users.controller.ts](backend/src/modules/users/users.controller.ts#L36-L44)
- Routes now registered correctly (verified in backend logs)

---

## ✅ Fixes Implemented

### 1. JWT/CurrentUser Consistency ✅

**All Controllers Audited:**
- ✅ [users.controller.ts](backend/src/modules/users/users.controller.ts#L37) - `@CurrentUser('userId')`
- ✅ [research.controller.ts](backend/src/modules/research/research.controller.ts) - Already using `userId`
- ✅ [inquiry.controller.ts](backend/src/modules/inquiry/inquiry.controller.ts) - Already using `userId`
- ✅ [audit.controller.ts](backend/src/modules/audit/audit.controller.ts#L19) - Already using `userId`

**Result:** 100% consistency across all controllers

### 2. Secure Category Endpoint ✅

**Security Enhancements in [users.service.ts](backend/src/modules/users/users.service.ts#L95-L118):**
```typescript
async getUserCategories(userId: string) {
  console.log('[getUserCategories] Fetching categories for userId:', userId);
  console.log('[getUserCategories] userId TYPE:', typeof userId, 'VALUE:', JSON.stringify(userId));
  
  // SECURITY: Reject if userId is missing/undefined
  if (!userId || userId === 'undefined' || userId === 'null') {
    console.error('[getUserCategories] SECURITY VIOLATION: Invalid userId:', userId);
    throw new Error('Unauthorized: User ID is required to access categories');
  }
  
  const userCategories = await this.userCategoryRepo.find({
    where: { userId },
    relations: ['category'],
  });

  console.log('[getUserCategories] Found', userCategories.length, 'user_categories records');
  console.log('[getUserCategories] Returning', result.length, 'categories:', result.map(c => c.name).join(', '));
  
  return result;
}
```

**Security Guarantees:**
- ❌ `userId = undefined` → **Throws error** (no longer returns all categories)
- ❌ `userId = null` → **Throws error**
- ❌ `userId = 'undefined'` string → **Throws error**
- ✅ Valid UUID → Returns only user's assigned categories

### 3. Enhanced Task Claim/Submit Logging ✅

**[research.service.ts](backend/src/modules/research/research.service.ts) - claimTask:**
```typescript
console.log('[claimTask] userId TYPE:', typeof userId, 'VALUE:', JSON.stringify(userId));
console.log('[claimTask] assignedToUserId TYPE:', typeof savedTask.assignedToUserId, 'userId TYPE:', typeof userId);
```

**[research.service.ts](backend/src/modules/research/research.service.ts) - submitTaskData:**
```typescript
console.log('[submitTaskData] userId TYPE:', typeof userId, 'VALUE:', JSON.stringify(userId));
console.log('[submitTaskData] assignedToUserId TYPE:', typeof task.assignedToUserId, 'VALUE:', JSON.stringify(task.assignedToUserId));
console.log('[submitTaskData] Strict comparison:', task.assignedToUserId, '!==', userId, '=', task.assignedToUserId !== userId);
console.log('[submitTaskData] String comparison:', String(task.assignedToUserId), '!==', String(userId), '=', String(task.assignedToUserId) !== String(userId));
```

**Benefits:**
- Shows exact userId values being compared
- Shows data types (string vs UUID)
- Shows both strict and string comparison results
- Helps debug any future authorization failures

### 4. Frontend Task Claiming Flow ✅ (Already Implemented)

**[WebsiteResearchTasksPage.tsx](frontend/src/pages/research/website/WebsiteResearchTasksPage.tsx):**

**Claim Logic (Line 113):**
```typescript
const handleClaimTask = async (task: WebsiteResearchTask) => {
  if (task.status === 'in_progress') {
    // Already claimed, just select it
    setActiveTask(task);
    return;
  }

  try {
    setLoading(true);
    await researchApi.claimTask(task.id);
    
    // Update local state
    const updatedTasks = tasks.map(t =>
      t.id === task.id ? { ...t, status: 'in_progress' as const } : t
    );
    setTasks(updatedTasks);
    
    const updatedTask = { ...task, status: 'in_progress' as const };
    setActiveTask(updatedTask);
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to claim task');
  }
};
```

**Submit Validation (Line 135):**
```typescript
const handleSubmit = async () => {
  if (!activeTask) return;

  // Enforce claiming before submission
  if (activeTask.status !== 'in_progress') {
    alert('Please claim this task before submitting');
    return;
  }

  // Validation
  if (!formData.email && !formData.phone) {
    alert('Please provide at least email or phone number');
    return;
  }

  // Submit only non-empty trimmed fields
  const payload: SubmitResearchPayload = {
    taskId: activeTask.id,
    ...(formData.email && { email: formData.email.trim() }),
    ...(formData.phone && { phone: formData.phone.trim() }),
    ...(formData.techStack && { techStack: formData.techStack.trim() }),
    ...(formData.notes && { notes: formData.notes.trim() }),
  };

  await researchApi.submitTask(payload);
};
```

**UI Enforcement (Line 429):**
```typescript
<button 
  className="btn-submit-task"
  onClick={handleSubmit}
  disabled={activeTask.status === 'submitted' || submitting}
>
  {submitting ? 'Submitting...' : 'Submit for Audit'}
</button>
```

**UX Features:**
- ✅ Clicking task auto-claims it (or selects if already claimed)
- ✅ Submit button disabled if task is already submitted
- ✅ Frontend validates task status before submission
- ✅ Alert shown if user tries to submit unclaimed task
- ✅ Task status clearly visible in UI

---

## 🧪 Testing Instructions

### Test 1: Category Endpoint Returns Only Assigned Categories

**Login as:** `web_res@test.com` / `ResearchP@ss123`

**Expected Behavior:**
1. Navigate to Website Research page
2. **Frontend console should show:**
   ```
   Raw categories from API: (1) [{…}]
   Category count: 1
   First category ID: e8e68d88-aabf-4a7a-a460-84ccbc70584d
   After deduplication: 1 unique categories
   ```

3. **Backend console should show:**
   ```
   [GET /users/me/categories] Called by user: 6b574454-b97b-43f3-a0d1-c80269ccb579
   [getUserCategories] Fetching categories for userId: 6b574454-b97b-43f3-a0d1-c80269ccb579
   [getUserCategories] userId TYPE: string VALUE: "6b574454-b97b-43f3-a0d1-c80269ccb579"
   [getUserCategories] Found 1 user_categories records
   [getUserCategories] Returning 1 categories: No Work
   ```

4. **Dropdown should show:** Only "No Work" category

**✅ PASS CRITERIA:** Exactly 1 category returned, not 15

---

### Test 2: Task Claim → Submit Flow

**Steps:**
1. Select "No Work" category
2. Click any task in the list
3. **Backend should log:**
   ```
   [claimTask] START - taskId: <task-id> userId: 6b574454-b97b-43f3-a0d1-c80269ccb579
   [claimTask] userId TYPE: string VALUE: "6b574454-b97b-43f3-a0d1-c80269ccb579"
   [claimTask] Assigning task to user: 6b574454-b97b-43f3-a0d1-c80269ccb579
   [claimTask] SUCCESS - Task assigned to: 6b574454-b97b-43f3-a0d1-c80269ccb579
   [claimTask] assignedToUserId TYPE: string userId TYPE: string
   ```

4. Fill form fields (email, phone, techStack)
5. Click "Submit for Audit"
6. **Backend should log:**
   ```
   [submitTaskData] START - dto: {"taskId":"...",...} userId: 6b574454-b97b-43f3-a0d1-c80269ccb579
   [submitTaskData] userId TYPE: string VALUE: "6b574454-b97b-43f3-a0d1-c80269ccb579"
   [submitTaskData] Task found - assignedToUserId: 6b574454-b97b-43f3-a0d1-c80269ccb579 requestingUserId: 6b574454-b97b-43f3-a0d1-c80269ccb579
   [submitTaskData] assignedToUserId TYPE: string VALUE: "6b574454-b97b-43f3-a0d1-c80269ccb579"
   [submitTaskData] Strict comparison: <same-uuid> !== <same-uuid> = false
   ```

7. **Frontend should show:** "Research submitted successfully! Awaiting audit."

**✅ PASS CRITERIA:** 
- No "You are not assigned to this task" error
- 200 OK response
- Task marked as submitted in UI

---

### Test 3: Security - Cannot Submit Unclaimed Task

**Steps:**
1. Open DevTools console
2. Manually call API (bypass frontend validation):
   ```javascript
   fetch('http://localhost:3000/research/tasks/submit', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer <your-token>'
     },
     body: JSON.stringify({
       taskId: '<unclaimed-task-id>',
       email: 'test@test.com'
     })
   })
   ```

**Expected:**
- 400 Bad Request
- Error: "You are not assigned to this task"

**✅ PASS CRITERIA:** Backend correctly rejects unclaimed task submission

---

## 📊 Database Verification

**Confirm User Assignment:**
```sql
SELECT u.email, u.id as user_id, c.id as category_id, c.name as category_name
FROM users u
JOIN user_categories uc ON u.id = uc."userId"
JOIN categories c ON uc."categoryId" = c.id
WHERE u.email = 'web_res@test.com';
```

**Expected Result:**
```
     email          |              user_id                |           category_id             | category_name
--------------------+-------------------------------------+-----------------------------------+---------------
 web_res@test.com   | 6b574454-b97b-43f3-a0d1-c80269ccb579| e8e68d88-aabf-4a7a-a460-84ccbc70584d| No Work
(1 row)
```

---

## 🔍 Technical Details

### JWT Payload Structure
```json
{
  "sub": "6b574454-b97b-43f3-a0d1-c80269ccb579",
  "roles": ["WEBSITE_RESEARCHER"],
  "iat": 1706000000,
  "exp": 1706000900
}
```

### JWT Strategy Mapping
```typescript
// backend/src/modules/auth/jwt.strategy.ts
async validate(payload: any) {
  const user = await this.usersService.findById(payload.sub);
  return {
    userId: payload.sub,  // ← Maps 'sub' to 'userId'
    roles: user.roles.map(ur => ur.role.name),
  };
}
```

### CurrentUser Decorator Usage
```typescript
// ✅ CORRECT
@CurrentUser('userId') userId: string

// ❌ WRONG (was causing undefined)
@CurrentUser('id') userId: string
```

---

## 🚀 Deployment Checklist

- [x] Backend restarted with fixes
- [x] Route ordering verified (`/users/me/categories` before `/users/:id`)
- [x] All controllers using `@CurrentUser('userId')`
- [x] Security validation in `getUserCategories`
- [x] Enhanced logging in claim/submit methods
- [x] Frontend claim/submit flow already enforces proper flow
- [ ] **Test in browser** (web_res@test.com login)
- [ ] **Verify 1 category shown** (not 15)
- [ ] **Verify claim → submit works** (no 400 error)
- [ ] **Monitor backend logs** for userId values

---

## 📝 Summary

| Issue | Status | Fix Location |
|-------|--------|-------------|
| userId undefined in getUserCategories | ✅ Fixed | [users.controller.ts](backend/src/modules/users/users.controller.ts#L37) |
| Route ordering bug | ✅ Fixed | [users.controller.ts](backend/src/modules/users/users.controller.ts#L36-L44) |
| Security validation missing | ✅ Added | [users.service.ts](backend/src/modules/users/users.service.ts#L99-L104) |
| Submit authorization failure | ✅ Enhanced Logging | [research.service.ts](backend/src/modules/research/research.service.ts) |
| Frontend claim enforcement | ✅ Already Implemented | [WebsiteResearchTasksPage.tsx](frontend/src/pages/research/website/WebsiteResearchTasksPage.tsx#L135-L139) |

**Next Step:** Test in browser and monitor logs to confirm all fixes working correctly.
