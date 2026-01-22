SELECT u.id, u.name, u.email, 
  STRING_AGG(DISTINCT r.name, ', ') as roles,
  STRING_AGG(DISTINCT c.name, ', ') as categories
FROM users u
LEFT JOIN user_roles ur ON u.id = ur."userId"
LEFT JOIN roles r ON ur."roleId" = r.id
LEFT JOIN user_categories uc ON u.id = uc."userId"
LEFT JOIN categories c ON uc."categoryId" = c.id
GROUP BY u.id, u.name, u.email
ORDER BY u.email
LIMIT 20;
