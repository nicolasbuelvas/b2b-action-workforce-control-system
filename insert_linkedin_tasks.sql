INSERT INTO research_tasks ("targetId", "categoryId", status, "assignedToUserId", targettype)
SELECT CONCAT('https://www.linkedin.com/search/results/people/?keywords=', REPLACE(name, ' ', '%20')) AS targetId,
       c.id::text AS categoryId,
       'PENDING' AS status,
       NULL AS assignedToUserId,
       'LINKEDIN' AS targettype
FROM categories c
WHERE name != 'No Work'
  AND NOT EXISTS (
    SELECT 1 FROM research_tasks rt
    WHERE rt."categoryId" = c.id::text
      AND rt.targettype = 'LINKEDIN'
  );
