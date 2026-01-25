-- Check researcher's categories
SELECT uc.id, uc."userId", uc."categoryId", c.name, c.id as cat_id
FROM user_categories uc
JOIN categories c ON uc."categoryId" = c.id
WHERE uc."userId" = '6b574454-b97b-43f3-a0d1-c80269ccb579'
ORDER BY uc."createdAt";
