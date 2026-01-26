-- ========================================
-- SEED 3 LINKEDIN RESEARCHER TASKS FOR PRODUCT A
-- ========================================
-- Product A category ID: c9d4cbfb-265b-4f7a-b98e-0767098de83f
-- These tasks will be available for LinkedIn Researcher (li_res@test.com)

INSERT INTO research_tasks (id, "targetId", targettype, "categoryId", status, "createdAt") VALUES
('44444444-4444-4444-4444-000000000001', 'linkedin-product-a-contact-001', 'LINKEDIN_PROFILE', 'c9d4cbfb-265b-4f7a-b98e-0767098de83f', 'PENDING', NOW()),
('44444444-4444-4444-4444-000000000002', 'linkedin-product-a-contact-002', 'LINKEDIN_PROFILE', 'c9d4cbfb-265b-4f7a-b98e-0767098de83f', 'PENDING', NOW()),
('44444444-4444-4444-4444-000000000003', 'linkedin-product-a-contact-003', 'LINKEDIN_PROFILE', 'c9d4cbfb-265b-4f7a-b98e-0767098de83f', 'PENDING', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify the seed
SELECT 'LinkedIn research tasks created for Product A:', COUNT(*) 
FROM research_tasks 
WHERE "categoryId" = 'c9d4cbfb-265b-4f7a-b98e-0767098de83f' 
  AND targettype = 'LINKEDIN_PROFILE';
