# Payment & Pricing System Implementation

## Overview

Complete payment and pricing management system for all 8 worker roles. Workers earn money for completed actions, tracked through a 3-tier approval process.

## System Architecture

### Payment Lifecycle

```
1. PENDING (⏳)
   - Worker submits action (e.g., research task)
   - PaymentRecord created with status='pending'
   - Amount calculated from ActionPrice

2. APPROVED (⚙️) → "In-Process"
   - Auditor reviews and approves action
   - PaymentRecord status changed to 'approved'
   - Worker can see in "In-Process" section

3. PAID (✅) → "Completed"
   - Super admin processes approved payments
   - PaymentRecord status changed to 'paid'
   - Payment marked as completed/received
```

### Database Schema

#### `action_prices` Table
- `id` (UUID): Primary key
- `role_id` (varchar): Worker role (website_researcher, etc.)
- `action_type` (varchar): Action name (submit, approve)
- `amount` (decimal 10,2): Price in USD
- `bonus_multiplier` (decimal 3,2): Multiplier for top 3 performers (default: 1.0)
- `description` (varchar): Optional notes
- **Unique constraint**: (role_id, action_type)

#### `payment_records` Table
- `id` (UUID): Primary key
- `user_id` (varchar): Worker's user ID
- `role` (varchar): Worker's role at submission time
- `action_id` (varchar): Reference to submitted action
- `action_type` (varchar): Type of action (submit, approve, etc.)
- `amount` (decimal 10,2): Payment amount
- `status` (enum): pending | approved | paid | rejected
- `category` (varchar, nullable): Category of work
- `created_at` (timestamp): When payment was created
- `updated_at` (timestamp): Last status change
- **Unique constraint**: (user_id, action_id)

## Backend Implementation

### Controllers & Routes

#### Pricing Management (`/api/payments/prices`)
```typescript
GET    /api/payments/prices              // Get all pricing rules
GET    /api/payments/prices-by-role      // Get prices for specific role
POST   /api/payments/prices              // Create new pricing rule
PATCH  /api/payments/prices/:id          // Update pricing rule
DELETE /api/payments/prices/:id          // Delete pricing rule
```

#### Payment Records (`/api/payments`)
```typescript
GET    /api/payments/summary/:userId           // Worker's payment summary
GET    /api/payments/details/:userId           // Worker's detailed records
GET    /api/payments/all                       // All payments (admin only)
GET    /api/payments/records/:userId           // Payment records by user
```

#### Payment Status Changes
```typescript
PATCH  /api/payments/approve/:paymentId        // Approve payment (pending→approved)
PATCH  /api/payments/reject/:paymentId         // Reject payment
PATCH  /api/payments/process                   // Mark multiple as paid (approved→paid)
```

#### Analytics
```typescript
GET    /api/payments/top-performers            // Top 3 workers by role
GET    /api/payments/earnings                  // Earnings analysis
GET    /api/payments/stats                     // Payment statistics
```

### Service Methods

#### PaymentsService
```typescript
// Pricing Management
async getActionPrices()
async getPricesByRole(role: string)
async createOrUpdatePrice(dto: CreateActionPriceDto)
async updatePrice(id: string, dto: UpdateActionPriceDto)
async deletePrice(id: string)

// Payment Tracking
async calculatePayment(params)              // Create payment for action
async approvePayment(paymentId: string)     // Auditor approval
async rejectPayment(paymentId: string)      // Rejection
async processPayments(paymentIds: string[]) // Mark as paid

// Worker Views
async getWorkerPaymentSummary(userId)       // For dashboard
async getWorkerPaymentDetails(userId, status?)
async getPaymentRecords(userId)

// Admin Views
async getAllPayments(filter options)

// Analytics
async getTopPerformers(role, category?)
async getEarningsByRole(role)
async getPaymentStats()
```

## Frontend Implementation

### Components

#### `PaymentSummaryCard` Component
- **Location**: `src/components/cards/PaymentSummaryCard.tsx`
- **Props**:
  - `userId`: Optional specific user (defaults to current)
  - `compact`: Minimal display mode
- **Shows**:
  - Pending: $ amount awaiting auditor approval
  - In-Process: $ amount approved but not yet paid
  - Completed: $ amount already received
  - Total lifetime earnings
  - **NO individual action prices**

#### Usage in Worker Pages
```typescript
import { PaymentSummaryCard } from '@/components/cards/PaymentSummaryCard';

// In any worker page:
<PaymentSummaryCard />  // Full display
<PaymentSummaryCard compact />  // Minimal display
```

### Pages

#### PricingPage (`/api/admin/pricing`)
- **Path**: `src/pages/admin/PricingPage.tsx`
- **Users**: Super Admin only
- **Features**:
  - Create/update/delete pricing rules per role/action
  - View all payment records
  - Approve pending payments
  - Process approved payments (mark as paid)
  - Reject payments
  - Analytics: top performers, earnings by role, payment stats
- **Tabs**:
  1. Pricing Rules - CRUD operations
  2. Payment Records - Status management

#### Worker Dashboards (All 8 Roles)
Add `<PaymentSummaryCard />` to:
1. `WebsiteResearcherDashboard.tsx`
2. `LinkedInResearcherDashboard.tsx`
3. `WebsiteInquirerDashboard.tsx`
4. `LinkedInInquirerDashboard.tsx`
5. `ResearchAuditorPage.tsx`
6. `InquiryAuditorPage.tsx`
7. `LinkedInInquiryAuditorPage.tsx`
8. `LinkedInResearchAuditorPage.tsx`

## API Integration Points

### When to Create Payments

1. **Worker Submits Task**
   - Call `POST /api/payments` internally (from action controller)
   - Creates PaymentRecord with status='pending'
   - Uses ActionPrice for role + actionType

2. **Auditor Approves**
   - Call `PATCH /api/payments/approve/:id`
   - Changes pending → approved
   - Worker sees in "In-Process"

3. **Admin Processes**
   - Select approved payments
   - Call `PATCH /api/payments/process`
   - Changes approved → paid
   - Worker sees in "Completed"

### DTO Structures

```typescript
// Create/Update Pricing
{
  roleId: "website_researcher",
  actionType: "submit",
  amount: 10.50,
  bonusMultiplier: 1.5,    // optional, for top 3
  description: "Standard task submission"
}

// Process Payments
{
  paymentIds: ["uuid1", "uuid2", "uuid3"]
}
```

## Pricing Examples

### All 8 Roles

| Role | Action | Base Price | Notes |
|------|--------|-----------|-------|
| website_researcher | submit | $10.00 | 1 action per role |
| linkedin_researcher | submit | $12.00 | More complex |
| website_inquirer | submit | $8.00 | Simpler inquiry |
| linkedin_inquirer | submit | $10.00 | 1 action for inquiries |
| research_auditor | approve | $2.00 | Auditor fee |
| inquiry_auditor | approve | $1.50 | Lower auditor fee |
| linkedin_inquiry_auditor | approve | $2.00 | Multiple actions |
| linkedin_research_auditor | approve | $2.50 | Most complex |

### Top 3 Bonus Multiplier
- 1st place: 1.5x (e.g., $10 → $15)
- 2nd place: 1.25x (e.g., $10 → $12.50)
- 3rd place: 1.1x (e.g., $10 → $11)

## Security & Privacy

### What Workers See
✅ Pending payment amounts
✅ In-process payment amounts
✅ Completed payment amounts
✅ Total lifetime earnings
✅ Action count per status

❌ Individual action prices
❌ Price change history
❌ Other workers' earnings
❌ Bonus multiplier logic

### Authentication
- All endpoints require JWT token
- Workers can only view/access their own payments
- Super admin has full access
- Auditors can only approve actions they reviewed

## Migration Files

### `1738100000001-UpdatePaymentTablesSchema.ts`
Adds missing columns:
- `action_prices.bonus_multiplier`
- `action_prices.description`
- `payment_records.category`

Run with: `npm run typeorm migration:run`

## Testing Workflow

1. **Set Up Prices**
   - Super admin goes to `/api/admin/pricing`
   - Adds pricing rules for all 8 roles
   - Example: website_researcher submit = $10

2. **Submit Action**
   - Worker completes task
   - Backend creates PaymentRecord (pending)
   - Worker sees on dashboard: Pending: $10

3. **Auditor Approves**
   - Auditor reviews action
   - Calls approve endpoint
   - PaymentRecord → approved
   - Worker sees: In-Process: $10

4. **Admin Processes**
   - Admin goes to PricingPage
   - Selects approved payments
   - Clicks "Mark as Paid"
   - PaymentRecord → paid
   - Worker sees: Completed: $10

5. **Verify Dashboard**
   - Check all worker dashboards
   - Payment cards show correct totals
   - No individual prices visible

## Integration Checklist

- [ ] Backend payment controller created
- [ ] Service methods implemented
- [ ] Database migrations applied
- [ ] PricingPage fully functional
- [ ] PaymentSummaryCard component added
- [ ] All 8 worker dashboards updated
- [ ] Initial pricing rules created
- [ ] Test payment workflow end-to-end
- [ ] Verify worker privacy (no prices shown)
- [ ] Test approval/rejection flow
- [ ] Analytics working correctly

## Future Enhancements

1. **Bulk Operations**
   - Bulk approve/reject payments
   - Batch export to accounting system

2. **Automations**
   - Auto-approve after X days
   - Monthly payment schedule
   - Automated payroll integration

3. **Reports**
   - PDF payment receipts
   - Monthly earning statements
   - Tax reporting (1099)

4. **Advanced Features**
   - Payment disputes/appeals
   - Adjustments/refunds
   - Multi-tier bonus system
   - Performance-based pricing

## Support

For questions or issues:
1. Check PaymentSummaryCard.tsx for component usage
2. Review PricingPage.tsx for admin features
3. Check backend services in `/payments/`
4. Verify migrations were applied correctly
