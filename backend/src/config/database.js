const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool(process.env.DATABASE_URL, {
    connectionLimit: 10
});

module.exports = pool;
