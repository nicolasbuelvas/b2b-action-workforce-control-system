SELECT 
  rt.id,
  rt.targettype,
  rt.status,
  rt."targetId",
  rt."categoryId",
  rt."assignedToUserId",
  rs.language,
  rs.country,
  rs.contact_name,
  rs.email,
  rs.phone,
  u.email as researcher_email
FROM research_tasks rt
LEFT JOIN research_submissions rs ON rt.id = rs.researchtaskid
LEFT JOIN users u ON rt."assignedToUserId" = u.id
WHERE rt.status = 'SUBMITTED' AND rt.targettype = 'COMPANY'
LIMIT 1;
