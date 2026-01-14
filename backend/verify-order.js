const pool = require('./src/config/database');

async function checkAndVerifyOrder() {
    let conn;
    try {
        conn = await pool.getConnection();

        const orderCode = 'TFQ-20260112-2095';

        // Check if order exists
        const orders = await conn.query("SELECT * FROM `Order` WHERE orderCode = ?", [orderCode]);

        if (orders.length > 0) {
            console.log('✅ Order ditemukan!');
            console.log('Kode:', orders[0].orderCode);
            console.log('Produk:', orders[0].productName);
            console.log('Varian:', orders[0].variantName);
            console.log('Total:', orders[0].totalPrice);
            console.log('\n👉 Kode ini VALID untuk submit testimoni.');
        } else {
            console.log('❌ Order tidak ditemukan');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

checkAndVerifyOrder();
