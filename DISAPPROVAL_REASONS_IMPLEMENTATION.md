# Disapproval & Flag Reasons Implementation - COMPLETE

## Summary
Full implementation of unified disapproval/flag reasons system for super admin, sub-admin, and all auditor roles with role/type/category support. All auditor UI pages updated with dynamic reason loading and both reject/flag workflows.

## Completed Components

### Database & Entity Layer ✅
- **Migration**: `backend/src/database/migrations/1738120000000-DisapprovalReasonsEnhancement.ts`
  - Drops legacy `applicableTo` column
  - Adds `reasonType` enum ('rejection' | 'flag')
  - Adds `applicableRoles` text[] for auditor role filtering
  - Adds `categoryIds` text[] for category-scoped access
  - Auto-runs on application startup via `migrationsRun: true`

- **Entity**: `backend/src/modules/subadmin/entities/disapproval-reason.entity.ts`
  - Updated schema with all new fields
  - Proper enum types and array columns

### Backend API Layer ✅

#### Super Admin Module
- **Service**: `backend/src/modules/admin/admin.service.ts`
  - `getDisapprovalReasons()` - Supports filtering by search/role/type/category
  - `createDisapprovalReason()` - Create global reasons (any category)
  - `updateDisapprovalReason()` - Edit global reasons
  
- **Controller**: `backend/src/modules/admin/admin.controller.ts`
  - POST `/admin/disapproval-reasons` - Create
  - GET `/admin/disapproval-reasons` - List with filters
  - PUT `/admin/disapproval-reasons/:id` - Update

#### Sub Admin Module
- **Service**: `backend/src/modules/subadmin/subadmin.service.ts`
  - `getSubAdminCategoryIds()` - Get assigned categories
  - `getDisapprovalReasonsForSubAdmin()` - List only category-scoped reasons
  - `createDisapprovalReasonForSubAdmin()` - Create with category validation
  - `updateDisapprovalReasonForSubAdmin()` - Cannot edit global reasons (enforced)
  
- **Controller**: `backend/src/modules/subadmin/subadmin.controller.ts`
  - POST `/subadmin/disapproval-reasons` - Create (auto-scoped to categories)
  - GET `/subadmin/disapproval-reasons` - List (filtered by assigned categories)
  - PUT `/subadmin/disapproval-reasons/:id` - Update (with validation)

#### Audit Module
- **Service**: `backend/src/modules/audit/audit.service.ts`
  - `getUserRoleNames()` - Get auditor roles for current user
  - `getAuditorCategoryIds()` - Get accessible categories for auditor
  - `validateDisapprovalReason()` - Validate reason eligibility (type/category/role)
  - `getDisapprovalReasonsForAuditor()` - Filtered active reasons by role/category/type
  - Updated `auditResearch()` - Requires reasonId for REJECTED/FLAGGED
  - Updated `auditInquiry()` - Requires reasonId for REJECTED/FLAGGED
  - Updated `auditLinkedInInquiry()` - Requires reasonId for REJECTED/FLAGGED

- **Controller**: `backend/src/modules/audit/audit.controller.ts`
  - GET `/audit/disapproval-reasons` - Returns filtered reasons for auditor

- **Entity**: `backend/src/modules/audit/entities/research-audit.entity.ts`
  - Updated decision field to support 'APPROVED' | 'REJECTED' | 'FLAGGED'

### Frontend API Layer ✅
- **Audit API Client**: `frontend/src/api/audit.api.ts`
  - New `DisapprovalReason` interface
  - `getDisapprovalReasons(filters)` - Fetch filtered reasons
  - `AuditDecision` supports new FLAGGED decision type
  - All audit methods require `reasonId` for reject/flag operations

### Admin UI Pages ✅

#### AdminDisapprovalReasonsPage
**File**: `frontend/src/pages/admin/AdminDisapprovalReasonsPage.tsx`
- Features:
  - Create/Edit disapproval reasons (global access)
  - Multi-select auditor roles (4 roles)
  - Radio select reason type (rejection/flag)
  - Multi-select categories (optional, empty = global)
  - Search, filter by role/type/category
  - Activate/deactivate toggle
  - Real-time reason list updates
- Styling: `frontend/src/pages/admin/adminDisapprovalReasons.css`

#### SubAdminDisapprovalReasons
**File**: `frontend/src/pages/sub-admin/SubAdminDisapprovalReasons.tsx`
- Features:
  - Create/Edit disapproval reasons (category-scoped)
  - Auto-limited to assigned categories
  - Multi-select auditor roles (4 roles)
  - Radio select reason type (rejection/flag)
  - Multi-select categories (pre-filtered to assigned)
  - Cannot edit global reasons (backend validation enforces)
  - Activate/deactivate toggle
- Uses existing CSS: `frontend/src/pages/sub-admin/SubAdminCRUD.css`

### Auditor UI Pages ✅

#### Website Inquirer Auditor
**File**: `frontend/src/pages/audit-inquirer/website/WebsiteAuditorPendingPage.tsx`
- Status: ✅ COMPLETE
- Features:
  - Dynamic rejection reasons dropdown (fetched by role/category)
  - Dynamic flag reasons dropdown (fetched by role/category)
  - Reject button (requires rejection reason)
  - Flag button (requires flag reason) 
  - Approve button (requires all validations + no flag reason)
  - Mutual exclusion: can't have both rejection and flag selected
  - Loading state for reasons

#### LinkedIn Inquirer Auditor
**File**: `frontend/src/pages/audit-inquirer/linkedin/LinkedinAuditorPendingPage.tsx`
- Status: ✅ COMPLETE
- Features:
  - Per-action inline reason dropdowns
  - Reject, Flag, Approve buttons for each action
  - Dynamic reasons loaded by role/category
  - Duplicate detection prevents flagging duplicates (but allows rejection)
  - Proper state management for multi-step submission

#### Website Research Auditor
**File**: `frontend/src/pages/audit-researcher/website/WebsiteResearchAuditorPendingPage.tsx`
- Status: ✅ COMPLETE
- Features:
  - Dynamic rejection reasons dropdown
  - Dynamic flag reasons dropdown
  - Reject button (requires rejection reason)
  - Flag button (requires flag reason)
  - Approve button (requires validations + no flag reason)
  - Mutual exclusion between reject/flag
  - loadReasons function fetches by role='website_research_auditor' and categoryId

#### LinkedIn Research Auditor
**File**: `frontend/src/pages/audit-researcher/linkedin/LinkedInResearchAuditorPendingPage.tsx`
- Status: ✅ COMPLETE
- Features:
  - Dynamic rejection reasons dropdown
  - Dynamic flag reasons dropdown  
  - Reject, Flag, Approve buttons
  - Reasons loaded by role='linkedin_research_auditor' and categoryId
  - Full state management for multi-action submissions
  - Proper validation and mutual exclusion

## Database Migration Status
- Migration file: `backend/src/database/migrations/1738120000000-DisapprovalReasonsEnhancement.ts`
- Located in correct path: `backend/src/database/migrations/`
- Will auto-run on backend startup (migrationsRun: true)
- Built into dist: ✅ `npm run build` succeeded
- Schema changes:
  - Drops `applicableTo` column
  - Creates `reasonType_enum` type with 'rejection'|'flag' values
  - Adds 'reasonType', 'applicableRoles', 'categoryIds' columns with defaults

## API Endpoint Summary
```
Super Admin (Global):
  POST   /api/admin/disapproval-reasons
  GET    /api/admin/disapproval-reasons?search=...&role=...&reasonType=...&categoryId=...
  PUT    /api/admin/disapproval-reasons/:id

Sub Admin (Category-Scoped):
  POST   /api/subadmin/disapproval-reasons
  GET    /api/subadmin/disapproval-reasons
  PUT    /api/subadmin/disapproval-reasons/:id

Auditors (Read-Only):
  GET    /api/audit/disapproval-reasons?role=...&type=...&categoryId=...

Audit Operations (with reasons):
  POST   /api/audit/research      { decision: 'REJECTED'|'FLAGGED'|'APPROVED', reasonId: '...' }
  POST   /api/audit/inquiry       { decision: 'REJECTED'|'FLAGGED'|'APPROVED', reasonId: '...' }
  POST   /api/audit/inquiry/linkedin { decision: 'REJECTED'|'FLAGGED'|'APPROVED', reasonId: '...' }
```

## Four Auditor Roles Supported
1. `website_inquirer_auditor` - Website Inquiry Auditor
2. `linkedin_inquirer_auditor` - LinkedIn Inquiry Auditor
3. `website_research_auditor` - Website Research Auditor
4. `linkedin_research_auditor` - LinkedIn Research Auditor

## Key Design Features
✅ **Role-Based Access**: Reasons filtered by auditor role
✅ **Type Support**: Each reason is either 'rejection' or 'flag' type
✅ **Category Scoping**: Sub-admins see only their assigned categories' reasons
✅ **Global Fallback**: Super admin reasons are global (empty categoryIds)
✅ **Real-Time Updates**: Auditors see active reasons live
✅ **Validation**: Backend validates reason eligibility before accepting
✅ **Mutual Exclusion**: Can't reject AND flag in same decision
✅ **Dynamic Dropdowns**: All 4 auditor UIs use API-driven reasons, not hardcoded
✅ **Duplicate Handling**: LinkedIn inquirer flags duplicates appropriately

## Testing Checklist
- [ ] Super Admin creates global rejection reason for all 4 roles
- [ ] Super Admin creates global flag reason for all 4 roles  
- [ ] Sub Admin creates category-scoped reason (limited to assigned categories)
- [ ] Website Inquirer Auditor sees correct filtered reasons, can reject/flag/approve
- [ ] LinkedIn Inquirer Auditor sees correct filtered reasons, handles multi-step actions
- [ ] Website Research Auditor sees correct filtered reasons, can reject/flag/approve
- [ ] LinkedIn Research Auditor sees correct filtered reasons, can reject/flag/approve
- [ ] Validation prevents auditor from using wrong reason type (e.g., flag reason for reject)
- [ ] Sub-admin cannot edit global reasons (backend prevents)
- [ ] Deactivating reason hides it from auditors

## Notes
- All auditor pages now have three buttons: Reject, Flag, Approve
- Dropdowns are populated from API, not hardcoded options
- Migration auto-runs; no manual intervention needed
- Backend properly validates all operations
- Frontend provides good UX with loading states and error handling
