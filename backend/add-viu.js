const pool = require('./src/config/database');

async function addViu() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Get category
        const cats = await conn.query("SELECT id FROM Category WHERE slug = 'digital' LIMIT 1");
        const categoryId = cats[0]?.id || 1;

        // Check if exists
        const existing = await conn.query("SELECT id FROM Product WHERE slug = 'viu-premium'");
        if (existing.length > 0) {
            console.log('Viu already exists');
            return;
        }

        // Add Viu
        const result = await conn.query(
            "INSERT INTO Product (name, slug, description, image, badge, isActive, categoryId, createdAt) VALUES (?, ?, ?, ?, ?, 1, ?, NOW())",
            ['Viu Premium', 'viu-premium', 'Viu Premium untuk streaming drama Korea, film, dan serial TV tanpa iklan. Nonton sepuasnya dengan kualitas HD.', 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500', '📺 PROMO', categoryId]
        );
        const productId = Number(result.insertId);

        // Add variants
        await conn.query("INSERT INTO Variant (name, price, originalPrice, isWarranty, isActive, productId) VALUES (?, ?, ?, 0, 1, ?)", ['1 Bulan', 29000, 59000, productId]);
        await conn.query("INSERT INTO Variant (name, price, originalPrice, isWarranty, isActive, productId) VALUES (?, ?, ?, 0, 1, ?)", ['3 Bulan', 79000, 150000, productId]);
        await conn.query("INSERT INTO Variant (name, price, originalPrice, isWarranty, isActive, productId) VALUES (?, ?, ?, 0, 1, ?)", ['1 Tahun', 249000, 500000, productId]);

        console.log('✅ Viu Premium added with 3 variants!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

addViu();
