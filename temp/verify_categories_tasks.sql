-- Verify researcher categories and tasks
SELECT 
  c.name as category_name,
  c.id as category_id,
  COUNT(rt.id) as task_count
FROM user_categories uc
JOIN categories c ON uc."categoryId" = c.id
LEFT JOIN research_tasks rt ON rt."categoryId" = c.id AND rt.status = 'PENDING'
WHERE uc."userId" = '6b574454-b97b-43f3-a0d1-c80269ccb579'
GROUP BY c.id, c.name;
