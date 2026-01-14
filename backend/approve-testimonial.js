const pool = require('./src/config/database');

async function approveTestimonial() {
    let conn;
    try {
        conn = await pool.getConnection();

        const orderCode = 'TFQ-20260112-2095';

        // Check if testimonial exists
        const testimonials = await conn.query("SELECT * FROM Testimonial WHERE orderCode = ?", [orderCode]);

        if (testimonials.length > 0) {
            // Approve testimonial
            await conn.query("UPDATE Testimonial SET isApproved = 1 WHERE orderCode = ?", [orderCode]);
            console.log('✅ Testimoni disetujui!');
            console.log('Nama:', testimonials[0].name);
            console.log('Isi:', testimonials[0].content);
            console.log('Rating:', testimonials[0].rating);
        } else {
            console.log('❌ Testimoni belum ada untuk kode ini.');
            console.log('Silakan submit testimoni terlebih dahulu di frontend.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

approveTestimonial();
