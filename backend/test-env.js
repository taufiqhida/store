try {
    require('dotenv').config();
    console.log('✅ dotenv loaded');
    const { PrismaClient } = require('@prisma/client');
    console.log('✅ prisma client loaded');
} catch (e) {
    console.error('❌ Error:', e.message);
}
