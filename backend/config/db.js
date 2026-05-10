const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'petto_pwa',

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    charset: 'utf8mb4'
});

module.exports = pool;