const mariadb = require('mariadb');

async function main() {
    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    try {
        // Check StoreSettings table structure
        console.log('=== StoreSettings Table ===');
        const cols = await conn.query('SHOW COLUMNS FROM StoreSettings');
        cols.forEach(c => console.log('-', c.Field, '(' + c.Type + ')'));

        // Check all settings
        console.log('\n=== Current Settings Values ===');
        const settings = await conn.query('SELECT * FROM StoreSettings');
        if (settings.length === 0) {
            console.log('No settings found! Need to seed settings.');
        } else {
            settings.forEach(s => {
                const value = s.value ? s.value.substring(0, 50) : 'NULL';
                console.log(`[${s.id}] ${s.key}: ${value}${s.value && s.value.length > 50 ? '...' : ''}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await conn.end();
    }
}

main();
