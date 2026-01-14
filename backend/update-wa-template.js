const pool = require('./src/config/database');

async function updateWaTemplate() {
    let conn;
    try {
        conn = await pool.getConnection();

        // Check current template
        const current = await conn.query("SELECT * FROM StoreSettings WHERE `key` = 'whatsapp_message_template'");
        console.log('Current template:', current);

        // New template with order code at top
        const newTemplate = `Halo kak, saya mau pesan:

🎫 *KODE PEMESANAN: {order_code}*

📦 Produk: {product}
📋 Varian: {variant}
🔢 Jumlah: {quantity}
💰 Harga: Rp {price}
🎲 Kode Unik: +Rp {unique_code}
💳 Total: Rp {total}
📱 Pembayaran: {payment}`;

        if (current.length > 0) {
            // Update existing template
            await conn.query("UPDATE StoreSettings SET value = ? WHERE `key` = 'whatsapp_message_template'", [newTemplate]);
            console.log('Template updated!');
        } else {
            // Insert new template
            await conn.query("INSERT INTO StoreSettings (`key`, value) VALUES ('whatsapp_message_template', ?)", [newTemplate]);
            console.log('Template inserted!');
        }

        // Verify
        const verify = await conn.query("SELECT * FROM StoreSettings WHERE `key` = 'whatsapp_message_template'");
        console.log('New template:', verify);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

updateWaTemplate();
