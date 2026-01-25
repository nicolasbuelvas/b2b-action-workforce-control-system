-- One-time correction to enforce single source of truth for duplicate flags
-- Rule: Earliest screenshot per hash is NOT duplicate; subsequent ones ARE duplicate.

WITH ranked AS (
  SELECT s.id, s.hash, s.created_at,
         ROW_NUMBER() OVER (PARTITION BY s.hash ORDER BY s.created_at ASC, s.id ASC) AS rn
  FROM screenshots s
)
UPDATE screenshots x
SET is_duplicate = CASE WHEN r.rn = 1 THEN false ELSE true END
FROM ranked r
WHERE x.id = r.id;

-- Align inquiry_submission_snapshots with screenshot metadata
UPDATE inquiry_submission_snapshots snap
SET is_duplicate = s.is_duplicate
FROM screenshots s
WHERE s.action_id = snap.inquiry_action_id;

-- Report counts after correction
SELECT 'Correction complete' AS status;
SELECT COUNT(*) FILTER (WHERE is_duplicate = true) AS true_count,
       COUNT(*) FILTER (WHERE is_duplicate = false) AS false_count
FROM screenshots;
