-- ========================================
-- CLEAN ALL TASK DATA SCRIPT
-- ========================================
-- This script deletes ALL task-related data across the system
-- including research tasks, inquiry tasks, screenshots, flags, etc.
-- Run this to start completely fresh
--
-- WARNING: This is DESTRUCTIVE and IRREVERSIBLE
-- Make sure you want to delete all task data before running
-- ========================================

-- Disable foreign key checks temporarily if needed (PostgreSQL doesn't require this)

-- 1. Delete all flagged actions
DELETE FROM flagged_actions;

-- 2. Delete all research audits
DELETE FROM research_audits;

-- 3. Delete all research submissions
DELETE FROM research_submissions;

-- 4. Delete all inquiry submission snapshots (contains screenshots, hashes, duplicates)
DELETE FROM inquiry_submission_snapshots;

-- 5. Delete all outreach records
DELETE FROM outreach_records;

-- 6. Delete all inquiry actions
DELETE FROM inquiry_actions;

-- 7. Delete all inquiry tasks
DELETE FROM inquiry_tasks;

-- 8. Delete all LinkedIn profiles
DELETE FROM linkedin_profiles;

-- 9. Delete all companies
DELETE FROM companies;

-- 10. Delete all research tasks
DELETE FROM research_tasks;

-- 11. Delete all screenshot hashes (for duplicate detection)
DELETE FROM screenshot_hashes;

-- 12. Delete all payment records related to tasks
DELETE FROM payment_records WHERE actiontype IN ('RESEARCH', 'INQUIRY', 'WEBSITE_INQUIRY', 'LINKEDIN_OUTREACH', 'LINKEDIN_EMAIL_REQUEST', 'LINKEDIN_CATALOGUE');

-- Note: Physical screenshot files in uploads/screenshots/ directory
-- need to be deleted separately using a file system command
-- See companion PowerShell script: delete-all-screenshots.ps1

-- Reset any sequences if needed (PostgreSQL uses sequences for auto-increment)
-- Generally not needed for UUID primary keys

-- Verify cleanup
SELECT 'research_tasks' as table_name, COUNT(*) as remaining_rows FROM research_tasks
UNION ALL
SELECT 'inquiry_tasks', COUNT(*) FROM inquiry_tasks
UNION ALL
SELECT 'inquiry_actions', COUNT(*) FROM inquiry_actions
UNION ALL
SELECT 'inquiry_submission_snapshots', COUNT(*) FROM inquiry_submission_snapshots
UNION ALL
SELECT 'research_submissions', COUNT(*) FROM research_submissions
UNION ALL
SELECT 'research_audits', COUNT(*) FROM research_audits
UNION ALL
SELECT 'flagged_actions', COUNT(*) FROM flagged_actions
UNION ALL
SELECT 'screenshot_hashes', COUNT(*) FROM screenshot_hashes
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'linkedin_profiles', COUNT(*) FROM linkedin_profiles
UNION ALL
SELECT 'outreach_records', COUNT(*) FROM outreach_records;

COMMIT;
