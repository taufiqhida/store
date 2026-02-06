const pool = require('./src/config/database');

const CUSTOMERS = [
    { phone: '081234567890', name: 'Budi Santoso' },
    { phone: '082345678901', name: 'Siti Nurhaliza' },
    { phone: '083456789012', name: 'Andi Wijaya' },
    { phone: '084567890123', name: 'Rina Kartika' },
    { phone: '085678901234', name: 'Dedi Kusuma' },
    { phone: '086789012345', name: 'Maya Sari' },
    { phone: '087890123456', name: 'Rudi Hartono' },
    { phone: '088901234567', name: 'Dewi Lestari' },
    { phone: '089012345678', name: 'Agus Setiawan' },
    { phone: '081122334455', name: 'Fitri Handayani' }
];

const generateOrderCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'CST-';
    for (let i = 0; i < 8; i++) {
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
        console.log('🌱 Seeding 10 customers with order history...');
        conn = await pool.getConnection();
        console.log('✅ Connected to database');

        const products = await conn.query('SELECT * FROM Product');
        if (products.length === 0) {
            console.error('❌ No products found.');
            return;
        }

        const allVariants = await conn.query('SELECT * FROM Variant');

        const statuses = ['pending', 'completed', 'cancelled'];
        const paymentMethods = ['QRIS', 'Transfer Bank', 'COD', 'Dana'];

        const startDate = new Date('2025-11-01');
        const endDate = new Date();

        let totalOrders = 0;

        for (const customer of CUSTOMERS) {
            const orderCount = Math.floor(Math.random() * 6) + 3; // 3-8 orders
            console.log(`\n📦 Creating ${orderCount} orders for ${customer.name} (${customer.phone})`);

            for (let i = 0; i < orderCount; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const productVariants = allVariants.filter(v => v.productId === product.id);
                if (productVariants.length === 0) continue;

                const variant = productVariants[Math.floor(Math.random() * productVariants.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const price = variant.price;
                const totalPrice = price * quantity;
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
                const createdAt = getRandomDate(startDate, endDate);
                const uniqueCode = Math.floor(Math.random() * 900) + 100;

                const orderCode = generateOrderCode();

                await conn.query(
                    `INSERT INTO \`Order\` 
                    (orderCode, productName, variantName, quantity, price, totalPrice, status, paymentMethod, phone, buyerMessage, uniqueCode, createdAt, paymentFee, discountAmount, whatsappSent) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
                    [
                        orderCode,
                        product.name,
                        variant.name,
                        quantity,
                        price,
                        totalPrice,
                        status,
                        paymentMethod,
                        customer.phone,
                        i === 0 ? `Pesanan pertama dari ${customer.name}` : null,
                        uniqueCode,
                        createdAt
                    ]
                );

                totalOrders++;
                console.log(`  ✅ ${orderCode} - ${product.name} (${variant.name}) - ${status}`);
            }
        }

        console.log(`\n✅ Successfully created ${totalOrders} orders for ${CUSTOMERS.length} customers`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

main();
