CREATE TABLE seniors (
    id SERIAL PRIMARY KEY,
    elderly_code VARCHAR(255),
    aac_code VARCHAR(255),
    name VARCHAR(255),
    contact_details VARCHAR(255),
    relationship_with_nok VARCHAR(255),
    nok_contact_details VARCHAR(255),
    block VARCHAR(255),
    floor VARCHAR(255),
    unit_number VARCHAR(255),
    address VARCHAR(255),
    postal_code VARCHAR(10),
    notes TEXT,
    key_attachments TEXT,
    no_of_days_living_alone INT,
    adl_difficulty JSONB,
    fall_risk VARCHAR(10),
    fall_history JSONB,
    social_interaction VARCHAR(10),
    photo_url VARCHAR(255),
    languages LANGUAGE, -- Assuming LANGUAGE is an ENUM
    nok_name VARCHAR(255)
);

-- Insert placeholder data for Senior 1 (Mandarin-speaking senior with mild fall risk and limited social interaction)
INSERT INTO seniors (
    elderly_code, aac_code, name, contact_details, relationship_with_nok, nok_contact_details, 
    block, floor, unit_number, address, postal_code, notes, key_attachments, 
    no_of_days_living_alone, adl_difficulty, fall_risk, fall_history, social_interaction, photo_url, languages, nok_name
) VALUES (
    'EC001', 'AAC001', 'Tan Ah Kow', '98765432', 'Son', '91234567',
    'Blk 50', '05', '123A', 'Strathmore Ave', '140050', 
    'Mild arthritis, needs assistance with mobility', '[]', 
    3, '["Washing", "Mobility"]', 'Mild', '[{"date": "2023-08-15", "details": "Slipped in kitchen"}]', 'Limited', '', 'Mandarin', 'Tan Ah Beng'
);

-- Insert placeholder data for Senior 2 (Cantonese-speaking senior with low fall risk and healthy social interaction)
INSERT INTO seniors (
    elderly_code, aac_code, name, contact_details, relationship_with_nok, nok_contact_details, 
    block, floor, unit_number, address, postal_code, notes, key_attachments, 
    no_of_days_living_alone, adl_difficulty, fall_risk, fall_history, social_interaction, photo_url, languages, nok_name
) VALUES (
    'EC002', 'AAC002', 'Lim Mei Ling', '87654321', 'Daughter', '92233445',
    'Blk 51', '12', '456B', 'Strathmore Ave', '140051', 
    'Independent but needs help with feeding', '[]', 
    1, '["Feeding"]', 'Low', '[]', 'Healthy', '', 'Cantonese', 'Lim Chong Wei'
);

-- Insert placeholder data for Senior 3 (Hokkien-speaking senior with high fall risk and isolated)
INSERT INTO seniors (
    elderly_code, aac_code, name, contact_details, relationship_with_nok, nok_contact_details, 
    block, floor, unit_number, address, postal_code, notes, key_attachments, 
    no_of_days_living_alone, adl_difficulty, fall_risk, fall_history, social_interaction, photo_url, languages, nok_name
) VALUES (
    'EC003', 'AAC003', 'Goh Ah Seng', '91234567', 'Granddaughter', '92345678',
    'Blk 55', '10', '789C', 'Tanglin Halt Rd', '141055', 
    'History of stroke, needs mobility assistance', '[]', 
    6, '["Mobility", "Transferring"]', 'High', '[{"date": "2023-09-01", "details": "Fell in bathroom"}]', 'Isolated', '', 'Hokkien', 'Goh Hui Ling'
);

-- Insert placeholder data for Senior 4 (Malay-speaking senior with zero fall risk and healthy social interaction)
INSERT INTO seniors (
    elderly_code, aac_code, name, contact_details, relationship_with_nok, nok_contact_details, 
    block, floor, unit_number, address, postal_code, notes, key_attachments, 
    no_of_days_living_alone, adl_difficulty, fall_risk, fall_history, social_interaction, photo_url, languages, nok_name
) VALUES (
    'EC004', 'AAC004', 'Ng Siew Lin', '96543210', 'Son', '98765431',
    'Blk 56', '08', '321A', 'Tanglin Halt Rd', '141056', 
    'Recovering from hip surgery', '[]', 
    0, '["Dressing"]', 'Zero', '[]', 'Healthy', '', 'Malay', 'Ng Wei Xiang'
);

-- Insert placeholder data for Senior 5 (Teochew-speaking senior with limited social interaction and mild fall risk)
INSERT INTO seniors (
    elderly_code, aac_code, name, contact_details, relationship_with_nok, nok_contact_details, 
    block, floor, unit_number, address, postal_code, notes, key_attachments, 
    no_of_days_living_alone, adl_difficulty, fall_risk, fall_history, social_interaction, photo_url, languages, nok_name
) VALUES (
    'EC005', 'AAC005', 'Cheng Wei Long', '94567890', 'Son', '93324567',
    'Blk 58', '06', '987B', 'Commonwealth Dr', '140058', 
    'Needs assistance with toileting, moderate fall risk', '[]', 
    4, '["Toileting"]', 'Mild', '[{"date": "2023-08-01", "details": "Tripped on wet floor"}]', 'Limited', '', 'Teochew', 'Cheng Wei Long'
);
