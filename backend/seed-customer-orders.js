const pool = require('./src/config/database');
const fs = require('fs');

const PHONES = ['087787129170', '087836366100', '085875577599'];

const generateOrderCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ORD-SEED-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function main() {
    let conn;
    try {
        console.log('🌱 Sending dummy orders (using native pool)...');
        conn = await pool.getConnection();
        console.log('✅ Connected to database');

        // Fetch products and variants manually
        const products = await conn.query('SELECT * FROM Product');

        if (products.length === 0) {
            console.error('❌ No products found.');
            return;
        }

        // Fetch all variants
        const allVariants = await conn.query('SELECT * FROM Variant');

        const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
        const paymentMethods = ['Transfer BCA', 'Transfer Mandiri', 'E-Wallet (Dana)', 'COD'];

        for (const phone of PHONES) {
            console.log(`Creating orders for ${phone}...`);
            const orderCount = Math.floor(Math.random() * 4) + 5;

            for (let i = 0; i < orderCount; i++) {
                const product = products[Math.floor(Math.random() * products.length)];

                // Find variants for this product
                const productVariants = allVariants.filter(v => v.productId === product.id);
                if (productVariants.length === 0) continue;

                const variant = productVariants[Math.floor(Math.random() * productVariants.length)];

                const quantity = Math.floor(Math.random() * 3) + 1;
                const price = variant.price;
                const uniqueCode = Math.floor(Math.random() * 999) + 1;
                const paymentFee = 2500;
                const subtotal = price * quantity;
                const totalPrice = subtotal + paymentFee + uniqueCode;

                const orderDate = getRandomDate(new Date(2023, 8, 1), new Date());
                const orderCode = generateOrderCode();

                await conn.query(`
                    INSERT INTO \`Order\` 
                    (orderCode, productName, variantName, quantity, price, paymentMethod, paymentFee, uniqueCode, totalPrice, buyerMessage, phone, status, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderCode,
                    product.name,
                    variant.name,
                    quantity,
                    price,
                    paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                    paymentFee,
                    uniqueCode,
                    totalPrice,
                    'Seed data order',
                    phone,
                    statuses[Math.floor(Math.random() * statuses.length)],
                    orderDate
                ]);
            }
        }

        console.log('✅ Seed data created successfully!');

    } catch (e) {
        console.error('CRITICAL ERROR:', e);
        try { fs.writeFileSync('seed_error.log', e.toString()); } catch (err) { }
        process.exit(1);
    } finally {
        if (conn) conn.release();
        // Pool needs to be closed to exit script
        process.exit(0);
    }
}

main();
