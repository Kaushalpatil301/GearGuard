-- ============================================================================
-- 
-- GearGuard - Seed Data (Indian Enterprise Context - Bharati Infra Group)
-- 
-- ============================================================================

-- Description: Sample data for testing and demonstration
-- Context: Large Indian Manufacturing & Infrastructure Company (Multi-city plants)
-- Note   : Only DATA changed; structure, order & format preserved

-- ============================================================================

-- Clear existing data (optional - use with caution)

TRUNCATE TABLE maintenance_logs, request_assignments, maintenance_requests, equipment, team_members, teams, users RESTART IDENTITY CASCADE;

-- ============================================================================

-- USERS (Technicians, Managers, Operators)

-- ============================================================================

-- Note: All passwords are hashed with bcrypt (plain text: "password123")

-- Password hash: $2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC

INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES

-- Technicians

('f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11', 'Arjun Verma', 'arjun.verma@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'TECHNICIAN', TRUE),
('bd8e3c0d-1b27-4d2b-9c13-63e1886a42f0', 'Priya Nair', 'priya.nair@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'TECHNICIAN', TRUE),
('f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b', 'Rohit Sharma', 'rohit.sharma@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'TECHNICIAN', TRUE),
('b3cb4a4c-1c7d-4a3e-9a51-4c88ffde8b02', 'Sai Teja', 'sai.teja@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'TECHNICIAN', TRUE),
('a7f58c7d-0b14-4f09-9b72-058c4f8d4a96', 'Vikram Yadav', 'vikram.yadav@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'TECHNICIAN', TRUE),
('cf5b74a4-7e83-4bc2-a4a8-32b223f7b5a1', 'Meera Iyer', 'meera.iyer@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'TECHNICIAN', TRUE),

-- Managers

('6ed0b5e4-8973-4f13-8b46-7d79c01d1924', 'Sanjay Gupta', 'sanjay.gupta@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'MANAGER', TRUE),
('1f1c2d0b-6c8e-4e2b-8aa1-99a50d847d39', 'Anita Menon', 'anita.menon@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'MANAGER', TRUE),

-- Users (Operators)

('0c7a7f8c-59f5-4da2-9f76-9e9fb9fdc5b4', 'Rahul Pandey', 'rahul.pandey@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'USER', TRUE),
('f7e31861-a26e-4f79-bf0b-2d8a6b0e9ad1', 'Deepika Rao', 'deepika.rao@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'USER', TRUE),
('a124185b-4ad9-4d0e-9c8c-64f191f1e1ab', 'Manish Kulkarni', 'manish.kulkarni@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'USER', TRUE),

-- Admin

('b6b33b0a-0cc5-4c26-b7b1-1e6b78e8d4f4', 'System Admin', 'admin@bharatinfra.in', '$2b$12$i.X0LCztnfJYKY/fyhg9hOpWuPQSQ80omafSTgD3fyui5ulWlrsqC', 'ADMIN', TRUE);

-- ============================================================================

-- TEAMS (Maintenance Teams)

-- ============================================================================

INSERT INTO teams (id, name, description, is_active) VALUES

('11111111-1111-1111-1111-111111111111', 'IT Infrastructure', 'Manages servers, network, and core IT assets', TRUE),
('22222222-2222-2222-2222-222222222222', 'Mechanical Maintenance', 'Handles CNC, presses, and rotating machinery', TRUE),
('33333333-3333-3333-3333-333333333333', 'Electrical Maintenance', 'Responsible for power systems and panels', TRUE),
('44444444-4444-4444-4444-444444444444', 'HVAC & Utilities', 'Maintains HVAC, exhaust and utility systems', TRUE),
('55555555-5555-5555-5555-555555555555', 'Safety & Compliance', 'Fire safety, emergency systems, and audits', TRUE);

-- ============================================================================

-- TEAM MEMBERS (Assign Technicians to Teams)

-- ============================================================================

INSERT INTO team_members (team_id, user_id) VALUES

-- IT Infrastructure

('11111111-1111-1111-1111-111111111111', 'f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11'), -- Arjun Verma
('11111111-1111-1111-1111-111111111111', 'bd8e3c0d-1b27-4d2b-9c13-63e1886a42f0'), -- Priya Nair

-- Mechanical Maintenance

('22222222-2222-2222-2222-222222222222', 'f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b'), -- Rohit Sharma
('22222222-2222-2222-2222-222222222222', 'b3cb4a4c-1c7d-4a3e-9a51-4c88ffde8b02'), -- Sai Teja

-- Electrical Maintenance

('33333333-3333-3333-3333-333333333333', 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96'), -- Vikram Yadav
('33333333-3333-3333-3333-333333333333', 'cf5b74a4-7e83-4bc2-a4a8-32b223f7b5a1'), -- Meera Iyer

-- HVAC & Utilities

('44444444-4444-4444-4444-444444444444', 'f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b'), -- Rohit Sharma (secondary)
('44444444-4444-4444-4444-444444444444', 'cf5b74a4-7e83-4bc2-a4a8-32b223f7b5a1'), -- Meera Iyer (secondary)

-- Safety & Compliance

('55555555-5555-5555-5555-555555555555', 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96'); -- Vikram Yadav (safety lead)

-- ============================================================================

-- EQUIPMENT (Assets across different locations)

-- ============================================================================

INSERT INTO equipment (id, name, description, serial_number, department, owner_id, team_id, status, location, purchase_date, warranty_end_date) VALUES

-- IT & Network Equipment

('eeee1111-1111-1111-1111-111111111111', 'Dell PowerEdge R750 Server', 'Primary SAP and ERP application server', 'SRV-DEL-R750-2022-001', 'IT', 'f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11', '11111111-1111-1111-1111-111111111111', 'OPERATIONAL', 'Mumbai Plant - Data Center', '2022-08-15', '2027-08-15'),
('eeee1111-2222-2222-2222-222222222222', 'HP LaserJet Pro MFP', 'Shared multifunction printer for production office', 'PRT-HP-MUM-2023-014', 'Administration', 'bd8e3c0d-1b27-4d2b-9c13-63e1886a42f0', '11111111-1111-1111-1111-111111111111', 'OPERATIONAL', 'Pune Factory - Admin Block 2nd Floor', '2023-02-10', '2025-02-10'),
('eeee1111-3333-3333-3333-333333333333', 'Cisco Catalyst 9300 Switch', '48-port core distribution switch', 'NET-CISCO-9300-2021-007', 'IT', 'f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11', '11111111-1111-1111-1111-111111111111', 'UNDER_MAINTENANCE', 'Bengaluru Office - Network Rack 1', '2021-11-05', '2024-11-05'),
('eeee1111-4444-4444-4444-444444444444', 'Palo Alto Firewall', 'Perimeter firewall for Delhi HQ', 'FW-PA-DEL-2020-003', 'IT', 'bd8e3c0d-1b27-4d2b-9c13-63e1886a42f0', '11111111-1111-1111-1111-111111111111', 'OPERATIONAL', 'Delhi HQ - Security Room', '2020-06-20', '2023-06-20'),

-- Mechanical Equipment

('eeee2222-1111-1111-1111-111111111111', 'CNC Vertical Milling Machine', '3-axis CNC milling for precision components', 'CNC-AMS-PUNE-2021-021', 'Production', 'f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b', '22222222-2222-2222-2222-222222222222', 'OPERATIONAL', 'Pune Factory - Shop Floor Line 1', '2021-04-12', '2024-04-12'),
('eeee2222-2222-2222-2222-222222222222', 'Hydraulic Deep Draw Press', '400-ton hydraulic press for chassis forming', 'HYD-PRS-MUM-2020-009', 'Production', 'f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b', '22222222-2222-2222-2222-222222222222', 'OPERATIONAL', 'Mumbai Plant - Press Shop Bay 2', '2020-09-25', '2023-09-25'),
('eeee2222-3333-3333-3333-333333333333', 'Conventional Lathe Machine', 'Heavy-duty lathe for shaft machining', 'LAT-COIM-2018-032', 'Production', 'b3cb4a4c-1c7d-4a3e-9a51-4c88ffde8b02', '22222222-2222-2222-2222-222222222222', 'SCRAPPED', 'Coimbatore Workshop - Scrap Yard', '2018-01-30', '2021-01-30'),
('eeee2222-4444-4444-4444-444444444444', 'CNC Turning Center', 'High-speed CNC turning for flanges', 'CNC-TURN-CHN-2022-018', 'Production', 'b3cb4a4c-1c7d-4a3e-9a51-4c88ffde8b02', '22222222-2222-2222-2222-222222222222', 'OPERATIONAL', 'Chennai Unit - Line B', '2022-03-18', '2025-03-18'),

-- Electrical Equipment

('eeee3333-1111-1111-1111-111111111111', 'Diesel Generator 750 KVA', 'Primary backup generator for Mumbai plant', 'DG-CUMMINS-MUM-2022-005', 'Facilities', 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96', '33333333-3333-3333-3333-333333333333', 'OPERATIONAL', 'Mumbai Plant - DG Yard', '2022-05-10', '2027-05-10'),
('eeee3333-2222-2222-2222-222222222222', '11kV Distribution Panel', 'Main incoming HT panel', 'DB-SIEMENS-DEL-2021-011', 'Facilities', 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96', '33333333-3333-3333-3333-333333333333', 'OPERATIONAL', 'Delhi HQ - Electrical Substation', '2021-09-02', '2031-09-02'),
('eeee3333-3333-3333-3333-333333333333', 'APC UPS 160 KVA', 'Central UPS for server clusters', 'UPS-APC-BLR-2023-019', 'IT', 'cf5b74a4-7e83-4bc2-a4a8-32b223f7b5a1', '33333333-3333-3333-3333-333333333333', 'UNDER_MAINTENANCE', 'Bengaluru Office - Server Room', '2023-04-05', '2028-04-05'),
('eeee3333-4444-4444-4444-444444444444', 'LV Motor Control Center', 'MCC for conveyor drives', 'MCC-AHD-2020-027', 'Production', 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96', '33333333-3333-3333-3333-333333333333', 'OPERATIONAL', 'Ahmedabad Plant - MCC Room', '2020-12-11', '2025-12-11'),

-- HVAC & Utilities

('eeee4444-1111-1111-1111-111111111111', 'Central Chiller 120 TR', 'Water-cooled chiller for office HVAC', 'CHILL-GGN-2022-003', 'Facilities', NULL, '44444444-4444-4444-4444-444444444444', 'OPERATIONAL', 'Gurugram Office - Chiller Plant', '2022-03-01', '2027-03-01'),
('eeee4444-2222-2222-2222-222222222222', 'Industrial Exhaust Fan', 'Roof-mounted exhaust for paint booth', 'FAN-PNT-NOI-2021-025', 'Production', NULL, '44444444-4444-4444-4444-444444444444', 'OPERATIONAL', 'Noida Manufacturing Unit - Paint Shop', '2021-07-08', '2026-07-08'),
('eeee4444-3333-3333-3333-333333333333', 'Air Handling Unit AHU-03', 'AHU for Pune office 3rd floor', 'AHU-PUN-2020-009', 'Facilities', NULL, '44444444-4444-4444-4444-444444444444', 'OPERATIONAL', 'Pune Factory - Office Block', '2020-10-20', '2025-10-20'),

-- Safety & Compliance

('eeee5555-1111-1111-1111-111111111111', 'Addressable Fire Alarm Panel', 'Main fire alarm control panel', 'FAP-DEL-2019-004', 'Safety', NULL, '55555555-5555-5555-5555-555555555555', 'OPERATIONAL', 'Delhi HQ - Security Control Room', '2019-12-12', '2024-12-12'),
('eeee5555-2222-2222-2222-222222222222', 'Sprinkler Pump Set', 'Diesel-driven sprinkler pump', 'SPP-MUM-2018-010', 'Safety', NULL, '55555555-5555-5555-5555-555555555555', 'OPERATIONAL', 'Mumbai Plant - Pump House', '2018-06-19', '2023-06-19'),
('eeee5555-3333-3333-3333-333333333333', 'CO2 Fire Suppression System', 'Clean agent system for server room', 'CO2-SYS-BLR-2021-006', 'Safety', NULL, '55555555-5555-5555-5555-555555555555', 'OPERATIONAL', 'Bengaluru Office - Data Center', '2021-03-23', '2026-03-23');

-- ============================================================================

-- MAINTENANCE REQUESTS

-- ============================================================================

INSERT INTO maintenance_requests (id, equipment_id, team_id, request_type, status, title, description, priority, scheduled_date, sla_hours, created_by) VALUES

-- New Requests (Not yet assigned)

('111a1111-1111-1111-1111-111111111111',
 'eeee1111-2222-2222-2222-222222222222',
 '11111111-1111-1111-1111-111111111111',
 'CORRECTIVE',
 'NEW',
 'Frequent paper jam in MFP',
 'HP LaserJet Pro is reporting frequent paper jams on Tray-2. Rollers need cleaning and feed path inspection.',
 'MEDIUM',
 '2026-01-02 09:00:00',
 48,
 '0c7a7f8c-59f5-4da2-9f76-9e9fb9fdc5b4'), -- Rahul Pandey

('111a1111-2222-2222-2222-222222222222',
 'eeee2222-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'PREVENTIVE',
 'NEW',
 'Quarterly preventive servicing of CNC mill',
 'Carry out lubrication, spindle runout check, backlash calibration, and safety interlock verification for CNC vertical milling machine.',
 'HIGH',
 '2026-01-10 10:00:00',
 24,
 'f7e31861-a26e-4f79-bf0b-2d8a6b0e9ad1'), -- Deepika Rao

('111a1111-3333-3333-3333-333333333333',
 'eeee3333-1111-1111-1111-111111111111',
 '33333333-3333-3333-3333-333333333333',
 'CORRECTIVE',
 'NEW',
 'Generator fails to take load',
 'Diesel generator starts but trips as soon as plant load is transferred. Suspected AVR or fuel supply issue.',
 'CRITICAL',
 '2025-12-30 08:00:00',
 4,
 '0c7a7f8c-59f5-4da2-9f76-9e9fb9fdc5b4'), -- Rahul Pandey

('111a1111-4444-4444-4444-444444444444',
 'eeee5555-1111-1111-1111-111111111111',
 '55555555-5555-5555-5555-555555555555',
 'PREVENTIVE',
 'NEW',
 'Annual fire alarm loop testing',
 'Perform full fire alarm loop testing, device address verification, and event logging review for Delhi HQ.',
 'MEDIUM',
 '2026-01-12 15:00:00',
 72,
 'a124185b-4ad9-4d0e-9c8c-64f191f1e1ab'), -- Manish Kulkarni

-- In Progress Requests (Already assigned)

('222a2222-1111-1111-1111-111111111111',
 'eeee1111-3333-3333-3333-333333333333',
 '11111111-1111-1111-1111-111111111111',
 'CORRECTIVE',
 'IN_PROGRESS',
 'Intermittent packet loss on core switch',
 'Cisco Catalyst switch is showing intermittent packet loss on uplink ports to firewall. Needs port diagnostics and possible SFP replacement.',
 'HIGH',
 '2025-12-27 10:00:00',
 24,
 'a124185b-4ad9-4d0e-9c8c-64f191f1e1ab'), -- Manish Kulkarni

('222a2222-2222-2222-2222-222222222222',
 'eeee3333-3333-3333-3333-333333333333',
 '33333333-3333-3333-3333-333333333333',
 'PREVENTIVE',
 'IN_PROGRESS',
 'UPS battery string health check',
 'Perform quarterly battery health check, internal resistance measurement, and replace weak jars in APC UPS string.',
 'MEDIUM',
 '2025-12-26 14:00:00',
 48,
 'f7e31861-a26e-4f79-bf0b-2d8a6b0e9ad1'), -- Deepika Rao

('222a2222-3333-3333-3333-333333333333',
 'eeee4444-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444444444',
 'CORRECTIVE',
 'IN_PROGRESS',
 'Chiller trip on low refrigerant',
 'Central chiller is frequently tripping on low refrigerant pressure alarm. Suspected micro-leak in evaporator circuit.',
 'HIGH',
 '2025-12-24 11:00:00',
 36,
 '0c7a7f8c-59f5-4da2-9f76-9e9fb9fdc5b4'), -- Rahul Pandey

-- Completed Requests (within SLA and near SLA)

('333a3333-1111-1111-1111-111111111111',
 'eeee4444-3333-3333-3333-333333333333',
 '44444444-4444-4444-4444-444444444444',
 'CORRECTIVE',
 'REPAIRED',
 'AHU belt slippage and noise',
 'AHU-03 reported belt slippage and abnormal noise. Belt replaced and pulley alignment corrected.',
 'HIGH',
 '2025-12-18 11:00:00',
 24,
 '0c7a7f8c-59f5-4da2-9f76-9e9fb9fdc5b4'), -- Rahul Pandey

('333a3333-2222-2222-2222-222222222222',
 'eeee2222-2222-2222-2222-222222222222',
 '22222222-2222-2222-2222-222222222222',
 'PREVENTIVE',
 'REPAIRED',
 'Half-yearly inspection of hydraulic press',
 'Completed inspection of valves, cylinders, and pressure gauges. No abnormal leakage observed. Greasing done at all moving joints.',
 'MEDIUM',
 '2025-12-15 09:00:00',
 72,
 'f7e31861-a26e-4f79-bf0b-2d8a6b0e9ad1'), -- Deepika Rao

('333a3333-3333-3333-3333-333333333333',
 'eeee5555-2222-2222-2222-222222222222',
 '55555555-5555-5555-5555-555555555555',
 'PREVENTIVE',
 'REPAIRED',
 'Sprinkler pump weekly jockey test',
 'Executed weekly auto-start test, verified header pressure and jockey pump cut-in/cut-out settings. Logged readings for audit.',
 'LOW',
 '2025-12-10 08:30:00',
 24,
 'a124185b-4ad9-4d0e-9c8c-64f191f1e1ab'), -- Manish Kulkarni

-- Scrapped Equipment Request (Historical)

('444a4444-1111-1111-1111-111111111111',
 'eeee2222-3333-3333-3333-333333333333',
 '22222222-2222-2222-2222-222222222222',
 'CORRECTIVE',
 'SCRAP',
 'Lathe main motor burnt',
 'Lathe machine main motor winding is burnt and bed is heavily worn out. Repair cost is uneconomical; recommended scrapping.',
 'LOW',
 '2025-11-20 13:00:00',
 96,
 'a124185b-4ad9-4d0e-9c8c-64f191f1e1ab'), -- Manish Kulkarni

-- Additional Requests for Calendar & SLA Variety

('555a5555-1111-1111-1111-111111111111',
 'eeee1111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 'PREVENTIVE',
 'NEW',
 'Monthly server health check',
 'Routine OS patching, RAID status verification, and log review for primary SAP server.',
 'MEDIUM',
 '2026-01-05 14:00:00',
 24,
 'f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11'), -- Arjun Verma

('555a5555-2222-2222-2222-222222222222',
 'eeee4444-2222-2222-2222-222222222222',
 '44444444-4444-4444-4444-444444444444',
 'PREVENTIVE',
 'NEW',
 'Exhaust fan belt replacement',
 'Annual belt replacement, bearing greasing, and vibration check for paint booth exhaust fan.',
 'MEDIUM',
 '2026-01-08 10:00:00',
 48,
 '6ed0b5e4-8973-4f13-8b46-7d79c01d1924'), -- Sanjay Gupta

('555a5555-3333-3333-3333-333333333333',
 'eeee3333-2222-2222-2222-222222222222',
 '33333333-3333-3333-3333-333333333333',
 'PREVENTIVE',
 'NEW',
 'Quarterly inspection of 11kV panel',
 'Check for hot spots, loose terminations and insulation health using thermal scan for main HT panel.',
 'HIGH',
 '2026-01-12 09:00:00',
 12,
 'bd8e3c0d-1b27-4d2b-9c13-63e1886a42f0'), -- Priya Nair

-- Overdue and SLA-Breached Historical Requests

('666a6666-1111-1111-1111-111111111111',
 'eeee1111-4444-4444-4444-444444444444',
 '11111111-1111-1111-1111-111111111111',
 'CORRECTIVE',
 'REPAIRED',
 'Firewall high CPU usage',
 'Palo Alto firewall reported sustained high CPU during peak hours. Policy optimization and session cleanup performed.',
 'CRITICAL',
 '2025-11-01 10:00:00',
 4,
 '0c7a7f8c-59f5-4da2-9f76-9e9fb9fdc5b4'), -- Breached SLA; completed late

('666a6666-2222-2222-2222-222222222222',
 'eeee3333-4444-4444-4444-444444444444',
 '33333333-3333-3333-3333-333333333333',
 'CORRECTIVE',
 'REPAIRED',
 'Voltage fluctuation observed in MCC feeders',
 'Operators reported flickering lights and sporadic voltage dips on conveyor MCC. Loose busbar joints were identified and rectified.',
 'HIGH',
 '2025-11-10 09:00:00',
 8,
 'a124185b-4ad9-4d0e-9c8c-64f191f1e1ab'); -- Near SLA, closed just in time

-- ============================================================================

-- REQUEST ASSIGNMENTS

-- ============================================================================

INSERT INTO request_assignments (id, request_id, assigned_to, assigned_by, assigned_at, completed_at, notes) VALUES

-- Completed assignments

('aaa11111-1111-1111-1111-111111111111',
 '333a3333-1111-1111-1111-111111111111',
 'f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b', -- Rohit Sharma (HVAC)
 '6ed0b5e4-8973-4f13-8b46-7d79c01d1924', -- Assigned by Sanjay Gupta
 '2025-12-18 09:30:00',
 '2025-12-18 16:30:00',
 'Replaced AHU belt and re-tensioned. Verified noise levels and airflow within limits.'),

('aaa22222-2222-2222-2222-222222222222',
 '333a3333-2222-2222-2222-222222222222',
 'f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b', -- Rohit Sharma (Mechanical)
 '6ed0b5e4-8973-4f13-8b46-7d79c01d1924', -- Assigned by Sanjay Gupta
 '2025-12-14 10:00:00',
 '2025-12-15 15:30:00',
 'Inspection completed and test run done. Press cleared for production for next 6 months.'),

('aaa33333-3333-3333-3333-333333333333',
 '333a3333-3333-3333-3333-333333333333',
 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96', -- Vikram Yadav (Safety)
 '1f1c2d0b-6c8e-4e2b-8aa1-99a50d847d39', -- Assigned by Anita Menon
 '2025-12-09 09:00:00',
 '2025-12-10 09:15:00',
 'Weekly sprinkler pump test completed and observations recorded in safety register.'),

('aaa66666-1111-1111-1111-111111111111',
 '666a6666-1111-1111-1111-111111111111',
 'f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11', -- Arjun Verma (IT)
 '6ed0b5e4-8973-4f13-8b46-7d79c01d1924', -- Assigned by Sanjay Gupta
 '2025-11-01 10:15:00',
 '2025-11-02 13:45:00',
 'Firewall policies tuned, logging thresholds adjusted. SLA breached due to extended analysis window.'),

('aaa66666-2222-2222-2222-222222222222',
 '666a6666-2222-2222-2222-222222222222',
 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96', -- Vikram Yadav (Electrical)
 '1f1c2d0b-6c8e-4e2b-8aa1-99a50d847d39', -- Assigned by Anita Menon
 '2025-11-10 09:15:00',
 '2025-11-10 16:45:00',
 'Tightened busbar connections, replaced one overheated lug. Completed just within SLA window.'),

-- Active assignments (not yet completed)

('aaa33333-1111-1111-1111-111111111111',
 '222a2222-1111-1111-1111-111111111111',
 'f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11', -- Arjun Verma (IT)
 '1f1c2d0b-6c8e-4e2b-8aa1-99a50d847d39', -- Assigned by Anita Menon
 '2025-12-27 11:00:00',
 NULL,
 NULL),

('aaa33333-2222-2222-2222-222222222222',
 '222a2222-2222-2222-2222-222222222222',
 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96', -- Vikram Yadav (Electrical)
 '6ed0b5e4-8973-4f13-8b46-7d79c01d1924', -- Assigned by Sanjay Gupta
 '2025-12-26 09:30:00',
 NULL,
 NULL),

('aaa33333-4444-4444-4444-444444444444',
 '222a2222-3333-3333-3333-333333333333',
 'cf5b74a4-7e83-4bc2-a4a8-32b223f7b5a1', -- Meera Iyer (HVAC)
 '1f1c2d0b-6c8e-4e2b-8aa1-99a50d847d39', -- Assigned by Anita Menon
 '2025-12-24 09:45:00',
 NULL,
 'Monitoring refrigerant pressure trends before final recharge decision.'),

-- Scrapped equipment assignment

('aaa44444-1111-1111-1111-111111111111',
 '444a4444-1111-1111-1111-111111111111',
 'b3cb4a4c-1c7d-4a3e-9a51-4c88ffde8b02', -- Sai Teja (Mechanical)
 '1f1c2d0b-6c8e-4e2b-8aa1-99a50d847d39', -- Assigned by Anita Menon
 '2025-11-20 14:00:00',
 '2025-11-21 17:00:00',
 'Inspected lathe; bed wear and motor damage confirmed. Recommended scrapping and tagged asset for disposal.');

-- ============================================================================

-- MAINTENANCE LOGS

-- ============================================================================

INSERT INTO maintenance_logs (request_id, user_id, action, details) VALUES

-- Logs for AHU repair

('333a3333-1111-1111-1111-111111111111',
 '0c7a7f8c-59f5-4da2-9f76-9e9fb9fdc5b4',
 'request_created',
 '{"title": "AHU belt slippage and noise", "priority": "HIGH", "created_from": "web_portal"}'),

('333a3333-1111-1111-1111-111111111111',
 '6ed0b5e4-8973-4f13-8b46-7d79c01d1924',
 'request_assigned',
 '{"assigned_to": "f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b", "assigned_to_name": "Rohit Sharma", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('333a3333-1111-1111-1111-111111111111',
 'f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b',
 'comment_added',
 '{"comment": "Found belt worn and loose. Replaced with new belt and aligned pulleys.", "timestamp": "2025-12-18T13:00:00Z"}'),

('333a3333-1111-1111-1111-111111111111',
 'f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b',
 'status_changed',
 '{"old_status": "IN_PROGRESS", "new_status": "REPAIRED", "timestamp": "2025-12-18T16:30:00Z"}'),

-- Logs for hydraulic press maintenance

('333a3333-2222-2222-2222-222222222222',
 'f7e31861-a26e-4f79-bf0b-2d8a6b0e9ad1',
 'request_created',
 '{"title": "Half-yearly inspection of hydraulic press", "priority": "MEDIUM", "created_from": "web_portal"}'),

('333a3333-2222-2222-2222-222222222222',
 '6ed0b5e4-8973-4f13-8b46-7d79c01d1924',
 'request_assigned',
 '{"assigned_to": "f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b", "assigned_to_name": "Rohit Sharma", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('333a3333-2222-2222-2222-222222222222',
 'f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b',
 'comment_added',
 '{"comment": "Checked hydraulic seals and hoses. No leakage found. Pressure test completed.", "timestamp": "2025-12-15T14:00:00Z"}'),

('333a3333-2222-2222-2222-222222222222',
 'f3f0e4a6-1c3f-4b6e-b5f3-64d1d4dcd42b',
 'status_changed',
 '{"old_status": "IN_PROGRESS", "new_status": "REPAIRED", "timestamp": "2025-12-15T15:30:00Z"}'),

-- Logs for UPS preventive maintenance (in progress, SLA still OK)

('222a2222-2222-2222-2222-222222222222',
 'f7e31861-a26e-4f79-bf0b-2d8a6b0e9ad1',
 'request_created',
 '{"title": "UPS battery string health check", "priority": "MEDIUM", "created_from": "web_portal"}'),

('222a2222-2222-2222-2222-222222222222',
 '6ed0b5e4-8973-4f13-8b46-7d79c01d1924',
 'request_assigned',
 '{"assigned_to": "a7f58c7d-0b14-4f09-9b72-058c4f8d4a96", "assigned_to_name": "Vikram Yadav", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('222a2222-2222-2222-2222-222222222222',
 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96',
 'comment_added',
 '{"comment": "First string checked, two weak jars identified. Planning replacement tomorrow morning.", "timestamp": "2025-12-27T08:45:00Z"}'),

-- Logs for network switch corrective request (active, priority change)

('222a2222-1111-1111-1111-111111111111',
 'a124185b-4ad9-4d0e-9c8c-64f191f1e1ab',
 'request_created',
 '{"title": "Intermittent packet loss on core switch", "priority": "HIGH", "created_from": "mobile_app"}'),

('222a2222-1111-1111-1111-111111111111',
 '1f1c2d0b-6c8e-4e2b-8aa1-99a50d847d39',
 'request_assigned',
 '{"assigned_to": "f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11", "assigned_to_name": "Arjun Verma", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('222a2222-1111-1111-1111-111111111111',
 'f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11',
 'priority_changed',
 '{"old_priority": "MEDIUM", "new_priority": "HIGH", "timestamp": "2025-12-27T11:30:00Z"}'),

-- Logs for scrapped equipment

('444a4444-1111-1111-1111-111111111111',
 'a124185b-4ad9-4d0e-9c8c-64f191f1e1ab',
 'request_created',
 '{"title": "Lathe main motor burnt", "priority": "LOW", "created_from": "web_portal"}'),

('444a4444-1111-1111-1111-111111111111',
 '1f1c2d0b-6c8e-4e2b-8aa1-99a50d847d39',
 'request_assigned',
 '{"assigned_to": "b3cb4a4c-1c7d-4a3e-9a51-4c88ffde8b02", "assigned_to_name": "Sai Teja", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('444a4444-1111-1111-1111-111111111111',
 'b3cb4a4c-1c7d-4a3e-9a51-4c88ffde8b02',
 'equipment_scrapped',
 '{"equipment_id": "eeee2222-3333-3333-3333-333333333333", "equipment_name": "Conventional Lathe Machine", "timestamp": "2025-11-21T17:00:00Z"}'),

('444a4444-1111-1111-1111-111111111111',
 'b3cb4a4c-1c7d-4a3e-9a51-4c88ffde8b02',
 'status_changed',
 '{"old_status": "IN_PROGRESS", "new_status": "SCRAP", "timestamp": "2025-11-21T17:00:00Z"}'),

-- Logs for SLA-breached firewall incident

('666a6666-1111-1111-1111-111111111111',
 '0c7a7f8c-59f5-4da2-9f76-9e9fb9fdc5b4',
 'request_created',
 '{"title": "Firewall high CPU usage", "priority": "CRITICAL", "created_from": "noc_dashboard"}'),

('666a6666-1111-1111-1111-111111111111',
 '6ed0b5e4-8973-4f13-8b46-7d79c01d1924',
 'request_assigned',
 '{"assigned_to": "f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11", "assigned_to_name": "Arjun Verma", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('666a6666-1111-1111-1111-111111111111',
 'f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11',
 'comment_added',
 '{"comment": "CPU spike due to large number of SSL decryption sessions. Tuned policies and offloaded logs.", "timestamp": "2025-11-02T09:20:00Z"}'),

('666a6666-1111-1111-1111-111111111111',
 'f901a1c0-2dbe-4d90-9c6c-2a0a2e6b2c11',
 'status_changed',
 '{"old_status": "IN_PROGRESS", "new_status": "REPAIRED", "timestamp": "2025-11-02T13:45:00Z"}'),

-- Logs for MCC voltage fluctuation (near SLA)

('666a6666-2222-2222-2222-222222222222',
 'a124185b-4ad9-4d0e-9c8c-64f191f1e1ab',
 'request_created',
 '{"title": "Voltage fluctuation observed in MCC feeders", "priority": "HIGH", "created_from": "mobile_app"}'),

('666a6666-2222-2222-2222-222222222222',
 '1f1c2d0b-6c8e-4e2b-8aa1-99a50d847d39',
 'request_assigned',
 '{"assigned_to": "a7f58c7d-0b14-4f09-9b72-058c4f8d4a96", "assigned_to_name": "Vikram Yadav", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('666a6666-2222-2222-2222-222222222222',
 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96',
 'comment_added',
 '{"comment": "Thermal scan showed one hot terminal on Feeder-3. Tightened and re-tested after cooldown.", "timestamp": "2025-11-10T14:30:00Z"}'),

('666a6666-2222-2222-2222-222222222222',
 'a7f58c7d-0b14-4f09-9b72-058c4f8d4a96',
 'status_changed',
 '{"old_status": "IN_PROGRESS", "new_status": "REPAIRED", "timestamp": "2025-11-10T16:45:00Z"}');

-- ============================================================================

-- Verification Queries (Uncomment to test)

-- ============================================================================

-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_teams FROM teams;
-- SELECT COUNT(*) as total_equipment FROM equipment;
-- SELECT COUNT(*) as total_requests FROM maintenance_requests;
-- SELECT COUNT(*) as total_assignments FROM request_assignments;
-- SELECT COUNT(*) as total_logs FROM maintenance_logs;

-- View all equipment with their teams
-- SELECT e.name, e.serial_number, e.status, e.location, t.name as team_name
-- FROM equipment e
-- JOIN teams t ON e.team_id = t.id
-- ORDER BY t.name, e.name;

-- View all maintenance requests with status and SLA
-- SELECT mr.title, mr.status, mr.priority, mr.scheduled_date, mr.sla_hours, e.name as equipment, t.name as team
-- FROM maintenance_requests mr
-- JOIN equipment e ON mr.equipment_id = e.id
-- JOIN teams t ON mr.team_id = t.id
-- ORDER BY mr.scheduled_date DESC;

-- ============================================================================

-- END OF SEED DATA

-- ============================================================================
