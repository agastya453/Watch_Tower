const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const initDb = async () => {
    // Connect without database first to ensure it exists
    const tempPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'website_tracker';

    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempPool.end();

    // Now connect to the actual database pool and ensure tables exist
    // Re-create the pool connected to the specific database
    const dbPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // We can swap the initial pool that has no db selected by exporting a function that provides query capability
    // Wait, let's just make `pool` use the database directly, knowing it might fail if db doesn't exist?
    // Let's modify the exported pool approach: we export an object that delegates query to a specific pool.
    
    // Create websites table
    await dbPool.query(`
        CREATE TABLE IF NOT EXISTS websites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            url VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create snapshots table
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

    // Update our reference so we export the correct pool for usage
    module.exports.query = dbPool.query.bind(dbPool);
    module.exports.execute = dbPool.execute.bind(dbPool);
    module.exports.getConnection = dbPool.getConnection.bind(dbPool);
};

module.exports = {
    initDb,
    query: async (...args) => {
        // Fallback or replaced in initDb
        throw new Error('Database not initialized yet!');
    }
};
