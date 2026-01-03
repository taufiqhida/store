const mariadb = require('mariadb');

async function test() {
    console.log('Testing direct connection...');

    const pool = mariadb.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1',
        connectionLimit: 5
    });

    try {
        const conn = await pool.getConnection();
        console.log('✅ Connection successful!');
        const rows = await conn.query('SELECT 1 as test');
        console.log('Query result:', rows);
        conn.release();
        await pool.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

test();
