# Fix for Inquiry Tasks Error

## Problem
After creating research tasks with the new metadata columns (job_type_id, company_type_id), the inquiry endpoint is failing with a 500 error because the backend server needs to reload its database schema.

## Root Cause
The database migration was applied while the backend server was running. TypeORM caches the table schema, so the running server still thinks those columns don't exist, even though they've been added to the database.

## Solution

### Step 1: Verify Database Columns
First, verify the columns exist in the database:
```powershell
docker exec -i b2b_postgres psql -U postgres -d backend -c "\d research_tasks" | Select-String "job_type|company_type|language"
```

You should see:
- job_type_id (uuid)
- company_type_id (uuid)
- language (varchar)

### Step 2: Restart Backend Server
Stop and restart the backend server to reload the schema:

**Terminal: node**
1. Press `Ctrl+C` to stop the backend
2. Run: `npm run start:dev`

The backend will reconnect to PostgreSQL and reload the updated schema.

### Step 3: Test Inquiry Workflow
1. Login as Website Inquirer
2. Navigate to Website Inquiry Tasks page
3. You should see the completed research tasks ready for inquiry
4. The error should be gone

## Additional Fix: Clear TypeORM Cache (If Issue Persists)

If restarting doesn't work, you may need to clear TypeORM's schema cache:

```powershell
cd backend
Remove-Item -Path ".typeorm-cache" -Recurse -Force -ErrorAction SilentlyContinue
npm run start:dev
```

## Verification
After restart, test these endpoints:
- `GET /inquiry/tasks/website` - should return available tasks
- `GET /subadmin/queued-actions` - should work without errors
- `GET /subadmin/alerts` - should work without errors

## Next Steps After Fix
Once the backend restarts successfully:
1. Website Inquirer can claim inquiry tasks
2. Submit inquiries with screenshots
3. Inquiry Auditor can review submissions
4. Full workflow: Create Task → Research → Audit Research → Inquire → Audit Inquiry → Complete

---
**Status**: Database migration applied ✅  
**Pending**: Backend server restart needed to reload schema
