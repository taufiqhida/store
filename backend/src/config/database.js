const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taufiq_store_1',
    connectionLimit: 50,              // Upgraded from 10 to 50 for production
    idleTimeout: 30000,               // Close idle connections after 30s
    acquireTimeout: 30000,            // Timeout untuk mendapat connection
    connectTimeout: 10000,            // Timeout untuk connect ke database
    minimumIdle: 5,                   // Maintain minimum 5 idle connections
    maxIdleTime: 60000,              // Max idle time before cleanup
    allowPublicKeyRetrieval: true,
    multipleStatements: false,        // Security: prevent SQL injection
    trace: false                      // Disable trace in production for performance
});

// Pool error handling
pool.on('error', (err) => {
    console.error('❌ Database pool error:', err);
});

module.exports = pool;
