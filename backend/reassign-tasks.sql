-- Update 5 tasks from Product A to Solar Leads
-- Update 5 tasks from Product B to Lighting Leads
UPDATE research_tasks
SET "categoryId" = '3985a5d0-537d-495a-8187-cbd51cdb04c7'
WHERE "categoryId" = 'c9d4cbfb-265b-4f7a-b98e-0767098de83f'
  AND id IN (
    SELECT id FROM research_tasks
    WHERE "categoryId" = 'c9d4cbfb-265b-4f7a-b98e-0767098de83f'
    LIMIT 5
  );

UPDATE research_tasks
SET "categoryId" = 'c4197c0f-5862-4852-b23e-4ff249f6a62b'
WHERE "categoryId" = '2aa6cee0-ee80-44b9-b3ae-b01fbba74cf6'
  AND id IN (
    SELECT id FROM research_tasks
    WHERE "categoryId" = '2aa6cee0-ee80-44b9-b3ae-b01fbba74cf6'
    LIMIT 5
  );

-- Check the updated distribution
SELECT 
    c.name as category_name,
    rt.targettype,
    COUNT(*) as task_count
FROM research_tasks rt
JOIN categories c ON rt."categoryId" = c.id
GROUP BY c.name, rt.targettype
ORDER BY c.name, rt.targettype;
