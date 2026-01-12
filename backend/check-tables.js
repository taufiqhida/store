const mariadb = require('mariadb');

async function main() {
    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    try {
        // Check Order table structure
        console.log('=== Order Table Columns ===');
        const orderCols = await conn.query('SHOW COLUMNS FROM `Order`');
        orderCols.forEach(c => console.log('-', c.Field, '(' + c.Type + ')'));

        // Check recent orders
        console.log('\n=== Recent Orders ===');
        const orders = await conn.query('SELECT * FROM `Order` ORDER BY id DESC LIMIT 5');
        if (orders.length === 0) {
            console.log('No orders found');
        } else {
            orders.forEach(o => console.log('Order:', o.orderCode, '| Product:', o.productName, '| Status:', o.status));
        }

        // Check Testimonial table
        console.log('\n=== Testimonial Table Columns ===');
        const testiCols = await conn.query('SHOW COLUMNS FROM Testimonial');
        testiCols.forEach(c => console.log('-', c.Field, '(' + c.Type + ')'));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await conn.end();
    }
}

main();
