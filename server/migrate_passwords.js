const bcrypt = require('bcrypt');
const pool = require('./db');

async function migratePasswords() {
    try {
        console.log('🔄 Checking users for plaintext passwords or placeholders...');
        const { rows: users } = await pool.query('SELECT id, school_email, password_hash FROM users');

        for (const user of users) {
            let plainPassword = null;
            if (user.password_hash === 'REPLACE_WITH_REAL_PASSWORD_HASH') {
                plainPassword = 'Password123!';
            } else if (!user.password_hash.startsWith('$2b$') && !user.password_hash.startsWith('$2a$')) {
                plainPassword = user.password_hash;
            }

            if (plainPassword) {
                const hashedPassword = await bcrypt.hash(plainPassword, 10);
                await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, user.id]);
                console.log(`✅ Hashed password for ${user.school_email} (ID: ${user.id})`);
            } else {
                console.log(`ℹ️ Already hashed: ${user.school_email} (ID: ${user.id})`);
            }
        }

        console.log('🎉 Password migration completed successfully!');
    } catch (err) {
        console.error('❌ Password migration failed:', err);
    } finally {
        await pool.end();
    }
}

migratePasswords();
