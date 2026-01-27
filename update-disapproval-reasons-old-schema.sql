-- Script to replace all disapproval reasons with new standardized ones
-- This script works with the OLD schema (using applicableTo column)
-- Run this in the PostgreSQL database

-- Step 1: Delete all existing disapproval reasons
DELETE FROM disapproval_reasons;

-- Step 2: Insert new disapproval/rejection reasons
-- Note: Using old schema format with applicableTo column
-- Format: reason is short name, description is the full text

-- REJECTION REASONS
INSERT INTO disapproval_reasons (reason, description, "applicableTo", "isActive", "createdAt", "updatedAt") VALUES
('Wrong Industry/Role', 'Company / contact is not part of the targeted industry or role', 'both', true, NOW(), NOW()),
('Invalid/Broken Link', 'Invalid or broken link (website or LinkedIn profile does not open)', 'both', true, NOW(), NOW()),
('Wrong Country/Language', 'Country or language does not match task requirements', 'both', true, NOW(), NOW()),
('Duplicate Data', 'Repeated data already exists in the system', 'research', true, NOW(), NOW()),
('Invalid Screenshot', 'Screenshot does not prove the required outreach action', 'inquiry', true, NOW(), NOW());

-- FLAG / SUSPICIOUS ACTIVITY REASONS
INSERT INTO disapproval_reasons (reason, description, "applicableTo", "isActive", "createdAt", "updatedAt") VALUES
('Fabricated Data', 'Data looks copied, fabricated, or auto-generated', 'research', true, NOW(), NOW()),
('Data Mismatch', 'Mismatch between submitted data and screenshot evidence', 'inquiry', true, NOW(), NOW()),
('Reused Screenshot', 'Same screenshot or pattern reused across multiple tasks', 'inquiry', true, NOW(), NOW()),
('Unusual Volume', 'Unusual speed or volume of submissions for this role', 'both', true, NOW(), NOW()),
('System Bypass', 'Attempt to bypass system rules (blacklist, required fields, steps)', 'both', true, NOW(), NOW());

-- Verify the insertion
SELECT id, reason, description, "applicableTo", "isActive" FROM disapproval_reasons ORDER BY id;
