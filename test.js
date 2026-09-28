
const db = require('./server/db');
db.query('INSERT INTO events (title, description, location, event_date, start_time, capacity, organizer_id, department_id, status) VALUES ('Test', 'Desc', 'Test Room', '2026-10-10', '14:00', 50, 2, 1, 'open')')
  .then(() => { console.log('SUCCESS'); process.exit(0); })
  .catch((err) => { console.error('DB_ERROR:', err.message); process.exit(1); });

