const pool = require('./src/config/database');
require('dotenv').config();

async function addPayments() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Clear 
        await conn.query('DELETE FROM PaymentMethod');
        console.log('Cleared existing records');

        // Insert with correct column names from Prisma schema:
        // name, icon, iconType, accountInfo, feeType, fees, currency, qrisImage, isActive
        const payments = [
            { name: 'GoPay', icon: '💚', accountInfo: '087739612610' },
            { name: 'Dana', icon: '💙', accountInfo: '087739612610' },
            { name: 'Jago', icon: '🏦', accountInfo: '7460087739612610' }
        ];

        for (const pm of payments) {
            const result = await conn.query(
                'INSERT INTO PaymentMethod (name, icon, iconType, accountInfo, feeType, fees, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [pm.name, pm.icon, 'emoji', pm.accountInfo, 'fixed', 0, 1]
            );
            console.log(`Added: ${pm.name} - ${pm.accountInfo}`);
        }

        // Verify
        const all = await conn.query('SELECT * FROM PaymentMethod');
        console.log('\nPayment methods in database:', all.length);
        all.forEach(p => console.log(`  ${p.id}: ${p.name} - ${p.accountInfo}`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

addPayments();
