-- Add metadata columns to research_tasks
ALTER TABLE research_tasks ADD COLUMN IF NOT EXISTS job_type_id UUID;
ALTER TABLE research_tasks ADD COLUMN IF NOT EXISTS company_type_id UUID;
ALTER TABLE research_tasks ADD COLUMN IF NOT EXISTS language VARCHAR;

-- Add foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_research_tasks_job_type'
    ) THEN
        ALTER TABLE research_tasks 
        ADD CONSTRAINT fk_research_tasks_job_type 
        FOREIGN KEY (job_type_id) REFERENCES job_types(id) ON DELETE SET NULL;
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_research_tasks_company_type'
    ) THEN
        ALTER TABLE research_tasks 
        ADD CONSTRAINT fk_research_tasks_company_type 
        FOREIGN KEY (company_type_id) REFERENCES company_types(id) ON DELETE SET NULL;
    END IF;
END$$;

-- Add metadata columns to linkedin_profiles
ALTER TABLE linkedin_profiles ADD COLUMN IF NOT EXISTS contact_name VARCHAR;
ALTER TABLE linkedin_profiles ADD COLUMN IF NOT EXISTS country VARCHAR;
ALTER TABLE linkedin_profiles ADD COLUMN IF NOT EXISTS language VARCHAR;
