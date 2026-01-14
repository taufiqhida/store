const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { username, password } = req.body;

        const admins = await conn.query('SELECT * FROM Admin WHERE username = ?', [username]);
        if (admins.length === 0) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const admin = admins[0];
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, admin: { id: admin.id, username: admin.username, name: admin.name } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Update credentials
router.put('/credentials', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { currentPassword, newUsername, newPassword } = req.body;

        const admins = await conn.query('SELECT * FROM Admin WHERE id = ?', [req.adminId]);
        if (admins.length === 0) {
            return res.status(404).json({ error: 'Admin tidak ditemukan' });
        }

        const admin = admins[0];
        const validPassword = await bcrypt.compare(currentPassword, admin.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Password saat ini salah' });
        }

        const updateFields = [];
        const updateValues = [];

        if (newUsername && newUsername !== admin.username) {
            const existing = await conn.query('SELECT id FROM Admin WHERE username = ? AND id != ?', [newUsername, admin.id]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Username sudah digunakan' });
            }
            updateFields.push('username = ?');
            updateValues.push(newUsername);
        }

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        if (updateFields.length > 0) {
            updateValues.push(admin.id);
            await conn.query(`UPDATE Admin SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
        }

        res.json({ success: true, message: 'Kredensial berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
