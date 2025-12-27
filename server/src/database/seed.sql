-- ============================================================================
-- GearGuard - Seed Data (Indian Context)
-- ============================================================================
-- Description: Sample data for testing and demonstration
-- Context: Manufacturing facility in India
-- ============================================================================

-- Clear existing data (optional - use with caution)
TRUNCATE TABLE maintenance_logs, request_assignments, maintenance_requests, equipment, team_members, teams, users RESTART IDENTITY CASCADE;

-- ============================================================================
-- USERS (Technicians, Managers, Operators)
-- ============================================================================

INSERT INTO users (id, name, email, role, is_active) VALUES
-- Technicians
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Rajesh Kumar', 'rajesh.kumar@gearguard.in', 'technician', TRUE),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Priya Sharma', 'priya.sharma@gearguard.in', 'technician', TRUE),
('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Amit Patel', 'amit.patel@gearguard.in', 'technician', TRUE),
('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'Sneha Reddy', 'sneha.reddy@gearguard.in', 'technician', TRUE),
('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'Vikram Singh', 'vikram.singh@gearguard.in', 'technician', TRUE),
('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'Anita Desai', 'anita.desai@gearguard.in', 'technician', TRUE),

-- Managers
('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'Suresh Mehta', 'suresh.mehta@gearguard.in', 'manager', TRUE),
('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'Kavita Nair', 'kavita.nair@gearguard.in', 'manager', TRUE),

-- Operators
('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'Rahul Verma', 'rahul.verma@gearguard.in', 'operator', TRUE),
('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'Deepika Joshi', 'deepika.joshi@gearguard.in', 'operator', TRUE),
('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 'Manoj Gupta', 'manoj.gupta@gearguard.in', 'operator', TRUE);

-- ============================================================================
-- TEAMS (Maintenance Teams)
-- ============================================================================

INSERT INTO teams (id, name, description, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'IT Support', 'Handles all IT equipment and computer systems', TRUE),
('22222222-2222-2222-2222-222222222222', 'Mechanical Team', 'Responsible for mechanical equipment and machinery', TRUE),
('33333333-3333-3333-3333-333333333333', 'Electrical Team', 'Manages electrical systems and power equipment', TRUE),
('44444444-4444-4444-4444-444444444444', 'HVAC Team', 'Maintains heating, ventilation, and air conditioning systems', TRUE);

-- ============================================================================
-- TEAM MEMBERS (Assign Technicians to Teams)
-- ============================================================================

INSERT INTO team_members (team_id, user_id) VALUES
-- IT Support Team
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'), -- Rajesh Kumar
('11111111-1111-1111-1111-111111111111', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e'), -- Priya Sharma

-- Mechanical Team
('22222222-2222-2222-2222-222222222222', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f'), -- Amit Patel
('22222222-2222-2222-2222-222222222222', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a'), -- Sneha Reddy

-- Electrical Team
('33333333-3333-3333-3333-333333333333', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b'), -- Vikram Singh
('33333333-3333-3333-3333-333333333333', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c'); -- Anita Desai

-- ============================================================================
-- EQUIPMENT (Assets across different locations)
-- ============================================================================

INSERT INTO equipment (id, name, description, serial_number, department, owner_id, team_id, status, location, purchase_date, warranty_end_date) VALUES
-- IT Equipment
('eeee1111-1111-1111-1111-111111111111', 'Dell PowerEdge Server', 'Main production server', 'SRV-DEL-2023-001', 'IT', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '11111111-1111-1111-1111-111111111111', 'OPERATIONAL', 'Mumbai Data Center', '2023-01-15', '2026-01-15'),
('eeee1111-2222-2222-2222-222222222222', 'HP LaserJet Printer', 'Office floor printer', 'PRT-HP-2023-045', 'Administration', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '11111111-1111-1111-1111-111111111111', 'OPERATIONAL', 'Pune Office - 3rd Floor', '2023-03-20', '2025-03-20'),
('eeee1111-3333-3333-3333-333333333333', 'Cisco Network Switch', '48-port gigabit switch', 'NET-CISCO-2022-089', 'IT', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '11111111-1111-1111-1111-111111111111', 'UNDER_MAINTENANCE', 'Bangalore Server Room', '2022-11-10', '2025-11-10'),

-- Mechanical Equipment
('eeee2222-1111-1111-1111-111111111111', 'CNC Milling Machine', 'Precision milling for parts', 'CNC-HAM-2021-034', 'Production', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '22222222-2222-2222-2222-222222222222', 'OPERATIONAL', 'Chennai Factory - Shop Floor A', '2021-06-15', '2024-06-15'),
('eeee2222-2222-2222-2222-222222222222', 'Hydraulic Press', '500-ton capacity hydraulic press', 'HYD-PRES-2020-012', 'Production', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '22222222-2222-2222-2222-222222222222', 'OPERATIONAL', 'Ahmedabad Plant - Assembly Line 2', '2020-08-25', '2023-08-25'),
('eeee2222-3333-3333-3333-333333333333', 'Lathe Machine', 'Heavy-duty lathe for metal turning', 'LAT-ACE-2019-067', 'Production', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', '22222222-2222-2222-2222-222222222222', 'SCRAPPED', 'Coimbatore Workshop', '2019-02-10', '2022-02-10'),

-- Electrical Equipment
('eeee3333-1111-1111-1111-111111111111', 'Diesel Generator', '500 KVA backup generator', 'DG-CUMMINS-2022-023', 'Facilities', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', '33333333-3333-3333-3333-333333333333', 'OPERATIONAL', 'Hyderabad Warehouse - Backyard', '2022-05-18', '2027-05-18'),
('eeee3333-2222-2222-2222-222222222222', 'Distribution Panel', 'Main electrical distribution board', 'DB-SIEMENS-2021-156', 'Facilities', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', '33333333-3333-3333-3333-333333333333', 'OPERATIONAL', 'Delhi Factory - Electrical Room', '2021-09-12', '2031-09-12'),
('eeee3333-3333-3333-3333-333333333333', 'UPS System', '100 KVA uninterruptible power supply', 'UPS-APC-2023-089', 'IT', 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', '33333333-3333-3333-3333-333333333333', 'UNDER_MAINTENANCE', 'Kolkata Office - Server Room', '2023-04-22', '2028-04-22'),

-- HVAC Equipment
('eeee4444-1111-1111-1111-111111111111', 'Central AC Unit', '20-ton central air conditioning', 'AC-VOLTAS-2022-034', 'Facilities', NULL, '44444444-4444-4444-4444-444444444444', 'OPERATIONAL', 'Gurgaon Office - Rooftop', '2022-03-08', '2027-03-08'),
('eeee4444-2222-2222-2222-222222222222', 'Industrial Exhaust Fan', 'Heavy-duty ventilation system', 'FAN-USHA-2021-178', 'Production', NULL, '44444444-4444-4444-4444-444444444444', 'OPERATIONAL', 'Noida Manufacturing Unit', '2021-07-14', '2026-07-14');

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
 'Printer paper jam issue', 
 'HP LaserJet printer has frequent paper jams. Need to inspect and clean the rollers.',
 'MEDIUM',
 NULL,
 48,
 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f'), -- Rahul Verma

('111a1111-2222-2222-2222-222222222222', 
 'eeee2222-1111-1111-1111-111111111111', 
 '22222222-2222-2222-2222-222222222222', 
 'PREVENTIVE', 
 'NEW', 
 'Quarterly maintenance for CNC machine', 
 'Scheduled preventive maintenance including lubrication, calibration, and safety checks.',
 'HIGH',
 '2025-01-15 10:00:00',
 24,
 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a'), -- Deepika Joshi

('111a1111-3333-3333-3333-333333333333', 
 'eeee3333-1111-1111-1111-111111111111', 
 '33333333-3333-3333-3333-333333333333', 
 'CORRECTIVE', 
 'NEW', 
 'Generator not starting', 
 'Diesel generator failed to start during power outage test. Battery might be dead.',
 'CRITICAL',
 NULL,
 4,
 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f'), -- Rahul Verma

-- In Progress Requests (Already assigned)
('222a2222-1111-1111-1111-111111111111', 
 'eeee1111-3333-3333-3333-333333333333', 
 '11111111-1111-1111-1111-111111111111', 
 'CORRECTIVE', 
 'IN_PROGRESS', 
 'Network switch port failure', 
 'Port 24 on Cisco switch is not responding. Need to diagnose and replace if necessary.',
 'HIGH',
 NULL,
 24,
 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b'), -- Manoj Gupta

('222a2222-2222-2222-2222-222222222222', 
 'eeee3333-3333-3333-3333-333333333333', 
 '33333333-3333-3333-3333-333333333333', 
 'PREVENTIVE', 
 'IN_PROGRESS', 
 'UPS battery replacement', 
 'Annual battery replacement for UPS system to ensure backup power reliability.',
 'MEDIUM',
 '2024-12-28 14:00:00',
 48,
 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a'), -- Deepika Joshi

-- Completed Requests
('333a3333-1111-1111-1111-111111111111', 
 'eeee4444-1111-1111-1111-111111111111', 
 '44444444-4444-4444-4444-444444444444', 
 'CORRECTIVE', 
 'REPAIRED', 
 'AC not cooling properly', 
 'Central AC unit was not maintaining temperature. Refrigerant was recharged.',
 'HIGH',
 NULL,
 24,
 'c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f'), -- Rahul Verma

('333a3333-2222-2222-2222-222222222222', 
 'eeee2222-2222-2222-2222-222222222222', 
 '22222222-2222-2222-2222-222222222222', 
 'PREVENTIVE', 
 'REPAIRED', 
 'Half-yearly inspection of hydraulic press', 
 'Routine inspection completed. All hydraulic seals and pressure gauges checked and certified.',
 'MEDIUM',
 '2024-12-15 09:00:00',
 72,
 'd0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a'), -- Deepika Joshi

-- Scrapped Equipment Request
('444a4444-1111-1111-1111-111111111111', 
 'eeee2222-3333-3333-3333-333333333333', 
 '22222222-2222-2222-2222-222222222222', 
 'CORRECTIVE', 
 'SCRAP', 
 'Lathe machine motor failure', 
 'Motor seized completely. Equipment is beyond economical repair. Recommended for scrapping.',
 'LOW',
 NULL,
 96,
 'e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b'); -- Manoj Gupta

-- ============================================================================
-- REQUEST ASSIGNMENTS
-- ============================================================================

INSERT INTO request_assignments (id, request_id, assigned_to, assigned_by, assigned_at, completed_at, notes) VALUES
-- Completed assignment
('aaa11111-1111-1111-1111-111111111111',
 '333a3333-1111-1111-1111-111111111111',
 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', -- Rajesh Kumar (IT)
 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', -- Assigned by Suresh Mehta
 '2024-12-20 08:30:00',
 '2024-12-21 16:45:00',
 'Refrigerant recharged successfully. AC working normally now.'),

('aaa22222-2222-2222-2222-222222222222',
 '333a3333-2222-2222-2222-222222222222',
 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', -- Amit Patel (Mechanical)
 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', -- Assigned by Suresh Mehta
 '2024-12-14 10:00:00',
 '2024-12-15 15:30:00',
 'All safety checks passed. Equipment certified for next 6 months.'),

-- Active assignments (not yet completed)
('aaa33333-1111-1111-1111-111111111111',
 '222a2222-1111-1111-1111-111111111111',
 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', -- Rajesh Kumar (IT)
 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', -- Assigned by Kavita Nair
 '2024-12-26 11:00:00',
 NULL,
 NULL),

('aaa33333-2222-2222-2222-222222222222',
 '222a2222-2222-2222-2222-222222222222',
 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', -- Vikram Singh (Electrical)
 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', -- Assigned by Suresh Mehta
 '2024-12-27 09:30:00',
 NULL,
 NULL),

-- Scrapped equipment assignment
('aaa44444-1111-1111-1111-111111111111',
 '444a4444-1111-1111-1111-111111111111',
 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', -- Sneha Reddy (Mechanical)
 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', -- Assigned by Kavita Nair
 '2024-12-10 14:00:00',
 '2024-12-11 17:00:00',
 'Equipment inspected. Motor replacement cost exceeds equipment value. Recommended scrapping.');

-- ============================================================================
-- MAINTENANCE LOGS
-- ============================================================================

INSERT INTO maintenance_logs (request_id, user_id, action, details) VALUES
-- Logs for completed AC repair
('333a3333-1111-1111-1111-111111111111',
 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d',
 'request_assigned',
 '{"assigned_to": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d", "assigned_to_name": "Rajesh Kumar", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('333a3333-1111-1111-1111-111111111111',
 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
 'comment_added',
 '{"comment": "Diagnosed issue. Refrigerant level is low. Will recharge today.", "timestamp": "2024-12-20T12:30:00Z"}'),

('333a3333-1111-1111-1111-111111111111',
 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
 'status_changed',
 '{"old_status": "IN_PROGRESS", "new_status": "REPAIRED", "timestamp": "2024-12-21T16:45:00Z"}'),

-- Logs for hydraulic press maintenance
('333a3333-2222-2222-2222-222222222222',
 'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d',
 'request_assigned',
 '{"assigned_to": "c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f", "assigned_to_name": "Amit Patel", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('333a3333-2222-2222-2222-222222222222',
 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
 'comment_added',
 '{"comment": "All hydraulic seals inspected. No leaks found. Pressure test successful.", "timestamp": "2024-12-15T14:00:00Z"}'),

('333a3333-2222-2222-2222-222222222222',
 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
 'status_changed',
 '{"old_status": "IN_PROGRESS", "new_status": "REPAIRED", "timestamp": "2024-12-15T15:30:00Z"}'),

-- Logs for network switch issue
('222a2222-1111-1111-1111-111111111111',
 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e',
 'request_assigned',
 '{"assigned_to": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d", "assigned_to_name": "Rajesh Kumar", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('222a2222-1111-1111-1111-111111111111',
 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
 'priority_changed',
 '{"old_priority": "MEDIUM", "new_priority": "HIGH", "timestamp": "2024-12-26T13:00:00Z"}'),

-- Logs for scrapped equipment
('444a4444-1111-1111-1111-111111111111',
 'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e',
 'request_assigned',
 '{"assigned_to": "d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a", "assigned_to_name": "Sneha Reddy", "previous_status": "NEW", "new_status": "IN_PROGRESS"}'),

('444a4444-1111-1111-1111-111111111111',
 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
 'equipment_scrapped',
 '{"equipment_id": "eeee2222-3333-3333-3333-333333333333", "equipment_name": "Lathe Machine", "timestamp": "2024-12-11T17:00:00Z"}'),

('444a4444-1111-1111-1111-111111111111',
 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
 'status_changed',
 '{"old_status": "IN_PROGRESS", "new_status": "SCRAP", "timestamp": "2024-12-11T17:00:00Z"}');

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

-- View all maintenance requests with status
-- SELECT mr.title, mr.status, mr.priority, e.name as equipment, t.name as team
-- FROM maintenance_requests mr
-- JOIN equipment e ON mr.equipment_id = e.id
-- JOIN teams t ON mr.team_id = t.id
-- ORDER BY mr.created_at DESC;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
