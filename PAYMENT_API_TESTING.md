# Payment System API Testing Guide

## Environment Setup

### Prerequisites
- cURL or Postman
- Valid JWT token from login
- Backend running on `http://localhost:3000`
- Database with migrations applied

### Getting JWT Token
```bash
# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'

# Copy the token from response
export TOKEN="your_jwt_token_here"
```

---

## 1. Pricing Management

### Create Pricing Rule
```bash
curl -X POST http://localhost:3000/api/payments/prices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "website_researcher",
    "actionType": "submit",
    "amount": 10.50,
    "bonusMultiplier": 1.0,
    "description": "Website research task submission"
  }'

# Expected Response:
# {
#   "id": "uuid",
#   "roleId": "website_researcher",
#   "actionType": "submit",
#   "amount": 10.5,
#   "bonusMultiplier": 1.0,
#   "description": "Website research task submission",
#   "createdAt": "2024-01-XX...",
#   "updatedAt": "2024-01-XX..."
# }
```

### Get All Pricing Rules
```bash
curl http://localhost:3000/api/payments/prices \
  -H "Authorization: Bearer $TOKEN"

# Expected Response: Array of pricing rules
```

### Get Pricing Rules by Role
```bash
curl "http://localhost:3000/api/payments/prices-by-role?role=website_researcher" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response: Pricing rules for that role only
```

### Update Pricing Rule
```bash
curl -X PATCH http://localhost:3000/api/payments/prices/PRICE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 11.00,
    "bonusMultiplier": 1.5,
    "description": "Updated description"
  }'
```

### Delete Pricing Rule
```bash
curl -X DELETE http://localhost:3000/api/payments/prices/PRICE_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# { "success": true }
```

---

## 2. Payment Creation (Simulated)

### Check Payment Summary for Worker
```bash
export WORKER_ID="worker-uuid-here"

curl http://localhost:3000/api/payments/summary/$WORKER_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "pending": { "count": 2, "total": 21.00 },
#   "inProcess": { "count": 1, "total": 10.50 },
#   "completed": { "count": 5, "total": 52.50 },
#   "totalEarnings": 84.00
# }
```

### Get Payment Details for Worker
```bash
curl "http://localhost:3000/api/payments/details/$WORKER_ID" \
  -H "Authorization: Bearer $TOKEN"

# Optional filter by status:
curl "http://localhost:3000/api/payments/details/$WORKER_ID?status=pending" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response: Array of payment records
```

### Get All Payment Records for User
```bash
curl http://localhost:3000/api/payments/records/$WORKER_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. Payment Status Management

### Approve Payment (Pending → Approved)
```bash
export PAYMENT_ID="payment-uuid-here"

curl -X PATCH http://localhost:3000/api/payments/approve/$PAYMENT_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "id": "uuid",
#   "status": "approved",
#   "updatedAt": "2024-01-XX..."
# }
```

### Reject Payment (Any → Rejected)
```bash
curl -X PATCH http://localhost:3000/api/payments/reject/$PAYMENT_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# { "id": "uuid", "status": "rejected" }
```

### Process Payments (Approved → Paid)
```bash
curl -X PATCH http://localhost:3000/api/payments/process \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIds": ["payment-id-1", "payment-id-2", "payment-id-3"]
  }'

# Expected Response: Array of updated payments
# [
#   { "id": "...", "status": "paid" },
#   { "id": "...", "status": "paid" }
# ]
```

---

## 4. Admin Payment Management

### Get All Payments (Paginated)
```bash
curl "http://localhost:3000/api/payments/all?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Optional filters:
curl "http://localhost:3000/api/payments/all?role=website_researcher&status=pending&page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "data": [ { ...payment }, ... ],
#   "pagination": {
#     "page": 1,
#     "limit": 50,
#     "total": 150,
#     "totalPages": 3
#   }
# }
```

---

## 5. Analytics

### Get Top Performers
```bash
curl "http://localhost:3000/api/payments/top-performers?role=website_researcher" \
  -H "Authorization: Bearer $TOKEN"

# Optional category filter:
curl "http://localhost:3000/api/payments/top-performers?role=website_researcher&category=tech" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response: Top 3 workers with counts and earnings
# [
#   { "userId": "...", "count": 50, "totalEarnings": "525.00" },
#   { "userId": "...", "count": 45, "totalEarnings": "472.50" },
#   { "userId": "...", "count": 40, "totalEarnings": "420.00" }
# ]
```

### Get Earnings by Role
```bash
curl "http://localhost:3000/api/payments/earnings?role=website_researcher" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "byUser": {
#     "user-id-1": 525.00,
#     "user-id-2": 472.50,
#     "user-id-3": 420.00
#   },
#   "total": 1417.50,
#   "average": 472.50,
#   "count": 3
# }
```

### Get Payment Statistics
```bash
curl http://localhost:3000/api/payments/stats \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "byStatus": {
#     "pending": 10,
#     "approved": 5,
#     "paid": 100,
#     "rejected": 2
#   },
#   "byRole": {
#     "website_researcher": { "count": 30, "total": 315.00 },
#     "linkedin_researcher": { "count": 20, "total": 240.00 },
#     ...
#   },
#   "totalAmount": 1417.50
# }
```

---

## Testing Workflow (Manual)

### Step 1: Create All Pricing Rules
Create pricing for all 8 roles:
```bash
# Run this script to create all
for ROLE in website_researcher linkedin_researcher website_inquirer linkedin_inquirer research_auditor inquiry_auditor linkedin_inquiry_auditor linkedin_research_auditor; do
  PRICE=$([ "$ROLE" = "research_auditor" ] && echo "2.00" || echo "10.00")
  ACTION=$([ "$ROLE" = *"auditor" ] && echo "approve" || echo "submit")
  
  curl -X POST http://localhost:3000/api/payments/prices \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"roleId\": \"$ROLE\",
      \"actionType\": \"$ACTION\",
      \"amount\": $PRICE,
      \"bonusMultiplier\": 1.0,
      \"description\": \"$ROLE $ACTION\"
    }"
done
```

### Step 2: Verify Pricing
```bash
curl http://localhost:3000/api/payments/prices \
  -H "Authorization: Bearer $TOKEN" | jq length
# Should return: 8 (8 roles)
```

### Step 3: Check Worker Payment Summary (Should be empty)
```bash
curl http://localhost:3000/api/payments/summary/test-worker-id \
  -H "Authorization: Bearer $TOKEN"
# Should return all zeros
```

### Step 4: Manually Create Test Payment
```bash
# In database:
INSERT INTO payment_records (
  id, user_id, role, action_id, action_type, amount, status
) VALUES (
  gen_random_uuid(),
  'test-worker-id',
  'website_researcher',
  'action-123',
  'submit',
  10.50,
  'pending'
);
```

### Step 5: Check Summary Again
```bash
curl http://localhost:3000/api/payments/summary/test-worker-id \
  -H "Authorization: Bearer $TOKEN"
# Should now show: pending.total = 10.50
```

### Step 6: Approve the Payment
```bash
# First, get the payment ID
PAYMENT_ID=$(curl http://localhost:3000/api/payments/records/test-worker-id \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

# Approve it
curl -X PATCH http://localhost:3000/api/payments/approve/$PAYMENT_ID \
  -H "Authorization: Bearer $TOKEN"

# Check summary
curl http://localhost:3000/api/payments/summary/test-worker-id \
  -H "Authorization: Bearer $TOKEN"
# Should now show: inProcess.total = 10.50, pending.total = 0
```

### Step 7: Process the Payment
```bash
curl -X PATCH http://localhost:3000/api/payments/process \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"paymentIds\": [\"$PAYMENT_ID\"]
  }"

# Check summary
curl http://localhost:3000/api/payments/summary/test-worker-id \
  -H "Authorization: Bearer $TOKEN"
# Should now show: completed.total = 10.50, inProcess.total = 0
```

---

## Error Codes & Troubleshooting

### 401 Unauthorized
```
Problem: Invalid or missing JWT token
Solution: Get new token via login endpoint
```

### 400 Bad Request
```
Problem: Missing required fields or invalid data
Solution: Check request body against DTO structure
Example:
  Missing: roleId, actionType, amount
  Invalid: amount not a number, status not valid enum
```

### 404 Not Found
```
Problem: Price or payment not found
Solution: Check if ID exists in database
  SELECT COUNT(*) FROM action_prices WHERE id = 'xxx';
  SELECT COUNT(*) FROM payment_records WHERE id = 'xxx';
```

### 409 Conflict
```
Problem: Duplicate pricing rule (same role + actionType)
Solution: Use PATCH to update instead of POST
Example: Already have website_researcher:submit, trying to POST again
```

### 422 Unprocessable Entity
```
Problem: Invalid state transition
Solution: Check current payment status
Examples:
  - Can't approve a payment that's already paid
  - Can't process a pending payment (must be approved first)
```

---

## Database Verification

### Check if Pricing Rules Exist
```sql
SELECT COUNT(*) FROM action_prices;
```

### Check Pricing Rules for Role
```sql
SELECT * FROM action_prices WHERE role_id = 'website_researcher';
```

### Check Payment Records
```sql
SELECT COUNT(*) FROM payment_records WHERE user_id = 'test-worker-id';
```

### Check Payment Status Distribution
```sql
SELECT status, COUNT(*) as count, SUM(amount) as total
FROM payment_records
GROUP BY status
ORDER BY status;
```

### Check Specific Worker Earnings
```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total
FROM payment_records
WHERE user_id = 'test-worker-id'
GROUP BY status;
```

---

## Postman Collection Template

### Create New Collection: "Payment System"

#### Request 1: Get Pricing Rules
- Method: GET
- URL: `http://localhost:3000/api/payments/prices`
- Header: `Authorization: Bearer {{token}}`

#### Request 2: Create Pricing Rule
- Method: POST
- URL: `http://localhost:3000/api/payments/prices`
- Header: `Authorization: Bearer {{token}}`
- Body (JSON):
```json
{
  "roleId": "website_researcher",
  "actionType": "submit",
  "amount": 10.50,
  "bonusMultiplier": 1.0,
  "description": "Test pricing"
}
```

#### Request 3: Get Worker Summary
- Method: GET
- URL: `http://localhost:3000/api/payments/summary/{{workerId}}`
- Header: `Authorization: Bearer {{token}}`

#### Request 4: Approve Payment
- Method: PATCH
- URL: `http://localhost:3000/api/payments/approve/{{paymentId}}`
- Header: `Authorization: Bearer {{token}}`

#### Request 5: Process Payments
- Method: PATCH
- URL: `http://localhost:3000/api/payments/process`
- Header: `Authorization: Bearer {{token}}`
- Body (JSON):
```json
{
  "paymentIds": ["{{paymentId1}}", "{{paymentId2}}"]
}
```

---

## Performance Testing

### Load Test: Create 1000 Payments
```bash
for i in {1..1000}; do
  # Manually insert into DB via SQL
  # Or call API 1000 times
done

# Measure:
time curl http://localhost:3000/api/payments/all?limit=1000 \
  -H "Authorization: Bearer $TOKEN"
# Should complete in <5 seconds
```

### Analytics Performance
```bash
time curl http://localhost:3000/api/payments/stats \
  -H "Authorization: Bearer $TOKEN"
# Should complete in <1 second
```

---

## Notes for Integration

When integrating with action submission:
1. Get worker role from JWT token or request context
2. Call `calculatePayment()` when action submitted
3. Save returned PaymentRecord ID
4. Link payment to action record

When integrating with auditor approval:
1. Find associated PaymentRecord
2. Call `approvePayment()` endpoint
3. Update action status to 'approved'

When integrating with payment processing:
1. Select batch of approved payments
2. Call `processPayments()` endpoint
3. Update billing records if needed

---

**All tests should return consistent, predictable data.**
**If behavior differs, check database and review service logic.**
