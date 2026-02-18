require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// =====================================================
// 🛡️ PROCESS ERROR HANDLERS - Prevent Backend Crashes
// =====================================================

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Server tetap berjalan...');
  console.error('Error:', error.name, error.message);
  console.error('Stack:', error.stack);
  // Don't exit the process - keep server running
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION! Server tetap berjalan...');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  // Don't exit the process - keep server running
});

// Catch warnings
process.on('warning', (warning) => {
  console.warn('⚠️ Warning:', warning.name, warning.message);
});


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
const adminOrderRoutes = require('./routes/admin/orders');

// Import middleware & config
const { authMiddleware } = require('./middleware/auth');
const upload = require('./config/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ SECURITY: Add security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for development
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow external resources
}));

// ✅ SECURITY: Configure CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now, tighten later
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ SECURITY: Rate Limiting Configuration
// Global rate limiter for all API requests
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs per IP
  message: { error: 'Terlalu banyak request. Coba lagi dalam 15 menit.' },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Strict limiter for login attempts (prevent brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per 15 minutes
  message: { error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Order creation limiter (prevent spam orders)
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 orders per hour per IP
  message: { error: 'Terlalu banyak pesanan. Coba lagi dalam 1 jam.' },
});

// Apply global rate limiter to all API routes
app.use('/api/', globalLimiter);

// ✅ Memory monitoring (production only)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);

    if (heapUsedMB > 400) {
      console.warn(`⚠️ High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`);
    }
  }, 60000); // Check every minute
}

// ✅ Concurrent request limiter per IP (prevent request flooding)
const activeConcurrentRequests = new Map();
const MAX_CONCURRENT_PER_IP = 10;

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const count = activeConcurrentRequests.get(ip) || 0;

  if (count >= MAX_CONCURRENT_PER_IP) {
    return res.status(429).json({
      error: 'Terlalu banyak request bersamaan. Tunggu sebentar.'
    });
  }

  activeConcurrentRequests.set(ip, count + 1);

  res.on('finish', () => {
    const current = activeConcurrentRequests.get(ip) || 0;
    if (current <= 1) {
      activeConcurrentRequests.delete(ip);
    } else {
      activeConcurrentRequests.set(ip, current - 1);
    }
  });

  next();
});

// ✅ Request timeout middleware (prevent hanging requests)
app.use((req, res, next) => {
  // Set timeout to 30 seconds
  req.setTimeout(30000, () => {
    console.error('⏱️ Request timeout:', req.method, req.path);
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout. Silakan coba lagi.' });
    }
  });
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== PUBLIC ROUTES ====================
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment-methods', paymentRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/flash-sales', flashSaleRoutes);
app.use('/api/testimonials', testimonialRoutes); // Rate limit applied only to POST in route file
app.use('/api/articles', articleRoutes);
app.use('/api/orders', orderLimiter, orderRoutes); // ✅ Rate limited
app.use('/api/settings', settingsRoutes);

// ==================== AUTH ROUTES ====================
// Apply stricter rate limit to login endpoint
app.use('/api/admin/login', loginLimiter);
app.use('/api/admin', authRoutes);

// ==================== ADMIN ROUTES ====================
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/orders', adminOrderRoutes);

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
app.post('/api/admin/payment-methods', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
  let conn;
  try {
    conn = await pool.getConnection();
    const { name, icon, iconType, accountInfo, feeType, fees, currency, qrisImage, isActive } = req.body;
    const result = await conn.query(
      'INSERT INTO PaymentMethod (name, icon, iconType, accountInfo, feeType, fees, currency, qrisImage, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, icon || '💳', iconType || 'emoji', accountInfo || null, feeType || 'fixed', fees || 0, currency || 'IDR', qrisImage || null, isActive !== false ? 1 : 0]
    );
    res.json({ success: true, id: Number(result.insertId) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});
app.put('/api/admin/payment-methods/:id', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params;
    const { name, icon, iconType, accountInfo, feeType, fees, currency, qrisImage, isActive } = req.body;
    await conn.query(
      'UPDATE PaymentMethod SET name = ?, icon = ?, iconType = ?, accountInfo = ?, feeType = ?, fees = ?, currency = ?, qrisImage = ?, isActive = ? WHERE id = ?',
      [name, icon, iconType || 'emoji', accountInfo, feeType, fees || 0, currency, qrisImage || null, isActive ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});
app.delete('/api/admin/payment-methods/:id', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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
app.post('/api/admin/discounts', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
  let conn;
  try {
    conn = await pool.getConnection();
    const { code, name, type, value, maxDiscount, minPurchase, applyTo, productIds, usageLimit, expiresAt, isActive } = req.body;

    // ✅ VALIDATION: Required fields
    if (!code || !name) {
      return res.status(400).json({ error: 'Kode dan nama diskon wajib diisi' });
    }

    // ✅ VALIDATION: Value cannot be negative
    if (value < 0) {
      return res.status(400).json({ error: 'Nilai diskon tidak boleh negatif' });
    }

    // ✅ VALIDATION: Percentage discount cannot exceed 100%
    if (type === 'percentage' && value > 100) {
      return res.status(400).json({ error: 'Diskon persentase tidak boleh lebih dari 100%' });
    }

    // ✅ VALIDATION: maxDiscount cannot be negative
    if (maxDiscount && maxDiscount < 0) {
      return res.status(400).json({ error: 'Maksimal diskon tidak boleh negatif' });
    }

    // ✅ VALIDATION: minPurchase cannot be negative
    if (minPurchase && minPurchase < 0) {
      return res.status(400).json({ error: 'Minimal pembelian tidak boleh negatif' });
    }

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

app.put('/api/admin/discounts/:id', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params;
    const { code, name, type, value, maxDiscount, minPurchase, applyTo, productIds, usageLimit, expiresAt, isActive } = req.body;

    // ✅ VALIDATION: Required fields
    if (!code || !name) {
      return res.status(400).json({ error: 'Kode dan nama diskon wajib diisi' });
    }

    // ✅ VALIDATION: Value cannot be negative
    if (value < 0) {
      return res.status(400).json({ error: 'Nilai diskon tidak boleh negatif' });
    }

    // ✅ VALIDATION: Percentage discount cannot exceed 100%
    if (type === 'percentage' && value > 100) {
      return res.status(400).json({ error: 'Diskon persentase tidak boleh lebih dari 100%' });
    }

    // ✅ VALIDATION: maxDiscount cannot be negative
    if (maxDiscount && maxDiscount < 0) {
      return res.status(400).json({ error: 'Maksimal diskon tidak boleh negatif' });
    }

    // ✅ VALIDATION: minPurchase cannot be negative
    if (minPurchase && minPurchase < 0) {
      return res.status(400).json({ error: 'Minimal pembelian tidak boleh negatif' });
    }

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

app.delete('/api/admin/discounts/:id', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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
app.post('/api/admin/flash-sales', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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
app.put('/api/admin/flash-sales/:id', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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
app.delete('/api/admin/flash-sales/:id', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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

app.put('/api/admin/testimonials/:id', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params;
    const { isApproved } = req.body;
    await conn.query('UPDATE Testimonial SET isApproved = ? WHERE id = ?', [isApproved ? 1 : 0, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

app.delete('/api/admin/testimonials/:id', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params;
    await conn.query('DELETE FROM Testimonial WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

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
app.post('/api/admin/articles', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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
app.put('/api/admin/articles/:id', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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
app.delete('/api/admin/articles/:id', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
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

// Admin settings
app.put('/api/admin/settings', authMiddleware, async (req, res) => {
  const pool = require('./config/database');
  let conn;
  try {
    conn = await pool.getConnection();
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      // Check if setting exists, if not insert it
      const existing = await conn.query('SELECT id FROM StoreSettings WHERE `key` = ?', [key]);
      if (existing.length > 0) {
        await conn.query('UPDATE StoreSettings SET value = ? WHERE `key` = ?', [value, key]);
      } else {
        await conn.query('INSERT INTO StoreSettings (`key`, value) VALUES (?, ?)', [key, value]);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Admin credentials - handled by authRoutes (/api/admin/credentials) mounted above

// Image upload
app.post('/api/admin/upload', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Use BASE_URL from env, or build from request headers for hosting
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// 🛡️ GLOBAL ERROR HANDLER - Catch all errors
// =====================================================

// 404 handler - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route tidak ditemukan',
    path: req.path
  });
});

// Global error handler - Catch all errors
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:');
  console.error('Error:', err.name, err.message);
  console.error('Stack:', err.stack);
  console.error('Path:', req.method, req.path);
  console.error('Body:', req.body);

  // Don't expose internal errors to client in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Handle specific error types
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token tidak valid' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token sudah kadaluarsa' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Format JSON tidak valid' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Ukuran file terlalu besar' });
  }

  // Database errors
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(500).json({
      error: 'Database error',
      message: isDevelopment ? err.message : 'Terjadi kesalahan pada database'
    });
  }

  // Generic error response
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Terjadi kesalahan pada server',
    ...(isDevelopment && { stack: err.stack })
  });
});

// =====================================================
// 🚀 START SERVER
// =====================================================

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🛡️ Error handling: ACTIVE`);
  console.log(`⏱️ Request timeout: 30 seconds`);
  console.log(`🔒 Rate limiting: ACTIVE`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} sudah digunakan. Gunakan port lain.`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️ SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
