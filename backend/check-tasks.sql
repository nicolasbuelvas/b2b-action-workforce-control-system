-- Check research tasks distribution
SELECT targettype, "categoryId", COUNT(*) as task_count
FROM research_tasks
GROUP BY targettype, "categoryId"
ORDER BY targettype, "categoryId";
