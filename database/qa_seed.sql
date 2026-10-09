-- Local QA fixtures for UM-Tap.
-- Run against the um_tap database after database/setup.sql.
-- Safe to rerun: only the specifically named [QA] users/events are changed.
-- Do not use these predictable accounts or QR tokens outside local testing.

BEGIN;

INSERT INTO departments (name)
VALUES
    ('Department of Computing Education (DCE)'),
    ('Department of Business Administration Education (DBAE)')
ON CONFLICT (name) DO NOTHING;

-- Passwords: student123 for student accounts, organizer123 for organizer
-- accounts, and admin123 for the admin account.
INSERT INTO users
    (school_email, password_hash, full_name, student_id, department_id, role, is_active)
VALUES
    (
        'student.qa@umindanao.edu.ph',
        '$2b$10$/9fzS.I.COWp21nLuMb5rOK.ekzO45I/wT5fsP4KOD4jAWxj.X2Ay',
        'QA Student One',
        'QA-2026-00001',
        (SELECT id FROM departments WHERE name = 'Department of Computing Education (DCE)'),
        'student',
        TRUE
    ),
    (
        'student2.qa@umindanao.edu.ph',
        '$2b$10$/9fzS.I.COWp21nLuMb5rOK.ekzO45I/wT5fsP4KOD4jAWxj.X2Ay',
        'QA Student Two',
        'QA-2026-00002',
        (SELECT id FROM departments WHERE name = 'Department of Business Administration Education (DBAE)'),
        'student',
        TRUE
    ),
    (
        'student3.qa@umindanao.edu.ph',
        '$2b$10$/9fzS.I.COWp21nLuMb5rOK.ekzO45I/wT5fsP4KOD4jAWxj.X2Ay',
        'QA Student Three',
        'QA-2026-00003',
        (SELECT id FROM departments WHERE name = 'Department of Computing Education (DCE)'),
        'student',
        TRUE
    ),
    (
        'student.inactive.qa@umindanao.edu.ph',
        '$2b$10$/9fzS.I.COWp21nLuMb5rOK.ekzO45I/wT5fsP4KOD4jAWxj.X2Ay',
        'QA Inactive Student',
        'QA-2026-00004',
        (SELECT id FROM departments WHERE name = 'Department of Computing Education (DCE)'),
        'student',
        FALSE
    ),
    (
        'organizer.qa@umindanao.edu.ph',
        '$2b$10$R7RnZ0scfgNRTc.ilGAad.FsiBrAVCoyeSNh0jLmC1pHrusXg318a',
        'QA Organizer One',
        NULL,
        (SELECT id FROM departments WHERE name = 'Department of Computing Education (DCE)'),
        'organizer',
        TRUE
    ),
    (
        'organizer.other.qa@umindanao.edu.ph',
        '$2b$10$R7RnZ0scfgNRTc.ilGAad.FsiBrAVCoyeSNh0jLmC1pHrusXg318a',
        'QA Organizer Two',
        NULL,
        (SELECT id FROM departments WHERE name = 'Department of Business Administration Education (DBAE)'),
        'organizer',
        TRUE
    ),
    (
        'organizer.inactive.qa@umindanao.edu.ph',
        '$2b$10$R7RnZ0scfgNRTc.ilGAad.FsiBrAVCoyeSNh0jLmC1pHrusXg318a',
        'QA Inactive Organizer',
        NULL,
        (SELECT id FROM departments WHERE name = 'Department of Computing Education (DCE)'),
        'organizer',
        FALSE
    ),
    (
        'admin.qa@umindanao.edu.ph',
        '$2b$10$vsqCMH7bEyYG./rPSuQIFeWGqz6OqfcR0EzVvrVk4BzrjE4a7A8SO',
        'QA Administrator',
        NULL,
        (SELECT id FROM departments WHERE name = 'Department of Computing Education (DCE)'),
        'admin',
        TRUE
    )
ON CONFLICT (school_email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    student_id = EXCLUDED.student_id,
    department_id = EXCLUDED.department_id,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Keep fixture event dates relative to the day the script is run.
INSERT INTO events
    (organizer_id, department_id, title, description, event_date, start_time, end_time, location, status)
SELECT
    u.id,
    d.id,
    fixture.title,
    fixture.description,
    fixture.event_date,
    fixture.start_time,
    fixture.end_time,
    fixture.location,
    fixture.status
FROM (
    VALUES
        (
            'organizer.qa@umindanao.edu.ph',
            'Department of Computing Education (DCE)',
            '[QA] Open - Campus Innovation Workshop',
            'Future event for browsing, registration, QR pass, and roster testing.',
            CURRENT_DATE + 14,
            TIME '09:00',
            TIME '12:00',
            'IT Laboratory 1',
            'open'
        ),
        (
            'organizer.qa@umindanao.edu.ph',
            'Department of Computing Education (DCE)',
            '[QA] Open - Accessibility Testing Clinic',
            'Second open event for testing multiple registrations and event details.',
            CURRENT_DATE + 21,
            TIME '13:00',
            TIME '16:00',
            'Learning Commons',
            'open'
        ),
        (
            'organizer.qa@umindanao.edu.ph',
            'Department of Computing Education (DCE)',
            '[QA] Ongoing - Check-in Session',
            'Active event with registered and attended tickets for QR scanner testing.',
            CURRENT_DATE,
            TIME '08:00',
            TIME '17:00',
            'UM Tagum Gymnasium',
            'ongoing'
        ),
        (
            'organizer.qa@umindanao.edu.ph',
            'Department of Computing Education (DCE)',
            '[QA] Closed - Archived Event',
            'Past event for closed-state display and disabled check-in testing.',
            CURRENT_DATE - 7,
            TIME '09:00',
            TIME '12:00',
            'Computer Lab 2',
            'closed'
        ),
        (
            'organizer.other.qa@umindanao.edu.ph',
            'Department of Business Administration Education (DBAE)',
            '[QA] Cancelled - Registration Disabled',
            'Cancelled event for status display and unavailable registration testing.',
            CURRENT_DATE + 7,
            TIME '10:00',
            TIME '12:00',
            'Business Building',
            'cancelled'
        ),
        (
            'organizer.other.qa@umindanao.edu.ph',
            'Department of Business Administration Education (DBAE)',
            '[QA] Owner Check - Other Organizer Event',
            'Owned by the second organizer for event ownership and access-control testing.',
            CURRENT_DATE + 10,
            TIME '14:00',
            TIME '16:00',
            'Room B204',
            'open'
        )
) AS fixture(organizer_email, department_name, title, description, event_date, start_time, end_time, location, status)
JOIN users u ON u.school_email = fixture.organizer_email
JOIN departments d ON d.name = fixture.department_name
WHERE NOT EXISTS (
    SELECT 1
    FROM events existing
    WHERE existing.title = fixture.title
);

-- Refresh only the fixture-owned events so reruns keep relative dates current.
UPDATE events e
SET
    organizer_id = u.id,
    department_id = d.id,
    description = fixture.description,
    event_date = fixture.event_date,
    start_time = fixture.start_time,
    end_time = fixture.end_time,
    location = fixture.location,
    status = fixture.status
FROM (
    VALUES
        ('[QA] Open - Campus Innovation Workshop', 'organizer.qa@umindanao.edu.ph', 'Department of Computing Education (DCE)', 'Future event for browsing, registration, QR pass, and roster testing.', CURRENT_DATE + 14, TIME '09:00', TIME '12:00', 'IT Laboratory 1', 'open'),
        ('[QA] Open - Accessibility Testing Clinic', 'organizer.qa@umindanao.edu.ph', 'Department of Computing Education (DCE)', 'Second open event for testing multiple registrations and event details.', CURRENT_DATE + 21, TIME '13:00', TIME '16:00', 'Learning Commons', 'open'),
        ('[QA] Ongoing - Check-in Session', 'organizer.qa@umindanao.edu.ph', 'Department of Computing Education (DCE)', 'Active event with registered and attended tickets for QR scanner testing.', CURRENT_DATE, TIME '08:00', TIME '17:00', 'UM Tagum Gymnasium', 'ongoing'),
        ('[QA] Closed - Archived Event', 'organizer.qa@umindanao.edu.ph', 'Department of Computing Education (DCE)', 'Past event for closed-state display and disabled check-in testing.', CURRENT_DATE - 7, TIME '09:00', TIME '12:00', 'Computer Lab 2', 'closed'),
        ('[QA] Cancelled - Registration Disabled', 'organizer.other.qa@umindanao.edu.ph', 'Department of Business Administration Education (DBAE)', 'Cancelled event for status display and unavailable registration testing.', CURRENT_DATE + 7, TIME '10:00', TIME '12:00', 'Business Building', 'cancelled'),
        ('[QA] Owner Check - Other Organizer Event', 'organizer.other.qa@umindanao.edu.ph', 'Department of Business Administration Education (DBAE)', 'Owned by the second organizer for event ownership and access-control testing.', CURRENT_DATE + 10, TIME '14:00', TIME '16:00', 'Room B204', 'open')
) AS fixture(title, organizer_email, department_name, description, event_date, start_time, end_time, location, status)
JOIN users u ON u.school_email = fixture.organizer_email
JOIN departments d ON d.name = fixture.department_name
WHERE e.title = fixture.title;

-- Fixed UUIDs make scanner tests repeatable. Attended fixture rows are
-- already redeemed; registered fixture rows can be scanned once.
INSERT INTO registrations
    (event_id, user_id, qr_token, status, checked_in_at, registered_at)
SELECT
    e.id,
    u.id,
    fixture.qr_token::UUID,
    fixture.status,
    CASE WHEN fixture.status = 'attended' THEN CURRENT_TIMESTAMP - INTERVAL '1 hour' ELSE NULL END,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM (
    VALUES
        ('[QA] Open - Campus Innovation Workshop', 'student.qa@umindanao.edu.ph', 'c0ffee00-0000-4000-8000-000000000001', 'registered'),
        ('[QA] Open - Campus Innovation Workshop', 'student2.qa@umindanao.edu.ph', 'c0ffee00-0000-4000-8000-000000000002', 'registered'),
        ('[QA] Open - Accessibility Testing Clinic', 'student3.qa@umindanao.edu.ph', 'c0ffee00-0000-4000-8000-000000000003', 'registered'),
        ('[QA] Ongoing - Check-in Session', 'student.qa@umindanao.edu.ph', 'c0ffee00-0000-4000-8000-000000000004', 'attended'),
        ('[QA] Ongoing - Check-in Session', 'student2.qa@umindanao.edu.ph', 'c0ffee00-0000-4000-8000-000000000005', 'registered'),
        ('[QA] Closed - Archived Event', 'student3.qa@umindanao.edu.ph', 'c0ffee00-0000-4000-8000-000000000006', 'attended')
) AS fixture(event_title, student_email, qr_token, status)
JOIN events e ON e.title = fixture.event_title
JOIN users u ON u.school_email = fixture.student_email
ON CONFLICT (event_id, user_id) DO UPDATE SET
    qr_token = EXCLUDED.qr_token,
    status = EXCLUDED.status,
    checked_in_at = EXCLUDED.checked_in_at,
    registered_at = EXCLUDED.registered_at;

COMMIT;

-- Run this query any time to retrieve the QA tickets and tokens:
SELECT
    e.title AS event,
    u.school_email AS student,
    r.status,
    r.qr_token
FROM registrations r
JOIN events e ON e.id = r.event_id
JOIN users u ON u.id = r.user_id
WHERE e.title LIKE '[QA]%'
ORDER BY e.event_date, e.title, u.school_email;
