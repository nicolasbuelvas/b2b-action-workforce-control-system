-- Check how many categories each user has
SELECT "userId", COUNT(*) as category_count 
FROM user_categories 
GROUP BY "userId" 
HAVING COUNT(*) > 1 
ORDER BY category_count DESC;
