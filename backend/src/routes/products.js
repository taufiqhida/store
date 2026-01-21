const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all products (public)
router.get('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { category, search } = req.query;

        let query = `
      SELECT p.*, c.name as categoryName, c.slug as categorySlug
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE 1=1
    `;
        const params = [];

        if (category && category !== 'all') {
            query += ' AND c.slug = ?';
            params.push(category);
        }
        if (search) {
            query += ' AND p.name LIKE ?';
            params.push(`%${search}%`);
        }
        query += ' ORDER BY p.createdAt DESC';

        const products = await conn.query(query, params);

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
                product.category = { name: product.categoryName, slug: product.categorySlug };
            }
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Get single product by slug (public)
router.get('/:slug', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { slug } = req.params;
        const products = await conn.query(`
      SELECT p.*, c.name as categoryName
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE p.slug = ?
    `, [slug]);

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = products[0];
        const variants = await conn.query('SELECT * FROM Variant WHERE productId = ?', [product.id]);
        product.variants = variants;
        product.category = { name: product.categoryName };

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
