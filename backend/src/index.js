const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'taufiq-store-secret-key-2024';

// Create database connection pool
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'taufiq_store_1',
  connectionLimit: 10
});

// Multer storage config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== PUBLIC ROUTES ====================

// Get all categories
app.get('/api/categories', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const categories = await conn.query('SELECT * FROM Category WHERE isActive = 1 ORDER BY name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Get all products with optional filters
app.get('/api/products', async (req, res) => {
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

    // Get variants for each product
    for (let product of products) {
      const variants = await conn.query(
        'SELECT * FROM Variant WHERE productId = ?',
        [product.id]
      );
      // Convert isActive from 0/1 to boolean
      product.variants = variants.map(v => ({
        ...v,
        isActive: v.isActive === 1 || v.isActive === true,
        isWarranty: v.isWarranty === 1 || v.isWarranty === true
      }));
      product.category = { name: product.categoryName, slug: product.categorySlug };
      product.isActive = product.isActive === 1 || product.isActive === true;
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Get single product with variants
app.get('/api/products/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params;

    const products = await conn.query(
      `SELECT p.*, c.name as categoryName, c.slug as categorySlug 
       FROM Product p 
       LEFT JOIN Category c ON p.categoryId = c.id 
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    const variants = await conn.query(
      'SELECT * FROM Variant WHERE productId = ?',
      [id]
    );

    product.variants = variants;
    product.category = { name: product.categoryName, slug: product.categorySlug };

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Get all payment methods
app.get('/api/payment-methods', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const methods = await conn.query(
      'SELECT * FROM PaymentMethod WHERE isActive = 1 ORDER BY name'
    );
    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Get store settings
app.get('/api/settings', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const settings = await conn.query('SELECT * FROM StoreSettings');
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Create order and get WhatsApp checkout URL
app.post('/api/orders', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { productName, variantName, quantity, price, paymentMethod, paymentFee, paymentAccountInfo, discountCode, discountAmount, buyerMessage } = req.body;

    // Generate unique code (1-100)
    const uniqueCode = Math.floor(Math.random() * 100) + 1;
    const subtotal = price * quantity;
    const fee = paymentFee || 0;
    const discount = discountAmount || 0;
    const totalPrice = subtotal + fee - discount + uniqueCode;

    // Generate order code: TFQ-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `TFQ-${dateStr}-${randomCode}`;

    // Create order with orderCode
    await conn.query(
      `INSERT INTO \`Order\` (orderCode, productName, variantName, quantity, price, uniqueCode, totalPrice, paymentMethod, status, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [orderCode, productName, variantName, quantity, price, uniqueCode, totalPrice, paymentMethod]
    );

    // Get WhatsApp settings
    const settings = await conn.query('SELECT * FROM StoreSettings');
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    const waNumber = settingsObj.whatsapp_number || '6281234567890';

    // Build WhatsApp message with breakdown
    let waMessage = `Halo ${settingsObj.store_name || 'Taufiq Store'}! 👋\n\n`;
    waMessage += `🔖 *Kode Pemesanan: ${orderCode}*\n\n`;
    waMessage += `Saya ingin memesan:\n`;
    waMessage += `📦 Produk: ${productName}\n`;
    waMessage += `🎯 Varian: ${variantName}\n`;
    waMessage += `🔢 Jumlah: ${quantity}\n`;
    waMessage += `💰 Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n`;

    if (fee > 0) {
      waMessage += `💳 Fee ${paymentMethod}: +Rp ${fee.toLocaleString('id-ID')}\n`;
    }

    if (discount > 0) {
      waMessage += `🏷️ Diskon${discountCode ? ` (${discountCode})` : ''}: -Rp ${discount.toLocaleString('id-ID')}\n`;
    }

    waMessage += `🔑 Kode Unik: +${uniqueCode}\n`;
    waMessage += `\n💵 *Total Bayar: Rp ${totalPrice.toLocaleString('id-ID')}*\n`;
    waMessage += `💳 Pembayaran: ${paymentMethod}\n`;

    // Add payment account info
    if (paymentAccountInfo) {
      waMessage += `📋 Transfer ke:\n${paymentAccountInfo}\n`;
    }

    if (buyerMessage) {
      waMessage += `\n📝 Pesan: ${buyerMessage}\n`;
    }

    waMessage += `\n💡 Simpan kode pemesanan untuk kirim testimoni nanti ya!`;
    waMessage += `\nMohon diproses ya, terima kasih! 🙏`;

    // Create WhatsApp URL
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

    // Increment discount usage count if discount was applied
    if (discountCode && discount > 0) {
      // Increment usage count
      await conn.query(
        'UPDATE Discount SET usageCount = usageCount + 1 WHERE code = ?',
        [discountCode.toUpperCase()]
      );

      // Auto-deactivate if limit reached
      await conn.query(
        'UPDATE Discount SET isActive = 0 WHERE code = ? AND usageLimit IS NOT NULL AND usageCount >= usageLimit',
        [discountCode.toUpperCase()]
      );
    }

    res.json({
      success: true,
      orderCode,
      uniqueCode,
      totalPrice,
      whatsappUrl: waUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// ==================== ADMIN ROUTES ====================

// Admin login
app.post('/api/admin/login', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { username, password } = req.body;

    const admins = await conn.query(
      'SELECT * FROM Admin WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = admins[0];
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, name: admin.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: { id: admin.id, username: admin.username, name: admin.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Get admin profile
app.get('/api/admin/me', authMiddleware, (req, res) => {
  res.json(req.admin);
});

// Update admin credentials (username/password)
app.put('/api/admin/credentials', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { currentPassword, newUsername, newPassword, newName } = req.body;

    // Get current admin
    const admins = await conn.query('SELECT * FROM Admin WHERE id = ?', [req.admin.id]);
    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = admins[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Password saat ini salah' });
    }

    // Check if new username already exists (if changing username)
    if (newUsername && newUsername !== admin.username) {
      const existing = await conn.query('SELECT id FROM Admin WHERE username = ? AND id != ?', [newUsername, admin.id]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Username sudah digunakan' });
      }
    }

    // Build update query
    let updateFields = [];
    let updateValues = [];

    if (newUsername) {
      updateFields.push('username = ?');
      updateValues.push(newUsername);
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (newName) {
      updateFields.push('name = ?');
      updateValues.push(newName);
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

// ==================== ADMIN PRODUCT CRUD ====================

// Create product
app.post('/api/admin/products', authMiddleware, async (req, res) => {
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

    // Create variants
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
app.put('/api/admin/products/:id', authMiddleware, async (req, res) => {
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

    // Delete old variants and create new ones
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
app.delete('/api/admin/products/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params;

    // Delete variants first
    await conn.query('DELETE FROM Variant WHERE productId = ?', [id]);
    await conn.query('DELETE FROM Product WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Update store settings
app.put('/api/admin/settings', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await conn.query(
        'UPDATE StoreSettings SET value = ? WHERE `key` = ?',
        [value, key]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// ==================== ADMIN CATEGORY CRUD ====================

// Get all categories (admin)
app.get('/api/admin/categories', authMiddleware, async (req, res) => {
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

// Create category
app.post('/api/admin/categories', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { name, slug } = req.body;

    const result = await conn.query(
      'INSERT INTO Category (name, slug) VALUES (?, ?)',
      [name, slug]
    );

    res.json({ success: true, id: Number(result.insertId) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Update category
app.put('/api/admin/categories/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params;
    const { name, slug } = req.body;

    await conn.query(
      'UPDATE Category SET name = ?, slug = ? WHERE id = ?',
      [name, slug, id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Delete category
app.delete('/api/admin/categories/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params;

    // Check if category has products
    const products = await conn.query('SELECT COUNT(*) as count FROM Product WHERE categoryId = ?', [id]);
    if (products[0].count > 0) {
      return res.status(400).json({ error: 'Kategori masih memiliki produk. Hapus atau pindahkan produk terlebih dahulu.' });
    }

    await conn.query('DELETE FROM Category WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// ==================== ADMIN PAYMENT METHOD CRUD ====================

// Get all payment methods (admin - including inactive)
app.get('/api/admin/payment-methods', authMiddleware, async (req, res) => {
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
app.post('/api/admin/payment-methods', authMiddleware, async (req, res) => {
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
app.put('/api/admin/payment-methods/:id', authMiddleware, async (req, res) => {
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
app.delete('/api/admin/payment-methods/:id', authMiddleware, async (req, res) => {
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

// ==================== ADMIN DISCOUNT CRUD ====================

// Get all discounts (admin)
app.get('/api/admin/discounts', authMiddleware, async (req, res) => {
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
app.post('/api/admin/discounts', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { code, name, type, value, maxDiscount, minPurchase, applyTo, productIds, usageLimit, expiresAt, isActive } = req.body;

    const result = await conn.query(
      `INSERT INTO Discount (code, name, type, value, maxDiscount, minPurchase, applyTo, productIds, usageLimit, expiresAt, isActive, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        code.toUpperCase(),
        name,
        type || 'fixed',
        value,
        maxDiscount || null,
        minPurchase || null,
        applyTo || 'all',
        productIds ? JSON.stringify(productIds) : null,
        usageLimit || null,
        expiresAt || null,
        isActive !== false ? 1 : 0
      ]
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
app.put('/api/admin/discounts/:id', authMiddleware, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params;
    const { code, name, type, value, maxDiscount, minPurchase, applyTo, productIds, usageLimit, expiresAt, isActive } = req.body;

    await conn.query(
      `UPDATE Discount SET code = ?, name = ?, type = ?, value = ?, maxDiscount = ?, minPurchase = ?, 
       applyTo = ?, productIds = ?, usageLimit = ?, expiresAt = ?, isActive = ? WHERE id = ?`,
      [
        code.toUpperCase(),
        name,
        type,
        value,
        maxDiscount || null,
        minPurchase || null,
        applyTo || 'all',
        productIds ? JSON.stringify(productIds) : null,
        usageLimit || null,
        expiresAt || null,
        isActive ? 1 : 0,
        id
      ]
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
app.delete('/api/admin/discounts/:id', authMiddleware, async (req, res) => {
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

// ==================== PUBLIC DISCOUNT VALIDATION ====================

// Validate discount code
app.post('/api/validate-discount', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { code, productId, subtotal } = req.body;

    const discounts = await conn.query(
      'SELECT * FROM Discount WHERE code = ? AND isActive = 1',
      [code.toUpperCase()]
    );

    if (discounts.length === 0) {
      return res.status(404).json({ error: 'Kode diskon tidak ditemukan' });
    }

    const discount = discounts[0];

    // Check expiry
    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Kode diskon sudah kadaluarsa' });
    }

    // Check usage limit
    if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
      return res.status(400).json({ error: 'Promo ini sudah habis terpakai' });
    }

    // Check minimum purchase
    if (discount.minPurchase && subtotal < discount.minPurchase) {
      return res.status(400).json({
        error: `Minimal pembelian Rp ${discount.minPurchase.toLocaleString('id-ID')}`
      });
    }

    // Check product applicability
    if (discount.applyTo === 'products' && discount.productIds) {
      const allowedProducts = JSON.parse(discount.productIds);
      if (productId && !allowedProducts.includes(productId)) {
        return res.status(400).json({ error: 'Diskon tidak berlaku untuk produk ini' });
      }
    }

    // Calculate discount amount
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
      discount: {
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        discountAmount: discountAmount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// ==================== IMAGE UPLOAD ====================

// Upload image
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

// ==================== FLASH SALE ROUTES ====================

// Get active flash sales (public)
app.get('/api/flash-sales', async (req, res) => {
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

    // Calculate discounted price
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
app.get('/api/admin/flash-sales', authMiddleware, async (req, res) => {
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

// Admin: Create flash sale
app.post('/api/admin/flash-sales', authMiddleware, async (req, res) => {
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

// Admin: Update flash sale
app.put('/api/admin/flash-sales/:id', authMiddleware, async (req, res) => {
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

// Admin: Delete flash sale
app.delete('/api/admin/flash-sales/:id', authMiddleware, async (req, res) => {
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

// ==================== TESTIMONIAL ROUTES ====================

// Get approved testimonials (public)
app.get('/api/testimonials', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const testimonials = await conn.query(
      'SELECT id, name, content, rating, productName, createdAt FROM Testimonial WHERE isApproved = 1 ORDER BY createdAt DESC LIMIT 20'
    );
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Submit testimonial (public) - requires valid order code
app.post('/api/testimonials', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { orderCode, name, content, rating } = req.body;

    // Validate order code exists
    const orders = await conn.query('SELECT productName FROM `Order` WHERE orderCode = ?', [orderCode]);
    if (orders.length === 0) {
      return res.status(400).json({ error: 'Kode pemesanan tidak valid' });
    }

    // Check if testimonial already exists for this order code
    const existing = await conn.query('SELECT id FROM Testimonial WHERE orderCode = ?', [orderCode]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Testimoni untuk pesanan ini sudah ada' });
    }

    const productName = orders[0].productName;

    const result = await conn.query(
      `INSERT INTO Testimonial (orderCode, name, content, rating, productName, isApproved, createdAt)
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [orderCode, name, content, rating || 5, productName]
    );

    res.json({ success: true, message: 'Testimoni berhasil dikirim dan menunggu persetujuan admin' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Admin: Get all testimonials
app.get('/api/admin/testimonials', authMiddleware, async (req, res) => {
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

// Admin: Update/approve testimonial
app.put('/api/admin/testimonials/:id', authMiddleware, async (req, res) => {
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

// Admin: Delete testimonial
app.delete('/api/admin/testimonials/:id', authMiddleware, async (req, res) => {
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

// ==================== ARTICLE ROUTES ====================

// Get published articles (public)
app.get('/api/articles', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const articles = await conn.query(
      'SELECT id, title, slug, content, image, isPublished, createdAt FROM Article WHERE isPublished = 1 ORDER BY createdAt DESC'
    );
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Get single article by slug (public)
app.get('/api/articles/:slug', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { slug } = req.params;
    const articles = await conn.query('SELECT * FROM Article WHERE slug = ? AND isPublished = 1', [slug]);

    if (articles.length === 0) {
      return res.status(404).json({ error: 'Artikel tidak ditemukan' });
    }

    res.json(articles[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.release();
  }
});

// Admin: Get all articles
app.get('/api/admin/articles', authMiddleware, async (req, res) => {
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

// Admin: Create article
app.post('/api/admin/articles', authMiddleware, async (req, res) => {
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

// Admin: Update article
app.put('/api/admin/articles/:id', authMiddleware, async (req, res) => {
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

// Admin: Delete article
app.delete('/api/admin/articles/:id', authMiddleware, async (req, res) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

