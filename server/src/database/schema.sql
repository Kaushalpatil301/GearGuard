-- ============================================================================
-- GearGuard Maintenance Management System - Database Schema
-- ============================================================================
-- Description: Production-grade schema for equipment maintenance management
-- Features: UUID keys, referential integrity, enums, proper indexing
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING OBJECTS
-- ============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS request_assignments CASCADE;
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS request_type CASCADE;
DROP TYPE IF EXISTS equipment_status CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Equipment status enum
CREATE TYPE equipment_status AS ENUM (
    'OPERATIONAL',      -- Equipment is working normally
    'UNDER_MAINTENANCE', -- Equipment is currently being serviced
    'SCRAPPED'          -- Equipment is decommissioned (no new requests allowed)
);

-- Maintenance request type enum
CREATE TYPE request_type AS ENUM (
    'CORRECTIVE',  -- Reactive maintenance (fix broken equipment)
    'PREVENTIVE'   -- Scheduled maintenance (requires scheduled_date)
);

-- Maintenance request status enum
CREATE TYPE request_status AS ENUM (
    'NEW',         -- Request created, not yet assigned
    'IN_PROGRESS', -- Technician is working on it
    'REPAIRED',    -- Equipment fixed and operational
    'SCRAP'        -- Equipment deemed unrepairable
);

-- Priority level enum
CREATE TYPE priority_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users Table
-- ----------------------------------------------------------------------------
-- Description: System users (technicians, managers, operators)
-- Note: Authentication is handled externally; this is for reference only
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL, -- e.g., 'technician', 'manager', 'operator'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookups by email and role
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role) WHERE is_active = TRUE;

-- ----------------------------------------------------------------------------
-- Teams Table
-- ----------------------------------------------------------------------------
-- Description: Maintenance teams (e.g., IT, Mechanics, Electricians)
-- Business Rule: Each equipment belongs to exactly one team
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for active teams
CREATE INDEX idx_teams_active ON teams(is_active);

-- ----------------------------------------------------------------------------
-- Team Members Table
-- ----------------------------------------------------------------------------
-- Description: Join table linking users (technicians) to maintenance teams
-- Business Rule: A user can belong to multiple teams, team can have multiple users
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate team memberships
    CONSTRAINT uq_team_members_team_user UNIQUE(team_id, user_id)
);

-- Indexes for efficient team/user lookups
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ----------------------------------------------------------------------------
-- Equipment Table
-- ----------------------------------------------------------------------------
-- Description: Physical assets requiring maintenance (machines, devices, tools)
-- Business Rule: Each equipment belongs to exactly one maintenance team
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    serial_number VARCHAR(100) UNIQUE,
    department VARCHAR(100), -- e.g., 'Production', 'IT', 'Logistics'
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Employee who owns/uses this equipment
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    status equipment_status NOT NULL DEFAULT 'OPERATIONAL',
    location VARCHAR(255),
    purchase_date DATE,
    warranty_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure serial number is provided
    CONSTRAINT chk_equipment_serial CHECK (serial_number IS NOT NULL AND LENGTH(serial_number) > 0)
);

-- Indexes for common queries
CREATE INDEX idx_equipment_team ON equipment(team_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_serial ON equipment(serial_number);
CREATE INDEX idx_equipment_department ON equipment(department) WHERE department IS NOT NULL;
CREATE INDEX idx_equipment_owner ON equipment(owner_id) WHERE owner_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- Maintenance Requests Table
-- ----------------------------------------------------------------------------
-- Description: Service requests for equipment maintenance
-- Business Rules:
--   - Auto-inherits team_id from equipment
--   - PREVENTIVE requests require scheduled_date (enforced at app level)
--   - CORRECTIVE requests may have NULL scheduled_date
--   - Scrapped equipment cannot accept new requests (app-level check)
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    request_type request_type NOT NULL,
    status request_status NOT NULL DEFAULT 'NEW',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority priority_level NOT NULL DEFAULT 'MEDIUM',
    scheduled_date TIMESTAMP, -- Required for PREVENTIVE, optional for CORRECTIVE
    duration_hours DECIMAL(5,2), -- Hours spent on repair (set when completed)
    sla_hours INTEGER NOT NULL DEFAULT 48, -- Service Level Agreement in hours
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure title and description are meaningful
    CONSTRAINT chk_request_title CHECK (LENGTH(title) >= 5),
    CONSTRAINT chk_request_description CHECK (LENGTH(description) >= 10)
);

-- Indexes for performance-critical queries
CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_team ON maintenance_requests(team_id);
CREATE INDEX idx_requests_status ON maintenance_requests(status);
CREATE INDEX idx_requests_scheduled ON maintenance_requests(scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX idx_requests_overdue ON maintenance_requests(scheduled_date, status) WHERE scheduled_date < CURRENT_TIMESTAMP AND status NOT IN ('REPAIRED', 'SCRAP');
CREATE INDEX idx_requests_type_status ON maintenance_requests(request_type, status);
CREATE INDEX idx_requests_created_by ON maintenance_requests(created_by);
CREATE INDEX idx_requests_sla ON maintenance_requests(created_at, status, sla_hours) WHERE status NOT IN ('REPAIRED', 'SCRAP');

-- ----------------------------------------------------------------------------
-- Request Assignments Table
-- ----------------------------------------------------------------------------
-- Description: Assigns maintenance requests to technicians
-- Business Rules:
--   - One request can only be assigned to ONE technician (UNIQUE constraint)
--   - Must be concurrency-safe (handled at app level with transactions)
--   - Technician must be a member of the request's team (app-level check)
CREATE TABLE request_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    
    -- CRITICAL: Prevent multiple assignments per request
    CONSTRAINT uq_assignment_request UNIQUE(request_id),
    
    -- Logical constraint: completion must be after assignment
    CONSTRAINT chk_assignment_dates CHECK (completed_at IS NULL OR completed_at >= assigned_at)
);

-- Indexes for assignment queries
CREATE INDEX idx_assignments_request ON request_assignments(request_id);
CREATE INDEX idx_assignments_assigned_to ON request_assignments(assigned_to);
CREATE INDEX idx_assignments_assigned_by ON request_assignments(assigned_by);
CREATE INDEX idx_assignments_completed ON request_assignments(completed_at) WHERE completed_at IS NOT NULL;

-- ----------------------------------------------------------------------------
-- Maintenance Logs Table
-- ----------------------------------------------------------------------------
-- Description: Audit trail for all request activities
-- Purpose: Track status changes, assignments, comments, and other events
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'status_changed', 'assigned', 'comment_added'
    details JSONB, -- Flexible storage for action-specific data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure action is meaningful
    CONSTRAINT chk_log_action CHECK (LENGTH(action) >= 3)
);

-- Indexes for log queries and reporting
CREATE INDEX idx_logs_request ON maintenance_logs(request_id);
CREATE INDEX idx_logs_user ON maintenance_logs(user_id);
CREATE INDEX idx_logs_created ON maintenance_logs(created_at DESC);
CREATE INDEX idx_logs_action ON maintenance_logs(action);
CREATE INDEX idx_logs_details ON maintenance_logs USING GIN(details); -- For JSONB queries

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Update timestamp trigger function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_teams_updated
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_equipment_updated
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_requests_updated
    BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'System users including technicians, managers, and operators';
COMMENT ON TABLE teams IS 'Maintenance teams responsible for equipment categories';
COMMENT ON TABLE team_members IS 'Links users to their respective maintenance teams';
COMMENT ON TABLE equipment IS 'Physical assets requiring maintenance';
COMMENT ON TABLE maintenance_requests IS 'Service requests for equipment maintenance';
COMMENT ON TABLE request_assignments IS 'Assignment of requests to technicians (one-to-one)';
COMMENT ON TABLE maintenance_logs IS 'Audit trail for all maintenance activities';

COMMENT ON COLUMN maintenance_requests.scheduled_date IS 'Required for PREVENTIVE requests, optional for CORRECTIVE';
COMMENT ON COLUMN equipment.status IS 'SCRAPPED equipment cannot receive new maintenance requests';
COMMENT ON CONSTRAINT uq_assignment_request ON request_assignments IS 'Ensures one request has only one assignment';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
