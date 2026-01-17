const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const { authMiddleware } = require('../../middleware/auth');

// Get all orders (admin)
router.get('/', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const orders = await conn.query(`
            SELECT * FROM \`Order\`
            ORDER BY createdAt DESC
        `);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Get order analytics (admin)
router.get('/analytics/summary', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();

        // Total revenue (only completed orders)
        const revenueResult = await conn.query(`
            SELECT COALESCE(SUM(totalPrice), 0) as totalRevenue 
            FROM \`Order\` 
            WHERE status = 'completed'
        `);

        // Today's revenue
        const todayRevenueResult = await conn.query(`
            SELECT COALESCE(SUM(totalPrice), 0) as todayRevenue 
            FROM \`Order\` 
            WHERE status = 'completed' 
            AND DATE(createdAt) = CURDATE()
        `);

        // This week revenue
        const weekRevenueResult = await conn.query(`
            SELECT COALESCE(SUM(totalPrice), 0) as weekRevenue 
            FROM \`Order\` 
            WHERE status = 'completed' 
            AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `);

        // This month revenue
        const monthRevenueResult = await conn.query(`
            SELECT COALESCE(SUM(totalPrice), 0) as monthRevenue 
            FROM \`Order\` 
            WHERE status = 'completed' 
            AND MONTH(createdAt) = MONTH(CURDATE()) 
            AND YEAR(createdAt) = YEAR(CURDATE())
        `);

        // Order counts by status
        const statusCounts = await conn.query(`
            SELECT status, COUNT(*) as count 
            FROM \`Order\` 
            GROUP BY status
        `);

        // Total orders
        const totalOrdersResult = await conn.query(`SELECT COUNT(*) as total FROM \`Order\``);

        // Top selling products
        const topProducts = await conn.query(`
            SELECT productName, SUM(quantity) as totalQty, SUM(price * quantity) as totalSales
            FROM \`Order\`
            WHERE status = 'completed'
            GROUP BY productName
            ORDER BY totalSales DESC
            LIMIT 5
        `);

        // Orders by payment method
        const paymentStats = await conn.query(`
            SELECT paymentMethod, COUNT(*) as count, SUM(totalPrice) as total
            FROM \`Order\`
            WHERE status = 'completed'
            GROUP BY paymentMethod
            ORDER BY total DESC
        `);

        res.json({
            totalRevenue: Number(revenueResult[0]?.totalRevenue || 0),
            todayRevenue: Number(todayRevenueResult[0]?.todayRevenue || 0),
            weekRevenue: Number(weekRevenueResult[0]?.weekRevenue || 0),
            monthRevenue: Number(monthRevenueResult[0]?.monthRevenue || 0),
            totalOrders: Number(totalOrdersResult[0]?.total || 0),
            statusCounts: statusCounts.reduce((acc, s) => { acc[s.status] = Number(s.count); return acc; }, {}),
            topProducts: topProducts.map(p => ({ name: p.productName, qty: Number(p.totalQty), sales: Number(p.totalSales) })),
            paymentStats: paymentStats.map(p => ({ method: p.paymentMethod, count: Number(p.count), total: Number(p.total) }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Get order by ID (admin)
router.get('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const orders = await conn.query('SELECT * FROM `Order` WHERE id = ?', [id]);

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order tidak ditemukan' });
        }

        res.json(orders[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Update order status (admin)
router.put('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Status tidak valid' });
        }

        await conn.query('UPDATE `Order` SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Delete order (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { id } = req.params;
        await conn.query('DELETE FROM `Order` WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
