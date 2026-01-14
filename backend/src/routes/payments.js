const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get payment methods (public - active only)
router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const methods = await conn.query('SELECT * FROM PaymentMethod WHERE isActive = 1 ORDER BY name');
        res.json(methods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Admin: Get all payment methods
router.get('/admin', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const methods = await conn.query('SELECT * FROM PaymentMethod ORDER BY name');
        res.json(methods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Create payment method
router.post('/', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { name, icon, accountInfo, feeType, fees, currency, isActive } = req.body;
        const result = await conn.query(
            'INSERT INTO PaymentMethod (name, icon, accountInfo, feeType, fees, currency, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, icon || '💳', accountInfo || null, feeType || 'fixed', fees || 0, currency || 'IDR', isActive !== false ? 1 : 0]
        );
        res.json({ success: true, id: Number(result.insertId) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Update payment method
router.put('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const { name, icon, accountInfo, feeType, fees, currency, isActive } = req.body;
        await conn.query(
            'UPDATE PaymentMethod SET name = ?, icon = ?, accountInfo = ?, feeType = ?, fees = ?, currency = ?, isActive = ? WHERE id = ?',
            [name, icon, accountInfo, feeType, fees || 0, currency, isActive ? 1 : 0, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Delete payment method
router.delete('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        await conn.query('DELETE FROM PaymentMethod WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
