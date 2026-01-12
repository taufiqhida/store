const mariadb = require('mariadb');

async function main() {
    console.log('🔧 Creating missing tables...');

    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'taufiq_store_1',
        multipleStatements: true
    });

    try {
        // Create Order table if not exists
        await conn.query(`
            CREATE TABLE IF NOT EXISTS \`Order\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orderCode VARCHAR(255) UNIQUE NOT NULL,
                productName VARCHAR(255) NOT NULL,
                variantName VARCHAR(255) NOT NULL,
                quantity INT NOT NULL,
                price FLOAT NOT NULL,
                uniqueCode INT NOT NULL,
                totalPrice FLOAT NOT NULL,
                paymentMethod VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                whatsappSent BOOLEAN DEFAULT FALSE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Order table created/verified');

        // Create FlashSale table if not exists
        await conn.query(`
            CREATE TABLE IF NOT EXISTS FlashSale (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                productId INT NOT NULL,
                discountPercent FLOAT NOT NULL,
                startDate DATETIME NOT NULL,
                endDate DATETIME NOT NULL,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ FlashSale table created/verified');

        // Create Testimonial table if not exists
        await conn.query(`
            CREATE TABLE IF NOT EXISTS Testimonial (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orderCode VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                rating INT DEFAULT 5,
                productName VARCHAR(255),
                isApproved BOOLEAN DEFAULT FALSE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Testimonial table created/verified');

        // Create Article table if not exists
        await conn.query(`
            CREATE TABLE IF NOT EXISTS Article (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                content TEXT NOT NULL,
                image VARCHAR(255),
                isPublished BOOLEAN DEFAULT FALSE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Article table created/verified');

        console.log('🎉 All missing tables have been created!');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await conn.end();
    }
}

main();
