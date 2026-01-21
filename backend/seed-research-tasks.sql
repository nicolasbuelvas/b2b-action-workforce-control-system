-- Seed companies for research tasks
INSERT INTO companies (name, domain, "normalizedDomain", country)
VALUES 
  ('Example Corp', 'example.com', 'example.com', 'US'),
  ('Tech Startup Ltd', 'techstartup.io', 'techstartup.io', 'UK'),
  ('Global Solutions Inc', 'globalsolutions.net', 'globalsolutions.net', 'CA'),
  ('Innovation Labs', 'innovationlabs.com', 'innovationlabs.com', 'US'),
  ('Digital Agency Pro', 'digitalagency.io', 'digitalagency.io', 'AU'),
  ('Cloud Services Co', 'cloudservices.com', 'cloudservices.com', 'US'),
  ('Data Analytics Plus', 'dataanalytics.com', 'dataanalytics.com', 'DE'),
  ('Mobile Apps Studio', 'mobileapps.io', 'mobileapps.io', 'FR'),
  ('Web Design Hub', 'webdesign.com', 'webdesign.com', 'ES'),
  ('Software Consulting', 'softwareconsult.com', 'softwareconsult.com', 'IT')
ON CONFLICT ("normalizedDomain") DO NOTHING;

-- Get company IDs and create research tasks
DO $$
DECLARE
  company_record RECORD;
  category_record RECORD;
  task_count INTEGER := 0;
BEGIN
  FOR company_record IN 
    SELECT id FROM companies LIMIT 10
  LOOP
    FOR category_record IN 
      SELECT id FROM categories WHERE "isActive" = true LIMIT 2
    LOOP
      -- Create a research task for each company-category combination
      INSERT INTO research_tasks ("targetId", "categoryId", status, targettype)
      VALUES (company_record.id, category_record.id, 'PENDING', 'COMPANY');
      
      task_count := task_count + 1;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Created % research tasks', task_count;
END $$;
