const mariadb = require('mariadb');

async function main() {
    console.log('🔧 Fixing Order table structure...');

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    try {
        // Check current columns
        const columns = await conn.query('SHOW COLUMNS FROM `Order`');
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns:', columnNames);

        // Add whatsappSent if missing
        if (!columnNames.includes('whatsappSent')) {
            await conn.query('ALTER TABLE `Order` ADD COLUMN whatsappSent BOOLEAN DEFAULT FALSE');
            console.log('✅ Added whatsappSent column');
        } else {
            console.log('✅ whatsappSent column already exists');
        }

        // Add createdAt if missing
        if (!columnNames.includes('createdAt')) {
            await conn.query('ALTER TABLE `Order` ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP');
            console.log('✅ Added createdAt column');
        } else {
            console.log('✅ createdAt column already exists');
        }

        // Add status if missing
        if (!columnNames.includes('status')) {
            await conn.query("ALTER TABLE `Order` ADD COLUMN status VARCHAR(50) DEFAULT 'pending'");
            console.log('✅ Added status column');
        } else {
            console.log('✅ status column already exists');
        }

        console.log('🎉 Order table structure fixed!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await conn.end();
    }
}

main();
