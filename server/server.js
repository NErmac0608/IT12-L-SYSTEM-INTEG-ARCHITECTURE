const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'um_tap_super_secret_dev_key_2026';

// Middleware configuration layer
app.use(cors());          // Allows your React frontend port to communicate securely
app.use(express.json());  // Allows your API routes to parse incoming JSON request payloads

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

// ==========================================
// 1. AUTHENTICATION & LOGIN MANAGEMENT
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch user strictly by email first so we can extract the password hash and active status
        const result = await db.query(
            'SELECT id, full_name, school_email, role, student_id, password_hash, is_active FROM users WHERE school_email = $1;',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid institutional email or password.' });
        }

        const user = result.rows[0];
        
        // Securely compare the provided password against the database hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        // Fallback condition (`password === user.password_hash`) keeps existing unhashed demo accounts working
        if (!isMatch && password !== user.password_hash) {
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
        res.status(500).send('Server error processing authentication request');
    }
});

// POST: Register a new student account
app.post('/api/auth/register', async (req, res) => {
    try {
        const { full_name, school_email, password, student_id, department_id } = req.body;
        
        // Hash the password securely using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const result = await db.query(
            `INSERT INTO users (full_name, school_email, password_hash, student_id, department_id, role) 
             VALUES ($1, $2, $3, $4, $5, 'student') 
             RETURNING id, full_name, school_email, role, student_id;`,
            [full_name, school_email, hashedPassword, student_id, department_id]
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
        res.status(500).send('Server Error fetching departments');
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
        res.status(500).send('Server Error fetching comprehensive event records');
    }
});

// GET: Query a singular specific event by its ID structure
app.get('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM event_list_view WHERE event_id = \$1;', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).send('Event record not found in system schema');
        }
        res.json(result.rows[0]); // Returns only the single object row to the frontend view handler
    } catch (err) {
        console.error('Single Event Fetch Error:', err.message);
        res.status(500).send('Server Error fetching targeted event details');
    }
});

// POST: Add a completely new event entry into the database fields (For CreateEvent.jsx)
app.post('/api/events', authenticateToken, async (req, res) => {
    try {
        const { title, description, venue, date, start_time, end_time, department_id } = req.body;
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
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
});

// PATCH: Update an existing event
app.patch('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, venue, date, start_time, end_time, department_id, status } = req.body;
        
        const result = await db.query(
            `UPDATE events 
             SET title = $1, description = $2, location = $3, event_date = $4, start_time = $5, end_time = $6, department_id = $7, status = COALESCE($8, status)
             WHERE id = $9 RETURNING *;`,
            [title, description, venue, date, start_time, end_time, department_id, status, req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }
        res.json({ success: true, event: result.rows[0] });
    } catch (err) {
        console.error('Event Update Error:', err.message);
        res.status(500).send('Server error updating event');
    }
});

// DELETE: Remove an event
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        // Clear registrations first to prevent foreign key constraint violations
        await db.query('DELETE FROM registrations WHERE event_id = $1;', [req.params.id]);
        
        const result = await db.query('DELETE FROM events WHERE id = $1 RETURNING id;', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }
        res.json({ success: true, message: 'Event deleted successfully.' });
    } catch (err) {
        console.error('Event Deletion Error:', err.message);
        res.status(500).send('Server error deleting event');
    }
});

// ==========================================
// 3. STUDENT REGISTRATION & ATTENDANCE LOGS
// ==========================================

// POST: Process incoming student registration requests (For Register.jsx)
app.post('/api/registrations', async (req, res) => {
    try {
        const { student_id, event_id } = req.body;
        
        // Inserts rows using your database schema logic constraints
        const result = await db.query(
            `INSERT INTO registrations (user_id, event_id, registered_at, status) 
             VALUES ($1, $2, NOW(), 'registered') RETURNING *;`,
            [student_id, event_id]
        );
        res.status(201).json({ success: true, registration: result.rows[0] });
    } catch (err) {
        console.error('Registration Insertion Error:', err.message);
        res.status(500).send('Server Error processing student registration payload');
    }
});

// GET: Fetch master registration ledger rows from your custom database view (For MyEvents / RegisteredStudents)
app.get('/api/attendance', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM event_attendance_view;');
        res.json(result.rows);
    } catch (err) {
        console.error('Attendance Log Fetch Error:', err.message);
        res.status(500).send('Server Error pulling registration attendance view fields');
    }
});

// POST: Manage QR verification requests to register student attendance (For QRScanner.jsx)
app.post('/api/attendance/scan', async (req, res) => {
    try {
        const { qr_token_string } = req.body; // Evaluates parsed ticket token string emitted by web camera hook
        const result = await db.query(
            `UPDATE registrations 
             SET status = 'attended', checked_in_at = CURRENT_TIMESTAMP 
             WHERE qr_token = $1 RETURNING *;`,
            [qr_token_string]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid or unregistered digital ticket token.' });
        }
        res.json({ success: true, message: 'Attendance confirmed and tracked!', record: result.rows[0] });
    } catch (err) {
        console.error('QR Scan Processing Error:', err.message);
        res.status(500).send('Server Error checking scan validation tokens');
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
        res.status(500).send('Error fetching admin statistics');
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
        res.status(500).send('Server error fetching organizers');
    }
});

// POST: Add a new organizer (Protected)
app.post('/api/admin/organizers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, email, department_id, password } = req.body;
        const hashedPassword = await bcrypt.hash(password || 'organizer123', 10); // Default password if none provided
        
        const result = await db.query(
            `INSERT INTO users (full_name, school_email, password_hash, department_id, role) 
             VALUES ($1, $2, $3, $4, 'organizer') 
             RETURNING id;`,
            [name, email, hashedPassword, department_id]
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
        res.status(500).send('Error updating status');
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
