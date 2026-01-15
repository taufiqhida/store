const pool = require('./src/config/database');

async function addProducts() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Get or create category
        let categories = await conn.query("SELECT id FROM Category WHERE slug = 'digital' LIMIT 1");
        let categoryId;

        if (categories.length === 0) {
            const result = await conn.query(
                "INSERT INTO Category (name, slug, isActive) VALUES ('Digital', 'digital', 1)"
            );
            categoryId = Number(result.insertId);
            console.log('Created category: Digital');
        } else {
            categoryId = categories[0].id;
        }

        // Products to add
        const products = [
            {
                name: 'Hotel Booking Premium',
                slug: 'hotel-booking-premium',
                description: 'Akun premium untuk booking hotel dengan diskon eksklusif hingga 50%. Dapat digunakan di berbagai platform hotel terkemuka.',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
                badge: '🏨 HOT',
                variants: [
                    { name: '1 Bulan', price: 75000, originalPrice: 150000 },
                    { name: '3 Bulan', price: 199000, originalPrice: 400000 },
                    { name: '6 Bulan', price: 349000, originalPrice: 750000 }
                ]
            },
            {
                name: 'CapCut Pro',
                slug: 'capcut-pro',
                description: 'CapCut Pro untuk editing video profesional tanpa watermark. Akses semua fitur premium, efek, dan template eksklusif.',
                image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500',
                badge: '🎬 BEST',
                variants: [
                    { name: '1 Bulan', price: 35000, originalPrice: 70000 },
                    { name: '3 Bulan', price: 89000, originalPrice: 180000 },
                    { name: '1 Tahun', price: 299000, originalPrice: 600000 }
                ]
            },
            {
                name: 'TikTok Premium',
                slug: 'tiktok-premium',
                description: 'TikTok Premium tanpa iklan, download video tanpa watermark, dan fitur eksklusif lainnya untuk pengalaman TikTok terbaik.',
                image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=500',
                badge: '📱 NEW',
                variants: [
                    { name: '1 Bulan', price: 45000, originalPrice: 90000 },
                    { name: '3 Bulan', price: 119000, originalPrice: 240000 },
                    { name: '6 Bulan', price: 199000, originalPrice: 450000 }
                ]
            }
        ];

        for (const product of products) {
            // Check if product exists
            const existing = await conn.query('SELECT id FROM Product WHERE slug = ?', [product.slug]);

            if (existing.length > 0) {
                console.log(`⏭️ ${product.name} already exists, skipping...`);
                continue;
            }

            // Insert product
            const result = await conn.query(
                `INSERT INTO Product (name, slug, description, image, badge, isActive, categoryId, createdAt)
                 VALUES (?, ?, ?, ?, ?, 1, ?, NOW())`,
                [product.name, product.slug, product.description, product.image, product.badge, categoryId]
            );
            const productId = Number(result.insertId);

            // Insert variants
            for (const variant of product.variants) {
                await conn.query(
                    `INSERT INTO Variant (name, price, originalPrice, isWarranty, isActive, productId)
                     VALUES (?, ?, ?, 0, 1, ?)`,
                    [variant.name, variant.price, variant.originalPrice, productId]
                );
            }

            console.log(`✅ ${product.name} added with ${product.variants.length} variants`);
        }

        console.log('\n=== Products Added Successfully! ===');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

addProducts();
