require('dotenv').config();
const pool = require('./src/config/database');

async function quickCheck() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Simple count
        const count = await conn.query('SELECT COUNT(*) as total FROM `Order`');
        console.log('Total Orders:', count[0].total);

        if (count[0].total > 0) {
            // Show all orders
            const all = await conn.query('SELECT orderCode, productName, totalPrice, status, createdAt FROM `Order` ORDER BY createdAt DESC');
            console.log('\nAll Orders:');
            console.log(JSON.stringify(all, null, 2));
        } else {
            console.log('\n>>> DATABASE KOSONG - Belum ada order! <<<');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

quickCheck();
