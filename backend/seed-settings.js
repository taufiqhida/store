const mariadb = require('mariadb');

async function main() {
    console.log('🔧 Seeding StoreSettings...');

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1'
    });

    try {
        const waTemplate = `Halo Taufiq Store! 👋

Saya ingin memesan:
📦 Produk: {product}
🎯 Varian: {variant}
🔢 Jumlah: {quantity}
💰 Harga: Rp {price}
🔑 Kode Unik: {unique_code}
💵 Total Bayar: Rp {total}
💳 Pembayaran: {payment}

Mohon diproses ya, terima kasih! 🙏`;

        const settings = [
            { key: 'store_name', value: 'Taufiq Store' },
            { key: 'store_tagline', value: 'Premium sat-set Anti Ribet' },
            { key: 'whatsapp_number', value: '6281234567890' },
            { key: 'whatsapp_message_template', value: waTemplate }
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

        console.log('\n🎉 Settings seeded successfully!');
        console.log('\n📝 Sekarang Anda bisa ganti nomor WhatsApp di Admin Dashboard > Settings');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await conn.end();
    }
}

main();
