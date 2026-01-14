const pool = require('./src/config/database');

async function deleteTestimonial() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Delete testimonial
        const result = await conn.query("DELETE FROM Testimonial WHERE orderCode = 'ORD-FBL95O'");
        console.log('Testimonial for ORD-FBL95O deleted!');
        console.log('Affected rows:', result.affectedRows);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

deleteTestimonial();
