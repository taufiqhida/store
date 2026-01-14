const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const paymentRoutes = require('./routes/payments');
const discountRoutes = require('./routes/discounts');
const flashSaleRoutes = require('./routes/flashsales');
const testimonialRoutes = require('./routes/testimonials');
const articleRoutes = require('./routes/articles');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const adminProductRoutes = require('./routes/admin/products');

// Import middleware & config
const { authMiddleware } = require('./middleware/auth');
const upload = require('./config/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== PUBLIC ROUTES ====================
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment-methods', paymentRoutes);
app.use('/api/validate-discount', discountRoutes);
app.use('/api/flash-sales', flashSaleRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);

// ==================== AUTH ROUTES ====================
app.use('/api/admin', authRoutes);

// ==================== ADMIN ROUTES ====================
app.use('/api/admin/products', adminProductRoutes);

// Admin categories
app.get('/api/admin/categories', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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

// Admin payment methods
app.get('/api/admin/payment-methods', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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
app.post('/api/admin/payment-methods', authMiddleware, require('./routes/payments'));
app.put('/api/admin/payment-methods/:id', authMiddleware, require('./routes/payments'));
app.delete('/api/admin/payment-methods/:id', authMiddleware, require('./routes/payments'));

// Admin discounts
app.get('/api/admin/discounts', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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
app.post('/api/admin/discounts', authMiddleware, require('./routes/discounts'));
app.put('/api/admin/discounts/:id', authMiddleware, require('./routes/discounts'));
app.delete('/api/admin/discounts/:id', authMiddleware, require('./routes/discounts'));

// Admin flash sales
app.get('/api/admin/flash-sales', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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
app.post('/api/admin/flash-sales', authMiddleware, require('./routes/flashsales'));
app.put('/api/admin/flash-sales/:id', authMiddleware, require('./routes/flashsales'));
app.delete('/api/admin/flash-sales/:id', authMiddleware, require('./routes/flashsales'));

// Admin testimonials
app.get('/api/admin/testimonials', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
  let conn;
  try {
    conn = await pool.getConnection();
    const testimonials = await conn.query('SELECT * FROM Testimonial ORDER BY createdAt DESC');
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});
app.put('/api/admin/testimonials/:id', authMiddleware, require('./routes/testimonials'));
app.delete('/api/admin/testimonials/:id', authMiddleware, require('./routes/testimonials'));

// Admin articles
app.get('/api/admin/articles', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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
app.post('/api/admin/articles', authMiddleware, require('./routes/articles'));
app.put('/api/admin/articles/:id', authMiddleware, require('./routes/articles'));
app.delete('/api/admin/articles/:id', authMiddleware, require('./routes/articles'));

// Admin settings
app.put('/api/admin/settings', authMiddleware, require('./routes/settings'));

// Admin credentials
app.put('/api/admin/credentials', authMiddleware, require('./routes/auth'));

// Image upload
app.post('/api/admin/upload', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
