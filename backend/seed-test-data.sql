-- ============================================================
-- COMPREHENSIVE SEED SCRIPT FOR B2B WORKFORCE SYSTEM
-- This script creates test data for all roles and workflows
-- Using snake_case column names as per PostgreSQL mapping
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CREATE RESEARCHERS (Web and LinkedIn)
-- ============================================================
INSERT INTO users (id, name, email, password_hash, createdAt)
SELECT gen_random_uuid(), v.name, v.email, v.password_hash, NOW()
FROM (VALUES
  ('Website Researcher 1', 'web_res@test.com', '$2b$10$yWjVW3XHhSbPFWSZ5GORuubcDIuW5PNlx7aK3.K13FXtDauS1/RDe'),
  ('LinkedIn Researcher 1', 'li_res@test.com', '$2b$10$yWjVW3XHhSbPFWSZ5GORuubcDIuW5PNlx7aK3.K13FXtDauS1/RDe'),
  ('Website Inquirer 1', 'web_inq@test.com', '$2b$10$yWjVW3XHhSbPFWSZ5GORuubcDIuW5PNlx7aK3.K13FXtDauS1/RDe'),
  ('LinkedIn Inquirer 1', 'li_inq@test.com', '$2b$10$yWjVW3XHhSbPFWSZ5GORuubcDIuW5PNlx7aK3.K13FXtDauS1/RDe'),
  ('Website Auditor 1', 'web_aud@test.com', '$2b$10$yWjVW3XHhSbPFWSZ5GORuubcDIuW5PNlx7aK3.K13FXtDauS1/RDe'),
  ('LinkedIn Auditor 1', 'li_aud@test.com', '$2b$10$yWjVW3XHhSbPFWSZ5GORuubcDIuW5PNlx7aK3.K13FXtDauS1/RDe')
) v(name, email, password_hash)
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = v.email
);

-- ============================================================
-- 2. ASSIGN ROLES TO RESEARCHERS
-- ============================================================
INSERT INTO user_roles (id, user_id, role_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, NOW()
FROM users u
JOIN roles r ON r.name = 'website_researcher'
WHERE u.email = 'web_res@test.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = u.id AND ur.role_id = r.id
);

INSERT INTO user_roles (id, user_id, role_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, NOW()
FROM users u
JOIN roles r ON r.name = 'linkedin_researcher'
WHERE u.email = 'li_res@test.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = u.id AND ur.role_id = r.id
);

INSERT INTO user_roles (id, user_id, role_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, NOW()
FROM users u
JOIN roles r ON r.name = 'website_inquirer'
WHERE u.email = 'web_inq@test.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = u.id AND ur.role_id = r.id
);

INSERT INTO user_roles (id, user_id, role_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, NOW()
FROM users u
JOIN roles r ON r.name = 'linkedin_inquirer'
WHERE u.email = 'li_inq@test.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = u.id AND ur.role_id = r.id
);

INSERT INTO user_roles (id, user_id, role_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, NOW()
FROM users u
JOIN roles r ON r.name = 'website_auditor'
WHERE u.email = 'web_aud@test.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = u.id AND ur.role_id = r.id
);

INSERT INTO user_roles (id, user_id, role_id, created_at)
SELECT gen_random_uuid(), u.id, r.id, NOW()
FROM users u
JOIN roles r ON r.name = 'linkedin_auditor'
WHERE u.email = 'li_aud@test.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- ============================================================
-- 3. ASSIGN ALL RESEARCHERS TO ALL ACTIVE CATEGORIES (CRITICAL FIX)
-- ============================================================
INSERT INTO user_categories (id, user_id, category_id, created_at)
SELECT 
  gen_random_uuid(),
  u.id,
  c.id,
  NOW()
FROM users u
CROSS JOIN categories c
WHERE u.email IN ('web_res@test.com', 'li_res@test.com', 'web_inq@test.com', 'li_inq@test.com', 'web_aud@test.com', 'li_aud@test.com')
  AND c.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM user_categories uc
    WHERE uc.user_id = u.id
      AND uc.category_id = c.id
  );

-- ============================================================
-- 4. CREATE TEST COMPANIES
-- ============================================================
INSERT INTO companies (id, name, domain, country, is_approved, category_id, created_at)
SELECT gen_random_uuid(), v.name, v.domain, v.country, true, c.id, NOW()
FROM categories c
CROSS JOIN (VALUES
  ('TechCorp Solutions', 'techcorp.com', 'US'),
  ('CloudBase Inc', 'cloudbase.io', 'US'),
  ('Digital Innovations Ltd', 'digitalinnovations.co.uk', 'UK'),
  ('Solar Energy Systems', 'solarenergy.de', 'Germany'),
  ('E-commerce Global', 'ecommerce-global.fr', 'France'),
  ('AI Solutions Pro', 'aisolutions.ai', 'US'),
  ('Web Design Studio', 'webstudio.nl', 'Netherlands'),
  ('Data Analytics Inc', 'datalytics.jp', 'Japan'),
  ('Marketing Automation Co', 'marketingauto.com.br', 'Brazil'),
  ('Enterprise Software Ltd', 'enterprise-soft.in', 'India')
) v(name, domain, country)
WHERE c.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM companies comp
  WHERE comp.domain = v.domain
    AND comp.category_id = c.id
);

-- ============================================================
-- 5. CREATE RESEARCH TASKS FOR EACH COMPANY
-- ============================================================
INSERT INTO research_tasks (
  id, 
  target_id, 
  target_type, 
  category_id, 
  status, 
  created_at
)
SELECT
  gen_random_uuid(),
  comp.id,
  'COMPANY',
  comp.category_id,
  'PENDING',
  NOW()
FROM companies comp
WHERE NOT EXISTS (
  SELECT 1 FROM research_tasks rt
  WHERE rt.target_id = comp.id
    AND rt.category_id = comp.category_id
);

-- ============================================================
-- 6. UPDATE ROLE METRICS FOR NEW RESEARCHERS
-- ============================================================
INSERT INTO role_metrics (
  id,
  user_id,
  role,
  date,
  total_actions,
  approved_actions,
  rejected_actions,
  flagged_actions,
  created_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'website_researcher',
  CURRENT_DATE,
  0,
  0,
  0,
  0,
  NOW()
FROM users u
WHERE u.email = 'web_res@test.com'
AND NOT EXISTS (
  SELECT 1 FROM role_metrics rm
  WHERE rm.user_id = u.id
    AND rm.role = 'website_researcher'
    AND rm.date = CURRENT_DATE
);

INSERT INTO role_metrics (
  id,
  user_id,
  role,
  date,
  total_actions,
  approved_actions,
  rejected_actions,
  flagged_actions,
  created_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'linkedin_researcher',
  CURRENT_DATE,
  0,
  0,
  0,
  0,
  NOW()
FROM users u
WHERE u.email = 'li_res@test.com'
AND NOT EXISTS (
  SELECT 1 FROM role_metrics rm
  WHERE rm.user_id = u.id
    AND rm.role = 'linkedin_researcher'
    AND rm.date = CURRENT_DATE
);

COMMIT;
