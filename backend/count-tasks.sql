SELECT targettype, "categoryId", COUNT(*) as count
FROM research_tasks
GROUP BY targettype, "categoryId";
