SELECT 
  rt.id as task_id,
  rt.targettype,
  rt.status,
  rt."categoryId",
  c.name as category_name,
  rt."assignedToUserId",
  u.name as worker_name,
  u.email as worker_email,
  co.name as company_name,
  co.domain as company_domain,
  co.country as company_country,
  rs.language,
  rs.country as submission_country
FROM research_tasks rt
LEFT JOIN categories c ON rt."categoryId" = c.id
LEFT JOIN users u ON rt."assignedToUserId" = u.id
LEFT JOIN companies co ON rt."targetId" = co.id
LEFT JOIN research_submissions rs ON rt.id = rs.researchtaskid
WHERE rt.status = 'SUBMITTED' 
  AND rt.targettype = 'COMPANY'
LIMIT 1;
