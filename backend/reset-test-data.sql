-- ===============================
-- RESET TEST DATA
-- ===============================
-- Creates minimal research tasks with only URLs/domains
-- Workers must complete the rest during research

BEGIN;

-- ===============================
-- DELETE ALL EXISTING TASKS
-- ===============================

DELETE FROM inquiry_actions;
DELETE FROM outreach_records;
DELETE FROM inquiry_tasks;
DELETE FROM research_submissions;
DELETE FROM research_tasks;
DELETE FROM companies;

-- ===============================
-- CREATE MINIMAL WEBSITE RESEARCH TASKS
-- ===============================

DO $$
DECLARE
  cat_record RECORD;
  company_id UUID;
  research_task_id UUID;
  i INT;
  cat_idx INT := 0;
  domain_name TEXT;
BEGIN
  -- For each category except no_work
  FOR cat_record IN 
    SELECT id, name FROM categories WHERE name != 'no_work'
  LOOP
    cat_idx := cat_idx + 1;
    
    -- Create 10 tasks per category
    FOR i IN 1..10 LOOP
      -- Create company with minimal data (only domain - researcher fills the rest)
      company_id := uuid_generate_v4();
      
      domain_name := CASE i
        WHEN 1 THEN 'microsoft-cat' || cat_idx || '.com'
        WHEN 2 THEN 'apple-cat' || cat_idx || '.com'
        WHEN 3 THEN 'amazon-cat' || cat_idx || '.com'
        WHEN 4 THEN 'google-cat' || cat_idx || '.com'
        WHEN 5 THEN 'meta-cat' || cat_idx || '.com'
        WHEN 6 THEN 'tesla-cat' || cat_idx || '.com'
        WHEN 7 THEN 'netflix-cat' || cat_idx || '.com'
        WHEN 8 THEN 'adobe-cat' || cat_idx || '.com'
        WHEN 9 THEN 'salesforce-cat' || cat_idx || '.com'
        WHEN 10 THEN 'oracle-cat' || cat_idx || '.com'
      END;
      
      INSERT INTO companies (id, name, domain, "normalizedDomain", country, "createdAt")
      VALUES (
        company_id,
        'Pending Research',
        domain_name,
        domain_name,
        'Unknown',
        NOW()
      );
      
      -- Create research task (PENDING - waiting for researcher)
      research_task_id := uuid_generate_v4();
      
      INSERT INTO research_tasks (id, "targetId", "targettype", "categoryId", status, "assignedToUserId", "createdAt")
      VALUES (
        research_task_id,
        company_id,
        'COMPANY',
        cat_record.id,
        'PENDING',
        NULL,
        NOW() - INTERVAL '1 day' * i
      );
      
    END LOOP;
  END LOOP;
END $$;

-- ===============================
-- CREATE MINIMAL LINKEDIN RESEARCH TASKS
-- ===============================

DO $$
DECLARE
  cat_record RECORD;
  research_task_id UUID;
  i INT;
  cat_idx INT := 0;
  linkedin_url TEXT;
BEGIN
  -- For each category except no_work
  FOR cat_record IN 
    SELECT id, name FROM categories WHERE name != 'no_work'
  LOOP
    cat_idx := cat_idx + 1;
    
    -- Create 10 LinkedIn tasks per category
    FOR i IN 1..10 LOOP
      research_task_id := uuid_generate_v4();
      
      linkedin_url := CASE i
        WHEN 1 THEN 'https://www.linkedin.com/in/satyanadella-cat' || cat_idx
        WHEN 2 THEN 'https://www.linkedin.com/in/tim-cook-cat' || cat_idx
        WHEN 3 THEN 'https://www.linkedin.com/in/andy-jassy-cat' || cat_idx
        WHEN 4 THEN 'https://www.linkedin.com/in/sundar-pichai-cat' || cat_idx
        WHEN 5 THEN 'https://www.linkedin.com/in/zuck-cat' || cat_idx
        WHEN 6 THEN 'https://www.linkedin.com/in/elon-musk-cat' || cat_idx
        WHEN 7 THEN 'https://www.linkedin.com/in/reed-hastings-cat' || cat_idx
        WHEN 8 THEN 'https://www.linkedin.com/in/shantanu-narayen-cat' || cat_idx
        WHEN 9 THEN 'https://www.linkedin.com/in/marc-benioff-cat' || cat_idx
        WHEN 10 THEN 'https://www.linkedin.com/in/safra-catz-cat' || cat_idx
      END;
      
      INSERT INTO research_tasks (id, "targetId", "targettype", "categoryId", status, "assignedToUserId", "createdAt")
      VALUES (
        research_task_id,
        linkedin_url,
        'LINKEDIN',
        cat_record.id,
        'PENDING',
        NULL,
        NOW() - INTERVAL '1 day' * i
      );
      
    END LOOP;
  END LOOP;
END $$;

COMMIT;
