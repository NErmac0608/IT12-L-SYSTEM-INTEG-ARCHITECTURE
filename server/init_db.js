const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    console.log('🔄 Initializing database schema, views, and initial accounts from database/setup.sql...');
    const sqlPath = path.resolve(__dirname, '../database/setup.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove CREATE DATABASE statement (cloud databases provide the database pre-created)
    sql = sql.replace(/CREATE DATABASE\s+[^;]+;/gi, '');

    await pool.query(sql);
    console.log('✅ Database initialized successfully!');
    console.log('   - Tables, views, and functions created.');
    console.log('   - Seeded default accounts:');
    console.log('     * Student:   student@umindanao.edu.ph   / student123');
    console.log('     * Organizer: organizer@umindanao.edu.ph / organizer123');
    console.log('     * Admin:     admin@umindanao.edu.ph     / admin123');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  } finally {
    await pool.end();
  }
}

initDatabase();
