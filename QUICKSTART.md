# Quick Start Guide - Sub-Admin Task Management System

## 🚀 Running the System

### Step 1: Start Docker Database
```bash
cd c:\Users\nicol\Downloads\b2b-action-workforce-control-system
docker-compose up -d
```

### Step 2: Start Backend Server (Terminal 1)
```bash
cd backend
npm run start:dev
```
Backend runs on: http://localhost:3000

### Step 3: Start Frontend Server (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5174

## 📋 Key URLs

| Feature | URL |
|---------|-----|
| Dashboard | http://localhost:5174/sub-admin/dashboard |
| Website Research | http://localhost:5174/sub-admin/research/website |
| LinkedIn Research | http://localhost:5174/sub-admin/research/linkedin |
| Website Inquiry | http://localhost:5174/sub-admin/inquiry/website |
| LinkedIn Inquiry | http://localhost:5174/sub-admin/inquiry/linkedin |

## 🔑 Backend API Endpoints

### Categories
```
GET /api/subadmin/categories
```
Returns: Category[]

### Research Tasks
```
GET /api/subadmin/research/website?categoryId=UUID&status=pending
GET /api/subadmin/research/linkedin?categoryId=UUID&status=pending

POST /api/subadmin/research/website
Body: { categoryId: string, domains: string[] }

POST /api/subadmin/research/linkedin
Body: { categoryId: string, profileUrls: string[] }

GET /api/subadmin/research/:taskId
```

### Inquiry Tasks
```
GET /api/subadmin/inquiry?categoryId=UUID&platform=WEBSITE&status=pending

GET /api/subadmin/inquiry/:taskId
```

## 🧪 Testing in Postman

### 1. Get JWT Token
```
POST http://localhost:3000/api/auth/login
Body:
{
  "email": "subadmin@example.com",
  "password": "your_password"
}
```

### 2. Copy token from response

### 3. Set Authorization Header
```
Authorization: Bearer YOUR_TOKEN
```

### 4. Test Endpoints
```
GET http://localhost:3000/api/subadmin/categories
GET http://localhost:3000/api/subadmin/research/website
GET http://localhost:3000/api/subadmin/research/linkedin?status=pending
```

## 📊 Database Query Examples

### Check Sub-Admin Categories
```sql
SELECT u.email, c.name, uc.categoryId
FROM users u
JOIN user_categories uc ON u.id = uc.userId
JOIN categories c ON uc.categoryId = c.id
WHERE u.id = 'YOUR_SUBADMIN_ID';
```

### Check LinkedIn Research Tasks
```sql
SELECT rt.id, rt.status, lp.url, c.name
FROM research_tasks rt
JOIN linkedin_profiles lp ON rt.targetId = lp.id
JOIN categories c ON rt.categoryId = c.id
WHERE rt.targettype = 'LINKEDIN_PROFILE'
LIMIT 10;
```

### Check Inquiry Tasks
```sql
SELECT it.id, it.status, it.categoryId, it.createdAt
FROM inquiry_tasks it
ORDER BY it.createdAt DESC
LIMIT 10;
```

## ✨ Frontend Features Implemented

### SubAdminLinkedInResearch.tsx
- ✅ Fetches LinkedIn research tasks from API
- ✅ Status filtering (pending, approved, rejected, flagged)
- ✅ Category display
- ✅ LinkedIn profile URL linking
- ✅ Review button with navigation
- ✅ Refresh functionality

### WebsiteResearch.tsx
- ✅ Fetches Website research tasks from API
- ✅ Status filtering
- ✅ Category filtering with dropdown
- ✅ Company domain linking
- ✅ Modal detail viewer
- ✅ Responsive table layout

### SubAdminWebsiteInquiry.tsx
- ✅ Lists Website inquiry tasks
- ✅ Status filtering
- ✅ Category filtering
- ✅ Review navigation
- ✅ Task ID display

### SubAdminLinkedInInquiry.tsx
- ✅ Lists LinkedIn inquiry tasks
- ✅ Platform-specific filtering
- ✅ Status tracking
- ✅ Review interface

## 🔐 Authentication

### Test Account
```
Email: subadmin@example.com
Password: SubAdmin123!
Role: sub_admin
Categories: Assigned via user_categories table
```

### Get Token for Testing
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"subadmin@example.com","password":"SubAdmin123!"}'
```

## 📊 Seeded Test Data

### Product A Category
```
ID: c9d4cbfb-265b-4f7a-b98e-0767098de83f
Name: Product A
Status: Active
```

### LinkedIn Research Tasks (5 Total)
```
- 3 newly created tasks
- 2 from migration
- All in PENDING status
- All assigned to Product A category
- Target type: LINKEDIN_PROFILE
```

## 🐛 Troubleshooting

### "Cannot find category" error
- Check user_categories table
- Verify user is assigned to category
- Use database query from section above

### API returns 403 Forbidden
- Verify JWT token is valid
- Check user has sub_admin role
- Verify category assignment in database

### Frontend shows empty list
- Check browser console for API errors
- Verify backend is running on port 3000
- Check database has data for selected filters

### Backend compilation error
```bash
cd backend
npm run build  # Check for TypeScript errors
npm install    # Reinstall dependencies if needed
```

## 📝 File Changes Summary

### Created Files
- `backend/src/modules/subadmin/subadmin.service.ts`
- `backend/src/modules/subadmin/subadmin.controller.ts`
- `backend/src/modules/subadmin/subadmin.module.ts`
- `frontend/src/api/subadmin.api.ts`

### Updated Files
- `backend/src/app.module.ts` - Added SubAdminModule import
- `frontend/src/pages/sub-admin/SubAdminLinkedInResearch.tsx`
- `frontend/src/pages/sub-admin/WebsiteResearch.tsx`
- `frontend/src/pages/sub-admin/SubAdminWebsiteInquiry.tsx`
- `frontend/src/pages/sub-admin/SubAdminLinkedInInquiry.tsx`

## ✅ Verification Steps

1. Backend compiles: `npm run build` in backend folder
2. No TypeScript errors in build output
3. Frontend starts on port 5174
4. Can login as sub-admin user
5. Can see research and inquiry tasks in lists
6. Can click on tasks to see details
7. Category filter works correctly

## 🎯 Next Steps

1. Test with real sub-admin users in your database
2. Verify category assignments
3. Create new research/inquiry tasks
4. Test review and approval workflows
5. Check audit logs for data integrity
6. Deploy to production environment

## 📞 Support

For issues or questions:
1. Check the browser console for JavaScript errors
2. Check backend logs for server errors
3. Verify database connection: `docker-compose ps`
4. Check JWT token validity
5. Verify user role and category assignments
