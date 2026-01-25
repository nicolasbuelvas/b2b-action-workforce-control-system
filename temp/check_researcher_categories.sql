-- Check if web_res@test.com has categories assigned
SELECT uc.id, uc."categoryId", c.name as category_name
FROM user_categories uc
JOIN categories c ON uc."categoryId" = c.id
WHERE uc."userId" = '6b574454-b97b-43f3-a0d1-c80269ccb579';
