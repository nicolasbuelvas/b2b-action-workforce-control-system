-- ========================================
-- SEED NEW TEST TASKS (20 TOTAL)
-- ========================================
-- This script creates realistic test tasks for the B2B Action Workforce system
-- 10 Website Researcher tasks (COMPANY type)
-- 10 LinkedIn Researcher tasks (LINKEDIN_PROFILE type)

-- First, create companies for website researcher tasks
INSERT INTO companies (id, domain, "normalizedDomain", name, country, "createdAt") VALUES
('11111111-1111-1111-1111-000000000001', 'tesla.com', 'tesla.com', 'Tesla Inc.', 'USA', NOW()),
('11111111-1111-1111-1111-000000000002', 'enphase.com', 'enphase.com', 'Enphase Energy', 'USA', NOW()),
('11111111-1111-1111-1111-000000000003', 'firstsolar.com', 'firstsolar.com', 'First Solar', 'USA', NOW()),
('11111111-1111-1111-1111-000000000004', 'canadiansolar.com', 'canadiansolar.com', 'Canadian Solar', 'Canada', NOW()),
('11111111-1111-1111-1111-000000000005', 'vestas.com', 'vestas.com', 'Vestas Wind Systems', 'Denmark', NOW()),
('11111111-1111-1111-1111-000000000006', 'orsted.com', 'orsted.com', 'Ørsted', 'Denmark', NOW()),
('11111111-1111-1111-1111-000000000007', 'sunpower.com', 'sunpower.com', 'SunPower Corporation', 'USA', NOW()),
('11111111-1111-1111-1111-000000000008', 'siemens-energy.com', 'siemens-energy.com', 'Siemens Energy', 'Germany', NOW()),
('11111111-1111-1111-1111-000000000009', 'trinasolar.com', 'trinasolar.com', 'Trina Solar', 'China', NOW()),
('11111111-1111-1111-1111-000000000010', 'longi.com', 'longi.com', 'LONGi Green Energy', 'China', NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- WEBSITE RESEARCHER TASKS (10)
-- ========================================
-- Use Solar Leads category: 3985a5d0-537d-495a-8187-cbd51cdb04c7
INSERT INTO research_tasks (id, "targetId", targettype, "categoryId", status, "createdAt") VALUES
('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000001', 'COMPANY', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('22222222-2222-2222-2222-000000000002', '11111111-1111-1111-1111-000000000002', 'COMPANY', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('22222222-2222-2222-2222-000000000003', '11111111-1111-1111-1111-000000000003', 'COMPANY', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('22222222-2222-2222-2222-000000000004', '11111111-1111-1111-1111-000000000004', 'COMPANY', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('22222222-2222-2222-2222-000000000005', '11111111-1111-1111-1111-000000000005', 'COMPANY', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('22222222-2222-2222-2222-000000000006', '11111111-1111-1111-1111-000000000006', 'COMPANY', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('22222222-2222-2222-2222-000000000007', '11111111-1111-1111-1111-000000000007', 'COMPANY', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('22222222-2222-2222-2222-000000000008', '11111111-1111-1111-1111-000000000008', 'COMPANY', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('22222222-2222-2222-2222-000000000009', '11111111-1111-1111-1111-000000000009', 'COMPANY', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('22222222-2222-2222-2222-000000000010', '11111111-1111-1111-1111-000000000010', 'COMPANY', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- LINKEDIN RESEARCHER TASKS (10)
-- ========================================
-- Use Solar Leads category: 3985a5d0-537d-495a-8187-cbd51cdb04c7
-- These use simple string IDs as targetId (LinkedIn profile URLs are stored in task metadata, not as separate entities)
INSERT INTO research_tasks (id, "targetId", targettype, "categoryId", status, "createdAt") VALUES
('33333333-3333-3333-3333-000000000001', 'linkedin-john-doe-solar', 'LINKEDIN_PROFILE', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('33333333-3333-3333-3333-000000000002', 'linkedin-maria-garcia-renewables', 'LINKEDIN_PROFILE', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('33333333-3333-3333-3333-000000000003', 'linkedin-david-smith-energy', 'LINKEDIN_PROFILE', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('33333333-3333-3333-3333-000000000004', 'linkedin-ana-rodriguez-cleantech', 'LINKEDIN_PROFILE', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('33333333-3333-3333-3333-000000000005', 'linkedin-carlos-mendez-solar', 'LINKEDIN_PROFILE', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('33333333-3333-3333-3333-000000000006', 'linkedin-sarah-johnson-renewable', 'LINKEDIN_PROFILE', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('33333333-3333-3333-3333-000000000007', 'linkedin-luis-fernandez-energy', 'LINKEDIN_PROFILE', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('33333333-3333-3333-3333-000000000008', 'linkedin-emily-watson-sustainability', 'LINKEDIN_PROFILE', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('33333333-3333-3333-3333-000000000009', 'linkedin-robert-klein-solar', 'LINKEDIN_PROFILE', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW()),
('33333333-3333-3333-3333-000000000010', 'linkedin-paula-gomez-renewables', 'LINKEDIN_PROFILE', '3985a5d0-537d-495a-8187-cbd51cdb04c7', 'PENDING', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify the seed
SELECT 'Companies created:', COUNT(*) FROM companies WHERE id LIKE '11111111-1111-1111-1111-%';
SELECT 'Website research tasks created:', COUNT(*) FROM research_tasks WHERE id LIKE '22222222-2222-2222-2222-%';
SELECT 'LinkedIn research tasks created:', COUNT(*) FROM research_tasks WHERE id LIKE '33333333-3333-3333-3333-%';
SELECT 'Total research tasks:', COUNT(*) FROM research_tasks;
