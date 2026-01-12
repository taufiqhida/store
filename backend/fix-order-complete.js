const mariadb = require('mariadb');

async function main() {
    console.log('🔧 Fixing Order table - Adding missing columns...');

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    try {
        // Get current columns
        const columns = await conn.query('SHOW COLUMNS FROM `Order`');
        const columnNames = columns.map(c => c.Field);
        console.log('Current columns:', columnNames);

        // List of required columns with their definitions
        const requiredColumns = [
            { name: 'orderCode', def: "VARCHAR(255) UNIQUE" },
            { name: 'productName', def: "VARCHAR(255) NOT NULL" },
            { name: 'variantName', def: "VARCHAR(255) NOT NULL" },
            { name: 'quantity', def: "INT NOT NULL DEFAULT 1" },
            { name: 'price', def: "FLOAT NOT NULL" },
            { name: 'uniqueCode', def: "INT NOT NULL DEFAULT 0" },
            { name: 'totalPrice', def: "FLOAT NOT NULL" },
            { name: 'paymentMethod', def: "VARCHAR(255)" },
            { name: 'status', def: "VARCHAR(50) DEFAULT 'pending'" },
            { name: 'whatsappSent', def: "BOOLEAN DEFAULT FALSE" },
            { name: 'createdAt', def: "DATETIME DEFAULT CURRENT_TIMESTAMP" }
        ];

        for (const col of requiredColumns) {
            if (!columnNames.includes(col.name)) {
                console.log(`Adding column: ${col.name}`);
                await conn.query(`ALTER TABLE \`Order\` ADD COLUMN ${col.name} ${col.def}`);
                console.log(`✅ Added ${col.name}`);
            }
        }

        // Show final structure
        console.log('\n=== Final Order Table Structure ===');
        const finalCols = await conn.query('SHOW COLUMNS FROM `Order`');
        finalCols.forEach(c => console.log('-', c.Field, '(' + c.Type + ')'));

        console.log('\n🎉 Order table is now complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await conn.end();
    }
}

main();
