ALTER TABLE inquiry_tasks ADD COLUMN IF NOT EXISTS research_task_id UUID;
CREATE INDEX IF NOT EXISTS idx_inquiry_tasks_research_task_id ON inquiry_tasks(research_task_id);
ALTER TABLE inquiry_submission_snapshots ADD COLUMN IF NOT EXISTS research_task_id UUID;
CREATE INDEX IF NOT EXISTS idx_inquiry_submission_snapshots_research_task_id ON inquiry_submission_snapshots(research_task_id);
INSERT INTO migrations (timestamp, name) VALUES (1769343110616, 'AddResearchTaskIdToInquiryTasks1769343110616') ON CONFLICT DO NOTHING;
INSERT INTO migrations (timestamp, name) VALUES (1769343173751, 'AddResearchTaskIdToInquirySubmissionSnapshots1769343173751') ON CONFLICT DO NOTHING;
SELECT 'Migrations applied successfully' AS result;
