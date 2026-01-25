-- Check relationship between research_tasks, inquiry_tasks, and companies
SELECT 
  rt.id as research_task_id,
  rt."targetId",
  rt.status as research_status,
  it.id as inquiry_task_id,
  it.status as inquiry_status,
  it."targetId" as inquiry_targetId,
  c.name as company_name,
  c.domain,
  c.country
FROM research_tasks rt
LEFT JOIN inquiry_tasks it ON rt.id = it."targetId"
LEFT JOIN companies c ON rt."targetId" = c.id
LIMIT 10;
