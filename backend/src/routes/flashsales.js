const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get active flash sales (public)
router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const flashSales = await conn.query(`
      SELECT fs.*, p.name as productName, p.image as productImage, p.slug as productSlug,
             v.name as variantName, v.price as variantPrice,
             COALESCE(v.price, (SELECT MIN(v2.price) FROM Variant v2 WHERE v2.productId = fs.productId AND v2.isActive = 1)) as originalPrice
      FROM FlashSale fs
      LEFT JOIN Product p ON fs.productId = p.id
      LEFT JOIN Variant v ON fs.variantId = v.id
      WHERE fs.isActive = 1 AND fs.startDate <= ? AND fs.endDate >= ?
      ORDER BY fs.endDate ASC
    `, [now, now]);

        flashSales.forEach(fs => {
            if (fs.originalPrice) {
                fs.discountedPrice = Math.round(fs.originalPrice * (1 - fs.discountPercent / 100));
            }
        });

        res.json(flashSales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Admin: Get all flash sales
router.get('/admin', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const flashSales = await conn.query(`
      SELECT fs.*, p.name as productName, v.name as variantName
      FROM FlashSale fs
      LEFT JOIN Product p ON fs.productId = p.id
      LEFT JOIN Variant v ON fs.variantId = v.id
      ORDER BY fs.createdAt DESC
    `);
        res.json(flashSales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Create flash sale
router.post('/', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { title, description, productId, variantId, discountPercent, startDate, endDate, isActive } = req.body;

        const result = await conn.query(
            `INSERT INTO FlashSale (title, description, productId, variantId, discountPercent, startDate, endDate, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [title, description || null, productId, variantId || null, discountPercent, startDate, endDate, isActive !== false ? 1 : 0]
        );

        res.json({ success: true, id: Number(result.insertId) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Update flash sale
router.put('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const { title, description, productId, variantId, discountPercent, startDate, endDate, isActive } = req.body;

        await conn.query(
            `UPDATE FlashSale SET title = ?, description = ?, productId = ?, variantId = ?, discountPercent = ?, 
       startDate = ?, endDate = ?, isActive = ? WHERE id = ?`,
            [title, description || null, productId, variantId || null, discountPercent, startDate, endDate, isActive ? 1 : 0, id]
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Delete flash sale
router.delete('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        await conn.query('DELETE FROM FlashSale WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
