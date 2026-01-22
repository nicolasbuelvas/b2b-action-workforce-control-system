-- Check what categories web_res@test.com is actually assigned to
SELECT 
  u.email,
  u.id as user_id,
  c.id as category_id,
  c.name as category_name,
  uc."createdAt" as assigned_at
FROM users u
JOIN user_categories uc ON u.id = uc."userId"
JOIN categories c ON uc."categoryId" = c.id
WHERE u.email = 'web_res@test.com';
