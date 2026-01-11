BEGIN;

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, name)
SELECT gen_random_uuid(), v.name
FROM (VALUES
  ('super_admin'),
  ('sub_admin'),
  ('website_researcher'),
  ('linkedin_researcher'),
  ('website_inquirer'),
  ('linkedin_inquirer'),
  ('website_auditor'),
  ('linkedin_auditor')
) v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM roles r WHERE r.name = v.name
);

-- ============================================================
-- USERS
-- password = admin123
-- ============================================================
INSERT INTO users (id, name, email, password_hash)
SELECT gen_random_uuid(), v.name, v.email, v.password_hash
FROM (VALUES
  (
    'Super Admin',
    'admin@tuapp.com',
    '$2b$10$yWjVW3XHhSbPFWSZ5GORuubcDIuW5PNlx7aK3.K13FXtDauS1/RDe'
  ),
  (
    'Sub Admin',
    'sub1@tuapp.com',
    '$2b$10$yWjVW3XHhSbPFWSZ5GORuubcDIuW5PNlx7aK3.K13FXtDauS1/RDe'
  )
) v(name, email, password_hash)
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = v.email
);

-- ============================================================
-- USER ROLES
-- ============================================================
INSERT INTO user_roles (id, "userId", "roleId")
SELECT gen_random_uuid(), u.id, r.id
FROM users u
JOIN roles r ON r.name = 'super_admin'
WHERE u.email = 'admin@tuapp.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur."userId" = u.id
    AND ur."roleId" = r.id
);

INSERT INTO user_roles (id, "userId", "roleId")
SELECT gen_random_uuid(), u.id, r.id
FROM users u
JOIN roles r ON r.name = 'sub_admin'
WHERE u.email = 'sub1@tuapp.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur."userId" = u.id
    AND ur."roleId" = r.id
);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (id, name, "isActive")
SELECT gen_random_uuid(), v.name, true
FROM (VALUES
  ('Product A'),
  ('Product B'),
  ('Product C')
) v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.name = v.name
);

-- ============================================================
-- CATEGORY CONFIGS
-- ============================================================
INSERT INTO category_configs (id, "categoryId", "cooldownRules")
SELECT
  gen_random_uuid(),
  c.id,
  jsonb_build_object(
    'website_inquiry', 30,
    'linkedin_inquiry', 60
  )
FROM categories c
WHERE NOT EXISTS (
  SELECT 1 FROM category_configs cc
  WHERE cc."categoryId" = c.id
);

-- ============================================================
-- ACTION PRICES
-- ============================================================
INSERT INTO action_prices (id, role, "actionType", amount)
SELECT gen_random_uuid(), v.role, v.action_type, v.amount
FROM (VALUES
  ('website_researcher',  'website_research',  0.50),
  ('linkedin_researcher', 'linkedin_research', 0.70),
  ('website_inquirer',    'website_inquiry',   1.00),
  ('linkedin_inquirer',   'linkedin_inquiry',  3.00)
) v(role, action_type, amount)
WHERE NOT EXISTS (
  SELECT 1
  FROM action_prices ap
  WHERE ap.role = v.role
    AND ap."actionType" = v.action_type
);

-- ============================================================
-- ROLE METRICS (FIX DEFINITIVO)
-- date IS NOT NULL → SE INSERTA EXPLÍCITAMENTE
-- ============================================================
INSERT INTO role_metrics (
  id,
  "userId",
  role,
  date,
  "totalActions",
  "approvedActions",
  "rejectedActions",
  "flaggedActions"
)
SELECT
  gen_random_uuid(),
  ur."userId"::text,
  r.name,
  CURRENT_DATE,
  0,
  0,
  0,
  0
FROM user_roles ur
JOIN roles r ON r.id = ur."roleId"
WHERE NOT EXISTS (
  SELECT 1
  FROM role_metrics rm
  WHERE rm."userId" = ur."userId"::text
    AND rm.role = r.name
    AND rm.date = CURRENT_DATE
);

COMMIT;