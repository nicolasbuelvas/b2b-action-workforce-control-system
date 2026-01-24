SELECT COUNT(*) as null_action_type FROM cooldown_records WHERE actionType IS NULL;
SELECT COUNT(*) as total_records FROM cooldown_records;
SELECT id, actionType FROM cooldown_records ORDER BY "createdAt" DESC LIMIT 3;
