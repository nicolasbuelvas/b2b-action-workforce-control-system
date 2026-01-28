# Payment & Pricing System Implementation Plan

## Overview
Complete payment tracking system with action-based pricing for 8 worker roles.

## System Architecture

### Database Tables (TypeORM Entities)
- ✅ `action_prices` - Pricing per role/action
- ✅ `payment_records` - Payment tracking (pending/approved/paid)
- 🔄 Need: `payment_details` - Detailed breakdown per task

### 8 Worker Roles
1. website_researcher - 1 action (WEBSITE_RESEARCH)
2. website_inquirer - 1 action (WEBSITE_INQUIRY)
3. linkedin_researcher - 1 action (LINKEDIN_RESEARCH)
4. linkedin_inquirer - 3 actions (LINKEDIN_OUTREACH, LINKEDIN_EMAIL_REQUEST, LINKEDIN_CATALOGUE)
5. research_auditor - 1 action (RESEARCH_AUDIT)
6. inquiry_auditor - 1 action (INQUIRY_AUDIT)
7. linkedin_inquiry_auditor - 3 actions (audit same as linkedin_inquirer)
8. linkedin_research_auditor - 1 action (audit)

### Payment Statuses
- PENDING: Waiting for auditor approval
- IN_PROCESS: Auditor approved, awaiting payment processing
- COMPLETED: Payment processed
- REJECTED: Auditor rejected

### Frontend Requirements
**Workers (All 8 roles):**
- ❌ Cannot see pricing
- ✅ See "Payment Summary" card
  - Pending (awaiting auditor)
  - In Process (approved, payment pending)
  - Completed (paid amount)
  - Lifetime Earnings

**Super Admin:**
- ✅ PricingPage.tsx - Full pricing management
- ✅ Set price per role/action
- ✅ View all worker payments
- ✅ Process payments (pending → paid)
- ✅ Top 3 bonuses per role/category

### Implementation Steps
1. ✅ Database schema (already exists)
2. 🔄 Backend payments API
3. 🔄 Worker payment summary (dashboard card)
4. 🔄 PricingPage functional implementation
5. 🔄 Payment tracking in all worker pages

## Status: IN PROGRESS
