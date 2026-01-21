-- Check existing users and their roles
SELECT u.id, u.email
FROM users u
WHERE u.id IN (
    SELECT DISTINCT "userId"
    FROM user_roles
    WHERE "roleId" IN (
        SELECT id FROM roles WHERE name IN ('website_researcher', 'linkedin_researcher')
    )
)
ORDER BY u.email;
