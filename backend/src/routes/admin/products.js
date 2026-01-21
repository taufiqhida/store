const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const { authMiddleware } = require('../../middleware/auth');

// Get all products (admin)
router.get('/', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const products = await conn.query(`
      SELECT p.*, c.name as categoryName
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      ORDER BY p.createdAt DESC
    `);

        // Optimized: Fetch all variants in single query (fix N+1)
        if (products.length > 0) {
            const productIds = products.map(p => p.id);
            const allVariants = await conn.query(
                'SELECT * FROM Variant WHERE productId IN (?)',
                [productIds]
            );

            // Map variants to products
            for (const product of products) {
                product.variants = allVariants.filter(v => v.productId === product.id);
                product.category = { name: product.categoryName };
            }
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Create product
router.post('/', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { name, slug, description, image, badge, categoryId, variants, isActive } = req.body;

        const result = await conn.query(
            `INSERT INTO Product (name, slug, description, image, badge, categoryId, isActive, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [name, slug, description, image, badge || null, categoryId, isActive !== false]
        );

        const productId = result.insertId;

        if (variants && variants.length > 0) {
            for (const v of variants) {
                await conn.query(
                    'INSERT INTO Variant (productId, name, price, originalPrice, isWarranty, isActive) VALUES (?, ?, ?, ?, ?, ?)',
                    [productId, v.name, v.price, v.originalPrice, v.isWarranty || false, v.isActive !== false]
                );
            }
        }

        res.json({ success: true, productId: Number(productId) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const { name, slug, description, image, badge, categoryId, variants, isActive } = req.body;

        await conn.query(
            `UPDATE Product SET name = ?, slug = ?, description = ?, image = ?, badge = ?, categoryId = ?, isActive = ? 
       WHERE id = ?`,
            [name, slug, description, image, badge || null, categoryId, isActive !== false, id]
        );

        if (variants) {
            await conn.query('DELETE FROM Variant WHERE productId = ?', [id]);
            for (const v of variants) {
                await conn.query(
                    'INSERT INTO Variant (productId, name, price, originalPrice, isWarranty, isActive) VALUES (?, ?, ?, ?, ?, ?)',
                    [id, v.name, v.price, v.originalPrice, v.isWarranty || false, v.isActive !== false]
                );
            }
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        await conn.query('DELETE FROM Variant WHERE productId = ?', [id]);
        await conn.query('DELETE FROM Product WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
