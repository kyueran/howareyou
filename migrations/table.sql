-- Modify the existing seniors table
CREATE TABLE seniors (
    id SERIAL PRIMARY KEY,
    elderly_code VARCHAR(255),
    centre_code VARCHAR(255),  -- Renamed from aac_code to centre_code
    name VARCHAR(255),
    contact_details VARCHAR(255),
    call_response VARCHAR(10),  -- ENUM type for callResponse: 'High', 'Medium', 'Low'
    nok JSONB,  -- Modify to store multiple next-of-kin (NokInfo)
    block VARCHAR(255),
    floor VARCHAR(255),
    unit_number VARCHAR(255),
    address VARCHAR(255),
    postal_code VARCHAR(10),
    notes TEXT,
    key_attachments JSONB,  -- Array of strings
    no_of_days_living_alone INT,
    adl_difficulty JSONB,  -- Array of strings
    fall_risk VARCHAR(10),  -- ENUM type for fallRisk: 'High', 'Mild', 'Low', 'Zero'
    fall_history JSONB,  -- Array of LineItem (date and details)
    key_concerns JSONB,  -- Array of LineItem (date and details)
    social_interaction VARCHAR(10),
    photo_url VARCHAR(255),
    languages JSONB  -- Array of languages
);

-- Update the insertion to reflect the new fields and changes

-- Insert placeholder data for Senior 1
INSERT INTO seniors (
    elderly_code, centre_code, name, contact_details, call_response, nok, 
    block, floor, unit_number, address, postal_code, notes, key_attachments, 
    no_of_days_living_alone, adl_difficulty, fall_risk, fall_history, key_concerns, 
    social_interaction, photo_url, languages
) VALUES (
    'EC001', 'CENT001', 'Tan Ah Kow', '98765432', 'High', '[{"name": "Tan Ah Beng", "relationship": "Son", "contact_details": "91234567"}]',
    'Blk 50', '05', '123A', 'Strathmore Ave', '140050', 
    'Mild arthritis, needs assistance with mobility', '[]', 
    3, '["Washing", "Mobility"]', 'Mild', '[{"date": "2023-08-15", "details": "Slipped in kitchen"}]', '[{"date": "2023-09-10", "details": "Mobility concern"}]', 
    'Limited', '', '["Mandarin"]'
);

-- Insert placeholder data for Senior 2
INSERT INTO seniors (
    elderly_code, centre_code, name, contact_details, call_response, nok, 
    block, floor, unit_number, address, postal_code, notes, key_attachments, 
    no_of_days_living_alone, adl_difficulty, fall_risk, fall_history, key_concerns, 
    social_interaction, photo_url, languages
) VALUES (
    'EC002', 'CENT002', 'Lim Mei Ling', '87654321', 'Medium', '[{"name": "Lim Chong Wei", "relationship": "Daughter", "contact_details": "92233445"}]',
    'Blk 51', '12', '456B', 'Strathmore Ave', '140051', 
    'Independent but needs help with feeding', '[]', 
    1, '["Feeding"]', 'Low', '[]', '[]', 
    'Healthy', '', '["Cantonese"]'
);
