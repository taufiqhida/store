const pool = require('./src/config/database');

const dummyNames = [
    'Andi Pratama', 'Budi Santoso', 'Citra Dewi', 'Dina Permata',
    'Eko Wijaya', 'Fitri Handayani', 'Galih Saputra', 'Hana Safitri',
    'Irwan Kurniawan', 'Joko Susanto'
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
    'Produk sesuai ekspektasi. Proses cepat dan aman. 👍'
];

async function createTestimonials() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Delete all existing testimonials
        await conn.query('DELETE FROM Testimonial');
        console.log('🗑️ Semua testimoni lama dihapus.\n');

        // Get all orders
        const orders = await conn.query('SELECT orderCode, productName FROM `Order` ORDER BY id LIMIT 10');

        if (orders.length === 0) {
            console.log('❌ Tidak ada order. Buat testimoni dengan order dummy.');

            // Create 10 testimonials without order validation
            for (let i = 0; i < 10; i++) {
                const orderCode = `TESTI-${String(i + 1).padStart(3, '0')}`;
                const name = dummyNames[i];
                const content = testimonialTemplates[i];
                const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5
                const productName = 'Produk Digital Premium';

                await conn.query(
                    `INSERT INTO Testimonial (orderCode, name, content, rating, productName, isApproved, createdAt)
                     VALUES (?, ?, ?, ?, ?, 1, NOW())`,
                    [orderCode, name, content, rating, productName]
                );
                console.log(`✅ ${i + 1}. ${name} (${rating}⭐)`);
            }
        } else {
            // Create testimonials from orders
            const totalToCreate = Math.min(10, orders.length);

            for (let i = 0; i < totalToCreate; i++) {
                const order = orders[i];
                const name = dummyNames[i];
                const content = testimonialTemplates[i];
                const rating = Math.floor(Math.random() * 2) + 4;

                await conn.query(
                    `INSERT INTO Testimonial (orderCode, name, content, rating, productName, isApproved, createdAt)
                     VALUES (?, ?, ?, ?, ?, 1, NOW())`,
                    [order.orderCode, name, content, rating, order.productName]
                );
                console.log(`✅ ${i + 1}. ${name} - ${order.productName} (${rating}⭐)`);
            }

            // If orders < 10, create additional with dummy order codes
            for (let i = totalToCreate; i < 10; i++) {
                const orderCode = `TESTI-${String(i + 1).padStart(3, '0')}`;
                const name = dummyNames[i];
                const content = testimonialTemplates[i];
                const rating = Math.floor(Math.random() * 2) + 4;
                const productName = 'Produk Digital Premium';

                await conn.query(
                    `INSERT INTO Testimonial (orderCode, name, content, rating, productName, isApproved, createdAt)
                     VALUES (?, ?, ?, ?, ?, 1, NOW())`,
                    [orderCode, name, content, rating, productName]
                );
                console.log(`✅ ${i + 1}. ${name} - ${productName} (${rating}⭐)`);
            }
        }

        console.log(`\n=== SELESAI: 10 testimoni dibuat dan disetujui! ===`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

createTestimonials();
