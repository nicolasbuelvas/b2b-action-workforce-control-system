-- Assign all 3 researchers to Solar Leads and Lighting Leads categories
INSERT INTO user_categories ("userId", "categoryId")
VALUES
    -- web_res@test.com to Solar Leads
    ('6b574454-b97b-43f3-a0d1-c80269ccb579', '3985a5d0-537d-495a-8187-cbd51cdb04c7'),
    -- web_res@test.com to Lighting Leads
    ('6b574454-b97b-43f3-a0d1-c80269ccb579', 'c4197c0f-5862-4852-b23e-4ff249f6a62b'),
    -- web_res3@test.com to Solar Leads
    ('233e7679-1a7c-4985-a9a2-1f953a284bb2', '3985a5d0-537d-495a-8187-cbd51cdb04c7'),
    -- web_res3@test.com to Lighting Leads
    ('233e7679-1a7c-4985-a9a2-1f953a284bb2', 'c4197c0f-5862-4852-b23e-4ff249f6a62b'),
    -- li_res@test.com to Solar Leads
    ('974c271a-9ae5-4433-b169-237f8edb396f', '3985a5d0-537d-495a-8187-cbd51cdb04c7'),
    -- li_res@test.com to Lighting Leads  
    ('974c271a-9ae5-4433-b169-237f8edb396f', 'c4197c0f-5862-4852-b23e-4ff249f6a62b')
ON CONFLICT DO NOTHING;

-- Verify the assignments
SELECT u.email, c.name as category
FROM user_categories uc
JOIN users u ON uc."userId" = u.id
JOIN categories c ON uc."categoryId" = c.id
ORDER BY u.email, c.name;
