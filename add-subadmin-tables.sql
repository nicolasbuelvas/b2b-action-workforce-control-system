-- Create company_types table
CREATE TABLE IF NOT EXISTS company_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create job_types table
CREATE TABLE IF NOT EXISTS job_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create disapproval_reasons table
CREATE TABLE IF NOT EXISTS disapproval_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  "applicableTo" VARCHAR DEFAULT 'both',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default company types
INSERT INTO company_types (name, description) VALUES
  ('Solar Lighting EPC', 'Solar and lighting engineering, procurement and construction'),
  ('SaaS', 'Software as a Service companies'),
  ('Manufacturing', 'Manufacturing and production companies'),
  ('Consulting', 'Consulting and professional services'),
  ('Individual / Freelancer', 'Individual contractors and freelancers')
ON CONFLICT DO NOTHING;

-- Insert default job types
INSERT INTO job_types (name, description) VALUES
  ('CEO', 'Chief Executive Officer'),
  ('Project Manager', 'Project management roles'),
  ('Engineering Manager', 'Engineering and technical management'),
  ('Operations Manager', 'Operations and logistics management'),
  ('Sales Manager', 'Sales and business development')
ON CONFLICT DO NOTHING;

-- Insert default disapproval reasons
INSERT INTO disapproval_reasons (reason, description, "applicableTo") VALUES
  ('Incomplete Information', 'Missing required data or information', 'both'),
  ('Invalid URL', 'URL is not accessible or incorrect', 'research'),
  ('Poor Screenshot Quality', 'Screenshot is unclear or not showing required information', 'inquiry'),
  ('Suspicious Activity', 'Potential fraudulent or suspicious behavior', 'both')
ON CONFLICT DO NOTHING;
