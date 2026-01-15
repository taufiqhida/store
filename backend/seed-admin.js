const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🔧 Creating admin users...');

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    try {
        // Admin 1: admin
        const existing1 = await conn.query('SELECT id FROM Admin WHERE username = ?', ['admin']);
        const hashedAdmin = await bcrypt.hash('admin123', 10);

        if (existing1.length > 0) {
            await conn.query('UPDATE Admin SET password = ? WHERE username = ?', [hashedAdmin, 'admin']);
            console.log('✅ Admin "admin" updated');
        } else {
            await conn.query(
                'INSERT INTO Admin (username, password, name, createdAt) VALUES (?, ?, ?, NOW())',
                ['admin', hashedAdmin, 'Administrator']
            );
            console.log('✅ Admin "admin" created');
        }

        // Admin 2: zaidan
        const existing2 = await conn.query('SELECT id FROM Admin WHERE username = ?', ['zaidan']);
        const hashedZaidan = await bcrypt.hash('zaidan', 10);

        if (existing2.length > 0) {
            await conn.query('UPDATE Admin SET password = ? WHERE username = ?', [hashedZaidan, 'zaidan']);
            console.log('✅ Admin "zaidan" updated');
        } else {
            await conn.query(
                'INSERT INTO Admin (username, password, name, createdAt) VALUES (?, ?, ?, NOW())',
                ['zaidan', hashedZaidan, 'Zaidan']
            );
            console.log('✅ Admin "zaidan" created');
        }

        console.log('\n=== Admin Users Ready ===');
        console.log('1. admin / admin123');
        console.log('2. zaidan / zaidan');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await conn.end();
    }
}

main();

