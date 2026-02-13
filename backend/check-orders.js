require('dotenv').config();
const pool = require('./src/config/database');

async function checkOrders() {
    let conn;
    try {
        conn = await pool.getConnection();

        console.log('🔍 Checking Order data...\n');

        // Check if Order table exists
        const tables = await conn.query("SHOW TABLES LIKE 'Order'");
        if (tables.length === 0) {
            console.log('❌ Table "Order" tidak ditemukan!');
            return;
        }
        console.log('✅ Table "Order" exists');

        // Count total orders
        const countResult = await conn.query('SELECT COUNT(*) as total FROM `Order`');
        const totalOrders = countResult[0].total;
        console.log(`\n📊 Total Orders: ${totalOrders}`);

        if (totalOrders === 0) {
            console.log('\n⚠️  Database kosong - belum ada order!');
            console.log('💡 Solusi: Buat order baru dari frontend atau jalankan seed script');
            return;
        }

        // Get sample orders
        const orders = await conn.query('SELECT * FROM `Order` ORDER BY createdAt DESC LIMIT 5');
        console.log('\n📋 Sample Orders (5 terbaru):');
        console.log('='.repeat(80));
        orders.forEach((order, idx) => {
            console.log(`${idx + 1}. Order Code: ${order.orderCode}`);
            console.log(`   Product: ${order.productName} - ${order.variantName}`);
            console.log(`   Total: Rp ${order.totalPrice?.toLocaleString('id-ID') || 0}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Date: ${order.createdAt}`);
            console.log('-'.repeat(80));
        });

        // Get analytics summary
        const revenueResult = await conn.query(`
            SELECT COALESCE(SUM(totalPrice), 0) as totalRevenue 
            FROM \`Order\` 
            WHERE status = 'completed'
        `);

        const statusCounts = await conn.query(`
            SELECT status, COUNT(*) as count 
            FROM \`Order\` 
            GROUP BY status
        `);

        console.log('\n💰 Revenue (Completed Orders):');
        console.log(`   Total Revenue: Rp ${Number(revenueResult[0].totalRevenue).toLocaleString('id-ID')}`);

        console.log('\n📈 Orders by Status:');
        statusCounts.forEach(s => {
            console.log(`   ${s.status}: ${s.count}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

checkOrders();
