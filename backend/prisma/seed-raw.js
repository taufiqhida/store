const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Seeding database with raw SQL...');

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1',
        multipleStatements: true
    });

    try {
        // Clear existing data
        console.log('Clearing existing data...');
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query('TRUNCATE TABLE `Order`');
        await conn.query('TRUNCATE TABLE `Variant`');
        await conn.query('TRUNCATE TABLE `Product`');
        await conn.query('TRUNCATE TABLE `Category`');
        await conn.query('TRUNCATE TABLE `PaymentMethod`');
        await conn.query('TRUNCATE TABLE `StoreSettings`');
        await conn.query('TRUNCATE TABLE `Admin`');
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Tables cleared');

        // Create categories
        await conn.query(`
            INSERT INTO Category (name, slug) VALUES 
            ('Hiburan', 'hiburan'),
            ('Lisensi', 'lisensi'),
            ('Edukasi', 'edukasi'),
            ('Followers', 'followers')
        `);
        console.log('✅ Categories created');

        // Get category IDs
        const categories = await conn.query('SELECT id, slug FROM Category');
        const catMap = {};
        categories.forEach(c => catMap[c.slug] = c.id);

        // Create products
        const products = [
            { name: 'ChatGPT Plus', slug: 'chatgpt-plus', description: 'Akses ChatGPT Plus dengan GPT-4, response lebih cepat, dan fitur premium lainnya.', image: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', badge: 'Terlaris', categoryId: catMap['lisensi'] },
            { name: 'Netflix Premium', slug: 'netflix-premium', description: 'Nikmati streaming Netflix Premium dengan kualitas 4K Ultra HD.', image: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', badge: 'Proses Instant', categoryId: catMap['hiburan'] },
            { name: 'Spotify Premium', slug: 'spotify-premium', description: 'Dengarkan musik favoritmu tanpa iklan dengan Spotify Premium.', image: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg', badge: null, categoryId: catMap['hiburan'] },
            { name: 'Youtube Premium', slug: 'youtube-premium', description: 'Tonton video Youtube tanpa iklan.', image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', badge: 'Proses Instant', categoryId: catMap['hiburan'] },
            { name: 'Canva Pro', slug: 'canva-pro', description: 'Desain dengan mudah menggunakan Canva Pro!', image: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg', badge: 'Terlaris', categoryId: catMap['lisensi'] },
            { name: 'Microsoft Office 365', slug: 'microsoft-office-365', description: 'Paket lengkap Microsoft Office.', image: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg', badge: null, categoryId: catMap['lisensi'] },
            { name: 'Duolingo Plus', slug: 'duolingo-plus', description: 'Belajar bahasa asing tanpa iklan.', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Duolingo_logo.svg', badge: null, categoryId: catMap['edukasi'] },
            { name: 'Followers Instagram', slug: 'followers-instagram', description: 'Tingkatkan followers Instagram kamu.', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png', badge: 'Proses Instant', categoryId: catMap['followers'] }
        ];

        for (const p of products) {
            await conn.query(
                'INSERT INTO Product (name, slug, description, image, badge, categoryId, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [p.name, p.slug, p.description, p.image, p.badge, p.categoryId]
            );
        }
        console.log('✅ Products created');

        // Get product IDs
        const productRows = await conn.query('SELECT id, slug FROM Product');
        const prodMap = {};
        productRows.forEach(p => prodMap[p.slug] = p.id);

        // Create variants
        const variants = [
            // ChatGPT Plus
            { productId: prodMap['chatgpt-plus'], name: 'Private 1 Bulan', price: 85000, originalPrice: 350000, isWarranty: true },
            { productId: prodMap['chatgpt-plus'], name: 'Sharing 1 Bulan', price: 35000, originalPrice: 100000, isWarranty: false },
            // Netflix
            { productId: prodMap['netflix-premium'], name: 'Private 1 Bulan', price: 45000, originalPrice: 186000, isWarranty: true },
            { productId: prodMap['netflix-premium'], name: 'Sharing 1 Bulan', price: 20000, originalPrice: 50000, isWarranty: false },
            // Spotify
            { productId: prodMap['spotify-premium'], name: 'Private 1 Bulan', price: 15000, originalPrice: 55000, isWarranty: true },
            { productId: prodMap['spotify-premium'], name: 'Family 1 Bulan', price: 25000, originalPrice: 87000, isWarranty: true },
            // Youtube
            { productId: prodMap['youtube-premium'], name: 'Private 1 Bulan', price: 20000, originalPrice: 69000, isWarranty: true },
            { productId: prodMap['youtube-premium'], name: 'Family 1 Bulan', price: 35000, originalPrice: 139000, isWarranty: true },
            // Canva
            { productId: prodMap['canva-pro'], name: 'Private 1 Bulan', price: 25000, originalPrice: 95000, isWarranty: true },
            { productId: prodMap['canva-pro'], name: 'Private 1 Tahun', price: 150000, originalPrice: 950000, isWarranty: true },
            // Office
            { productId: prodMap['microsoft-office-365'], name: 'Personal 1 Tahun', price: 150000, originalPrice: 899000, isWarranty: true },
            { productId: prodMap['microsoft-office-365'], name: 'Family 1 Tahun', price: 250000, originalPrice: 1299000, isWarranty: true },
            // Duolingo
            { productId: prodMap['duolingo-plus'], name: 'Private 1 Bulan', price: 35000, originalPrice: 129000, isWarranty: true },
            { productId: prodMap['duolingo-plus'], name: 'Private 1 Tahun', price: 200000, originalPrice: 999000, isWarranty: true },
            // Followers
            { productId: prodMap['followers-instagram'], name: '1000 Followers', price: 50000, originalPrice: 100000, isWarranty: false },
            { productId: prodMap['followers-instagram'], name: '5000 Followers', price: 200000, originalPrice: 450000, isWarranty: false }
        ];

        for (const v of variants) {
            await conn.query(
                'INSERT INTO Variant (productId, name, price, originalPrice, isWarranty) VALUES (?, ?, ?, ?, ?)',
                [v.productId, v.name, v.price, v.originalPrice, v.isWarranty]
            );
        }
        console.log('✅ Variants created');

        // Create payment methods
        const paymentMethods = [
            { name: 'QRIS', icon: '📱', type: 'ewallet' },
            { name: 'GoPay', icon: '💚', type: 'ewallet' },
            { name: 'OVO', icon: '💜', type: 'ewallet' },
            { name: 'DANA', icon: '💙', type: 'ewallet' },
            { name: 'ShopeePay', icon: '🧡', type: 'ewallet' },
            { name: 'Bank Transfer', icon: '🏦', type: 'bank' }
        ];

        for (const pm of paymentMethods) {
            await conn.query(
                'INSERT INTO PaymentMethod (name, icon, type, isActive) VALUES (?, ?, ?, 1)',
                [pm.name, pm.icon, pm.type]
            );
        }
        console.log('✅ Payment methods created');

        // Create store settings
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
            await conn.query(
                'INSERT INTO StoreSettings (`key`, value) VALUES (?, ?)',
                [s.key, s.value]
            );
        }
        console.log('✅ Store settings created');

        // Create admin users (2 accounts)
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const hashedPassword2 = await bcrypt.hash('zaidan123', 10);

        await conn.query(
            'INSERT INTO Admin (username, password, name, createdAt) VALUES (?, ?, ?, NOW())',
            ['admin', hashedPassword, 'Administrator']
        );
        await conn.query(
            'INSERT INTO Admin (username, password, name, createdAt) VALUES (?, ?, ?, NOW())',
            ['zaidan', hashedPassword2, 'Zaidan']
        );
        console.log('✅ Admin users created:');
        console.log('   - admin / admin123');
        console.log('   - zaidan / zaidan123');

        // Create sample orders for analytics
        const sampleOrders = [
            { orderCode: 'ORD-ABC123', productName: 'ChatGPT Plus', variantName: 'Private 1 Bulan', quantity: 1, price: 85000, paymentMethod: 'QRIS', status: 'completed', daysAgo: 0 },
            { orderCode: 'ORD-DEF456', productName: 'Netflix Premium', variantName: 'Private 1 Bulan', quantity: 2, price: 45000, paymentMethod: 'GoPay', status: 'completed', daysAgo: 1 },
            { orderCode: 'ORD-GHI789', productName: 'Spotify Premium', variantName: 'Private 1 Bulan', quantity: 1, price: 15000, paymentMethod: 'OVO', status: 'completed', daysAgo: 2 },
            { orderCode: 'ORD-JKL012', productName: 'Canva Pro', variantName: 'Private 1 Tahun', quantity: 1, price: 150000, paymentMethod: 'DANA', status: 'completed', daysAgo: 3 },
            { orderCode: 'ORD-MNO345', productName: 'Youtube Premium', variantName: 'Private 1 Bulan', quantity: 3, price: 20000, paymentMethod: 'Bank Transfer', status: 'pending', daysAgo: 0 },
            { orderCode: 'ORD-PQR678', productName: 'Microsoft Office 365', variantName: 'Personal 1 Tahun', quantity: 1, price: 150000, paymentMethod: 'QRIS', status: 'confirmed', daysAgo: 1 },
            { orderCode: 'ORD-STU901', productName: 'ChatGPT Plus', variantName: 'Sharing 1 Bulan', quantity: 5, price: 35000, paymentMethod: 'GoPay', status: 'completed', daysAgo: 5 },
            { orderCode: 'ORD-VWX234', productName: 'Duolingo Plus', variantName: 'Private 1 Bulan', quantity: 1, price: 35000, paymentMethod: 'OVO', status: 'completed', daysAgo: 7 },
            { orderCode: 'ORD-YZA567', productName: 'Followers Instagram', variantName: '1000 Followers', quantity: 2, price: 50000, paymentMethod: 'DANA', status: 'processing', daysAgo: 0 },
            { orderCode: 'ORD-BCD890', productName: 'Netflix Premium', variantName: 'Sharing 1 Bulan', quantity: 10, price: 20000, paymentMethod: 'ShopeePay', status: 'completed', daysAgo: 10 }
        ];

        for (const order of sampleOrders) {
            const uniqueCode = Math.floor(Math.random() * 999) + 1;
            const totalPrice = (order.price * order.quantity) + uniqueCode;
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - order.daysAgo);

            await conn.query(
                `INSERT INTO \`Order\` (orderCode, productName, variantName, quantity, price, paymentMethod, uniqueCode, totalPrice, status, createdAt) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [order.orderCode, order.productName, order.variantName, order.quantity, order.price, order.paymentMethod, uniqueCode, totalPrice, order.status, createdAt]
            );
        }
        console.log('✅ Sample orders created (10 orders for analytics)');

        console.log('🎉 Seeding completed!');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await conn.end();
    }
}

main();

