-- ==============================================================================
-- METROLOGIX-76 / TULA-VAIDHIK (तुला-वैदिक)
-- Production PostgreSQL 16 Database Schema for Supabase
-- Compliant with OIML Recommendation R 76-1:2006, R 76-2:2007,
-- and The Legal Metrology Act, 2009 / General Rules, 2011
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing objects cleanly if re-running
DROP TABLE IF EXISTS audit_trail_events CASCADE;
DROP TABLE IF EXISTS test_observations CASCADE;
DROP TABLE IF EXISTS test_sessions CASCADE;
DROP TABLE IF EXISTS instruments CASCADE;
DROP TABLE IF EXISTS standard_weight_sets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS laboratories CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS accuracy_class CASCADE;
DROP TYPE IF EXISTS verification_stage CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS receptor_type CASCADE;
DROP TYPE IF EXISTS weight_class CASCADE;

-- 3. Create Custom Enums for Metrological Rigor
CREATE TYPE user_role AS ENUM (
    'METROLOGIST',    -- Testing Officer / Laboratory Technician
    'REVIEWER',       -- Principal Scientific Officer / Technical Auditor
    'DIRECTOR',       -- Lab Director / Controller (Issuing Authority)
    'AUDITOR'         -- Read-only DoCA / NABL Inspector
);

CREATE TYPE accuracy_class AS ENUM (
    'CLASS_I',        -- Special Accuracy (e >= 0.001 g, n >= 50,000)
    'CLASS_II',       -- High Accuracy (0.001 g <= e <= 0.05 g, n up to 100,000)
    'CLASS_III',      -- Medium Accuracy (Commercial & Industrial scales, n up to 10,000)
    'CLASS_IIII'      -- Ordinary Accuracy (n up to 1,000)
);

CREATE TYPE verification_stage AS ENUM (
    'INITIAL_VERIFICATION',   -- Type Evaluation / Factory Verification (Table 6 MPE: +/- 0.5e, 1.0e, 1.5e)
    'IN_SERVICE_VERIFICATION' -- Subsequent Reverification in Field (2x MPE Doubling per Section 24)
);

CREATE TYPE session_status AS ENUM (
    'DRAFT',
    'IN_TESTING',
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED',
    'RETEST_REQUIRED'
);

CREATE TYPE receptor_type AS ENUM (
    'PLATFORM',
    'PAN',
    'SUSPENDED',
    'WEIGHBRIDGE',
    'HOPPER_TANK',
    'OTHER'
);

CREATE TYPE weight_class AS ENUM (
    'E1', 'E2', 'F1', 'F2', 'M1', 'M2', 'M3'
);

-- ==============================================================================
-- 4. Laboratories Table (RRSL, CSIR-NPL, GATC Centers)
-- ==============================================================================
CREATE TABLE laboratories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,             -- e.g. 'RRSL-BLR', 'RRSL-AHM', 'CSIR-NPL'
    name VARCHAR(255) NOT NULL,
    lab_type VARCHAR(50) NOT NULL DEFAULT 'RRSL', -- 'RRSL', 'NPL', 'GATC'
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    accreditation_number VARCHAR(100),            -- NABL / ISO-IEC 17025 Accreditation No
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. Users & Laboratory Personnel Table (RBAC)
-- ==============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'METROLOGIST',
    laboratory_id UUID REFERENCES laboratories(id) ON DELETE SET NULL,
    designation VARCHAR(150),
    digital_signature_hash TEXT,                  -- Public key or PKI cert identifier
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. OIML R 111 Standard Weight Sets & Equipment Traceability
-- ==============================================================================
CREATE TABLE standard_weight_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratory_id UUID NOT NULL REFERENCES laboratories(id) ON DELETE CASCADE,
    set_identifier VARCHAR(100) NOT NULL,          -- e.g. 'RRSL/STD/WS-04'
    weight_class weight_class NOT NULL,            -- E2, F1, F2, M1
    calibration_cert_no VARCHAR(100) NOT NULL,
    calibrated_by VARCHAR(255) NOT NULL,           -- e.g. 'CSIR-NPL, New Delhi'
    calibration_date DATE NOT NULL,
    expiry_date DATE NOT NULL,                     -- Watchdog for expiration lockout
    expanded_uncertainty NUMERIC(16, 6) NOT NULL,  -- Must satisfy U <= 1/3 MPE
    coverage_factor_k NUMERIC(4, 2) DEFAULT 2.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. Instruments Master & Technical Specifications
-- ==============================================================================
CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(150) NOT NULL,
    manufacturer_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    applicant_name VARCHAR(255),
    accuracy_class accuracy_class NOT NULL,
    max_capacity NUMERIC(16, 6) NOT NULL,          -- Max
    min_capacity NUMERIC(16, 6) NOT NULL,          -- Min
    verification_scale_interval_e NUMERIC(16, 6) NOT NULL, -- e
    actual_scale_interval_d NUMERIC(16, 6) NOT NULL,       -- d
    n_intervals INT NOT NULL,                      -- Computed: Max / e
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'g',
    receptor_type receptor_type NOT NULL DEFAULT 'PLATFORM',
    is_multi_interval BOOLEAN NOT NULL DEFAULT FALSE,
    partial_ranges JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of [{min, max, e, d}]
    
    -- WELMEC 7.2 & Software Examination parameters
    firmware_version VARCHAR(100),
    firmware_hash_sha256 VARCHAR(64),
    calibration_counter_c INT DEFAULT 0,
    
    -- Photo Evidence Links (Stored in Supabase Storage bucket 'lab-evidence')
    nameplate_image_url TEXT,
    casing_image_url TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. Test Sessions (Model Approval / Type Evaluation Process)
-- ==============================================================================
CREATE TABLE test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_no VARCHAR(100) UNIQUE NOT NULL,   -- e.g. 'RRSL-BLR-2026-NAWI-0089'
    report_no VARCHAR(100) UNIQUE,                 -- e.g. 'OIML-IND-2026-0042'
    instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    laboratory_id UUID NOT NULL REFERENCES laboratories(id),
    operator_id UUID NOT NULL REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    director_id UUID REFERENCES users(id),
    standard_weight_set_id UUID REFERENCES standard_weight_sets(id),
    
    rulepack_version VARCHAR(50) NOT NULL DEFAULT 'OIML_R76_2006',
    verification_stage verification_stage NOT NULL DEFAULT 'INITIAL_VERIFICATION',
    status session_status NOT NULL DEFAULT 'DRAFT',
    
    -- Environmental Conditions (OIML R 76-1 Section 2)
    ambient_temperature_c NUMERIC(5, 2),
    relative_humidity_pct NUMERIC(5, 2),
    atmospheric_pressure_hpa NUMERIC(7, 2),
    
    -- Computer Vision Auditor Audit Results
    spirit_bubble_tilt_deg NUMERIC(5, 2),
    spirit_bubble_status VARCHAR(20) DEFAULT 'PASS',
    platter_clutter_status VARCHAR(20) DEFAULT 'PASS',
    lead_seal_hole_verified BOOLEAN DEFAULT FALSE,
    
    -- Statutory Sign-off & Cryptographic Integrity
    summary_verdict VARCHAR(20),                   -- 'PASS', 'FAIL'
    merkle_root_hash VARCHAR(64),                  -- Final dataset SHA-256 Merkle root
    digital_signature_ecdsa TEXT,                  -- ECDSA signature by Director
    signed_at TIMESTAMPTZ,
    
    -- Compiled Output Document URLs
    pdf_report_url TEXT,
    docx_report_url TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. Test Observations (Dense Changeover & Evaluation Readings)
-- ==============================================================================
CREATE TABLE test_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_session_id UUID NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL,               -- 'WEIGHING', 'ECCENTRICITY', 'REPEATABILITY', 'DISCRIMINATION', 'TARE', 'TEMPERATURE'
    step_number INT NOT NULL,
    target_load NUMERIC(16, 6) NOT NULL,          -- Load L
    applied_direction VARCHAR(30) DEFAULT 'ASCENDING', -- 'ASCENDING', 'DESCENDING', 'CENTER', 'CORNER_FL', etc.
    
    -- Changeover Point Math Inputs & Results (Clause A.4.4.3)
    indicated_value_i NUMERIC(16, 6) NOT NULL,    -- Display Indication I
    auxiliary_load_delta_l NUMERIC(16, 6) NOT NULL DEFAULT 0, -- Delta L to reach changeover
    turning_point_p NUMERIC(16, 6) NOT NULL,      -- P = I + 0.5e - Delta L
    uncorrected_error_e NUMERIC(16, 6) NOT NULL,  -- E = P - L
    zero_error_e0 NUMERIC(16, 6) NOT NULL DEFAULT 0, -- Zero Error E0
    corrected_error_ec NUMERIC(16, 6) NOT NULL,   -- Ec = E - E0
    
    -- Tolerance & Verdict
    mpe_limit NUMERIC(16, 6) NOT NULL,            -- Stage-Aware MPE threshold
    is_compliant BOOLEAN NOT NULL,                -- |Ec| <= |mpe_limit|
    compliance_margin NUMERIC(16, 6) NOT NULL,    -- |mpe_limit| - |Ec|
    
    -- Reviewer & Metadata
    reviewer_notes TEXT,
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. Immutable Audit Trail & Cryptographic Event Sourcing
-- ==============================================================================
CREATE TABLE audit_trail_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_session_id UUID NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,             -- 'CREATE', 'OBSERVATION_EDIT', 'REVIEW_NOTE', 'APPROVE', 'SIGN'
    target_entity VARCHAR(50) NOT NULL,
    target_entity_id UUID,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    justification_reason TEXT,
    previous_event_hash VARCHAR(64),
    event_hash VARCHAR(64) NOT NULL,              -- SHA-256(prev_hash + payload)
    timestamp_ist TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent any manual updates or deletes on the Audit Trail
CREATE OR REPLACE RULE no_update_audit_trail AS
ON UPDATE TO audit_trail_events DO INSTEAD NOTHING;

CREATE OR REPLACE RULE no_delete_audit_trail AS
ON DELETE TO audit_trail_events DO INSTEAD NOTHING;

-- ==============================================================================
-- 11. Performance Indexes for Sub-Millisecond Retrieval
-- ==============================================================================
CREATE INDEX idx_instruments_serial ON instruments(serial_number);
CREATE INDEX idx_sessions_application ON test_sessions(application_no);
CREATE INDEX idx_sessions_report ON test_sessions(report_no);
CREATE INDEX idx_sessions_status ON test_sessions(status);
CREATE INDEX idx_sessions_lab ON test_sessions(laboratory_id);
CREATE INDEX idx_observations_session ON test_observations(test_session_id, test_type);
CREATE INDEX idx_audit_session ON audit_trail_events(test_session_id);

-- ==============================================================================
-- 12. Automatic updated_at Trigger
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_laboratories_updated_at BEFORE UPDATE ON laboratories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_instruments_updated_at BEFORE UPDATE ON instruments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_test_sessions_updated_at BEFORE UPDATE ON test_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 13. Official Seed Data for Indian RRSLs & Standard Equipment
-- ==============================================================================

-- Insert 6 Regional Reference Standard Laboratories (RRSL) + CSIR-NPL
INSERT INTO laboratories (code, name, lab_type, city, state, accreditation_number) VALUES
('CSIR-NPL', 'National Physical Laboratory (CSIR-NPL)', 'NPL', 'New Delhi', 'Delhi', 'NABL-APEX-0001'),
('RRSL-BLR', 'Regional Reference Standard Laboratory, Bengaluru', 'RRSL', 'Bengaluru', 'Karnataka', 'NABL-RRSL-0012'),
('RRSL-AHM', 'Regional Reference Standard Laboratory, Ahmedabad', 'RRSL', 'Ahmedabad', 'Gujarat', 'NABL-RRSL-0014'),
('RRSL-FBD', 'Regional Reference Standard Laboratory, Faridabad', 'RRSL', 'Faridabad', 'Haryana', 'NABL-RRSL-0015'),
('RRSL-BBS', 'Regional Reference Standard Laboratory, Bhubaneswar', 'RRSL', 'Bhubaneswar', 'Odisha', 'NABL-RRSL-0016'),
('RRSL-GHY', 'Regional Reference Standard Laboratory, Guwahati', 'RRSL', 'Guwahati', 'Assam', 'NABL-RRSL-0017'),
('RRSL-VNS', 'Regional Reference Standard Laboratory, Varanasi', 'RRSL', 'Varanasi', 'Uttar Pradesh', 'NABL-RRSL-0018')
ON CONFLICT (code) DO NOTHING;

-- Insert Standard Staff Roles for RRSL Bengaluru
WITH lab AS (SELECT id FROM laboratories WHERE code = 'RRSL-BLR' LIMIT 1)
INSERT INTO users (email, full_name, role, laboratory_id, designation) VALUES
('operator.blr@doca.gov.in', 'Er. Rajesh Kumar', 'METROLOGIST', (SELECT id FROM lab), 'Senior Technical Officer'),
('reviewer.blr@doca.gov.in', 'Dr. Sunita Rao', 'REVIEWER', (SELECT id FROM lab), 'Principal Scientific Officer'),
('director.blr@doca.gov.in', 'Dr. Anand Verma', 'DIRECTOR', (SELECT id FROM lab), 'Director & Controller of Legal Metrology')
ON CONFLICT (email) DO NOTHING;

-- Insert Certified Standard Weight Sets (OIML R 111 Traceable to NPL)
WITH lab AS (SELECT id FROM laboratories WHERE code = 'RRSL-BLR' LIMIT 1)
INSERT INTO standard_weight_sets (laboratory_id, set_identifier, weight_class, calibration_cert_no, calibrated_by, calibration_date, expiry_date, expanded_uncertainty) VALUES
((SELECT id FROM lab), 'RRSL-BLR/STD/WS-01', 'E2', 'NPL-CAL-2025-9821', 'CSIR-NPL, New Delhi', '2025-04-15', '2027-04-14', 0.000050),
((SELECT id FROM lab), 'RRSL-BLR/STD/WS-02', 'F1', 'NPL-CAL-2025-9844', 'CSIR-NPL, New Delhi', '2025-06-10', '2027-06-09', 0.000500),
((SELECT id FROM lab), 'RRSL-BLR/STD/WS-03', 'F2', 'NPL-CAL-2025-9901', 'CSIR-NPL, New Delhi', '2025-08-01', '2027-07-31', 0.005000),
((SELECT id FROM lab), 'RRSL-BLR/STD/WS-04', 'M1', 'NPL-CAL-2025-9925', 'CSIR-NPL, New Delhi', '2025-09-12', '2027-09-11', 0.050000);

-- Insert a Baseline Sample Instrument (Class III Retail Platform Scale)
INSERT INTO instruments (
    model_name, manufacturer_name, serial_number, applicant_name,
    accuracy_class, max_capacity, min_capacity,
    verification_scale_interval_e, actual_scale_interval_d, n_intervals,
    unit_of_measure, receptor_type, firmware_version, firmware_hash_sha256, calibration_counter_c
) VALUES (
    'Eagle Precision Bench 30K', 'Eagle Scales Manufacturing Ltd', 'EAGLE-2026-X99', 'Eagle Distribution India Pvt Ltd',
    'CLASS_III', 30000.000000, 100.000000,
    5.000000, 1.000000, 6000,
    'g', 'PLATFORM', 'v2.4.1-legal', '8f4a3c2b1e9d8f7a6c5b4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b', 42
);

-- ==============================================================================
-- 14. Verification Summary Message
-- ==============================================================================
SELECT 
    'METROLOGIX-76 Database Schema Successfully Initialized!' AS status,
    (SELECT COUNT(*) FROM laboratories) AS laboratories_seeded,
    (SELECT COUNT(*) FROM standard_weight_sets) AS weight_sets_seeded,
    (SELECT COUNT(*) FROM users) AS users_seeded,
    (SELECT COUNT(*) FROM instruments) AS instruments_seeded;
