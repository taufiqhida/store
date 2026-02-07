const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function test() {
    const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/taufiq_store_1';
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/);
    const [, user, password, host, port, database] = urlMatch;

    const conn = await mariadb.createConnection({
        host,
        user,
        password,
        database,
        port: parseInt(port),
        multipleStatements: true
    });

    try {
        console.log('Testing admin_users insert...');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const result = await conn.query(
            `INSERT INTO admin_users (username, password, name, email, role, permissions, isActive, createdAt, updatedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['testadmin', hashedPassword, 'Test Admin', 'test@test.com', 'SUPER_ADMIN', '[]', 1]
        );

        console.log('✅ Success!', result);
    } catch (error) {
        console.error('❌ Full Error:');
        console.error('Message:', error.message);
        console.error('SQL:', error.sql);
        console.error('Code:', error.code);
        console.error('Errno:', error.errno);
    } finally {
        await conn.end();
    }
}

test();
