-- Quick fix to add test data for researchers
BEGIN;

-- 1. Create test users if not exist
INSERT INTO users (id, name, email, password_hash)
SELECT gen_random_uuid(), 'Web Researcher', 'web_res@test.com', '$2b$10$yWjVW3XHhSbPFWSZ5GORuubcDIuW5PNlx7aK3.K13FXtDauS1/RDe'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'web_res@test.com');

INSERT INTO users (id, name, email, password_hash)
SELECT gen_random_uuid(), 'LinkedIn Researcher', 'li_res@test.com', '$2b$10$yWjVW3XHhSbPFWSZ5GORuubcDIuW5PNlx7aK3.K13FXtDauS1/RDe'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'li_res@test.com');

-- 2. Assign researcher roles
INSERT INTO user_roles (id, "userId", "roleId")
SELECT gen_random_uuid(), u.id, r.id
FROM users u, roles r
WHERE u.email = 'web_res@test.com' AND r.name = 'website_researcher'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur."userId" = u.id AND ur."roleId" = r.id);

INSERT INTO user_roles (id, "userId", "roleId")
SELECT gen_random_uuid(), u.id, r.id
FROM users u, roles r
WHERE u.email = 'li_res@test.com' AND r.name = 'linkedin_researcher'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur."userId" = u.id AND ur."roleId" = r.id);

-- 3. Assign users to all active categories (CRITICAL)
INSERT INTO user_categories (id, "userId", "categoryId")
SELECT gen_random_uuid(), u.id, c.id
FROM users u, categories c
WHERE u.email IN ('web_res@test.com', 'li_res@test.com')
  AND c."isActive" = true
  AND NOT EXISTS (SELECT 1 FROM user_categories uc WHERE uc."userId" = u.id AND uc."categoryId" = c.id);

-- 4. Create test companies if they don't exist
INSERT INTO companies (id, name, domain, "normalizedDomain", country)
SELECT gen_random_uuid(), v.name, v.domain, v.domain, v.country
FROM (VALUES
  ('TechCorp', 'techcorp.com', 'US'),
  ('CloudBase', 'cloudbase.io', 'US'),
  ('WebStudio', 'webstudio.nl', 'Netherlands'),
  ('DataLytics', 'datalytics.jp', 'Japan'),
  ('SolarEnergy', 'solarenergy.de', 'Germany')
) v(name, domain, country)
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE domain = v.domain);

-- 5. Get category ID and create research tasks
WITH active_cat AS (SELECT id FROM categories WHERE "isActive" = true LIMIT 1)
INSERT INTO research_tasks (id, "targetId", targettype, "categoryId", status)
SELECT gen_random_uuid(), c.id, 'COMPANY', cat.id, 'PENDING'
FROM companies c, active_cat cat
WHERE NOT EXISTS (
  SELECT 1 FROM research_tasks rt 
  WHERE rt."targetId" = c.id AND rt."categoryId" = cat.id
);

COMMIT;
