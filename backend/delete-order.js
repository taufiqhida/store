const pool = require('./src/config/database');

async function deleteOrder() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Delete order
        const result = await conn.query("DELETE FROM `Order` WHERE orderCode = 'ORD-FBL95O'");
        console.log('Result:', result);
        console.log('Order ORD-FBL95O deleted!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

deleteOrder();
