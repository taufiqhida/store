const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Seeding database...');

    // Create single connection first to test
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'taufiq_store_1'
        });
        console.log('✅ Direct connection works');
    } catch (e) {
        console.error('Direct connection failed:', e);
        return;
    }

    // Create connection pool with mariadb driver
    const pool = mariadb.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1',
        connectionLimit: 10
    });

    console.log('Pool created, testing adapter...');

    const adapter = new PrismaMariaDb(pool);
    console.log('Adapter created:', adapter);

    const prisma = new PrismaClient({ adapter });
    console.log('PrismaClient created');

    try {
        // Test query
        const count = await prisma.category.count();
        console.log('Category count:', count);
    } catch (e) {
        console.error('Prisma query failed:', e);
    }

    await conn.end();
    await pool.end();
}

require('dotenv').config();
main().catch(console.error);
