-- Check categories assigned to Sub-Admin
SELECT uc."userId", uc."categoryId", c.name 
FROM user_categories uc 
JOIN categories c ON uc."categoryId" = c.id 
WHERE uc."userId" = 'd73f14d9-efa0-42f1-8f04-1c81a152ecbf' 
ORDER BY c.name;

-- If the above returns no results, check all users in user_categories
SELECT DISTINCT "userId", COUNT(*) as category_count
FROM user_categories 
GROUP BY "userId"
LIMIT 10;
