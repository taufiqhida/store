const pool = require('./src/config/database');

async function listOrders() {
    let conn;
    try {
        conn = await pool.getConnection();

        const orders = await conn.query('SELECT orderCode, productName, createdAt FROM `Order` ORDER BY id DESC');

        console.log('=== DAFTAR KODE PEMESANAN ===\n');
        if (orders.length === 0) {
            console.log('Belum ada pesanan.');
        } else {
            orders.forEach(o => {
                console.log(`${o.orderCode} - ${o.productName} (${o.createdAt})`);
            });
        }
        console.log(`\nTotal: ${orders.length} pesanan`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

listOrders();
