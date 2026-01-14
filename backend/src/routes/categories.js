const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get categories (public)
router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const categories = await conn.query('SELECT * FROM Category ORDER BY name');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Admin: Get all categories
router.get('/admin', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const categories = await conn.query('SELECT * FROM Category ORDER BY name');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Create category
router.post('/', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { name, slug } = req.body;
        const result = await conn.query('INSERT INTO Category (name, slug) VALUES (?, ?)', [name, slug]);
        res.json({ success: true, id: Number(result.insertId) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Update category
router.put('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const { name, slug } = req.body;
        await conn.query('UPDATE Category SET name = ?, slug = ? WHERE id = ?', [name, slug, id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Delete category
router.delete('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const products = await conn.query('SELECT COUNT(*) as count FROM Product WHERE categoryId = ?', [id]);
        if (products[0].count > 0) {
            return res.status(400).json({ error: 'Kategori masih memiliki produk. Hapus atau pindahkan produk terlebih dahulu.' });
        }
        await conn.query('DELETE FROM Category WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
