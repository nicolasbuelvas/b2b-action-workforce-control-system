-- Complete migration and data update for disapproval reasons
-- Step 1: Run the migration to update schema

-- Drop old column
ALTER TABLE disapproval_reasons DROP COLUMN IF EXISTS "applicableTo";
DROP TYPE IF EXISTS "public"."disapproval_reasons_applicableto_enum";

-- Create new enum type
CREATE TYPE "public"."disapproval_reasons_reasontype_enum" AS ENUM('rejection', 'flag');

-- Add new columns
ALTER TABLE disapproval_reasons ADD COLUMN IF NOT EXISTS "reasonType" "public"."disapproval_reasons_reasontype_enum" NOT NULL DEFAULT 'rejection';
ALTER TABLE disapproval_reasons ADD COLUMN IF NOT EXISTS "applicableRoles" text[] NOT NULL DEFAULT '{}';
ALTER TABLE disapproval_reasons ADD COLUMN IF NOT EXISTS "categoryIds" text[] NOT NULL DEFAULT '{}';

-- Step 2: Delete all existing data
DELETE FROM disapproval_reasons;

-- Step 3: Insert new standardized reasons

-- REJECTION REASONS (5)
INSERT INTO disapproval_reasons (reason, description, "reasonType", "applicableRoles", "categoryIds", "isActive", "createdAt", "updatedAt") VALUES
('Wrong Industry/Role', 'Company / contact is not part of the targeted industry or role', 'rejection', 
 ARRAY['website_research_auditor', 'website_inquirer_auditor', 'linkedin_research_auditor', 'linkedin_inquirer_auditor'], '{}', true, NOW(), NOW()),
 
('Invalid/Broken Link', 'Invalid or broken link (website or LinkedIn profile does not open)', 'rejection', 
 ARRAY['website_research_auditor', 'website_inquirer_auditor', 'linkedin_research_auditor', 'linkedin_inquirer_auditor'], '{}', true, NOW(), NOW()),
 
('Wrong Country/Language', 'Country or language does not match task requirements', 'rejection', 
 ARRAY['website_research_auditor', 'website_inquirer_auditor', 'linkedin_research_auditor', 'linkedin_inquirer_auditor'], '{}', true, NOW(), NOW()),
 
('Duplicate Data', 'Repeated data already exists in the system', 'rejection', 
 ARRAY['website_research_auditor', 'linkedin_research_auditor'], '{}', true, NOW(), NOW()),
 
('Invalid Screenshot', 'Screenshot does not prove the required outreach action', 'rejection', 
 ARRAY['website_inquirer_auditor', 'linkedin_inquirer_auditor'], '{}', true, NOW(), NOW());

-- FLAG / SUSPICIOUS ACTIVITY REASONS (5)
INSERT INTO disapproval_reasons (reason, description, "reasonType", "applicableRoles", "categoryIds", "isActive", "createdAt", "updatedAt") VALUES
('Fabricated Data', 'Data looks copied, fabricated, or auto-generated', 'flag', 
 ARRAY['website_research_auditor', 'linkedin_research_auditor'], '{}', true, NOW(), NOW()),
 
('Data Mismatch', 'Mismatch between submitted data and screenshot evidence', 'flag', 
 ARRAY['website_inquirer_auditor', 'linkedin_inquirer_auditor'], '{}', true, NOW(), NOW()),
 
('Reused Screenshot', 'Same screenshot or pattern reused across multiple tasks', 'flag', 
 ARRAY['website_inquirer_auditor', 'linkedin_inquirer_auditor'], '{}', true, NOW(), NOW()),
 
('Unusual Volume', 'Unusual speed or volume of submissions for this role', 'flag', 
 ARRAY['website_research_auditor', 'website_inquirer_auditor', 'linkedin_research_auditor', 'linkedin_inquirer_auditor'], '{}', true, NOW(), NOW()),
 
('System Bypass', 'Attempt to bypass system rules (blacklist, required fields, steps)', 'flag', 
 ARRAY['website_research_auditor', 'website_inquirer_auditor', 'linkedin_research_auditor', 'linkedin_inquirer_auditor'], '{}', true, NOW(), NOW());

-- Verify the data
SELECT id, reason, description, "reasonType", "applicableRoles", "isActive" FROM disapproval_reasons ORDER BY "reasonType", reason;
