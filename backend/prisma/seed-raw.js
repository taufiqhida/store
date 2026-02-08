const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
    console.log('🌱 Seeding database with raw SQL...');

    // Koneksi database pakai env variabel
    const conn = await mariadb.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: 3306,
        multipleStatements: true
    });

    try {
        // Hapus data lama
        console.log('🧹 Clearing existing data...');
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query('TRUNCATE TABLE `order`');
        await conn.query('TRUNCATE TABLE `variant`');
        await conn.query('TRUNCATE TABLE `product`');
        await conn.query('TRUNCATE TABLE `category`');
        await conn.query('TRUNCATE TABLE `paymentmethod`');
        await conn.query('TRUNCATE TABLE `storesettings`');
        await conn.query('TRUNCATE TABLE `admin_users`');
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Tables cleared');

        // Buat kategori
        await conn.query(`
            INSERT INTO category (name, slug) VALUES 
            ('Hiburan', 'hiburan'),
            ('Lisensi', 'lisensi'),
            ('Edukasi', 'edukasi'),
            ('Followers', 'followers')
        `);
        console.log('✅ Categories created');

        // Ambil ID kategori
        const categories = await conn.query('SELECT id, slug FROM category');
        const catMap = {};
        categories.forEach(c => catMap[c.slug] = c.id);

        // Buat produk
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
                'INSERT INTO product (name, slug, description, image, badge, categoryId, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [p.name, p.slug, p.description, p.image, p.badge, p.categoryId]
            );
        }
        console.log('✅ Products created');

        // Ambil ID produk
        const productRows = await conn.query('SELECT id, slug FROM product');
        const prodMap = {};
        productRows.forEach(p => prodMap[p.slug] = p.id);

        // Buat variant
        const variants = [
            { productId: prodMap['chatgpt-plus'], name: 'Private 1 Bulan', price: 85000, originalPrice: 350000, isWarranty: true },
            { productId: prodMap['chatgpt-plus'], name: 'Sharing 1 Bulan', price: 35000, originalPrice: 100000, isWarranty: false },
            { productId: prodMap['netflix-premium'], name: 'Private 1 Bulan', price: 45000, originalPrice: 186000, isWarranty: true },
            { productId: prodMap['netflix-premium'], name: 'Sharing 1 Bulan', price: 20000, originalPrice: 50000, isWarranty: false },
            { productId: prodMap['spotify-premium'], name: 'Private 1 Bulan', price: 15000, originalPrice: 55000, isWarranty: true },
            { productId: prodMap['spotify-premium'], name: 'Family 1 Bulan', price: 25000, originalPrice: 87000, isWarranty: true }
        ];

        for (const v of variants) {
            await conn.query(
                'INSERT INTO variant (productId, name, price, originalPrice, isWarranty) VALUES (?, ?, ?, ?, ?)',
                [v.productId, v.name, v.price, v.originalPrice, v.isWarranty]
            );
        }
        console.log('✅ Variants created');

        // Buat payment methods
        const paymentMethods = [
            { name: 'QRIS', icon: '📱' },
            { name: 'GoPay', icon: '💚' },
            { name: 'DANA', icon: '💙' }
        ];

        for (const pm of paymentMethods) {
            await conn.query(
                'INSERT INTO paymentmethod (name, icon, iconType, isActive) VALUES (?, ?, ?, 1)',
                [pm.name, pm.icon, 'emoji']
            );
        }
        console.log('✅ Payment methods created');

        // Buat store settings
        const settings = [
            { key: 'store_name', value: 'Taufiq Store' },
            { key: 'whatsapp_number', value: '6281234567890' }
        ];

        for (const s of settings) {
            await conn.query(
                'INSERT INTO storesettings (`key`, value) VALUES (?, ?)',
                [s.key, s.value]
            );
        }
        console.log('✅ Store settings created');

        // Buat super admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await conn.query(
            `INSERT INTO admin_users (username, password, name, email, role, permissions, isActive, createdAt, updatedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            ['admin', hashedPassword, 'Super Administrator', 'admin@taufiqstore.com', 'SUPER_ADMIN', '[]', 1]
        );
        console.log('✅ Super Admin created (username: admin, password: admin123)');

        console.log('🎉 Seeding completed!');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await conn.end();
    }
}

main();
