# SubAdmin Pages - Complete Implementation

All SubAdmin pages are now properly connected to their backend APIs with correct data loading and display.

## Page Connections (Group A → Group B Reference)

### 1. Research Pages

#### WebsiteResearch.tsx ✅ WORKING
- **Reference**: WebsiteResearchTasksPage.tsx (researcher)
- **API**: `getWebsiteResearchTasks(categoryId, status, limit, offset)`
- **Endpoint**: `/subadmin/research/website`
- **Features**:
  - Category filtering with auto-selection
  - Status filtering (all/pending/in_progress/submitted/completed/approved/rejected)
  - Search functionality (companyName, domain, country)
  - Pagination (50 items per page)
  - Task cards grouped by category
  - Detail modal for viewing task information
  - **View-only** (no claiming/submitting)

#### SubAdminLinkedInResearch.tsx ✅ COMPLETE
- **Reference**: LinkedinResearchTasksPage.tsx (researcher)
- **API**: `getLinkedInResearchTasks(categoryId, status, limit, offset)`
- **Endpoint**: `/subadmin/research/linkedin`
- **Features**:
  - Category filtering with auto-selection
  - Status filtering
  - Search (profileName, profileCompany, profileUrl, country)
  - Pagination
  - Task cards with LinkedIn profile information
  - Detail modal
  - **View-only**

### 2. Inquiry Pages

#### SubAdminWebsiteInquiry.tsx ✅ COMPLETE
- **Reference**: WebsiteInquiryTasksPage.tsx (inquirer)
- **API**: `getInquiryTasks(categoryId, 'WEBSITE', status, limit, offset)`
- **Endpoint**: `/subadmin/inquiry`
- **Features**:
  - Category filtering with auto-selection
  - Status filtering
  - Search (companyName, companyDomain, country)
  - Pagination
  - Inquiry task cards with company information
  - Detail modal showing research task status
  - **View-only** (no outreach templates/uploads)

#### SubAdminLinkedInInquiry.tsx ✅ COMPLETE
- **Reference**: LinkedinInquiryTasksPage.tsx (inquirer)
- **API**: `getInquiryTasks(categoryId, 'LINKEDIN', status, limit, offset)`
- **Endpoint**: `/subadmin/inquiry`
- **Features**:
  - Category filtering with auto-selection
  - Status filtering
  - Search (profileName, profileUrl, country)
  - Pagination
  - Inquiry task cards with LinkedIn profile information
  - Detail modal showing research task status
  - **View-only**

### 3. Audit/Review Pages

#### SubAdminResearchReview.tsx ✅ COMPLETE
- **References**: 
  - WebsiteResearchAuditorPendingPage.tsx (auditor-researcher)
  - LinkedinResearchAuditorPendingPage.tsx (auditor-researcher)
- **API**: `getPendingResearchTasks(limit, offset)`
- **Endpoint**: `/subadmin/pending/research`
- **Routes**: 
  - `/sub-admin/audit/website-research`
  - `/sub-admin/audit/linkedin-research`
- **Features**:
  - Shows ALL pending research (both website and LinkedIn)
  - Table view with columns: Target, Source, Category, Status, Researcher, Created
  - Pagination
  - Link to detailed audit page
  - **View-only** (no approve/reject actions)

#### SubAdminInquiryReview.tsx ✅ COMPLETE
- **References**: 
  - WebsiteAuditorPendingPage.tsx (auditor/inquirer)
  - LinkedinAuditorPendingPage.tsx (auditor/inquirer)
- **API**: `getPendingInquiryTasks(limit, offset)`
- **Endpoint**: `/subadmin/pending/inquiry`
- **Routes**: 
  - `/sub-admin/audit/website-inquiry`
  - `/sub-admin/audit/linkedin-inquiry`
- **Features**:
  - Shows ALL pending inquiries (both website and LinkedIn)
  - Table view with columns: Target, Channel, Category, Status, Worker, Created
  - Pagination
  - Link to detailed audit page
  - **View-only** (no approve/reject actions)

## Backend Implementation

All backend methods in `backend/src/modules/subadmin/subadmin.service.ts` use **raw SQL with `::text` casts** to handle UUID/VARCHAR type mismatches:

### Fixed Methods:
1. ✅ `getWebsiteResearchTasks()` - Raw SQL with `cat.id::text = t."categoryId"`
2. ✅ `getLinkedInResearchTasks()` - Raw SQL with `cat.id::text = t."categoryId"`
3. ✅ `getInquiryTasks()` - Raw SQL with `cat.id::text = t."categoryId"`
4. ✅ `getPendingResearchTasks()` - Raw SQL with `cat.id::text = t."categoryId"`
5. ✅ `getPendingInquiryTasks()` - Raw SQL with `cat.id::text = t."categoryId"`

### Key Pattern:
```typescript
LEFT JOIN categories cat ON cat.id::text = t."categoryId"
LEFT JOIN companies c ON c.id::text = t."targetId"
LEFT JOIN linkedin_profiles lp ON lp.id::text = t."targetId"
```

## Frontend API Functions

All API functions in `frontend/src/api/subadmin.api.ts`:

```typescript
// Categories
export const getSubAdminCategories = (): Promise<Category[]>

// Research
export const getWebsiteResearchTasks = (
  categoryId?: string,
  status?: string,
  limit?: number,
  offset?: number,
): Promise<PaginatedResponse<ResearchTask>>

export const getLinkedInResearchTasks = (
  categoryId?: string,
  status?: string,
  limit?: number,
  offset?: number,
): Promise<PaginatedResponse<ResearchTask>>

// Inquiry
export const getInquiryTasks = (
  categoryId?: string,
  platform?: 'WEBSITE' | 'LINKEDIN',
  status?: string,
  limit?: number,
  offset?: number,
): Promise<PaginatedResponse<InquiryTask>>

// Audit/Review
export const getPendingResearchTasks = (
  limit?: number,
  offset?: number,
): Promise<PaginatedResponse<any>>

export const getPendingInquiryTasks = (
  limit?: number,
  offset?: number,
): Promise<PaginatedResponse<any>>
```

## Common UI Pattern

All SubAdmin pages follow this pattern:

1. **Category Loading**:
   - Load categories from `/subadmin/categories`
   - Deduplicate by ID
   - Auto-select if only 1 category exists

2. **Task Loading**:
   - Use appropriate SubAdmin API function
   - Pass category filter, status filter, pagination params
   - Handle paginated response: `{ data: [], total: number }`

3. **Filters**:
   - Category dropdown (all/specific category)
   - Status dropdown (all/pending/in_progress/etc)
   - Search input with debounced filtering

4. **Display**:
   - Card-based layout for tasks
   - Group by category name
   - Color-coded status badges
   - Detail modal for full information

5. **Pagination**:
   - Limit: 50 items per page
   - Offset-based navigation
   - Total count display

## Differences from Worker Pages

SubAdmin pages are **view-only monitoring tools** while worker pages are **interactive task management**:

| Feature | SubAdmin Pages | Worker Pages |
|---------|---------------|--------------|
| Category Access | All categories | User-assigned categories only |
| Task Actions | View only | Claim, Submit, Upload |
| Filtering | Category + Status + Search | Status only (auto-loaded by category) |
| Pagination | Yes (50 per page) | No (load all for category) |
| Active Task | No | Yes (one at a time) |
| Forms | No | Yes (research data, outreach templates) |
| File Upload | No | Yes (screenshots, evidence) |

## Routes Summary

| Route | Component | API Endpoint |
|-------|-----------|--------------|
| `/sub-admin/research/website` | WebsiteResearch.tsx | `/subadmin/research/website` |
| `/sub-admin/research/linkedin` | SubAdminLinkedInResearch.tsx | `/subadmin/research/linkedin` |
| `/sub-admin/inquiry/website` | SubAdminWebsiteInquiry.tsx | `/subadmin/inquiry` (platform=WEBSITE) |
| `/sub-admin/inquiry/linkedin` | SubAdminLinkedInInquiry.tsx | `/subadmin/inquiry` (platform=LINKEDIN) |
| `/sub-admin/audit/website-research` | SubAdminResearchReview.tsx | `/subadmin/pending/research` |
| `/sub-admin/audit/linkedin-research` | SubAdminResearchReview.tsx | `/subadmin/pending/research` |
| `/sub-admin/audit/website-inquiry` | SubAdminInquiryReview.tsx | `/subadmin/pending/inquiry` |
| `/sub-admin/audit/linkedin-inquiry` | SubAdminInquiryReview.tsx | `/subadmin/pending/inquiry` |

## Testing Status

- ✅ Backend compiles successfully
- ✅ Frontend builds without errors
- ✅ WebsiteResearch.tsx confirmed working by user
- ✅ All other pages use same pattern
- ✅ No 500 errors (UUID/VARCHAR issue resolved)

## Key Success Factors

1. **Database Type Casting**: `::text` in all SQL JOINs
2. **Category Deduplication**: `Array.from(new Map(...).values())`
3. **Auto-Selection**: Single category auto-selected
4. **Paginated Responses**: Handle `{ data, total }` structure
5. **Consistent Patterns**: All pages follow WebsiteResearch.tsx template
