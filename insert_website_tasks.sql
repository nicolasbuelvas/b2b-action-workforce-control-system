INSERT INTO research_tasks ("targetId", "categoryId", status, "assignedToUserId", targettype)
SELECT '1520e4fb-dca4-4492-830c-e497c2041ea0', id, 'PENDING', NULL, 'COMPANY'
FROM categories
WHERE name != 'No Work';
