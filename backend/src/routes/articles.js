const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get published articles (public)
router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const articles = await conn.query(
            'SELECT id, title, slug, content, image, isPublished, createdAt FROM Article WHERE isPublished = 1 ORDER BY createdAt DESC'
        );
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Get single article by slug (public)
router.get('/:slug', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { slug } = req.params;
        const articles = await conn.query('SELECT * FROM Article WHERE slug = ? AND isPublished = 1', [slug]);

        if (articles.length === 0) {
            return res.status(404).json({ error: 'Artikel tidak ditemukan' });
        }

        res.json(articles[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Admin: Get all articles
router.get('/admin/all', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const articles = await conn.query('SELECT * FROM Article ORDER BY createdAt DESC');
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Create article
router.post('/', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { title, slug, content, image, isPublished } = req.body;

        const result = await conn.query(
            `INSERT INTO Article (title, slug, content, image, isPublished, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [title, slug, content, image || null, isPublished ? 1 : 0]
        );

        res.json({ success: true, id: Number(result.insertId) });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Slug artikel sudah digunakan' });
        }
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Update article
router.put('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const { title, slug, content, image, isPublished } = req.body;

        await conn.query(
            `UPDATE Article SET title = ?, slug = ?, content = ?, image = ?, isPublished = ?, updatedAt = NOW() WHERE id = ?`,
            [title, slug, content, image || null, isPublished ? 1 : 0, id]
        );

        res.json({ success: true });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Slug artikel sudah digunakan' });
        }
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Delete article
router.delete('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        await conn.query('DELETE FROM Article WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
