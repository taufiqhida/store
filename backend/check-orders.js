const pool = require('./src/config/database');

async function checkOrders() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Check orders in database
        const orders = await conn.query('SELECT id, orderCode, productName, createdAt FROM `Order` ORDER BY createdAt DESC LIMIT 10');
        console.log('Recent Orders:');
        console.log(orders);

        // Check table structure
        const columns = await conn.query("SHOW COLUMNS FROM `Order`");
        console.log('\nOrder table columns:');
        columns.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

checkOrders();
