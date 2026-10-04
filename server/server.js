const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./db');

// Enforce JWT_SECRET existence (Fail-fast in all environments)
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    console.error('❌ FATAL: JWT_SECRET environment variable is missing. Server cannot start securely.');
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration: Whitelist specific client origins
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(url => url.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true
}));

app.use(express.json());  // Allows your API routes to parse incoming JSON request payloads

// Catch malformed JSON request payloads gracefully without crashing the server process
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, message: 'Malformed JSON payload.' });
    }
    next(err);
});

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
}

// Admin Verification Middleware
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    next();
}

// Organizer or Admin Verification Middleware
function requireOrganizer(req, res, next) {
    if (!req.user || (req.user.role !== 'organizer' && req.user.role !== 'admin')) {
        return res.status(403).json({ success: false, message: 'Organizer access required.' });
    }
    next();
}

// Student or Admin Verification Middleware
function requireStudent(req, res, next) {
    if (!req.user || (req.user.role !== 'student' && req.user.role !== 'admin')) {
        return res.status(403).json({ success: false, message: 'Student access required to register for events.' });
    }
    next();
}

// ==========================================
// 1. AUTHENTICATION & LOGIN MANAGEMENT
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide both institutional email and password.' });
        }

        // Fetch user strictly by normalized email
        const result = await db.query(
            'SELECT id, full_name, school_email, role, student_id, password_hash, is_active FROM users WHERE LOWER(school_email) = $1;',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid institutional email or password.' });
        }

        const user = result.rows[0];
        
        // Securely compare the provided password against the database hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid institutional email or password.' });
        }

        // Check if the account has been deactivated by an administrator
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact an administrator.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.school_email, role: user.role.toLowerCase() },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.full_name,
                email: user.school_email,
                role: user.role.toLowerCase(), // Converts 'Student' / 'Organizer' string values cleanly to lowercase
                studentId: user.student_id
            },
            token
        });
    } catch (err) {
        console.error('Auth Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error processing authentication request.' });
    }
});

// POST: Register a new student account
app.post('/api/auth/register', async (req, res) => {
    try {
        const { full_name, password, student_id, department_id } = req.body;
        const school_email = (req.body.school_email || '').trim().toLowerCase();

        if (!full_name || !school_email || !password || !student_id || !department_id) {
            return res.status(400).json({ success: false, message: 'All registration fields are required.' });
        }

        if (!/^[A-Z0-9._%+-]+@umindanao\.edu\.ph$/i.test(school_email)) {
            return res.status(400).json({ success: false, message: 'Institutional email must belong to @umindanao.edu.ph domain.' });
        }
        
        // Hash the password securely using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const result = await db.query(
            `INSERT INTO users (full_name, school_email, password_hash, student_id, department_id, role) 
             VALUES ($1, $2, $3, $4, $5, 'student') 
             RETURNING id, full_name, school_email, role, student_id;`,
            [full_name.trim(), school_email, hashedPassword, student_id.trim(), department_id]
        );
        
        res.status(201).json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Registration Error:', err.message);
        if (err.code === '23505') {
            res.status(400).json({ success: false, message: 'Email or Student ID already registered.' });
        } else {
            res.status(500).json({ success: false, message: 'Server error during registration.' });
        }
    }
});

// GET: Fetch list of departments
app.get('/api/departments', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name FROM departments ORDER BY name;');
        res.json(result.rows);
    } catch (err) {
        console.error('Departments Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching departments.' });
    }
});

// ==========================================
// 2. CAMPUS EVENTS CONTROLLERS
// ==========================================

// GET: Fetch all active events utilizing the view generated by your SQL script
app.get('/api/events', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM event_list_view;');
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch Events Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching events.' });
    }
});

// GET: Query a singular specific event by its ID structure
app.get('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM event_list_view WHERE event_id = $1;', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }
        res.json(result.rows[0]); // Returns only the single object row to the frontend view handler
    } catch (err) {
        console.error('Single Event Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching event details.' });
    }
});

// POST: Add a completely new event entry into the database fields (For CreateEvent.jsx)
app.post('/api/events', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const { title, description, venue, date, start_time, end_time, department_id } = req.body;
        
        if (!title || !venue || !date || !start_time || !end_time || !department_id) {
            return res.status(400).json({ success: false, message: 'Please provide all required event details.' });
        }

        // The authenticated user's ID is the organizer
        const organizer_id = req.user.id;
        
        const result = await db.query(
            `INSERT INTO events (title, description, location, event_date, start_time, end_time, organizer_id, department_id, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open') RETURNING *;`,
            [title, description, venue, date, start_time, end_time, organizer_id, department_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create Event Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error creating event.' });
    }
});

// PATCH: Update an existing event (Restricted to Event Owner or Admin)
app.patch('/api/events/:id', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        // 1. Fetch event to verify existence and ownership
        const existing = await db.query('SELECT id, organizer_id FROM events WHERE id = $1;', [req.params.id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        // 2. Ownership check: Must be the creator of the event or an administrator
        if (req.user.role !== 'admin' && String(existing.rows[0].organizer_id) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to modify this event.' });
        }

        const { title, description, venue, date, start_time, end_time, department_id, status } = req.body;
        
        const result = await db.query(
            `UPDATE events 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 location = COALESCE($3, location),
                 event_date = COALESCE($4, event_date),
                 start_time = COALESCE($5, start_time),
                 end_time = COALESCE($6, end_time),
                 department_id = COALESCE($7, department_id),
                 status = COALESCE($8, status)
             WHERE id = $9 RETURNING *;`,
            [title, description, venue, date, start_time, end_time, department_id, status, req.params.id]
        );
        
        res.json({ success: true, event: result.rows[0] });
    } catch (err) {
        console.error('Event Update Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error updating event.' });
    }
});

// DELETE: Remove or Cancel an event (Restricted to Event Owner or Admin)
app.delete('/api/events/:id', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        // 1. Fetch event to verify existence and ownership
        const existing = await db.query('SELECT id, organizer_id FROM events WHERE id = $1;', [req.params.id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        // 2. Ownership check: Must be the creator of the event or an administrator
        if (req.user.role !== 'admin' && String(existing.rows[0].organizer_id) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this event.' });
        }

        // 3. Issue 10: Allow admins to hard purge with ?hard=true, otherwise soft-cancel to preserve historical registrations & attendance
        const hardDelete = req.query.hard === 'true' && req.user.role === 'admin';
        if (hardDelete) {
            const client = await db.connect();
            try {
                await client.query('BEGIN');
                await client.query('DELETE FROM registrations WHERE event_id = $1;', [req.params.id]);
                await client.query('DELETE FROM events WHERE id = $1;', [req.params.id]);
                await client.query('COMMIT');
                return res.json({ success: true, message: 'Event permanently purged by administrator.' });
            } catch (txErr) {
                await client.query('ROLLBACK');
                throw txErr;
            } finally {
                client.release();
            }
        }

        // Default: Soft cancel event to preserve historical records
        const result = await db.query("UPDATE events SET status = 'cancelled' WHERE id = $1 RETURNING *;", [req.params.id]);
        res.json({ success: true, message: 'Event marked as cancelled. Historical records preserved.', event: result.rows[0] });
    } catch (err) {
        console.error('Event Deletion Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error deleting event.' });
    }
});

// ==========================================
// 3. STUDENT REGISTRATION & ATTENDANCE LOGS
// ==========================================

// POST: Process incoming student registration requests (For Register.jsx / EventDetails.jsx)
app.post('/api/registrations', authenticateToken, requireStudent, async (req, res) => {
    try {
        // Critical 5: Student identity derived directly from JWT
        const student_user_id = req.user.id;
        const { event_id } = req.body;

        if (!event_id) {
            return res.status(400).json({ success: false, message: 'Event ID is required.' });
        }

        // Verify event exists and is open for registration
        const eventCheck = await db.query('SELECT id, title, status FROM events WHERE id = $1;', [event_id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }
        if (eventCheck.rows[0].status !== 'open') {
            return res.status(400).json({ success: false, message: `Registration is unavailable (Event is ${eventCheck.rows[0].status}).` });
        }

        // Inserts registration; qr_token UUID is automatically generated by PostgreSQL default
        const result = await db.query(
            `INSERT INTO registrations (user_id, event_id, registered_at, status) 
             VALUES ($1, $2, NOW(), 'registered') 
             RETURNING id, event_id, user_id, qr_token, status, registered_at;`,
            [student_user_id, event_id]
        );
        res.status(201).json({ 
            success: true, 
            message: 'Registration successful.', 
            registration: result.rows[0] 
        });
    } catch (err) {
        console.error('Registration Insertion Error:', err.message);
        // Issue 8: Handle duplicate registration constraint violation (uq_event_student)
        if (err.code === '23505') {
            return res.status(409).json({ success: false, message: 'You are already registered for this event.' });
        }
        res.status(500).json({ success: false, message: 'Server error processing student registration.' });
    }
});

// GET: Fetch registration and attendance records with role-based scoping
app.get('/api/attendance', authenticateToken, async (req, res) => {
    try {
        let query = 'SELECT * FROM event_attendance_view';
        const params = [];

        if (req.user.role === 'student') {
            // Students only see their own tickets and QR tokens
            query += ' WHERE student_id_record = $1 ORDER BY registered_at DESC;';
            params.push(req.user.id);
        } else if (req.user.role === 'organizer') {
            // Organizers only see registrations for events they manage
            query += ' WHERE event_id IN (SELECT id FROM events WHERE organizer_id = $1) ORDER BY registered_at DESC;';
            params.push(req.user.id);
        } else {
            // Admins see all records
            query += ' ORDER BY registered_at DESC;';
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Attendance Log Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching attendance records.' });
    }
});

// GET: Dedicated student registration tickets endpoint
app.get('/api/student/registrations', authenticateToken, requireStudent, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM event_attendance_view WHERE student_id_record = $1 ORDER BY registered_at DESC;',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Student Registrations Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching student registrations.' });
    }
});

// UUID validation regex for incoming digital ticket tokens
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// POST: Manage QR verification requests to register student attendance (For QRScanner.jsx)
app.post('/api/attendance/scan', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const qr_token = (req.body.qr_token_string || req.body.qr_token || '').trim();
        let event_id = req.body.event_id;

        if (!qr_token || !UUID_REGEX.test(qr_token)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing QR token format.' });
        }

        // 1. Resolve event if not explicitly provided
        if (!event_id) {
            const regLookup = await db.query('SELECT event_id FROM registrations WHERE qr_token = $1;', [qr_token]);
            if (regLookup.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Invalid QR code or registration not found.' });
            }
            event_id = regLookup.rows[0].event_id;
        }

        // 2. Critical 7: Verify event existence, status, and organizer authorization
        const eventCheck = await db.query('SELECT id, title, organizer_id, status FROM events WHERE id = $1;', [event_id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        const event = eventCheck.rows[0];

        // Authorization check: Only event owner or admin can scan attendance
        if (req.user.role !== 'admin' && String(event.organizer_id) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to scan attendance for this event.' });
        }

        // Event status check: Cannot scan attendance for cancelled or closed events
        if (event.status === 'cancelled' || event.status === 'closed') {
            return res.status(400).json({ success: false, message: `Cannot scan attendance. Event is currently ${event.status}.` });
        }

        // 3. Atomic check-in execution via stored procedure
        const checkInResult = await db.query('SELECT * FROM check_in_student($1, $2);', [event_id, qr_token]);
        const checkIn = checkInResult.rows[0];

        if (!checkIn || !checkIn.success) {
            const isAlreadyRedeemed = checkIn?.message?.includes('already been redeemed');
            const statusCode = isAlreadyRedeemed ? 409 : 400;
            return res.status(statusCode).json({
                success: false,
                message: checkIn?.message || 'Check-in failed.',
                details: {
                    studentName: checkIn?.student_name,
                    checkedInAt: checkIn?.checked_in_at,
                    registrationId: checkIn?.registration_id
                }
            });
        }

        res.json({
            success: true,
            message: checkIn.message,
            attendance: {
                registrationId: checkIn.registration_id,
                studentName: checkIn.student_name,
                checkedInAt: checkIn.checked_in_at,
                eventTitle: event.title
            }
        });
    } catch (err) {
        console.error('QR Scan Processing Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error processing attendance scan.' });
    }
});

// GET: Export attendance roster for an event as CSV (Objective #3)
app.get('/api/events/:id/export', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const eventId = req.params.id;

        // 1. Verify event existence and authorization
        const eventResult = await db.query('SELECT id, title, organizer_id FROM events WHERE id = $1;', [eventId]);
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        const event = eventResult.rows[0];
        if (req.user.role !== 'admin' && String(event.organizer_id) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to export attendance for this event.' });
        }

        // 2. Fetch attendee roster from event_attendance_view
        const rosterResult = await db.query(
            `SELECT 
                registration_id,
                full_name,
                student_id,
                school_email,
                department,
                status,
                registered_at,
                checked_in_at
             FROM event_attendance_view 
             WHERE event_id = $1 
             ORDER BY full_name ASC;`,
            [eventId]
        );

        // 3. Helper to escape and quote CSV values
        const escapeCsv = (val) => {
            if (val === null || val === undefined) return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };

        const headers = [
            'Registration ID',
            'Student Name',
            'Student ID',
            'School Email',
            'Department',
            'Attendance Status',
            'Registration Date',
            'Check-in Timestamp'
        ];

        const rows = rosterResult.rows.map(row => [
            escapeCsv(row.registration_id),
            escapeCsv(row.full_name),
            escapeCsv(row.student_id || 'N/A'),
            escapeCsv(row.school_email),
            escapeCsv(row.department || 'N/A'),
            escapeCsv(row.status),
            escapeCsv(row.registered_at ? new Date(row.registered_at).toISOString() : ''),
            escapeCsv(row.checked_in_at ? new Date(row.checked_in_at).toISOString() : 'N/A')
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\r\n');
        const sanitizedTitle = event.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `attendance_${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csvContent); // Include UTF-8 BOM for proper Excel compatibility
    } catch (err) {
        console.error('Attendance Export Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error generating attendance export.' });
    }
});

// ==========================================
// 5. ADMIN CONTROLLERS
// ==========================================

// GET: Fetch top level admin statistics
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalUsersResult = await db.query('SELECT COUNT(*) FROM users');
        const studentsResult = await db.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
        const organizersResult = await db.query("SELECT COUNT(*) FROM users WHERE role = 'organizer'");
        
        res.json({
            totalUsers: totalUsersResult.rows[0].count,
            students: studentsResult.rows[0].count,
            organizers: organizersResult.rows[0].count
        });
    } catch (err) {
        console.error('Stats Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching admin statistics.' });
    }
});

// GET: Fetch all organizers (Protected)
app.get('/api/admin/organizers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.full_name as name, u.school_email as email, d.name as department, u.is_active 
             FROM users u 
             JOIN departments d ON u.department_id = d.id 
             WHERE u.role = 'organizer' 
             ORDER BY u.created_at DESC;`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch Organizers Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching organizers.' });
    }
});

// POST: Add a new organizer (Protected)
app.post('/api/admin/organizers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, department_id, password } = req.body;
        const email = (req.body.email || '').trim().toLowerCase();

        if (!name || !email || !department_id) {
            return res.status(400).json({ success: false, message: 'Name, institutional email, and department are required.' });
        }

        if (!/^[A-Z0-9._%+-]+@umindanao\.edu\.ph$/i.test(email)) {
            return res.status(400).json({ success: false, message: 'Institutional email must belong to @umindanao.edu.ph domain.' });
        }

        const hashedPassword = await bcrypt.hash(password || 'organizer123', 10); // Default password if none provided
        
        const result = await db.query(
            `INSERT INTO users (full_name, school_email, password_hash, department_id, role) 
             VALUES ($1, $2, $3, $4, 'organizer') 
             RETURNING id;`,
            [name.trim(), email, hashedPassword, department_id]
        );
        res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error('Add Organizer Error:', err.message);
        res.status(500).json({ success: false, message: 'Could not create organizer. Email might already exist.' });
    }
});

// PATCH: Toggle organizer active status (Protected)
app.patch('/api/admin/organizers/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { is_active } = req.body;
        await db.query('UPDATE users SET is_active = $1 WHERE id = $2;', [is_active, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Toggle Status Error:', err.message);
        res.status(500).json({ success: false, message: 'Error updating organizer status.' });
    }
});

// DELETE: Remove an organizer (Protected)
app.delete('/api/admin/organizers/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1;', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Organizer Error:', err.message);
        res.status(500).json({ success: false, message: 'Cannot delete organizer if they have created events.' });
    }
});

// ==========================================
// 6. BOOTSTRAP ACTIVATION HANDSHAKE
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Unified API Engine running dynamically on port ${PORT}`);
});
