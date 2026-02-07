const mariadb = require('mariadb');

(async () => {
    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    console.log('Super Admins in database:');
    const admins = await conn.query('SELECT username, name, role FROM admin_users');
    admins.forEach(a => console.log(`  - ${a.username} (${a.name}) - Role: ${a.role}`));

    console.log('\nProducts count:');
    const products = await conn.query('SELECT COUNT(*) as count FROM product');
    console.log(`  ${products[0].count} products`);

    console.log('\nCategories count:');
    const categories = await conn.query('SELECT COUNT(*) as count FROM category');
    console.log(`  ${categories[0].count} categories`);

    await conn.end();
})();
