# Quick Reference: Payment System

## For Developers

### Add Payment Card to a Page

```typescript
import { PaymentSummaryCard } from '@/components/cards/PaymentSummaryCard';

export function MyWorkerPage() {
  return (
    <div>
      <h1>My Page</h1>
      <PaymentSummaryCard />  {/* Full display */}
      {/* OR */}
      <PaymentSummaryCard compact />  {/* Minimal display */}
    </div>
  );
}
```

### Create Payment in Backend

```typescript
// When action is submitted, create payment record
const payment = await this.paymentsService.calculatePayment({
  userId: worker.id,
  role: worker.role,           // e.g., 'website_researcher'
  actionId: action.id,
  actionType: 'submit',        // e.g., 'submit', 'approve'
});
```

### Approve Payment (Auditor)

```typescript
// When auditor approves action
await this.paymentsService.approvePayment(paymentId);
// Status: pending → approved
// Worker sees amount move to "In-Process"
```

### Process Payment (Admin)

```typescript
// Mark approved payments as paid
await this.paymentsService.processPayments(paymentIds);
// Status: approved → paid
// Worker sees amount move to "Completed"
```

### Get Worker Payment Summary

```typescript
// For dashboard
const summary = await axios.get(`/api/payments/summary/${userId}`);
// Returns: { pending: {...}, inProcess: {...}, completed: {...}, totalEarnings }
```

## Available Routes

### Admin Panel
- `/api/admin/pricing` - Super admin pricing management

### Worker Dashboard
- Any worker page with `<PaymentSummaryCard />`

### Payment Creation
- Automatic when action submitted

### Payment Approval
- Admin calls API endpoint or UI button

### Payment Processing
- Admin selects and processes in PricingPage

## Database Commands

### Check Pricing Rules
```sql
SELECT * FROM action_prices;
```

### Check Payment Records
```sql
SELECT * FROM payment_records WHERE user_id = 'xxx';
```

### Check Payment by Status
```sql
SELECT COUNT(*), SUM(amount), status 
FROM payment_records 
GROUP BY status;
```

### Update Worker Earnings
```sql
SELECT SUM(amount) as total_earned
FROM payment_records 
WHERE user_id = 'xxx' AND status IN ('approved', 'paid');
```

## Configuration

### Pricing Rule Creation
1. Super admin → `/api/admin/pricing`
2. Click "+ Add Pricing Rule"
3. Select role (website_researcher, etc.)
4. Select action type (submit, approve, etc.)
5. Enter unit price (e.g., 10.50)
6. Optional: bonus multiplier for top 3
7. Save

### Example Pricing
```
website_researcher submit = $10.00
linkedin_researcher submit = $12.00
research_auditor approve = $2.00
inquiry_auditor approve = $1.50
```

## Testing Flow

### 1. Create Pricing
```bash
curl -X POST http://localhost:3000/api/payments/prices \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "website_researcher",
    "actionType": "submit",
    "amount": 10.50,
    "bonusMultiplier": 1.0,
    "description": "Research submission"
  }'
```

### 2. Get Pricing
```bash
curl http://localhost:3000/api/payments/prices \
  -H "Authorization: Bearer TOKEN"
```

### 3. Get Worker Summary
```bash
curl http://localhost:3000/api/payments/summary/USER_ID \
  -H "Authorization: Bearer TOKEN"
```

### 4. Approve Payment
```bash
curl -X PATCH http://localhost:3000/api/payments/approve/PAYMENT_ID \
  -H "Authorization: Bearer TOKEN"
```

### 5. Process Payment
```bash
curl -X PATCH http://localhost:3000/api/payments/process \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentIds": ["ID1", "ID2"]}'
```

## Common Tasks

### Show Payment Info to Worker
✅ Use `<PaymentSummaryCard />`
❌ Don't expose ActionPrice data
❌ Don't show individual prices

### Find Unpaid Payments
```sql
SELECT * FROM payment_records 
WHERE status IN ('pending', 'approved')
ORDER BY created_at DESC;
```

### Calculate Worker Earnings
```sql
SELECT 
  user_id,
  SUM(CASE WHEN status='paid' THEN amount ELSE 0 END) as paid,
  SUM(CASE WHEN status='approved' THEN amount ELSE 0 END) as approved,
  SUM(CASE WHEN status='pending' THEN amount ELSE 0 END) as pending
FROM payment_records
WHERE user_id = 'xxx'
GROUP BY user_id;
```

### Find Top Performers
```sql
SELECT user_id, COUNT(*) as count, SUM(amount) as total
FROM payment_records
WHERE status = 'paid' AND role = 'website_researcher'
GROUP BY user_id
ORDER BY total DESC
LIMIT 3;
```

## Component Props

### PaymentSummaryCard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | string | undefined | Optional specific user (defaults to current) |
| `compact` | boolean | false | Minimal display mode (3 numbers) |

### Display Modes

**Full Display** (default)
- Shows: Pending, In-Process, Completed boxes
- Shows: Action counts per status
- Shows: Status descriptions
- Shows: Total lifetime earnings
- Shows: Disclaimer about no individual prices

**Compact Display**
- Shows: 3 key numbers (Pending, In-Process, Completed)
- Clean, minimal layout
- Good for sidebars/small spaces

## Troubleshooting

### Workers Don't See Payment Card
- [ ] Component imported correctly?
- [ ] Component added to page JSX?
- [ ] API endpoint accessible at `/api/payments/summary/:userId`?
- [ ] JWT token valid?

### Prices Not Saving
- [ ] Unique constraint on (roleId, actionType)?
- [ ] Data types correct (amount = decimal)?
- [ ] Database migration applied?

### Payments Not Creating
- [ ] ActionPrice exists for role + actionType?
- [ ] calculatePayment() called when action submitted?
- [ ] User role correctly set?

### Status Not Updating
- [ ] Payment exists in database?
- [ ] Correct payment ID?
- [ ] Previous status allows transition?
  - pending → approved ✅
  - approved → paid ✅
  - paid → ? ❌ (blocked)

## Files Reference

| File | Purpose |
|------|---------|
| `payments.controller.ts` | API endpoints (20+) |
| `payments.service.ts` | Business logic |
| `action-price.entity.ts` | Pricing database schema |
| `payment-record.entity.ts` | Payment tracking schema |
| `PricingPage.tsx` | Admin management UI |
| `PaymentSummaryCard.tsx` | Worker dashboard component |
| `PAYMENT_SYSTEM_GUIDE.md` | Complete documentation |
| `PAYMENT_IMPLEMENTATION_SUMMARY.md` | What was built |

## Quick Debugging

### Check If Payments Exist
```typescript
const payments = await paymentsService.getPaymentRecords(userId);
console.log(payments);
```

### Check Payment Status
```typescript
const details = await paymentsService.getWorkerPaymentDetails(userId, 'pending');
console.log('Pending:', details);
```

### Check Pricing Rules
```typescript
const prices = await paymentsService.getActionPrices();
console.log('Available prices:', prices);
```

### Check Statistics
```typescript
const stats = await paymentsService.getPaymentStats();
console.log('Stats:', stats);
```

## Constants

### Worker Roles (8 Total)
```
website_researcher
linkedin_researcher
website_inquirer
linkedin_inquirer
research_auditor
inquiry_auditor
linkedin_inquiry_auditor
linkedin_research_auditor
```

### Action Types
```
submit     - Worker action submission
approve    - Auditor approval action
```

### Payment Statuses
```
pending     - Awaiting auditor approval
approved    - Auditor approved, awaiting payment processing
paid        - Payment received by worker
rejected    - Payment rejected, not paid
```

---

**For more details, see:**
- `PAYMENT_SYSTEM_GUIDE.md` - Full system documentation
- `PAYMENT_IMPLEMENTATION_SUMMARY.md` - What was built
- Component source files - Inline documentation and comments
