const mariadb = require('mariadb');

async function main() {
    console.log('🔧 Seeding Site Mode Settings...');

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    try {
        const settings = [
            { key: 'site_mode', value: 'coming_soon' }, // coming_soon, maintenance, live
            { key: 'coming_soon_message', value: 'Toko kami sedang dalam persiapan. Kami akan segera hadir dengan produk-produk terbaik untuk Anda!' },
            { key: 'coming_soon_date', value: '2026-02-01T00:00:00' }, // Target countdown date
            { key: 'maintenance_message', value: 'Sedang dalam perbaikan. Mohon maaf atas ketidaknyamanannya, kami akan segera kembali!' },
            { key: 'maintenance_end_date', value: '2026-01-16T00:00:00' } // Estimated end date
        ];

        for (const s of settings) {
            // Check if exists
            const existing = await conn.query('SELECT id FROM StoreSettings WHERE `key` = ?', [s.key]);

            if (existing.length > 0) {
                console.log(`- ${s.key}: already exists, skipping`);
            } else {
                await conn.query('INSERT INTO StoreSettings (`key`, value) VALUES (?, ?)', [s.key, s.value]);
                console.log(`✅ ${s.key}: inserted`);
            }
        }

        console.log('\n🎉 Site mode settings seeded successfully!');
        console.log('\n📝 Sekarang Anda bisa mengatur mode situs di Admin Dashboard > Settings');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await conn.end();
    }
}

main();
