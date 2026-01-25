-- ============================================================================
-- CREATE 3 NEW CLEAN RESEARCH TASKS for Product A category
-- These tasks will be available for website_researcher role
-- ============================================================================

-- Define constants
WITH constants AS (
  SELECT 
    'c9d4cbfb-265b-4f7a-b98e-0767098de83f'::uuid as product_a_id,
    'COMPANY' as targettype,
    'PENDING' as initial_status
),
company_ids AS (
  SELECT id FROM companies 
  WHERE id IN (
    '11111111-1111-1111-1111-000000000003'::uuid,  -- First Solar
    '11111111-1111-1111-1111-000000000004'::uuid,  -- Canadian Solar
    '11111111-1111-1111-1111-000000000006'::uuid   -- Orsted
  )
  ORDER BY id
)
INSERT INTO research_tasks ("targetId", "categoryId", status, targettype)
SELECT 
  CAST(c.id AS VARCHAR),
  (SELECT product_a_id FROM constants)::varchar,
  (SELECT initial_status FROM constants)::research_tasks_status_enum,
  (SELECT targettype FROM constants)
FROM company_ids c
ON CONFLICT DO NOTHING;

-- Verify creation
SELECT 'New Research Tasks Created:' AS status;
SELECT 'Total research_tasks count: ' || COUNT(*)::TEXT FROM research_tasks;
SELECT 'Product A tasks: ' || COUNT(*)::TEXT FROM research_tasks 
WHERE "categoryId" = 'c9d4cbfb-265b-4f7a-b98e-0767098de83f'::varchar;

-- Show the new tasks with company details
SELECT 
  rt.id,
  c.name as company_name,
  rt.status,
  rt.targettype,
  rt."createdAt"
FROM research_tasks rt
JOIN companies c ON rt."targetId" = CAST(c.id AS VARCHAR)
WHERE rt."categoryId" = 'c9d4cbfb-265b-4f7a-b98e-0767098de83f'::varchar
ORDER BY rt."createdAt" DESC;

SELECT '✓ New research tasks ready for website_researcher' AS result;
