const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Seeding database...');

    // Create connection pool with explicit config
    const pool = mariadb.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1',
        waitForConnections: true,
        connectionLimit: 10
    });
    const adapter = new PrismaMariaDb(pool);
    const prisma = new PrismaClient({ adapter });

    // Clear existing data
    await prisma.admin.deleteMany();
    await prisma.order.deleteMany();
    await prisma.variant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.storeSettings.deleteMany();

    // Create categories
    const categories = await Promise.all([
        prisma.category.create({ data: { name: 'Hiburan', slug: 'hiburan' } }),
        prisma.category.create({ data: { name: 'Lisensi', slug: 'lisensi' } }),
        prisma.category.create({ data: { name: 'Edukasi', slug: 'edukasi' } }),
        prisma.category.create({ data: { name: 'Followers', slug: 'followers' } }),
    ]);

    console.log('✅ Categories created');

    // Create products with variants
    const products = [
        {
            name: 'ChatGPT Plus',
            slug: 'chatgpt-plus',
            description: 'Akses ChatGPT Plus dengan GPT-4, response lebih cepat, dan fitur premium lainnya. Cocok untuk produktivitas dan kreativitas tanpa batas!',
            image: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
            badge: 'Terlaris',
            categoryId: categories[1].id, // Lisensi
            variants: [
                { name: 'Private 1 Bulan', price: 85000, originalPrice: 350000, isWarranty: true },
                { name: 'Sharing 1 Bulan', price: 35000, originalPrice: 100000, isWarranty: false }
            ]
        },
        {
            name: 'Netflix Premium',
            slug: 'netflix-premium',
            description: 'Nikmati streaming Netflix Premium dengan kualitas 4K Ultra HD. Bisa ditonton di berbagai perangkat tanpa iklan.',
            image: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
            badge: 'Proses Instant',
            categoryId: categories[0].id, // Hiburan
            variants: [
                { name: 'Private 1 Bulan', price: 45000, originalPrice: 186000, isWarranty: true },
                { name: 'Sharing 1 Bulan', price: 20000, originalPrice: 50000, isWarranty: false }
            ]
        },
        {
            name: 'Spotify Premium',
            slug: 'spotify-premium',
            description: 'Dengarkan musik favoritmu tanpa iklan, bisa download offline, dan kualitas audio terbaik dengan Spotify Premium.',
            image: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg',
            badge: null,
            categoryId: categories[0].id, // Hiburan
            variants: [
                { name: 'Private 1 Bulan', price: 15000, originalPrice: 55000, isWarranty: true },
                { name: 'Family 1 Bulan', price: 25000, originalPrice: 87000, isWarranty: true }
            ]
        },
        {
            name: 'Youtube Premium',
            slug: 'youtube-premium',
            description: 'Tonton video Youtube tanpa iklan, bisa background play, dan download video untuk ditonton offline.',
            image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
            badge: 'Proses Instant',
            categoryId: categories[0].id, // Hiburan
            variants: [
                { name: 'Private 1 Bulan', price: 20000, originalPrice: 69000, isWarranty: true },
                { name: 'Family 1 Bulan', price: 35000, originalPrice: 139000, isWarranty: true }
            ]
        },
        {
            name: 'Canva Pro',
            slug: 'canva-pro',
            description: 'Desain dengan mudah menggunakan Canva Pro! Akses jutaan template premium, foto, dan fitur magic resize.',
            image: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg',
            badge: 'Terlaris',
            categoryId: categories[1].id, // Lisensi
            variants: [
                { name: 'Private 1 Bulan', price: 25000, originalPrice: 95000, isWarranty: true },
                { name: 'Private 1 Tahun', price: 150000, originalPrice: 950000, isWarranty: true }
            ]
        },
        {
            name: 'Microsoft Office 365',
            slug: 'microsoft-office-365',
            description: 'Paket lengkap Microsoft Office termasuk Word, Excel, PowerPoint, dan 1TB OneDrive storage.',
            image: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg',
            badge: null,
            categoryId: categories[1].id, // Lisensi
            variants: [
                { name: 'Personal 1 Tahun', price: 150000, originalPrice: 899000, isWarranty: true },
                { name: 'Family 1 Tahun', price: 250000, originalPrice: 1299000, isWarranty: true }
            ]
        },
        {
            name: 'Duolingo Plus',
            slug: 'duolingo-plus',
            description: 'Belajar bahasa asing tanpa iklan dengan Duolingo Plus. Fitur offline dan unlimited hearts!',
            image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Duolingo_logo.svg',
            badge: null,
            categoryId: categories[2].id, // Edukasi
            variants: [
                { name: 'Private 1 Bulan', price: 35000, originalPrice: 129000, isWarranty: true },
                { name: 'Private 1 Tahun', price: 200000, originalPrice: 999000, isWarranty: true }
            ]
        },
        {
            name: 'Followers Instagram',
            slug: 'followers-instagram',
            description: 'Tingkatkan followers Instagram kamu dengan followers real dan aktif. Aman dan tidak drop!',
            image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
            badge: 'Proses Instant',
            categoryId: categories[3].id, // Followers
            variants: [
                { name: '1000 Followers', price: 50000, originalPrice: 100000, isWarranty: false },
                { name: '5000 Followers', price: 200000, originalPrice: 450000, isWarranty: false }
            ]
        }
    ];

    for (const product of products) {
        const { variants, ...productData } = product;
        const createdProduct = await prisma.product.create({
            data: {
                ...productData,
                variants: {
                    create: variants
                }
            }
        });
        console.log(`✅ Created product: ${createdProduct.name}`);
    }

    // Create payment methods
    const paymentMethods = [
        { name: 'QRIS', icon: '📱', type: 'ewallet' },
        { name: 'GoPay', icon: '💚', type: 'ewallet' },
        { name: 'OVO', icon: '💜', type: 'ewallet' },
        { name: 'DANA', icon: '💙', type: 'ewallet' },
        { name: 'ShopeePay', icon: '🧡', type: 'ewallet' },
        { name: 'Bank Transfer', icon: '🏦', type: 'bank' },
    ];

    for (const pm of paymentMethods) {
        await prisma.paymentMethod.create({ data: pm });
    }
    console.log('✅ Payment methods created');

    // Create store settings
    const storeSettings = [
        { key: 'store_name', value: 'Taufiq Store' },
        { key: 'store_tagline', value: 'Premium sat-set Anti Ribet' },
        { key: 'whatsapp_number', value: '6281234567890' },
        {
            key: 'whatsapp_message_template',
            value: `Halo Taufiq Store! 👋

Saya ingin memesan:
📦 Produk: {product}
🎯 Varian: {variant}
🔢 Jumlah: {quantity}
💰 Harga: Rp {price}
🔑 Kode Unik: {unique_code}
💵 Total Bayar: Rp {total}
💳 Pembayaran: {payment}

Mohon diproses ya, terima kasih! 🙏`
        },
    ];

    for (const setting of storeSettings) {
        await prisma.storeSettings.create({ data: setting });
    }
    console.log('✅ Store settings created');

    // Create admin user (password: admin123)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.create({
        data: {
            username: 'admin',
            password: hashedPassword,
            name: 'Administrator'
        }
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');

    console.log('🎉 Seeding completed!');

    await prisma.$disconnect();
    await pool.end();
}

require('dotenv').config();
main()
    .catch((e) => {
        console.error('❌ Error seeding:', e);
        process.exit(1);
    });
