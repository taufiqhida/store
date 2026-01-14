const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get approved testimonials (public)
router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const testimonials = await conn.query(
            'SELECT id, name, content, rating, productName, createdAt FROM Testimonial WHERE isApproved = 1 ORDER BY createdAt DESC LIMIT 20'
        );
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Submit testimonial (public)
router.post('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { orderCode, name, content, rating } = req.body;

        const orders = await conn.query('SELECT productName FROM `Order` WHERE orderCode = ?', [orderCode]);
        if (orders.length === 0) {
            return res.status(400).json({ error: 'Kode pemesanan tidak valid' });
        }

        const existing = await conn.query('SELECT id FROM Testimonial WHERE orderCode = ?', [orderCode]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Testimoni untuk pesanan ini sudah ada' });
        }

        const productName = orders[0].productName;
        await conn.query(
            `INSERT INTO Testimonial (orderCode, name, content, rating, productName, isApproved, createdAt)
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
            [orderCode, name, content, rating || 5, productName]
        );

        res.json({ success: true, message: 'Testimoni berhasil dikirim dan menunggu persetujuan admin' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Admin: Get all testimonials
router.get('/admin', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const testimonials = await conn.query('SELECT * FROM Testimonial ORDER BY createdAt DESC');
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Admin: Update testimonial
router.put('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const { isApproved } = req.body;
        await conn.query('UPDATE Testimonial SET isApproved = ? WHERE id = ?', [isApproved ? 1 : 0, id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Admin: Delete testimonial
router.delete('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        await conn.query('DELETE FROM Testimonial WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
