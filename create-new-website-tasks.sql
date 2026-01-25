-- Create 3 NEW research tasks for Product A category (website_researcher role)
-- Using companies: SunPower Corporation, Siemens Energy, Trina Solar

WITH constants AS (
  SELECT 
    'c9d4cbfb-265b-4f7a-b98e-0767098de83f'::varchar as product_a_id,
    'COMPANY'::varchar as targettype,
    'PENDING'::research_tasks_status_enum as initial_status
),
selected_companies AS (
  SELECT id FROM companies 
  WHERE id IN (
    '11111111-1111-1111-1111-000000000007'::uuid,  -- SunPower Corporation
    '11111111-1111-1111-1111-000000000008'::uuid,  -- Siemens Energy
    '11111111-1111-1111-1111-000000000009'::uuid   -- Trina Solar
  )
  ORDER BY id
)
INSERT INTO research_tasks ("targetId", "categoryId", status, targettype)
SELECT 
  CAST(c.id AS VARCHAR),
  (SELECT product_a_id FROM constants),
  (SELECT initial_status FROM constants),
  (SELECT targettype FROM constants)
FROM selected_companies c
ON CONFLICT DO NOTHING;

-- Verify creation
SELECT 'New Research Tasks Created for Product A:' AS status;
SELECT rt.id, c.name as company_name, rt.status, rt.targettype, rt."createdAt"
FROM research_tasks rt
JOIN companies c ON rt."targetId" = CAST(c.id AS VARCHAR)
WHERE rt."categoryId" = 'c9d4cbfb-265b-4f7a-b98e-0767098de83f'::varchar
ORDER BY rt."createdAt" DESC
LIMIT 3;

SELECT 'Total research tasks in Product A: ' || COUNT(*)::TEXT
FROM research_tasks 
WHERE "categoryId" = 'c9d4cbfb-265b-4f7a-b98e-0767098de83f'::varchar;
