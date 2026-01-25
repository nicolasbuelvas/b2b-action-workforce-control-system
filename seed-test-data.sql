-- Seed test companies
INSERT INTO companies (name, domain, "normalizedDomain", country)
VALUES 
  ('TechCorp USA', 'techcorp.com', 'techcorp.com', 'United States'),
  ('InnovateLabs', 'innovatelabs.io', 'innovatelabs.io', 'Canada'),
  ('GlobalTech Ltd', 'globaltech.uk', 'globaltech.uk', 'United Kingdom')
ON CONFLICT ("normalizedDomain") DO NOTHING;

-- Create research tasks linked to test companies
WITH company_ids AS (
  SELECT id FROM companies WHERE domain IN ('techcorp.com', 'innovatelabs.io', 'globaltech.uk')
),
category_id AS (
  SELECT id FROM categories LIMIT 1
),
company_str AS (
  SELECT CAST(id AS VARCHAR) as company_id_str, id FROM company_ids
),
cat_str AS (
  SELECT CAST(id AS VARCHAR) as cat_id_str FROM category_id
)
INSERT INTO research_tasks ("targetId", "categoryId", status, targettype)
SELECT c.company_id_str, ca.cat_id_str, 'PENDING'::research_tasks_status_enum, 'COMPANY'
FROM company_str c, cat_str ca
ON CONFLICT DO NOTHING;

-- Create inquiry tasks linked to test research tasks
WITH test_research AS (
  SELECT id, "targetId", "categoryId" FROM research_tasks 
  WHERE status = 'PENDING'::research_tasks_status_enum
  ORDER BY id
  LIMIT 3
),
test_inquirer AS (
  SELECT id FROM users WHERE email = 'web_inq@test.com'
),
test_category AS (
  SELECT id FROM categories LIMIT 1
)
INSERT INTO inquiry_tasks ("targetId", "categoryId", status, "assignedToUserId", "research_task_id")
SELECT tr."targetId", tc.id, 'PENDING'::inquiry_tasks_status_enum, ti.id, tr.id
FROM test_research tr, test_inquirer ti, test_category tc
ON CONFLICT DO NOTHING;

SELECT 'Test data created successfully' AS result;
