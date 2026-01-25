# Architecture: 403 Forbidden Fix

## Before (BROKEN)

```
┌─────────────────────────────────────────────────────────────────┐
│                   WEBSITE RESEARCHER PAGE                       │
│                 (WebsiteResearchTasksPage.tsx)                  │
│                                                                 │
│  loadCategories() {                                            │
│    const userCats = await getUserCategories(user.id)  ← WRONG  │
│  }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ (CALLS ADMIN API)
┌──────────────────────────────────────────────────────────────────┐
│                  ADMIN API (admin.api.ts)                        │
│                                                                  │
│ export function getUserCategories(userId: string)               │
│   axios.get(`/admin/users/${userId}/categories`)               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼ (HTTP REQUEST)
┌──────────────────────────────────────────────────────────────────┐
│                  BACKEND: ADMIN CONTROLLER                       │
│                                                                  │
│ @UseGuards(JwtGuard, RolesGuard)                               │
│ @Roles('super_admin')  ← BLOCKS RESEARCHERS!                  │
│ @Get('users/:userId/categories')                              │
│ getUserCategories(@Param('userId') userId: string)            │
└──────────────────────────────────────────────────────────────────┘
                         │
                         ▼
                  ❌ 403 FORBIDDEN
             (Website Researcher blocked!)
```

## After (FIXED)

```
┌─────────────────────────────────────────────────────────────────┐
│                   WEBSITE RESEARCHER PAGE                       │
│                 (WebsiteResearchTasksPage.tsx)                  │
│                                                                 │
│  loadCategories() {                                            │
│    const userCats = await researchApi.getMyCategories() ✅    │
│  }                                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ (CALLS RESEARCH API)
┌──────────────────────────────────────────────────────────────────┐
│                 RESEARCH API (research.api.ts)                   │
│                                                                  │
│ export const researchApi = {                                    │
│   getMyCategories: async () => {                               │
│     const response = await axios.get('/users/me/categories')  │
│     return response.data                                       │
│   }                                                            │
│ }                                                              │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼ (HTTP REQUEST - NO USER ID PARAM)
┌──────────────────────────────────────────────────────────────────┐
│                 BACKEND: USERS CONTROLLER (NEW)                  │
│                                                                  │
│ @UseGuards(JwtGuard, RolesGuard)                               │
│ @Controller('users')                                           │
│ @Get('me/categories')  ← NON-ADMIN ENDPOINT                   │
│ getMyCategories(@CurrentUser('id') userId: string)            │
│   ↓                                                            │
│   return this.usersService.getUserCategories(userId)          │
│   ↓                                                            │
│   Get from user_categories table (JWT-validated user)         │
└──────────────────────────────────────────────────────────────────┘
                         │
                         ▼
                  ✅ 200 OK
             [{ id: "...", name: "No Work" }]
          (Web Researcher can now access their categories!)
```

## Security Comparison

### OLD: Admin API Approach ❌
```
Frontend                    Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
getUserCategories(user.id)      →  /admin/users/{id}/categories
                                 ↓  @Roles('super_admin')
                             ❌ 403 Forbidden
```

**Problems**:
- Admin endpoint required
- Blocked legitimate researchers
- Frontend passed user.id (theoretical spoofing vector)

### NEW: User-Scoped Endpoint ✅
```
Frontend                    Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
getMyCategories()               →  /users/me/categories
(no user ID parameter)             ↓  @JwtGuard
                               ↓  @CurrentUser('id')
                               ↓  Extract from JWT token
                               ✅ 200 OK + Categories
```

**Advantages**:
- Non-admin endpoint (appropriate scope)
- All authenticated users can access
- No user ID passed from frontend
- Backend validates token → extracts user ID
- No spoofing possible

## Guard Hierarchy

### Admin Endpoints (Protected)
```
@UseGuards(JwtGuard, RolesGuard)      ← ALL REQUESTS CHECKED
@Roles('super_admin')                  ← ONLY SUPER ADMIN
@Controller('admin')
│
├─ GET /admin/users                    → 403 for Researchers
├─ GET /admin/categories               → 403 for Researchers
└─ GET /admin/users/:id/categories    → 403 for Researchers ✅ STILL PROTECTED
```

### User Endpoints (Open)
```
@UseGuards(JwtGuard, RolesGuard)      ← ALL REQUESTS CHECKED
@Controller('users')                   ← NO ROLE RESTRICTION
│
├─ GET /users/me/categories            → 200 for ALL roles
│                                         (each sees only their own)
├─ POST /users                         → 403 (admin only via Roles)
└─ GET /users/:id                      → 403 (admin only via Roles)
```

## Data Flow: Researcher Accessing Categories

### Step 1: Authentication
```
┌─────────┐  Login Request     ┌─────────┐
│Frontend │─────────────────→  │ Backend │
│         │  web_res@test.com  │         │
│         │  admin123          │         │
└─────────┘                    └────┬────┘
                                    ▼
                           Verify credentials
                           Check user_roles table
                           Generate JWT token
                                    │
┌─────────┐  AccessToken      ┌─────────┐
│Frontend │←─────────────────  │ Backend │
│         │  eyJhbGc...        │         │
└─────────┘                    └─────────┘
```

### Step 2: Category Request
```
┌──────────────────────────────────────┐
│ Frontend Request Headers             │
├──────────────────────────────────────┤
│ GET /users/me/categories             │
│ Authorization: Bearer eyJhbGc...     │ ← JWT Token
└──────────────────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│ Backend: JwtGuard                    │
├──────────────────────────────────────┤
│ 1. Extract token from header         │
│ 2. Verify signature                  │
│ 3. Decode payload → user object      │
│ 4. Attach to req.user                │
│ 5. Pass to next guard/controller     │
└──────────────────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│ Backend: RolesGuard                  │
├──────────────────────────────────────┤
│ 1. Check @Roles decorator            │
│ 2. No role restriction on this route │
│ 3. Allow all authenticated users     │
└──────────────────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│ UsersController.getMyCategories      │
├──────────────────────────────────────┤
│ @CurrentUser('id') userId: string    │
│ Extract: userId = req.user.id        │
│          (from JWT, not URL param!)  │
└──────────────────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│ UsersService.getUserCategories       │
├──────────────────────────────────────┤
│ 1. Find user_categories rows         │
│ 2. Where userId = (JWT userId)       │
│ 3. Join with categories table        │
│ 4. Return: [{ id, name }]            │
└──────────────────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│ Database Query                       │
├──────────────────────────────────────┤
│ SELECT uc.*, c.name                  │
│ FROM user_categories uc              │
│ JOIN categories c ...                │
│ WHERE uc.userId = '6b574454...'      │
│                                      │
│ Result: [{ id: "e8e6...", name: "No Work" }]
└──────────────────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│ Response to Frontend                 │
├──────────────────────────────────────┤
│ Status: 200 OK                       │
│ Body: [                              │
│   {                                  │
│     "id": "e8e68d88-aabf-4a7a",     │
│     "name": "No Work",               │
│     "assignedAt": "2026-01-21..."    │
│   }                                  │
│ ]                                    │
└──────────────────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│ Frontend: WebsiteResearchTasksPage   │
├──────────────────────────────────────┤
│ setCategories([{ id, name }])        │
│ If count === 1: auto-select it       │
│ If count > 1:  show dropdown         │
│ Load tasks for selected category     │
│ Display: Tasks for "No Work"         │
│ Status: ✅ NO 403 ERROR              │
└──────────────────────────────────────┘
```

## Summary

```
┌──────────────────────────────────────────────────────────────────┐
│                        BEFORE vs AFTER                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ BEFORE: Admin Endpoint                                          │
│ ───────────────────────────────────────────────────────────────│
│ Endpoint:     /admin/users/{id}/categories                      │
│ Guard:        @Roles('super_admin')                             │
│ Frontend:     getUserCategories(user.id)                        │
│ Researcher:   ❌ 403 Forbidden                                  │
│                                                                  │
│ AFTER: User-Scoped Endpoint                                    │
│ ───────────────────────────────────────────────────────────────│
│ Endpoint:     /users/me/categories                              │
│ Guard:        JwtGuard (all authenticated users)                │
│ Frontend:     getMyCategories()                                 │
│ Researcher:   ✅ 200 OK + Categories                            │
│                                                                  │
│ SECURITY IMPACT:                                               │
│ ✅ Admin endpoints still protected (/admin/*)                  │
│ ✅ No global permission bypass                                  │
│ ✅ User can only access their own data                         │
│ ✅ Token-based user extraction (no spoofing)                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```
