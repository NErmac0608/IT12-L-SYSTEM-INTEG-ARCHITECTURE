const pool = require('./db');
const bcrypt = require('bcrypt');

async function resetDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Resetting database...');
    await client.query('BEGIN');

    // 1. Clear registrations and attendance logs
    await client.query('TRUNCATE TABLE registrations RESTART IDENTITY CASCADE;');

    // 2. Clear events
    await client.query('TRUNCATE TABLE events RESTART IDENTITY CASCADE;');

    // 3. Remove all users except the 3 demo accounts
    await client.query(`
      DELETE FROM users 
      WHERE school_email NOT IN (
        'student@umindanao.edu.ph',
        'organizer@umindanao.edu.ph',
        'admin@umindanao.edu.ph'
      );
    `);

    // 4. Ensure the 9 official departments exist
    await client.query(`
      INSERT INTO departments (name)
      VALUES 
        ('Department of Teacher Education (DTE)'),
        ('Department of Criminal Justice Education (DCJE)'),
        ('Department of Arts and Sciences Education (DASE)'),
        ('Department of Business Administration Education (DBAE)'),
        ('Department of Computing Education (DCE)'),
        ('Department of Engineering Education (DEE)'),
        ('Department of Accounting Education (DAE)'),
        ('Department of Hospitality Education (DHE)'),
        ('Basic Education (JHS & SHS)')
      ON CONFLICT (name) DO NOTHING;
    `);

    const deptRes = await client.query("SELECT id FROM departments WHERE name = 'Department of Computing Education (DCE)' LIMIT 1;");
    const deptId = deptRes.rows[0]?.id;

    // 5. Ensure the 3 demo accounts exist with active status and valid password hashes
    const studentHash = await bcrypt.hash('student123', 10);
    const organizerHash = await bcrypt.hash('organizer123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    await client.query(`
      INSERT INTO users (full_name, school_email, password_hash, role, student_id, department_id, is_active)
      VALUES 
        ('Demo Student', 'student@umindanao.edu.ph', $1, 'student', 'N.145242', $2, true),
        ('Demo Organizer', 'organizer@umindanao.edu.ph', $3, 'organizer', NULL, $2, true),
        ('System Administrator', 'admin@umindanao.edu.ph', $4, 'admin', NULL, $2, true)
      ON CONFLICT (school_email) DO UPDATE 
      SET 
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = true;
    `, [studentHash, deptId, organizerHash, adminHash]);

    // 6. Re-seed one fresh active open event for testing
    const orgRes = await client.query("SELECT id FROM users WHERE school_email = 'organizer@umindanao.edu.ph';");
    const orgId = orgRes.rows[0]?.id;

    if (orgId) {
      await client.query(`
        INSERT INTO events (title, description, location, event_date, start_time, end_time, organizer_id, department_id, status)
        VALUES (
          'Campus IT Symposium & General Assembly',
          'Annual assembly and student orientation for Computing Education students.',
          'UMTC Gymnasium',
          CURRENT_DATE + INTERVAL '7 days',
          '08:00:00',
          '17:00:00',
          $1,
          $2,
          'open'
        );
      `, [orgId, deptId]);
    }

    await client.query('COMMIT');
    console.log('✅ Database reset successfully!');
    console.log('   - Registrations: Cleaned');
    console.log('   - Past Events: Cleaned (1 fresh open event seeded)');
    console.log('   - Preserved Accounts: student@umindanao.edu.ph, organizer@umindanao.edu.ph, admin@umindanao.edu.ph');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database reset failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();
