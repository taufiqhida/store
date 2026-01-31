const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🔧 Creating super admin...');

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    try {
        //  Check if admin_users table exists
        const existing = await conn.query('SELECT id FROM admin_users WHERE username = ?', ['admin']);
        const hashedPassword = await bcrypt.hash('password123', 10);

        if (existing.length > 0) {
            console.log('✅ Super admin already exists');
        } else {
            await conn.query(
                'INSERT INTO admin_users (username, password, name, email, role, permissions, isActive, deletedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                ['admin', hashedPassword, 'Super Admin', null, 'SUPER_ADMIN', '["*"]', 1, null]
            );
            console.log('✅ Super admin created!');
            console.log('   Username: admin');
            console.log('   Password: password123');
            console.log('   Role: SUPER_ADMIN');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await conn.end();
    }
}

main();
