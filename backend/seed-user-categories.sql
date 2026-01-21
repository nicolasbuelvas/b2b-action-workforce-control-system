-- Seed user-category assignments
-- This assigns all website_researcher and linkedin_researcher users to all available categories

-- First, get all categories and all researcher users
-- Then assign each researcher to each category

-- Assign all website researchers to all categories
INSERT INTO user_categories ("userId", "categoryId", "createdAt", "updatedAt")
SELECT 
    u.id as "userId",
    c.id as "categoryId",
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM users u
CROSS JOIN categories c
WHERE u.id IN (
    SELECT DISTINCT ur."userId"
    FROM user_roles ur
    JOIN roles r ON ur."roleId" = r.id
    WHERE r.name IN ('website_researcher', 'linkedin_researcher')
)
ON CONFLICT ("userId", "categoryId") DO NOTHING;

-- Check the results
SELECT 
    u.email,
    COUNT(uc."categoryId") as assigned_categories
FROM users u
LEFT JOIN user_categories uc ON u.id = uc."userId"
WHERE u.id IN (
    SELECT DISTINCT ur."userId"
    FROM user_roles ur
    JOIN roles r ON ur."roleId" = r.id
    WHERE r.name IN ('website_researcher', 'linkedin_researcher')
)
GROUP BY u.id, u.email
ORDER BY u.email;
