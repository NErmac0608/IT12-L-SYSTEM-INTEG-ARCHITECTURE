const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const db = require('./db');
const { ORGANIZER_PORTAL_KEY, ADMIN_PORTAL_KEY, verifyOrganizerPortalKey, verifyAdminPortalKey } = require('./portalSecurity');

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
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching origins
        if (
            !origin ||
            allowedOrigins.includes(origin) ||
            allowedOrigins.includes('*') ||
            origin.endsWith('.vercel.app')
        ) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true
}));

app.use(express.json());  // Allows your API routes to parse incoming JSON request payloads

// Gracefully route requests whether called with /api prefix or directly without it
app.use((req, res, next) => {
    if (!req.url.startsWith('/api') && (
        req.url.startsWith('/portal') ||
        req.url.startsWith('/auth') ||
        req.url.startsWith('/events') ||
        req.url.startsWith('/attendance') ||
        req.url.startsWith('/departments') ||
        req.url.startsWith('/admin')
    )) {
        req.url = '/api' + req.url;
    }
    next();
});

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
// Authentication Core Helper
async function authenticateUserCredentials(email, password) {
    if (!email || !password) {
        throw { status: 400, message: 'Please provide both institutional email and password.' };
    }

    const result = await db.query(
        'SELECT id, full_name, school_email, role, student_id, password_hash, is_active FROM users WHERE LOWER(school_email) = $1;',
        [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
        throw { status: 401, message: 'Invalid institutional email or password.' };
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw { status: 401, message: 'Invalid institutional email or password.' };
    }

    if (!user.is_active) {
        throw { status: 403, message: 'Your account has been deactivated. Please contact an administrator.' };
    }

    const token = jwt.sign(
        { id: user.id, email: user.school_email, role: user.role.toLowerCase() },
        JWT_SECRET,
        { expiresIn: '12h' }
    );

    return {
        user: {
            id: user.id,
            name: user.full_name,
            email: user.school_email,
            role: user.role.toLowerCase(),
            studentId: user.student_id
        },
        token
    };
}

// 1. ONE-WAY STUDENT AUTHENTICATION (Direct, non-searchable access)
// Rejects organizer and administrative credentials to guarantee strict segregation
app.post('/api/auth/student/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const authData = await authenticateUserCredentials(email, password);

        if (authData.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access restricted: Student login only. Faculty and administrative accounts must use their designated secure portals.'
            });
        }

        res.json({ success: true, ...authData });
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ success: false, message: err.message || 'Authentication error.' });
    }
});

// 2. ENCRYPTED ORGANIZER PORTAL AUTHENTICATION
// Requires valid encrypted portal key; strictly restricted to organizers and admins
app.post('/api/portal/organizer/login', verifyOrganizerPortalKey, async (req, res) => {
    try {
        const { email, password } = req.body;
        const authData = await authenticateUserCredentials(email, password);

        if (authData.user.role !== 'organizer' && authData.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Student accounts are not permitted on the Organizer Terminal.'
            });
        }

        res.json({ success: true, ...authData });
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ success: false, message: err.message || 'Authentication error.' });
    }
});

// POST: Register a new organizer account via portal
app.post('/api/portal/organizer/register', verifyOrganizerPortalKey, async (req, res) => {
    try {
        const { full_name, password, department_id } = req.body;
        const school_email = (req.body.school_email || req.body.email || '').trim().toLowerCase();

        if (!full_name || !school_email || !password || !department_id) {
            return res.status(400).json({ success: false, message: 'All registration fields (name, email, department, password) are required.' });
        }

        if (!/^[A-Z0-9._%+-]+@umindanao\.edu\.ph$/i.test(school_email)) {
            return res.status(400).json({ success: false, message: 'Institutional email must belong to @umindanao.edu.ph domain.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users (full_name, school_email, password_hash, department_id, role, is_active) 
             VALUES ($1, $2, $3, $4, 'organizer', true) 
             RETURNING id, full_name, school_email, role;`,
            [full_name.trim(), school_email, hashedPassword, department_id]
        );

        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.school_email, role: 'organizer' },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                name: user.full_name,
                email: user.school_email,
                role: 'organizer'
            },
            token
        });
    } catch (err) {
        console.error('Organizer Portal Registration Error:', err.message);
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: 'Institutional email already registered.' });
        }
        res.status(500).json({ success: false, message: 'Server error registering organizer profile.' });
    }
});

// 3. ENCRYPTED ADMIN GATEWAY AUTHENTICATION
// Requires valid encrypted admin portal key; strictly restricted to administrators
app.post('/api/portal/admin/login', verifyAdminPortalKey, async (req, res) => {
    try {
        const { email, password } = req.body;
        const authData = await authenticateUserCredentials(email, password);

        if (authData.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Strict administrative privileges required.'
            });
        }

        res.json({ success: true, ...authData });
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ success: false, message: err.message || 'Authentication error.' });
    }
});

// POST: Register a new admin account via gateway
app.post('/api/portal/admin/register', verifyAdminPortalKey, async (req, res) => {
    try {
        const { full_name, password } = req.body;
        const school_email = (req.body.school_email || req.body.email || '').trim().toLowerCase();

        if (!full_name || !school_email || !password) {
            return res.status(400).json({ success: false, message: 'Full name, institutional email, and password are required.' });
        }

        if (!/^[A-Z0-9._%+-]+@umindanao\.edu\.ph$/i.test(school_email)) {
            return res.status(400).json({ success: false, message: 'Institutional email must belong to @umindanao.edu.ph domain.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users (full_name, school_email, password_hash, department_id, role, is_active) 
             VALUES ($1, $2, $3, 1, 'admin', true) 
             RETURNING id, full_name, school_email, role;`,
            [full_name.trim(), school_email, hashedPassword]
        );

        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, email: user.school_email, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                name: user.full_name,
                email: user.school_email,
                role: 'admin'
            },
            token
        });
    } catch (err) {
        console.error('Admin Portal Registration Error:', err.message);
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: 'Institutional email already registered.' });
        }
        res.status(500).json({ success: false, message: 'Server error registering admin profile.' });
    }
});

// Verify encrypted portal access keys for obscured endpoints
app.get('/api/portal/verify', (req, res) => {
    const { scope, key } = req.query;
    if (scope === 'organizer' && key === ORGANIZER_PORTAL_KEY) {
        return res.json({ success: true, scope: 'organizer' });
    }
    if (scope === 'admin' && key === ADMIN_PORTAL_KEY) {
        return res.json({ success: true, scope: 'admin' });
    }
    return res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

// Standard backwards-compatible login handler (routes students by default)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, target_role } = req.body;
        const authData = await authenticateUserCredentials(email, password);

        if (target_role && authData.user.role !== target_role) {
            return res.status(403).json({
                success: false,
                message: `Access denied for specified ${target_role} role.`
            });
        }

        res.json({ success: true, ...authData });
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ success: false, message: err.message || 'Authentication error.' });
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
        const result = await db.query('SELECT * FROM event_list_view WHERE id = $1;', [id]);
        
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
        } else {
            // Organizers and admins see all attendance records for monitoring
            query += ' ORDER BY registered_at DESC;';
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Attendance Log Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching attendance records.' });
    }
});

// ==========================================
// 3.1 DEDICATED STUDENT FETCH CONTROLLERS
// ==========================================

// GET: Dedicated student dashboard overview
app.get('/api/student/dashboard', authenticateToken, requireStudent, async (req, res) => {
    try {
        const eventsRes = await db.query('SELECT * FROM event_list_view WHERE status = $1 ORDER BY event_date ASC;', ['open']);
        const registrationsRes = await db.query(
            'SELECT * FROM event_attendance_view WHERE student_id_record = $1 ORDER BY registered_at DESC;',
            [req.user.id]
        );
        const attendedCount = registrationsRes.rows.filter(r => r.status === 'attended').length;

        res.json({
            success: true,
            student: req.user,
            totalEventsOpen: eventsRes.rows.length,
            totalRegistrations: registrationsRes.rows.length,
            totalAttended: attendedCount,
            passes: registrationsRes.rows,
            recommendedEvents: eventsRes.rows.slice(0, 3)
        });
    } catch (err) {
        console.error('Student Dashboard Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching student dashboard data.' });
    }
});

// GET: Dedicated student events catalog
app.get('/api/student/events', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM event_list_view WHERE status = $1 ORDER BY event_date ASC;', ['open']);
        res.json(result.rows);
    } catch (err) {
        console.error('Student Events Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching student events.' });
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

// ==========================================
// 3.2 DEDICATED ORGANIZER FETCH CONTROLLERS
// ==========================================

// GET: Dedicated organizer management station overview
app.get('/api/organizer/dashboard', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const eventsRes = await db.query('SELECT * FROM event_list_view ORDER BY event_date DESC;');
        const attendanceRes = await db.query('SELECT * FROM event_attendance_view ORDER BY registered_at DESC;');
        const totalAttended = attendanceRes.rows.filter(r => r.status === 'attended').length;
        const totalRegistered = attendanceRes.rows.length;
        const turnoutRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

        res.json({
            success: true,
            organizer: req.user,
            totalEvents: eventsRes.rows.length,
            activeEvents: eventsRes.rows.filter(e => e.status === 'open' || e.status === 'ongoing').length,
            totalEnrolled: totalRegistered,
            totalAttended: totalAttended,
            turnoutRate: turnoutRate,
            recentCheckIns: attendanceRes.rows.filter(r => r.status === 'attended').slice(0, 5),
            eventCatalog: eventsRes.rows
        });
    } catch (err) {
        console.error('Organizer Dashboard Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching organizer dashboard data.' });
    }
});

// GET: Dedicated organizer events catalog
app.get('/api/organizer/events', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM event_list_view ORDER BY event_date DESC;');
        res.json(result.rows);
    } catch (err) {
        console.error('Organizer Events Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching organizer events.' });
    }
});

// GET: Dedicated organizer attendance ledger
app.get('/api/organizer/attendance', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM event_attendance_view ORDER BY registered_at DESC;');
        res.json(result.rows);
    } catch (err) {
        console.error('Organizer Attendance Fetch Error:', err.message);
        res.status(500).json({ success: false, message: 'Server error fetching organizer attendance.' });
    }
});

// UUID validation regex for incoming digital ticket tokens
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// POST: Manage QR verification requests to register student attendance (For QRScanner.jsx)
app.post('/api/attendance/scan', authenticateToken, requireOrganizer, async (req, res) => {
    try {
        const rawToken = (req.body.qr_token_string || req.body.qr_token || '').trim();
        let event_id = req.body.event_id;

        // Robust UUID extraction (handles raw UUIDs, JSON payloads, or URL/text wrappers)
        const uuidMatch = rawToken.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
        const qr_token = uuidMatch ? uuidMatch[0].toLowerCase() : rawToken;

        if (!qr_token || !UUID_REGEX.test(qr_token)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing QR token format.' });
        }

        // 1. Resolve registration and associated event from the scanned QR token
        const regLookup = await db.query(
            `SELECT r.*, e.title as event_title, e.organizer_id, e.status as event_status 
             FROM registrations r 
             JOIN events e ON r.event_id = e.id 
             WHERE r.qr_token = $1;`,
            [qr_token]
        );

        if (regLookup.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid QR code or registration not found.' });
        }

        const registration = regLookup.rows[0];

        // 2. If an event was explicitly selected in the scanner, verify ticket target
        if (event_id && String(event_id) !== String(registration.event_id)) {
            const targetEventCheck = await db.query('SELECT title FROM events WHERE id = $1;', [event_id]);
            const targetTitle = targetEventCheck.rows[0]?.title || `Event #${event_id}`;
            return res.status(400).json({ 
                success: false, 
                message: `This ticket is registered for "${registration.event_title}", not the selected event ("${targetTitle}").` 
            });
        }

        event_id = registration.event_id;

        // 3. Authorization check: Any authenticated organizer or admin can scan attendance
        if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
            return res.status(403).json({ success: false, message: 'You are not authorized to scan attendance for this event.' });
        }

        // 4. Event status check: Cannot scan attendance for cancelled or closed events
        if (registration.event_status === 'cancelled' || registration.event_status === 'closed') {
            return res.status(400).json({ success: false, message: `Cannot scan attendance. Event is currently ${registration.event_status}.` });
        }

        // 5. Atomic check-in execution via stored procedure
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
                eventTitle: registration.event_title
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
        if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
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
        const totalEventsResult = await db.query('SELECT COUNT(*) FROM events');
        const totalRegistrationsResult = await db.query('SELECT COUNT(*) FROM registrations');
        const totalAttendedResult = await db.query("SELECT COUNT(*) FROM registrations WHERE status = 'attended'");

        const recentOrganizersResult = await db.query(`
            SELECT u.id, u.full_name, u.school_email, d.name as department, u.is_active, u.created_at
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.role = 'organizer'
            ORDER BY u.created_at DESC LIMIT 5;
        `);

        const recentEventsResult = await db.query(`
            SELECT e.id, e.title, e.event_date, e.status, d.name as department, u.full_name as organizer_name
            FROM events e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN users u ON e.organizer_id = u.id
            ORDER BY e.created_at DESC LIMIT 5;
        `);
        
        res.json({
            success: true,
            totalUsers: totalUsersResult.rows[0].count,
            students: studentsResult.rows[0].count,
            organizers: organizersResult.rows[0].count,
            totalEvents: totalEventsResult.rows[0].count,
            totalRegistrations: totalRegistrationsResult.rows[0].count,
            totalAttended: totalAttendedResult.rows[0].count,
            recentOrganizers: recentOrganizersResult.rows,
            recentEvents: recentEventsResult.rows
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
