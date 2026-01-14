const pool = require('./src/config/database');

const dummyNames = [
    'Andi Pratama', 'Budi Santoso', 'Citra Dewi', 'Dina Permata',
    'Eko Wijaya', 'Fitri Handayani', 'Galih Saputra', 'Hana Safitri',
    'Irwan Kurniawan', 'Joko Susanto', 'Kartika Sari', 'Lina Marlina'
];

const testimonialTemplates = [
    'Produk sangat bagus dan berkualitas! Pengiriman cepat. Terima kasih!',
    'Sangat puas dengan pelayanannya. Recommended banget!',
    'Kualitas premium dengan harga terjangkau. Pasti repeat order!',
    'Fast response dan barang sesuai deskripsi. Top!',
    'Mantap! Sudah langganan dari dulu. Tidak pernah mengecewakan.',
    'Seller ramah dan helpful. Produk original dan berkualitas.',
    'Best seller! Produknya asli dan pelayanan memuaskan.',
    'Pengalaman belanja yang menyenangkan. Highly recommended!',
    'Sudah beli berkali-kali, selalu puas. Terima kasih seller!',
    'Produk sesuai ekspektasi. Proses cepat dan aman. 👍',
    'Harga terbaik dibanding toko lain. Kualitas terjamin!',
    'Respon cepat, pengiriman aman. Pasti balik lagi!'
];

async function seedTestimonials() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Get all orders
        const orders = await conn.query('SELECT orderCode, productName FROM `Order`');
        console.log(`Found ${orders.length} orders\n`);

        let created = 0;
        let skipped = 0;

        for (const order of orders) {
            // Check if testimonial already exists
            const existing = await conn.query('SELECT id FROM Testimonial WHERE orderCode = ?', [order.orderCode]);

            if (existing.length > 0) {
                console.log(`⏭️ ${order.orderCode} - Already has testimonial`);
                skipped++;
                continue;
            }

            // Random name and content
            const name = dummyNames[Math.floor(Math.random() * dummyNames.length)];
            const content = testimonialTemplates[Math.floor(Math.random() * testimonialTemplates.length)];
            const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars

            // Insert and approve testimonial
            await conn.query(
                `INSERT INTO Testimonial (orderCode, name, content, rating, productName, isApproved, createdAt)
                 VALUES (?, ?, ?, ?, ?, 1, NOW())`,
                [order.orderCode, name, content, rating, order.productName]
            );

            console.log(`✅ ${order.orderCode} - ${name} (${rating}⭐)`);
            created++;
        }

        console.log(`\n=== SELESAI ===`);
        console.log(`Dibuat: ${created} testimoni`);
        console.log(`Dilewati: ${skipped} (sudah ada)`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

seedTestimonials();
