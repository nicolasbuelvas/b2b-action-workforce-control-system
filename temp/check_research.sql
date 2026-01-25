SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'research_submissions' 
ORDER BY ordinal_position;

SELECT COUNT(*) FROM research_tasks;
SELECT * FROM research_tasks LIMIT 3;
