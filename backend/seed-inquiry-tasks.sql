-- Add inquiry tasks for testing
BEGIN;

-- Get a company and create an inquiry task
WITH first_company AS (
  SELECT c.id, c.name, c.domain, c."categoryId"
  FROM companies c
  LIMIT 1
)
INSERT INTO inquiry_tasks (id, "targetId", "categoryId", "assignedToUserId", status)
SELECT 
  gen_random_uuid(),
  c.id,
  c."categoryId",
  (SELECT id FROM users WHERE email = 'web_inq@test.com' LIMIT 1),
  'PENDING'
FROM first_company c
WHERE NOT EXISTS (
  SELECT 1 FROM inquiry_tasks WHERE "targetId" = c.id
);

-- Create inquiry actions for the website inquirer (1 action for website)
WITH task AS (
  SELECT id FROM inquiry_tasks 
  WHERE "assignedToUserId" = (SELECT id FROM users WHERE email = 'web_inq@test.com' LIMIT 1)
  LIMIT 1
)
INSERT INTO inquiry_actions (id, "taskId", "actionIndex", "performedByUserId", status)
SELECT
  gen_random_uuid(),
  t.id,
  1,
  (SELECT id FROM users WHERE email = 'web_inq@test.com' LIMIT 1),
  'PENDING'
FROM task t
WHERE NOT EXISTS (
  SELECT 1 FROM inquiry_actions WHERE "taskId" = t.id AND "actionIndex" = 1
);

-- Create LinkedIn inquiry tasks with 3 actions
WITH first_li_company AS (
  SELECT c.id, c.name, c.domain, c."categoryId"
  FROM companies c
  WHERE domain LIKE '%.jp' OR domain LIKE '%.nl'
  LIMIT 1
)
INSERT INTO inquiry_tasks (id, "targetId", "categoryId", "assignedToUserId", status)
SELECT 
  gen_random_uuid(),
  c.id,
  c."categoryId",
  (SELECT id FROM users WHERE email = 'li_inq@test.com' LIMIT 1),
  'PENDING'
FROM first_li_company c
WHERE NOT EXISTS (
  SELECT 1 FROM inquiry_tasks WHERE "targetId" = c.id AND "assignedToUserId" = (SELECT id FROM users WHERE email = 'li_inq@test.com' LIMIT 1)
);

-- Create 3 actions for LinkedIn inquirer
WITH task AS (
  SELECT id FROM inquiry_tasks 
  WHERE "assignedToUserId" = (SELECT id FROM users WHERE email = 'li_inq@test.com' LIMIT 1)
  LIMIT 1
)
INSERT INTO inquiry_actions (id, "taskId", "actionIndex", "performedByUserId", status)
SELECT
  gen_random_uuid(),
  t.id,
  i.action_num,
  (SELECT id FROM users WHERE email = 'li_inq@test.com' LIMIT 1),
  'PENDING'
FROM task t, (SELECT 1 as action_num UNION SELECT 2 UNION SELECT 3) i
WHERE NOT EXISTS (
  SELECT 1 FROM inquiry_actions WHERE "taskId" = t.id AND "actionIndex" = i.action_num
);

COMMIT;
