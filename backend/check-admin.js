const pool = require('./src/config/database');
require('dotenv').config();

async function getAdmin() {
    let conn;
    try {
        conn = await pool.getConnection();
        const admins = await conn.query('SELECT id, username, name FROM Admin');
        console.log('Admin accounts:');
        admins.forEach(a => console.log(`  Username: ${a.username}, Name: ${a.name}`));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}
getAdmin();
