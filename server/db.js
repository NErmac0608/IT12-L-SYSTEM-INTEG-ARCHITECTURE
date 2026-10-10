const { Pool, types } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Parse PostgreSQL DATE columns (oid 1082) directly as 'YYYY-MM-DD' strings to prevent UTC date shifting
types.setTypeParser(1082, (val) => val);


const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost')
            ? false
            : { rejectUnauthorized: false }
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
      };

const pool = new Pool(poolConfig);

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection error:', err.stack);
    } else {
        console.log('✅ Connected to um_tap database successfully at:', res.rows[0].now);
    }
});

module.exports = pool;
