const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Generate unique order code
const generateOrderCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ORD-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Create order
router.post('/', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { productName, variantName, quantity, price, paymentMethod, paymentFee, paymentAccountInfo, discountCode, discountAmount, buyerMessage, phone } = req.body;

        // ✅ VALIDATION: Basic fields
        if (!productName || !variantName || !quantity || !price || !paymentMethod) {
            return res.status(400).json({ error: 'Data pesanan tidak lengkap' });
        }

        // ✅ VALIDATION: Quantity must be positive number
        if (isNaN(quantity) || Number(quantity) <= 0) {
            return res.status(400).json({ error: 'Jumlah pesanan harus angka dan lebih dari 0' });
        }

        // ✅ VALIDATION: Price must be positive number
        if (isNaN(price) || Number(price) < 0) {
            return res.status(400).json({ error: 'Harga produk tidak valid' });
        }

        // ✅ VALIDATION: Discount amount cannot be negative
        if (discountAmount && (isNaN(discountAmount) || Number(discountAmount) < 0)) {
            return res.status(400).json({ error: 'Nilai diskon tidak valid' });
        }

        const uniqueCode = Math.floor(Math.random() * 999) + 1;
        const subtotal = price * quantity;
        const totalPrice = subtotal + (paymentFee || 0) + uniqueCode - (discountAmount || 0);
        const orderCode = generateOrderCode();

        // Get settings for WhatsApp
        const settingsRows = await conn.query('SELECT `key`, value FROM StoreSettings');
        const settings = {};
        settingsRows.forEach(row => { settings[row.key] = row.value; });

        // Save order
        const result = await conn.query(
            `INSERT INTO \`Order\` (orderCode, productName, variantName, quantity, price, paymentMethod, paymentFee, paymentAccountInfo, discountCode, discountAmount, uniqueCode, totalPrice, buyerMessage, phone, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
            [orderCode, productName, variantName, quantity, price, paymentMethod, paymentFee || 0, paymentAccountInfo, discountCode, discountAmount || 0, uniqueCode, totalPrice, buyerMessage, phone]
        );

        // Update discount usage if code was used
        if (discountCode) {
            await conn.query('UPDATE Discount SET usageCount = usageCount + 1 WHERE code = ?', [discountCode]);
        }

        // Generate WhatsApp message
        const template = settings.whatsapp_message_template ||
            `Halo kak, saya mau pesan:\n\n🎫 *KODE PEMESANAN: {order_code}*\n\n📦 Produk: {product}\n📋 Varian: {variant}\n🔢 Jumlah: {quantity}\n💰 Harga: Rp {price}\n🎲 Kode Unik: +Rp {unique_code}\n💳 Total: Rp {total}\n📱 Pembayaran: {payment}`;

        const formatPrice = (num) => new Intl.NumberFormat('id-ID').format(num);

        let message = template
            .replace('{product}', productName)
            .replace('{variant}', variantName)
            .replace('{quantity}', quantity)
            .replace('{price}', formatPrice(subtotal))
            .replace('{unique_code}', uniqueCode)
            .replace('{total}', formatPrice(totalPrice))
            .replace('{payment}', paymentMethod)
            .replace('{order_code}', orderCode);

        if (buyerMessage) {
            message += `\n\n💬 Catatan: ${buyerMessage}`;
        }

        if (phone) {
            message += `\n📞 No. HP: ${phone}`;
        }

        const waNumber = settings.whatsapp_number || '6281234567890';
        const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

        res.json({ success: true, orderId: Number(result.insertId), orderCode, whatsappUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Create cart order (multi-item)
router.post('/cart', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { items, paymentMethod, bookingCode, uniqueCode, phone } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Keranjang kosong' });
        }

        // ✅ VALIDATION: Validate all items in cart
        for (const item of items) {
            if (!item.productName || !item.variantName || !item.quantity || !item.price) {
                return res.status(400).json({ error: 'Data item di keranjang tidak lengkap' });
            }

            // check quantity
            if (isNaN(item.quantity) || Number(item.quantity) <= 0) {
                return res.status(400).json({ error: `Jumlah untuk ${item.productName} harus lebih dari 0` });
            }

            // check price
            if (isNaN(item.price) || Number(item.price) < 0) {
                return res.status(400).json({ error: `Harga untuk ${item.productName} tidak valid` });
            }
        }

        // Get settings for WhatsApp
        const settingsRows = await conn.query('SELECT `key`, value FROM StoreSettings');
        const settings = {};
        settingsRows.forEach(row => { settings[row.key] = row.value; });

        const formatPrice = (num) => new Intl.NumberFormat('id-ID').format(num);
        let subtotal = 0;

        // Calculate subtotal first
        for (const item of items) {
            subtotal += item.price * item.quantity;
        }

        // Use unique code from frontend (same as what user sees in cart)
        const orderUniqueCode = uniqueCode || Math.floor(Math.random() * 999) + 1;
        const grandTotal = subtotal + orderUniqueCode;

        // Save each item as an order with same booking code
        for (const item of items) {
            const itemTotal = item.price * item.quantity;

            await conn.query(
                `INSERT INTO \`Order\` (orderCode, productName, variantName, quantity, price, paymentMethod, uniqueCode, totalPrice, phone, status, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                [bookingCode, item.productName, item.variantName, item.quantity, item.price, paymentMethod, orderUniqueCode, itemTotal + orderUniqueCode, phone]
            );
        }

        // Build WhatsApp message
        const waNumber = settings.whatsapp_number || '6281234567890';

        let message = `Halo Taufiq Store! 👋\n\n`;
        message += `📋 *KODE BOOKING: ${bookingCode}*\n\n`;
        message += `Saya mau pesan:\n`;
        message += `━━━━━━━━━━━━━━━\n`;

        items.forEach((item, index) => {
            message += `${index + 1}. *${item.productName}*\n`;
            message += `   📦 Varian: ${item.variantName}\n`;
            message += `   🔢 Jumlah: ${item.quantity}\n`;
            message += `   💰 Harga: Rp ${formatPrice(item.price * item.quantity)}\n\n`;
        });

        message += `━━━━━━━━━━━━━━━\n`;
        message += `💵 Subtotal: Rp ${formatPrice(subtotal)}\n`;
        message += `🔑 Kode Unik: +Rp ${orderUniqueCode}\n`;
        message += `💳 Pembayaran: ${paymentMethod}\n`;
        message += `━━━━━━━━━━━━━━━\n`;
        message += `💰 *TOTAL BAYAR: Rp ${formatPrice(grandTotal)}*\n\n`;
        message += `Mohon diproses ya, terima kasih! 🙏`;

        const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

        res.json({
            success: true,
            bookingCode,
            orderCount: items.length,
            whatsappUrl
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Public Order History
router.get('/history', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const { phone } = req.query;

        // ✅ VALIDATION: Phone required for privacy
        if (!phone) {
            return res.status(400).json({ error: 'Nomor HP wajib diisi' });
        }

        // Fetch orders by phone (limit 50 recent)
        const orders = await conn.query(
            `SELECT id, orderCode, productName, variantName, quantity, price, totalPrice, status, paymentMethod, buyerMessage, createdAt 
             FROM \`Order\` 
             WHERE phone = ? 
             ORDER BY createdAt DESC 
             LIMIT 50`,
            [phone]
        );

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;

