const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🔧 Creating admin user...');

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    try {
        // Check if admin exists
        const existing = await conn.query('SELECT id FROM Admin WHERE username = ?', ['admin']);

        if (existing.length > 0) {
            console.log('Admin user already exists. Updating password...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await conn.query('UPDATE Admin SET password = ? WHERE username = ?', [hashedPassword, 'admin']);
        } else {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await conn.query(
                'INSERT INTO Admin (username, password, name, createdAt) VALUES (?, ?, ?, NOW())',
                ['admin', hashedPassword, 'Administrator']
            );
        }

        console.log('✅ Admin user ready (username: admin, password: admin123)');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await conn.end();
    }
}

main();
