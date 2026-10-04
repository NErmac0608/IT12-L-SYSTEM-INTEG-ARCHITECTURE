const pool = require('./db');

async function fixCheckInFunction() {
    try {
        console.log('🔄 Updating check_in_student stored procedure in PostgreSQL...');
        const sql = `
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

    -- Update registration as attended (prefix table name to prevent plpgsql column ambiguity)
    UPDATE registrations
    SET
        status = 'attended',
        checked_in_at = CURRENT_TIMESTAMP
    WHERE registrations.id = v_registration.id
    RETURNING registrations.checked_in_at
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
        `;

        await pool.query(sql);
        console.log('✅ check_in_student stored procedure updated successfully!');
    } catch (err) {
        console.error('❌ Failed to update check_in_student:', err);
    } finally {
        await pool.end();
    }
}

fixCheckInFunction();
