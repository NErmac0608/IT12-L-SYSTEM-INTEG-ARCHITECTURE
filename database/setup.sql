-- =========================================================
-- UM-TAP DATABASE SCRIPT
-- Project: UM-Tap: Event Registration and Attendance
--          Monitoring System
-- Database: PostgreSQL
-- =========================================================


-- =========================================================
-- 0. CREATE DATABASE
-- =========================================================

CREATE DATABASE um_tap;


-- =========================================================
-- IMPORTANT:
-- After creating the database, connect to the "um_tap"
-- database before running the remaining script.
-- =========================================================


-- =========================================================
-- 1. CLEANUP
-- This allows the script to be re-run during development.
-- Remove this section if you need to preserve existing data.
-- =========================================================

DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;


-- =========================================================
-- 2. DEPARTMENTS TABLE
-- Stores the departments that users belong to and that
-- host university events.
-- =========================================================

CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_departments_name
        UNIQUE (name),

    CONSTRAINT chk_departments_name
        CHECK (LENGTH(TRIM(name)) > 0)
);


-- =========================================================
-- 3. USERS TABLE
-- Stores students, event organizers, and administrators.
--
-- Roles:
-- student   = regular event attendee
-- organizer = creates/manages events and scans QR codes
-- admin     = manages organizer accounts/system access
-- =========================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    school_email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    full_name VARCHAR(150) NOT NULL,

    student_id VARCHAR(50) UNIQUE,

    department_id BIGINT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'student',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,


    -- Department relationship
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,


    -- User role validation
    CONSTRAINT chk_users_role
        CHECK (role IN ('student', 'organizer', 'admin')),


    -- UM institutional email validation
    CONSTRAINT chk_users_um_email
        CHECK (
            school_email ~* '^[A-Z0-9._%+-]+@umindanao\.edu\.ph$'
        )
);


-- =========================================================
-- 4. EVENTS TABLE
-- Stores activities, seminars, assemblies, and other
-- university events created by organizers.
-- =========================================================

CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,

    organizer_id BIGINT NOT NULL,

    department_id BIGINT NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    event_date DATE NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    location VARCHAR(255) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'open',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,


    -- Organizer relationship
    CONSTRAINT fk_events_organizer
        FOREIGN KEY (organizer_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,


    -- Department relationship
    CONSTRAINT fk_events_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,


    -- Event status validation
    CONSTRAINT chk_events_status
        CHECK (status IN ('open', 'ongoing', 'closed')),


    -- End time must be later than start time
    CONSTRAINT chk_events_time
        CHECK (end_time > start_time)
);


-- =========================================================
-- 5. REGISTRATIONS TABLE
-- Connects a student to an event.
--
-- Each successful registration generates one unique QR token.
-- The QR token is used by the organizer's scanner during
-- on-site attendance checking.
--
-- registered = student registered but has not checked in
-- attended   = QR was successfully scanned
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


CREATE TABLE registrations (
    id BIGSERIAL PRIMARY KEY,

    event_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    qr_token UUID NOT NULL DEFAULT gen_random_uuid(),

    status VARCHAR(20) NOT NULL DEFAULT 'registered',

    checked_in_at TIMESTAMPTZ NULL,

    registered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,


    -- Event relationship
    CONSTRAINT fk_registrations_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,


    -- User relationship
    CONSTRAINT fk_registrations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,


    -- Registration status validation
    CONSTRAINT chk_registrations_status
        CHECK (status IN ('registered', 'attended')),


    -- Prevent duplicate registration for the same event
    CONSTRAINT uq_event_student
        UNIQUE (event_id, user_id),


    -- Every QR token must be unique
    CONSTRAINT uq_qr_token
        UNIQUE (qr_token),


    -- Check-in timestamp must match registration status
    CONSTRAINT chk_checked_in_status
        CHECK (
            (status = 'registered' AND checked_in_at IS NULL)
            OR
            (status = 'attended' AND checked_in_at IS NOT NULL)
        )
);


-- =========================================================
-- 6. INDEXES
-- These improve common searches used by the system.
-- =========================================================

-- Departments
CREATE INDEX idx_departments_name
ON departments(name);


-- Users
CREATE INDEX idx_users_department
ON users(department_id);

CREATE INDEX idx_users_role
ON users(role);


-- Events
CREATE INDEX idx_events_department
ON events(department_id);

CREATE INDEX idx_events_date
ON events(event_date);

CREATE INDEX idx_events_status
ON events(status);

CREATE INDEX idx_events_organizer
ON events(organizer_id);


-- Registrations
CREATE INDEX idx_registrations_event
ON registrations(event_id);

CREATE INDEX idx_registrations_user
ON registrations(user_id);

CREATE INDEX idx_registrations_status
ON registrations(status);

CREATE INDEX idx_registrations_qr_token
ON registrations(qr_token);


-- =========================================================
-- 7. UPDATED_AT FUNCTION
-- Automatically updates updated_at whenever a record
-- is changed.
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN

    NEW.updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


-- =========================================================
-- 8. UPDATED_AT TRIGGERS
-- =========================================================

-- Departments trigger
CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Users trigger
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Events trigger
CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- =========================================================
-- 9. DEPARTMENT FUNCTION
-- Adds a new department and returns its ID.
-- =========================================================

CREATE OR REPLACE FUNCTION add_department(
    p_name VARCHAR(150)
)
RETURNS BIGINT
AS $$
DECLARE

    v_department_id BIGINT;

BEGIN

    INSERT INTO departments (name)
    VALUES (TRIM(p_name))

    RETURNING id
    INTO v_department_id;

    RETURN v_department_id;

END;
$$ LANGUAGE plpgsql;


-- =========================================================
-- 10. SAMPLE DATA
-- These are sample records for testing only.
-- Password hashes below are placeholders.
-- Replace them with real hashes generated by the backend.
-- =========================================================


-- ---------------------------------------------------------
-- Sample Departments
-- ---------------------------------------------------------

INSERT INTO departments (name)
VALUES
    ('BS Information Technology'),
    ('College of Computing Education'),
    ('University Administration');


-- ---------------------------------------------------------
-- Sample Users
-- ---------------------------------------------------------

INSERT INTO users
(
    school_email,
    password_hash,
    full_name,
    student_id,
    department_id,
    role
)
VALUES
(
    'student01@umindanao.edu.ph',
    'REPLACE_WITH_REAL_PASSWORD_HASH',
    'Juan Dela Cruz',
    '2026-00001',

    (
        SELECT id
        FROM departments
        WHERE name = 'BS Information Technology'
    ),

    'student'
),
(
    'organizer01@umindanao.edu.ph',
    'REPLACE_WITH_REAL_PASSWORD_HASH',
    'Maria Santos',
    NULL,

    (
        SELECT id
        FROM departments
        WHERE name = 'College of Computing Education'
    ),

    'organizer'
),
(
    'admin01@umindanao.edu.ph',
    'REPLACE_WITH_REAL_PASSWORD_HASH',
    'System Administrator',
    NULL,

    (
        SELECT id
        FROM departments
        WHERE name = 'University Administration'
    ),

    'admin'
);


-- ---------------------------------------------------------
-- Sample Event
-- ---------------------------------------------------------

INSERT INTO events
(
    organizer_id,
    department_id,
    title,
    description,
    event_date,
    start_time,
    end_time,
    location,
    status
)
VALUES
(
    (
        SELECT id
        FROM users
        WHERE school_email = 'organizer01@umindanao.edu.ph'
    ),

    (
        SELECT id
        FROM departments
        WHERE name = 'BS Information Technology'
    ),

    'BSIT General Assembly',

    'General assembly for BSIT students.',

    '2026-09-15',

    '08:00:00',

    '17:00:00',

    'UM Tagum Gymnasium',

    'open'
);


-- ---------------------------------------------------------
-- Sample Registration
-- The QR token is automatically generated as a UUID.
-- ---------------------------------------------------------

INSERT INTO registrations
(
    event_id,
    user_id
)
VALUES
(
    (
        SELECT id
        FROM events
        WHERE title = 'BSIT General Assembly'
    ),

    (
        SELECT id
        FROM users
        WHERE school_email = 'student01@umindanao.edu.ph'
    )
);


-- =========================================================
-- 11. USEFUL VIEWS
-- =========================================================


-- ---------------------------------------------------------
-- View all events together with organizer and department
-- information.
-- ---------------------------------------------------------

CREATE OR REPLACE VIEW event_list_view AS

SELECT
    e.id,
    e.title,
    e.description,

    d.id AS department_id,
    d.name AS department,

    e.event_date,
    e.start_time,
    e.end_time,
    e.location,
    e.status,

    e.organizer_id,

    u.full_name AS organizer_name,

    e.created_at

FROM events e

JOIN users u
    ON e.organizer_id = u.id

JOIN departments d
    ON e.department_id = d.id;


-- ---------------------------------------------------------
-- View registered students and their attendance status.
-- ---------------------------------------------------------

CREATE OR REPLACE VIEW event_attendance_view AS

SELECT
    r.id AS registration_id,

    r.event_id,

    e.title AS event_title,

    e.event_date,

    e.location,

    u.id AS student_id_record,

    u.full_name,

    u.student_id,

    u.school_email,

    d.id AS department_id,

    d.name AS department,

    r.qr_token,

    r.status,

    r.registered_at,

    r.checked_in_at

FROM registrations r

JOIN events e
    ON r.event_id = e.id

JOIN users u
    ON r.user_id = u.id

JOIN departments d
    ON u.department_id = d.id;


-- =========================================================
-- 12. ATTENDANCE / QR SCANNING FUNCTION
--
-- This function:
--
-- 1. Finds the registration using the QR token.
-- 2. Confirms the registration belongs to the selected event.
-- 3. Checks that the QR has not already been redeemed.
-- 4. Changes status from registered -> attended.
-- 5. Records the exact check-in timestamp.
-- =========================================================

CREATE OR REPLACE FUNCTION check_in_student(
    p_event_id BIGINT,
    p_qr_token UUID
)

RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    registration_id BIGINT,
    student_name VARCHAR,
    checked_in_at TIMESTAMPTZ
)

AS $$

DECLARE

    v_registration registrations%ROWTYPE;

    v_student_name VARCHAR(150);

BEGIN


    -- Find the registration using the event and QR token
    SELECT r.*
    INTO v_registration

    FROM registrations r

    WHERE r.event_id = p_event_id

      AND r.qr_token = p_qr_token

    FOR UPDATE;


    -- QR code or registration does not exist
    IF NOT FOUND THEN

        RETURN QUERY

        SELECT
            FALSE,
            'Invalid QR code or registration not found.'::TEXT,
            NULL::BIGINT,
            NULL::VARCHAR,
            NULL::TIMESTAMPTZ;

        RETURN;

    END IF;


    -- Check if the QR code has already been used
    IF v_registration.status = 'attended' THEN

        SELECT u.full_name
        INTO v_student_name

        FROM users u

        WHERE u.id = v_registration.user_id;


        RETURN QUERY

        SELECT
            FALSE,
            'QR code has already been redeemed.'::TEXT,
            v_registration.id,
            v_student_name,
            v_registration.checked_in_at;

        RETURN;

    END IF;


    -- Update registration as attended
    UPDATE registrations

    SET
        status = 'attended',
        checked_in_at = CURRENT_TIMESTAMP

    WHERE id = v_registration.id

    RETURNING checked_in_at
    INTO v_registration.checked_in_at;


    -- Get student name
    SELECT u.full_name
    INTO v_student_name

    FROM users u

    WHERE u.id = v_registration.user_id;


    -- Return successful attendance
    RETURN QUERY

    SELECT
        TRUE,
        'Attendance successfully recorded.'::TEXT,
        v_registration.id,
        v_student_name,
        v_registration.checked_in_at;


END;

$$ LANGUAGE plpgsql;


-- =========================================================
-- 13. TEST QUERIES
-- Uncomment these when testing the database.
-- =========================================================


-- View all departments:
-- SELECT * FROM departments;


-- View all users:
-- SELECT * FROM users;


-- View all events:
-- SELECT * FROM events;


-- View all registrations:
-- SELECT * FROM registrations;


-- View complete event list:
-- SELECT * FROM event_list_view;


-- View attendance records:
-- SELECT * FROM event_attendance_view;


-- Test adding a department:
-- SELECT add_department('BS Computer Science');


-- Test QR check-in:
-- SELECT *
-- FROM check_in_student(
--     1,
--     (SELECT qr_token FROM registrations LIMIT 1)
-- );


-- Check attendance after scanning:
-- SELECT *
-- FROM event_attendance_view
-- WHERE event_id = 1;

=============================================================
14. Demo Accounts for Testing
=============================================================
-- 1. Insert a demo student account
INSERT INTO users (full_name, school_email, password_hash, role, student_id, department_id)
VALUES ('Demo Student', 'student@umindanao.edu.ph', 'student123', 'student', 'N.145242', 1)
ON CONFLICT (school_email) DO NOTHING;

-- 2. Insert a demo organizer account
INSERT INTO users (full_name, school_email, password_hash, role, department_id)
VALUES ('Demo Organizer', 'organizer@umindanao.edu.ph', 'organizer123', 'organizer', 1)
ON CONFLICT (school_email) DO NOTHING;

-- 3. Insert a demo admin account
INSERT INTO users (full_name, school_email, password_hash, role, department_id)
VALUES ('System Administrator', 'admin@umindanao.edu.ph', 'admin123', 'admin', 1)
ON CONFLICT (school_email) DO NOTHING;
