# Quick Testing Guide - SubAdmin Pages

## ✅ COMPLETED FIXES

All 8 SubAdmin role pages have been fixed to eliminate the UUID/VARCHAR error.

---

## Pages Fixed

### 1. Website Research ✅
**Path**: `/sub-admin/research/website`
**Endpoint**: `GET /subadmin/research/website`
**Status**: User confirmed working

### 2. LinkedIn Research ✅
**Path**: `/sub-admin/research/linkedin`
**Endpoint**: `GET /subadmin/research/linkedin`
**Status**: Fixed (needs testing)

### 3. Website Inquiry ✅
**Path**: `/sub-admin/inquiry/website`
**Endpoint**: `GET /subadmin/inquiry?platform=WEBSITE`
**Status**: Fixed (needs testing)

### 4. LinkedIn Inquiry ✅
**Path**: `/sub-admin/inquiry/linkedin`  
**Endpoint**: `GET /subadmin/inquiry?platform=LINKEDIN`
**Status**: Fixed (needs testing)

### 5. Research Review ✅
**Path**: `/sub-admin/review/research`
**Endpoint**: `GET /subadmin/pending/research`
**Status**: Fixed (needs testing)

### 6. Inquiry Review ✅
**Path**: `/sub-admin/review/inquiry`
**Endpoint**: `GET /subadmin/pending/inquiry`
**Status**: Fixed (needs testing)

---

## Test Each Page

For each page, verify:

1. **Page Loads** - No 500 errors
2. **Category Filter** - Shows your assigned categories
3. **Status Filter** - Filters by pending/in_progress/submitted/completed/rejected
4. **Search** - Filters results in real-time
5. **Pagination** - Can navigate pages, change results per page
6. **Detail Modal** - Click "View Details" opens modal with full task info
7. **Active Filters** - Shows which filters are active, can remove them

---

## What Changed

### Backend
- All methods now use raw SQL instead of TypeORM QueryBuilder
- Added `::text` casts to fix UUID/VARCHAR comparisons
- Example: `LEFT JOIN categories cat ON cat.id::text = t."categoryId"`

### Frontend
- All 4 main pages (Research/Inquiry × Website/LinkedIn) now use same UI pattern
- Proper pagination support
- Better error handling
- Consistent filter behavior
- Modern card-based layout

---

## If You See Errors

### 500 Internal Server Error
- Check backend logs: `docker logs b2b_backend -f`
- Look for database query errors
- File: `backend/src/modules/subadmin/subadmin.service.ts`

### 403 Forbidden
- User doesn't have SubAdmin role
- Or user has no assigned categories

### Empty Results
- Normal if no tasks exist for your categories
- Check database: `docker exec -i b2b_postgres psql -U postgres -d backend -c "SELECT * FROM user_categories WHERE \"userId\" = 'YOUR_USER_ID';"`

---

## Database Verification

```bash
# Check your assigned categories
docker exec -i b2b_postgres psql -U postgres -d backend -c "
SELECT uc.*, c.name 
FROM user_categories uc 
JOIN categories c ON c.id = uc.\"categoryId\" 
WHERE uc.\"userId\" = 'YOUR_USER_ID';"

# Check research tasks in your categories
docker exec -i b2b_postgres psql -U postgres -d backend -c "
SELECT COUNT(*), status, \"categoryId\" 
FROM research_tasks 
WHERE \"categoryId\" IN (SELECT \"categoryId\" FROM user_categories WHERE \"userId\" = 'YOUR_USER_ID')
GROUP BY status, \"categoryId\";"

# Check inquiry tasks
docker exec -i b2b_postgres psql -U postgres -d backend -c "
SELECT COUNT(*), status, platform, \"categoryId\" 
FROM inquiry_tasks 
WHERE \"categoryId\" IN (SELECT \"categoryId\" FROM user_categories WHERE \"userId\" = 'YOUR_USER_ID')
GROUP BY status, platform, \"categoryId\";"
```

---

## Files Modified

### Backend (1 file)
- `backend/src/modules/subadmin/subadmin.service.ts`

### Frontend (4 files)
- `frontend/src/api/subadmin.api.ts`
- `frontend/src/pages/sub-admin/SubAdminLinkedInResearch.tsx`
- `frontend/src/pages/sub-admin/SubAdminWebsiteInquiry.tsx`
- `frontend/src/pages/sub-admin/SubAdminLinkedInInquiry.tsx`

---

## Build Status

✅ Backend: `npm run build` - SUCCESS  
✅ Frontend: `npm run build` - SUCCESS  
✅ No TypeScript errors

---

## Next Steps

1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login as SubAdmin user
4. Test each of the 8 pages listed above
5. Report any errors or unexpected behavior

---

## Success Criteria

- ✅ No 500 errors on any page
- ✅ Category filter works
- ✅ Status filter works
- ✅ Search works
- ✅ Pagination works
- ✅ Detail modals work
- ✅ Data displays correctly

---

## Rollback

If needed, revert these files:
```bash
git checkout HEAD -- backend/src/modules/subadmin/subadmin.service.ts
git checkout HEAD -- frontend/src/api/subadmin.api.ts
git checkout HEAD -- frontend/src/pages/sub-admin/SubAdminLinkedInResearch.tsx
git checkout HEAD -- frontend/src/pages/sub-admin/SubAdminWebsiteInquiry.tsx
git checkout HEAD -- frontend/src/pages/sub-admin/SubAdminLinkedInInquiry.tsx
```
