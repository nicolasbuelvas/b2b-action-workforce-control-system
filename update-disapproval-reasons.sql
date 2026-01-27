-- Script to replace all disapproval reasons with new standardized ones
-- Run this in the PostgreSQL database

-- Step 1: Delete all existing disapproval reasons
DELETE FROM disapproval_reasons;

-- Step 2: Insert new disapproval/rejection reasons
INSERT INTO disapproval_reasons (id, reason, description, "reasonType", "applicableRoles", "categoryIds", "isActive", "createdAt", "updatedAt") VALUES

-- REJECTION REASONS
('rej-001', 'Wrong Industry/Role', 'Company / contact is not part of the targeted industry or role', 'rejection', 
 ARRAY['website_research_auditor', 'website_inquirer_auditor', 'linkedin_research_auditor', 'linkedin_inquirer_auditor'], 
 ARRAY[]::text[], true, NOW(), NOW()),

('rej-002', 'Invalid/Broken Link', 'Invalid or broken link (website or LinkedIn profile does not open)', 'rejection', 
 ARRAY['website_research_auditor', 'website_inquirer_auditor', 'linkedin_research_auditor', 'linkedin_inquirer_auditor'], 
 ARRAY[]::text[], true, NOW(), NOW()),

('rej-003', 'Wrong Country/Language', 'Country or language does not match task requirements', 'rejection', 
 ARRAY['website_research_auditor', 'website_inquirer_auditor', 'linkedin_research_auditor', 'linkedin_inquirer_auditor'], 
 ARRAY[]::text[], true, NOW(), NOW()),

('rej-004', 'Duplicate Data', 'Repeated data already exists in the system', 'rejection', 
 ARRAY['website_research_auditor', 'linkedin_research_auditor'], 
 ARRAY[]::text[], true, NOW(), NOW()),

('rej-005', 'Invalid Screenshot', 'Screenshot does not prove the required outreach action', 'rejection', 
 ARRAY['website_inquirer_auditor', 'linkedin_inquirer_auditor'], 
 ARRAY[]::text[], true, NOW(), NOW()),

-- FLAG / SUSPICIOUS ACTIVITY REASONS
('flag-001', 'Fabricated Data', 'Data looks copied, fabricated, or auto-generated', 'flag', 
 ARRAY['website_research_auditor', 'linkedin_research_auditor'], 
 ARRAY[]::text[], true, NOW(), NOW()),

('flag-002', 'Data Mismatch', 'Mismatch between submitted data and screenshot evidence', 'flag', 
 ARRAY['website_inquirer_auditor', 'linkedin_inquirer_auditor'], 
 ARRAY[]::text[], true, NOW(), NOW()),

('flag-003', 'Reused Screenshot', 'Same screenshot or pattern reused across multiple tasks', 'flag', 
 ARRAY['website_inquirer_auditor', 'linkedin_inquirer_auditor'], 
 ARRAY[]::text[], true, NOW(), NOW()),

('flag-004', 'Unusual Volume', 'Unusual speed or volume of submissions for this role', 'flag', 
 ARRAY['website_research_auditor', 'website_inquirer_auditor', 'linkedin_research_auditor', 'linkedin_inquirer_auditor'], 
 ARRAY[]::text[], true, NOW(), NOW()),

('flag-005', 'System Bypass', 'Attempt to bypass system rules (blacklist, required fields, steps)', 'flag', 
 ARRAY['website_research_auditor', 'website_inquirer_auditor', 'linkedin_research_auditor', 'linkedin_inquirer_auditor'], 
 ARRAY[]::text[], true, NOW(), NOW());

-- Verify the insertion
SELECT id, description, "reasonType", "applicableRoles", "isActive" FROM disapproval_reasons ORDER BY "reasonType", id;
