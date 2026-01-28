# Fix for SubAdmin LinkedIn Research

## Issue
SubAdmin LinkedIn Research page not showing tasks (Website Research works fine).

## Root Cause
The backend controller at line 197 returns `result.data` instead of the full paginated response object `result`.

## Fix Required

**File:** `backend/src/modules/subadmin/subadmin.controller.ts`

**Line 180-199:** Change this:

```typescript
  @Get('research/linkedin')
  async getLinkedInResearchTasks(
    @CurrentUser() user: UserPayload,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: ResearchStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const result = await this.subAdminService.getLinkedInResearchTasks(
      user.id,  // ← PROBLEM 1: Should use user?.id ?? user?.userId
      categoryId,
      status,
      Math.min(limit, 100),
      offset,
    );
    return result.data;  // ← PROBLEM 2: Should return full result object
  }
```

**To this:**

```typescript
  @Get('research/linkedin')
  async getLinkedInResearchTasks(
    @CurrentUser() user: UserPayload,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: ResearchStatus,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const userId = user?.id ?? user?.userId;  // ← FIX 1
    const result = await this.subAdminService.getLinkedInResearchTasks(
      userId,
      categoryId,
      status,
      Math.min(limit, 100),
      offset,
    );
    return result;  // ← FIX 2: Return full paginated response
  }
```

## Why This Fixes It

1. **userId handling**: Matches the pattern used in other endpoints (like `getUsers`, `getCategories`)
2. **Full response return**: The frontend expects `{ data: [], total: number }` but was only getting the data array

## Compare with Working Website Research

**Website Research** (lines ~165-177) correctly returns the full result:
```typescript
@Get('research/website')
async getWebsiteResearchTasks(...) {
  const result = await this.subAdminService.getWebsiteResearchTasks(...);
  return result;  // ← Returns full paginated object
}
```

**LinkedIn Research** (lines 183-199) was incorrectly returning only `result.data`:
```typescript
@Get('research/linkedin')
async getLinkedInResearchTasks(...) {
  const result = await this.subAdminService.getLinkedInResearchTasks(...);
  return result.data;  // ← Wrong! Loses pagination info
}
```

## Manual Fix Instructions

1. Open `backend/src/modules/subadmin/subadmin.controller.ts`
2. Go to line ~183-199 (the `getLinkedInResearchTasks` method)
3. Change line ~191: `user.id,` → `userId,`
4. Add line ~191 (before the method call): `const userId = user?.id ?? user?.userId;`
5. Change line ~197: `return result.data;` → `return result;`
6. Save file
7. Backend will auto-reload
8. Test SubAdmin LinkedIn Research page - tasks should now appear
