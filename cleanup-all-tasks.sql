-- ============================================================================
-- COMPREHENSIVE TASK DATA CLEANUP
-- Reset system to clean state - remove ALL task-related data created BEFORE
-- new structural fixes (researchTaskId, snapshots, etc.)
-- ============================================================================

-- STEP 1: Delete from inquiry_submission_snapshots (no foreign key dependencies)
DELETE FROM inquiry_submission_snapshots;

-- STEP 2: Delete from inquiry_actions (foreign key to inquiry_tasks)
DELETE FROM inquiry_actions;

-- STEP 3: Delete from inquiry_tasks (no dependent tables after actions deleted)
DELETE FROM inquiry_tasks;

-- STEP 4: Delete from research_submissions (foreign key to research_tasks)
DELETE FROM research_submissions;

-- STEP 5: Delete from research_actions (foreign key to research_tasks)
DELETE FROM research_actions;

-- STEP 6: Delete from research_tasks (no dependent tables after actions deleted)
DELETE FROM research_tasks;

-- STEP 7: Delete from screenshots (may have foreign key to inquiry_actions)
DELETE FROM screenshots;

-- STEP 8: Delete from screenshot_hashes (independent table)
DELETE FROM screenshot_hashes;

-- STEP 9: Verify cleanup
SELECT 'Cleanup Results:' AS status;

SELECT 'inquiry_tasks: ' || COUNT(*)::TEXT as count_check FROM inquiry_tasks;
SELECT 'research_tasks: ' || COUNT(*)::TEXT as count_check FROM research_tasks;
SELECT 'inquiry_submission_snapshots: ' || COUNT(*)::TEXT as count_check FROM inquiry_submission_snapshots;
SELECT 'inquiry_actions: ' || COUNT(*)::TEXT as count_check FROM inquiry_actions;
SELECT 'research_submissions: ' || COUNT(*)::TEXT as count_check FROM research_submissions;
SELECT 'research_actions: ' || COUNT(*)::TEXT as count_check FROM research_actions;
SELECT 'screenshots: ' || COUNT(*)::TEXT as count_check FROM screenshots;
SELECT 'screenshot_hashes: ' || COUNT(*)::TEXT as count_check FROM screenshot_hashes;

SELECT '✓ Data cleanup completed successfully' AS result;
