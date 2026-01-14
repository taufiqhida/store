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
        const { productName, variantName, quantity, price, paymentMethod, paymentFee, paymentAccountInfo, discountCode, discountAmount, buyerMessage } = req.body;

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
            `INSERT INTO \`Order\` (orderCode, productName, variantName, quantity, price, paymentMethod, paymentFee, paymentAccountInfo, discountCode, discountAmount, uniqueCode, totalPrice, buyerMessage, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
            [orderCode, productName, variantName, quantity, price, paymentMethod, paymentFee || 0, paymentAccountInfo, discountCode, discountAmount || 0, uniqueCode, totalPrice, buyerMessage]
        );

        // Update discount usage if code was used
        if (discountCode) {
            await conn.query('UPDATE Discount SET usageCount = usageCount + 1 WHERE code = ?', [discountCode]);
        }

        // Generate WhatsApp message
        const template = settings.whatsapp_message_template ||
            `Halo kak, saya mau pesan:\n\n📦 Produk: {product}\n📋 Varian: {variant}\n🔢 Jumlah: {quantity}\n💰 Harga: Rp {price}\n🎫 Kode Unik: +Rp {unique_code}\n💳 Total: Rp {total}\n📱 Pembayaran: {payment}\n\n📝 Kode Order: {order_code}`;

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

        const waNumber = settings.whatsapp_number || '6281234567890';
        const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

        res.json({ success: true, orderId: Number(result.insertId), orderCode, whatsappUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
