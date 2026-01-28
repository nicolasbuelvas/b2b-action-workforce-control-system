# SubAdminLinkedInResearch Fix - Complete

## Problem
The `/subadmin/research/linkedin` endpoint was returning a **500 Internal Server Error** with the message:
```
column p.name does not exist
```

## Root Cause
The SQL query in `getLinkedInResearchTasks()` was trying to select non-existent columns from the `linkedin_profiles` table:
- `p.name` - doesn't exist
- `p.company` - doesn't exist

## Solution
Updated the SQL query in `backend/src/modules/subadmin/subadmin.service.ts` to use the correct columns from the `linkedin_profiles` entity:

### Before:
```typescript
SELECT 
  ...
  p.name as "profileName",
  p.url as "profileUrl",
  p.company as "profileCompany",
  ...
FROM research_tasks t
LEFT JOIN linkedin_profiles p ON p.id::text = t."targetId" AND t.targettype = 'LINKEDIN_PROFILE'
```

### After:
```typescript
SELECT 
  ...
  p."contactName" as "profileName",
  p.url as "profileUrl",
  p.country,
  ...
FROM research_tasks t
LEFT JOIN linkedin_profiles p ON p.id::text = t."targetId"
```

## Changes Made

### Backend (`backend/src/modules/subadmin/subadmin.service.ts`)
1. Fixed `targettype` filter from `IN ('LINKEDIN_PROFILE', 'LINKEDIN')` to just `'LINKEDIN_PROFILE'`
2. Fixed column names to match actual database schema:
   - `p.name` → `p."contactName"`
   - Removed non-existent `p.company` column
3. Added `p.country` which is available in the `linkedin_profiles` table
4. Updated transformation to include `profileName`, `profileUrl`, and `country`
5. Fixed parameter indexing to use correct placeholder numbers

### LinkedIn Profiles Entity
The actual `linkedin_profiles` table has these columns:
- `id` (UUID)
- `url` (string)
- `normalizedUrl` (string)
- `contactName` (nullable string)
- `country` (nullable string)
- `language` (nullable string)
- `createdAt` (timestamp)

## Frontend Status
No changes needed - `SubAdminLinkedInResearch.tsx` already correctly:
- Uses `getLinkedInResearchTasks()` API
- Handles paginated response structure
- Displays LinkedIn-specific fields (profileName, profileUrl, country)
- Has category filtering, status filtering, search, and pagination
- Follows the same pattern as the working WebsiteResearch.tsx

## API Response Structure
The endpoint now returns properly structured data:
```typescript
{
  data: [
    {
      id: string,
      profileUrl: string,
      profileName?: string,
      country?: string,
      category: string,
      categoryName: string,
      status: string,
      createdAt: string
    },
    ...
  ],
  total: number
}
```

## Testing
✅ Backend builds successfully
✅ Frontend builds successfully
✅ All TypeScript types are correct
✅ Query uses correct table columns
✅ Response structure matches frontend expectations

## Result
SubAdminLinkedInResearch.tsx is now fully connected to LinkedinResearchTasksPage.tsx reference page and will:
- Load all LinkedIn research tasks for the selected category
- Display them in card format with profiles, URLs, countries
- Support filtering by category and status
- Support searching by profile name or URL
- Provide pagination
