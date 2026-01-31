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

        const admins = await conn.query('SELECT * FROM admin_users WHERE username = ?', [username]);
        if (admins.length === 0) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const admin = admins[0];

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({ error: 'Akun tidak aktif. Hubungi administrator.' });
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: '7d' });

        // Parse permissions from JSON string
        const permissions = admin.role === 'SUPER_ADMIN' ? ['*'] : JSON.parse(admin.permissions || '[]');

        res.json({
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                name: admin.name,
                role: admin.role,
                permissions: permissions
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Get current admin info
router.get('/me', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const admins = await conn.query('SELECT id, username, name, email, role, permissions, isActive FROM admin_users WHERE id = ?', [req.adminId]);

        if (admins.length === 0) {
            return res.status(404).json({ error: 'Admin tidak ditemukan' });
        }

        const admin = admins[0];
        const permissions = admin.role === 'SUPER_ADMIN' ? ['*'] : JSON.parse(admin.permissions || '[]');

        res.json({
            id: admin.id,
            username: admin.username,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: permissions,
            isActive: admin.isActive
        });
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

        const admins = await conn.query('SELECT * FROM admin_users WHERE id = ?', [req.adminId]);
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
            const existing = await conn.query('SELECT id FROM admin_users WHERE username = ? AND id != ?', [newUsername, admin.id]);
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
            updateFields.push('updatedAt = NOW()');
            updateValues.push(admin.id);
            await conn.query(`UPDATE admin_users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
        }

        res.json({ success: true, message: 'Kredensial berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// ==================== ADMIN USER MANAGEMENT ====================

// Get all admin users
router.get('/users', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { includeDeleted } = req.query;

        let query = 'SELECT id, username, name, email, role, permissions, isActive, deletedAt, createdAt, updatedAt FROM admin_users';
        if (!includeDeleted) {
            query += ' WHERE isActive = 1';
        }
        query += ' ORDER BY createdAt DESC';

        const users = await conn.query(query);

        // Parse permissions for each user
        const usersWithParsedPermissions = users.map(user => ({
            ...user,
            permissions: user.role === 'SUPER_ADMIN' ? ['*'] : JSON.parse(user.permissions || '[]')
        }));

        res.json(usersWithParsedPermissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Create admin user
router.post('/users', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { username, password, name, email, role, permissions } = req.body;

        // Validate required fields
        if (!username || !password || !name) {
            return res.status(400).json({ error: 'Username, password, dan nama harus diisi' });
        }

        // Check if username already exists
        const existing = await conn.query('SELECT id FROM admin_users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username sudah digunakan' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare permissions
        const permissionsJson = role === 'SUPER_ADMIN' ? '["*"]' : JSON.stringify(permissions || []);

        // Insert new admin
        const result = await conn.query(
            `INSERT INTO admin_users (username, password, name, email, role, permissions, isActive, createdAt, updatedAt) 
             VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
            [username, hashedPassword, name, email || null, role || 'ADMIN', permissionsJson]
        );

        res.json({ success: true, id: Number(result.insertId) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Update admin user
router.put('/users/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const { username, password, name, email, role, permissions, isActive } = req.body;

        // Get current admin
        const admins = await conn.query('SELECT * FROM admin_users WHERE id = ?', [id]);
        if (admins.length === 0) {
            return res.status(404).json({ error: 'Admin tidak ditemukan' });
        }

        const updateFields = [];
        const updateValues = [];

        if (username) {
            // Check if username is taken by another admin
            const existing = await conn.query('SELECT id FROM admin_users WHERE username = ? AND id != ?', [username, id]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Username sudah digunakan' });
            }
            updateFields.push('username = ?');
            updateValues.push(username);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }

        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email || null);
        }

        if (role) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }

        if (permissions !== undefined) {
            const permissionsJson = role === 'SUPER_ADMIN' ? '["*"]' : JSON.stringify(permissions);
            updateFields.push('permissions = ?');
            updateValues.push(permissionsJson);
        }

        if (isActive !== undefined) {
            updateFields.push('isActive = ?');
            updateValues.push(isActive ? 1 : 0);
        }

        if (updateFields.length > 0) {
            updateFields.push('updatedAt = NOW()');
            updateValues.push(id);
            await conn.query(`UPDATE admin_users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Soft delete admin user
router.delete('/users/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;

        // Check if admin exists
        const admins = await conn.query('SELECT * FROM admin_users WHERE id = ?', [id]);
        if (admins.length === 0) {
            return res.status(404).json({ error: 'Admin tidak ditemukan' });
        }

        const admin = admins[0];

        // Prevent deleting super admin
        if (admin.role === 'SUPER_ADMIN') {
            // Count how many active super admins exist
            const superAdmins = await conn.query('SELECT COUNT(*) as count FROM admin_users WHERE role = ? AND isActive = 1', ['SUPER_ADMIN']);
            if (superAdmins[0].count <= 1) {
                return res.status(400).json({ error: 'Tidak dapat menghapus super admin terakhir' });
            }
        }

        // Soft delete: set isActive to false and set deletedAt
        await conn.query('UPDATE admin_users SET isActive = 0, deletedAt = NOW(), updatedAt = NOW() WHERE id = ?', [id]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Restore admin user
router.post('/users/:id/restore', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;

        // Restore: set isActive to true and clear deletedAt
        await conn.query('UPDATE admin_users SET isActive = 1, deletedAt = NULL, updatedAt = NOW() WHERE id = ?', [id]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
