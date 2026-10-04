const pool = require('./db');

async function migrateEventStatus() {
    try {
        console.log('🔄 Updating chk_events_status constraint in PostgreSQL...');
        await pool.query('ALTER TABLE events DROP CONSTRAINT IF EXISTS chk_events_status;');
        await pool.query("ALTER TABLE events ADD CONSTRAINT chk_events_status CHECK (status IN ('open', 'ongoing', 'closed', 'cancelled'));");
        console.log('✅ Successfully updated chk_events_status to support "cancelled" status!');
    } catch (err) {
        console.error('❌ Failed to update constraint:', err);
    } finally {
        await pool.end();
    }
}

migrateEventStatus();
