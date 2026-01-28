# Website Research Tasks - SubAdmin Page Implementation

**Date**: January 27, 2026  
**Component**: `WebsiteResearch.tsx`  
**Location**: `frontend/src/pages/sub-admin/WebsiteResearch.tsx`

## Overview

The Website Research page is a comprehensive SubAdmin interface for viewing and managing all **in-progress website researcher task submissions** assigned to their categories. The page provides powerful filtering, searching, and detailed task inspection capabilities.

## Key Features

### ✅ Category-Based View
- **Multi-Category Support**: SubAdmins can view tasks from all their assigned categories
- **Category Grouping**: Tasks are automatically grouped and displayed by category
- **Category Dropdown Filter**: Quick filter to show tasks from a single category or all categories
- **Task Count**: Shows number of tasks per category

### ✅ Advanced Filtering System
- **Search by Company Name or Domain**: Real-time text search across company names and URLs
- **Status Filter**: Filter tasks by status (Pending, In Progress, Submitted, Completed, Rejected)
- **Category Filter**: Filter tasks by category (All or specific category)
- **Results Per Page**: Choose between 25, 50, or 100 tasks per page
- **Active Filters Display**: Visual tags showing all currently applied filters with quick clear buttons
- **Search with Debounce**: Optimized search with 300ms debounce to reduce API calls

### ✅ Task Display
- **Card-Based Layout**: Modern grid layout that adapts to screen size (1-4 columns)
- **Compact Task Cards** showing:
  - Company name
  - Domain/URL (clickable link to company website)
  - Country of origin (with flag emoji)
  - Task creation date and time
  - Status badge with color coding
- **Color-Coded Status Badges**:
  - Pending: Orange (#FFA500)
  - In Progress: Blue (#3498DB)
  - Submitted: Green (#2ECC71)
  - Completed: Dark Green (#27AE60)
  - Rejected: Red (#E74C3C)

### ✅ Pagination
- **Smart Pagination**: Only appears when tasks exceed the selected limit
- **Previous/Next Buttons**: Navigate between pages with disabled state on edges
- **Page Information**: Shows current page number and total pages
- **Configurable Page Size**: Change results per page on the fly

### ✅ Detail Modal
- **Full Task Information**: Click "View Details" on any task card to open a modal with:
  - Company name
  - Domain (clickable link)
  - Country
  - Category
  - Status (with color badge)
  - Creation timestamp
  - Task ID (for internal reference)
- **Close Options**: Click X button or outside the modal to close

### ✅ State Management
- **Loading States**: Clear loading spinner while fetching data
- **Error Handling**: User-friendly error messages if data fetch fails
- **Empty States**: Message when no tasks match the selected filters
- **Result Summary**: Shows "Showing X to Y of Z tasks"

## Real Data Integration

### Backend Endpoint
```
GET /subadmin/research/website
Query Parameters:
  - categoryId (optional): Filter by specific category
  - status (optional): Filter by status
  - limit: Number of results (default 50, max 100)
  - offset: Pagination offset (default 0)
```

### Data Source
- **Database Table**: `research_tasks` (filtered by targettype='COMPANY')
- **Related Data**: Company information from `companies` table
- **Category Info**: Category names from `categories` table
- **Scope**: Only tasks from SubAdmin's assigned categories

### Response Format
```typescript
{
  data: [
    {
      id: string (UUID),
      profileUrl: string (company domain),
      companyName: string,
      country: string,
      category: string,
      submittedBy: string,
      status: string (pending|in_progress|submitted|completed|rejected),
      createdAt: string (ISO timestamp)
    }
  ],
  total: number
}
```

## Authorization & Security

### Access Control
- **Role Required**: `sub_admin` role
- **Category Scoping**: Can only view tasks from assigned categories
- **Read-Only**: SubAdmins can view tasks but cannot edit or approve/reject from this page
- **JWT Protected**: All API calls include Bearer token authentication

### Data Privacy
- Only SubAdmin's assigned categories are fetched and displayed
- Pagination prevents accidental data leaks through offset manipulation
- No sensitive submission data (like email addresses) is displayed

## Component Architecture

### State Variables
```typescript
- tasks: WebsiteResearchTask[] - Filtered task list
- categories: Category[] - SubAdmin's assigned categories
- loadState: 'idle'|'loading'|'success'|'error'
- selectedCategory: string ('all' or category ID)
- selectedStatus: StatusFilter ('all' or specific status)
- searchQuery: string (real-time search text)
- limit: number (25, 50, or 100)
- offset: number (pagination offset)
- totalCount: number (total matching tasks)
- selectedTask: WebsiteResearchTask | null (detail modal)
```

### Effect Hooks
1. **Load Categories** (on mount): Fetches SubAdmin's assigned categories
2. **Load Tasks** (on filter/pagination change): Fetches filtered tasks with pagination
3. **Debounce Search** (on search change): Resets pagination when search updates

### API Calls
- `getSubAdminCategories()` - Get all assigned categories
- `getWebsiteResearchTasks(categoryId?, status?, limit, offset)` - Get filtered tasks

## Styling & Responsiveness

### Design System
- **Color Palette**: Tailwind-compatible colors (slate, blue, green, red, orange)
- **Typography**: System fonts with -apple-system, Segoe UI, Roboto
- **Spacing**: 24px base unit with proportional scaling
- **Border Radius**: 12px for large containers, 8px for inputs, 6px for badges
- **Shadows**: Subtle shadows (0 1px 3px rgba(0,0,0,0.08)) for depth

### Responsive Breakpoints
- **Desktop (≥768px)**: 4-column grid for task cards, full width filters
- **Tablet (768px)**: 2-column grid, stacked filters
- **Mobile (<768px)**: 1-column grid, single-column filters and stack

### Interactive Elements
- **Hover States**: Cards lift slightly on hover, buttons change color
- **Focus States**: Inputs have blue focus ring (3px rgba(59, 130, 246, 0.1))
- **Transitions**: 0.2s ease for all color/opacity changes
- **Disabled States**: 50% opacity for disabled buttons

## Usage Instructions for SubAdmins

### Viewing Tasks
1. Navigate to **SubAdmin Dashboard** → **Website Research**
2. Tasks are grouped by category and displayed as cards
3. Each card shows company name, domain, country, and status

### Searching
1. Type in the "Search by Company or URL" field
2. Search is case-insensitive and searches across:
   - Company name
   - Domain/URL
   - Country

### Filtering
1. Use **Category** dropdown to filter by single category
2. Use **Status** dropdown to filter by task status
3. Use **Results Per Page** to adjust pagination size
4. Click **X** on filter tags to quickly clear individual filters

### Viewing Details
1. Click **"View Details"** button on any task card
2. Modal opens showing:
   - Full company information
   - Domain with clickable link
   - Status and timestamps
   - Task ID for reference
3. Click **X** or outside modal to close

### Pagination
1. Navigate between pages using **Previous** and **Next** buttons
2. Page number shown in center
3. Buttons disabled when at first/last page
4. Change page size with **Results Per Page** dropdown (resets to page 1)

## API Integration Examples

### Getting Website Research Tasks with Filter
```typescript
// Get tasks from specific category with status filter
const tasks = await getWebsiteResearchTasks(
  'category-id-123',  // categoryId
  'in_progress',      // status
  50,                 // limit
  0                   // offset
);
```

### Getting All Tasks with Pagination
```typescript
// Get next page of tasks
const tasks = await getWebsiteResearchTasks(
  undefined,    // All categories
  undefined,    // All statuses
  50,          // Results per page
  50           // Offset for page 2 (50-99)
);
```

## Real Database Queries

### Query for Website Research Tasks
```sql
SELECT 
  task.id,
  task.status,
  task.createdAt,
  company.domain as profileUrl,
  company.name as companyName,
  company.country,
  category.name as category
FROM research_tasks task
LEFT JOIN companies company ON company.id = task.targetId
LEFT JOIN categories category ON category.id = task.categoryId
WHERE task.targettype = 'COMPANY'
  AND task.categoryId IN (:subadminCategoryIds)
  -- Optional filters:
  -- AND task.status = :status
  -- AND task.categoryId = :categoryId
ORDER BY task.createdAt DESC
LIMIT :limit OFFSET :offset;
```

## Performance Considerations

### Optimization Techniques
1. **Debounced Search**: 300ms debounce on search input to prevent excessive API calls
2. **Pagination**: Limited results per page (25, 50, 100) prevent large response payloads
3. **Category Filtering**: Backend restricts to SubAdmin's categories before database query
4. **Status Enum**: Uses efficient enum filtering in database
5. **Lazy Loading**: Tasks only loaded when component mounts and filters change

### Expected Load Times
- **First Load**: 500-800ms (categories + initial tasks)
- **Filter Change**: 200-400ms (API call + render)
- **Search**: 300ms debounce + 200-400ms API response
- **Pagination**: 200-400ms (API call + render)

## Troubleshooting

### Issue: Tasks Not Displaying
**Solution**: 
- Check if SubAdmin has assigned categories
- Verify user role includes `sub_admin`
- Check network tab for API errors
- Ensure backend endpoint is accessible at `/subadmin/research/website`

### Issue: Category Filter Shows No Options
**Solution**:
- Verify SubAdmin has assigned categories in `user_categories` table
- Check if `getSubAdminCategories()` returns data
- Look for API errors in browser console

### Issue: Search Not Working
**Solution**:
- Debounce delay is 300ms, wait after typing
- Search is case-insensitive
- Search matches partial strings (e.g., "google" matches "google.com")
- Check browser console for API errors

### Issue: Pagination Buttons Disabled
**Solution**:
- Normal behavior when at first/last page
- Try changing "Results Per Page" to load more tasks
- Or apply different filters to get more matching results

## Future Enhancements

### Potential Features
1. **Bulk Actions**: Select multiple tasks for batch operations
2. **Export to CSV**: Download task list with filters applied
3. **Approval/Rejection**: Approve or reject tasks directly from this page
4. **Comments**: Add notes/comments to tasks
5. **Assignment**: Reassign tasks to different researchers
6. **Sorting**: Sort by company name, country, or date
7. **Advanced Filters**: Date range, country filter, company type filter
8. **Task Analytics**: Show charts of task distribution by status/category
9. **Real-time Updates**: WebSocket notifications for new submissions
10. **Keyboard Shortcuts**: Quick navigation and filtering with keyboard

## Testing Checklist

### Functional Testing
- [ ] Load page and verify categories are fetched
- [ ] Search by company name works correctly
- [ ] Filter by category restricts results
- [ ] Filter by status restricts results
- [ ] Pagination works forward and backward
- [ ] Click "View Details" opens modal with correct info
- [ ] Close modal with X button
- [ ] Close modal by clicking outside
- [ ] Active filters display with X buttons
- [ ] Clearing filters removes cards properly

### Data Validation
- [ ] Company names display correctly
- [ ] Domains are clickable and go to correct website
- [ ] Countries display with emoji
- [ ] Dates are formatted correctly
- [ ] Status badges have correct colors
- [ ] Task count per category is accurate

### UI/UX Testing
- [ ] Page loads smoothly without layout shifts
- [ ] Loading spinner displays while fetching
- [ ] Empty state shows when no tasks match filters
- [ ] Error message displays on API failure
- [ ] Buttons are responsive and clickable
- [ ] Responsive design works on mobile/tablet

### Performance Testing
- [ ] Page loads within 2 seconds
- [ ] Searching doesn't cause excessive API calls
- [ ] Pagination doesn't cause layout jank
- [ ] Memory doesn't grow unbounded with many tasks

### Security Testing
- [ ] Can only see categories assigned to user
- [ ] Cannot modify or approve tasks from this page
- [ ] API calls include authentication
- [ ] Pagination cannot access other users' data
