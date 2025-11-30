-- Database initialization script for AI-First CRM HCP Module
-- This script creates tables, indexes, and populates sample data

-- Create HCPs table
CREATE TABLE IF NOT EXISTS hcps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    hospital VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Interactions table
CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    hcp_id INTEGER REFERENCES hcps(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL,
    notes TEXT NOT NULL,
    products_discussed VARCHAR(500),
    follow_up_required BOOLEAN DEFAULT FALSE,
    followup_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hcps_name ON hcps(name);
CREATE INDEX IF NOT EXISTS idx_hcps_specialty ON hcps(specialty);
CREATE INDEX IF NOT EXISTS idx_interactions_hcp_id ON interactions(hcp_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at DESC);

-- Insert sample HCPs (only if table is empty)
INSERT INTO hcps (name, specialty, hospital, email, phone) 
SELECT * FROM (VALUES
    ('John Smith', 'Cardiology', 'City General Hospital', 'john.smith@citygeneral.com', '+1-555-0101'),
    ('Sarah Johnson', 'Endocrinology', 'Metro Medical Center', 'sarah.johnson@metromedical.com', '+1-555-0102'),
    ('Michael Chen', 'Oncology', 'Regional Cancer Institute', 'michael.chen@rci.org', '+1-555-0103'),
    ('Emily Williams', 'Neurology', 'Brain & Spine Clinic', 'emily.williams@brainspine.com', '+1-555-0104'),
    ('David Martinez', 'Rheumatology', 'Joint Care Center', 'david.martinez@jointcare.com', '+1-555-0105'),
    ('Lisa Anderson', 'Gastroenterology', 'Digestive Health Hospital', 'lisa.anderson@digestivehealth.com', '+1-555-0106'),
    ('Robert Taylor', 'Pulmonology', 'Respiratory Care Institute', 'robert.taylor@respcare.org', '+1-555-0107'),
    ('Jennifer Brown', 'Dermatology', 'Skin Health Clinic', 'jennifer.brown@skinhealth.com', '+1-555-0108')
) AS v(name, specialty, hospital, email, phone)
WHERE NOT EXISTS (SELECT 1 FROM hcps LIMIT 1);

-- Insert sample interactions (only if table is empty)
INSERT INTO interactions (hcp_id, interaction_type, notes, products_discussed, follow_up_required, created_at)
SELECT * FROM (VALUES
    (1, 'visit', 'Discussed new cardiovascular drug trials. Dr. Smith showed high interest in efficacy data for hypertension patients. Requested detailed clinical study results.', 'CardioMax, HeartGuard', true, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (2, 'call', 'Phone consultation about diabetes management solutions. Dr. Johnson interested in latest glucose monitoring technology and patient compliance tools.', 'GlucoControl, DiabetesCare Pro', false, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (3, 'email', 'Responded to inquiry about oncology drug side effects. Provided comprehensive documentation on patient safety profiles and clinical outcomes.', 'OncoSafe, CancerGuard', true, CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (1, 'webinar', 'Attended product webinar on cardiovascular innovations. Asked detailed questions about drug interactions and contraindications.', 'CardioMax', false, CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (4, 'visit', 'In-person meeting to discuss neurological disorder treatments. Dr. Williams very receptive to new Alzheimer disease therapies.', 'NeuroPlus, BrainCare', true, CURRENT_TIMESTAMP - INTERVAL '3 days')
) AS v(hcp_id, interaction_type, notes, products_discussed, follow_up_required, created_at)
WHERE NOT EXISTS (SELECT 1 FROM interactions LIMIT 1);

-- Create trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for interactions table
DROP TRIGGER IF EXISTS update_interactions_updated_at ON interactions;
CREATE TRIGGER update_interactions_updated_at 
    BEFORE UPDATE ON interactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to crm_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crm_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO crm_user;