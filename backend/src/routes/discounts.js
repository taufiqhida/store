const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Validate discount code (public)
router.post('/validate', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { code, productId, subtotal } = req.body;

        const discounts = await conn.query('SELECT * FROM Discount WHERE code = ? AND isActive = 1', [code.toUpperCase()]);
        if (discounts.length === 0) {
            return res.status(404).json({ error: 'Kode diskon tidak ditemukan' });
        }

        const discount = discounts[0];

        if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
            return res.status(400).json({ error: 'Kode diskon sudah kadaluarsa' });
        }

        if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
            return res.status(400).json({ error: 'Promo ini sudah habis terpakai' });
        }

        if (discount.minPurchase && subtotal < discount.minPurchase) {
            return res.status(400).json({ error: `Minimal pembelian Rp ${discount.minPurchase.toLocaleString('id-ID')}` });
        }

        if (discount.applyTo === 'products' && discount.productIds) {
            const allowedProducts = JSON.parse(discount.productIds);
            if (productId && !allowedProducts.includes(productId)) {
                return res.status(400).json({ error: 'Diskon tidak berlaku untuk produk ini' });
            }
        }

        let discountAmount = 0;
        if (discount.type === 'percent') {
            discountAmount = (subtotal * discount.value) / 100;
            if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
                discountAmount = discount.maxDiscount;
            }
        } else {
            discountAmount = discount.value;
        }

        res.json({
            success: true,
            discount: { code: discount.code, name: discount.name, type: discount.type, value: discount.value, discountAmount }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Admin: Get all discounts
router.get('/admin', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const discounts = await conn.query('SELECT * FROM Discount ORDER BY createdAt DESC');
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Create discount
router.post('/', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { code, name, type, value, maxDiscount, minPurchase, applyTo, productIds, usageLimit, expiresAt, isActive } = req.body;

        const result = await conn.query(
            `INSERT INTO Discount (code, name, type, value, maxDiscount, minPurchase, applyTo, productIds, usageLimit, expiresAt, isActive, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [code.toUpperCase(), name, type || 'fixed', value, maxDiscount || null, minPurchase || null, applyTo || 'all', productIds ? JSON.stringify(productIds) : null, usageLimit || null, expiresAt || null, isActive !== false ? 1 : 0]
        );

        res.json({ success: true, id: Number(result.insertId) });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Kode diskon sudah digunakan' });
        }
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Update discount
router.put('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const { code, name, type, value, maxDiscount, minPurchase, applyTo, productIds, usageLimit, expiresAt, isActive } = req.body;

        await conn.query(
            `UPDATE Discount SET code = ?, name = ?, type = ?, value = ?, maxDiscount = ?, minPurchase = ?, 
       applyTo = ?, productIds = ?, usageLimit = ?, expiresAt = ?, isActive = ? WHERE id = ?`,
            [code.toUpperCase(), name, type, value, maxDiscount || null, minPurchase || null, applyTo || 'all', productIds ? JSON.stringify(productIds) : null, usageLimit || null, expiresAt || null, isActive ? 1 : 0, id]
        );

        res.json({ success: true });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Kode diskon sudah digunakan' });
        }
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Delete discount
router.delete('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        await conn.query('DELETE FROM Discount WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
