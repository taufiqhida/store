const mariadb = require('mariadb');

(async () => {
    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    console.log('Product table:');
    const cols = await conn.query('DESCRIBE Product');
    cols.forEach(c => console.log(`  ${c.Field} - ${c.Type}`));

    console.log('\nVariant table:');
    const cols2 = await conn.query('DESCRIBE Variant');
    cols2.forEach(c => console.log(`  ${c.Field} - ${c.Type}`));

    await conn.end();
})();
