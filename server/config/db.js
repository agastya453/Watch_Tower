const mysql = require('mysql2/promise');
require('dotenv').config();

let dbPool;

const initDb = async () => {
    const tempPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    const dbName = process.env.DB_NAME || 'website_tracker';

    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempPool.end();

    dbPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    await dbPool.query(`
        CREATE TABLE IF NOT EXISTS websites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            url VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await dbPool.query(`
        CREATE TABLE IF NOT EXISTS snapshots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            site_id INT,
            content LONGTEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            change_type ENUM('none', 'minor', 'major') DEFAULT 'none',
            diff_added TEXT,
            diff_removed TEXT,
            FOREIGN KEY (site_id) REFERENCES websites(id) ON DELETE CASCADE
        )
    `);
};

const getPool = () => {
    if (!dbPool) throw new Error('Database not initialized yet!');
    return dbPool;
};

module.exports = {
    initDb,
    query: (...args) => getPool().query(...args),
    execute: (...args) => getPool().execute(...args),
    getConnection: (...args) => getPool().getConnection(...args)
};