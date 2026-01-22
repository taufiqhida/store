const pool = require('./src/config/database');
require('dotenv').config();

async function checkTable() {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query('DESCRIBE PaymentMethod');
        console.log('PaymentMethod columns:', result);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

checkTable();
