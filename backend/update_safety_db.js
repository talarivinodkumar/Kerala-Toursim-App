const mysql = require('mysql2/promise');
require('dotenv').config();
const run = async () => {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    // Add columns to tourists
    try { await db.query('ALTER TABLE tourists ADD COLUMN otp VARCHAR(10)'); } catch (e) { }
    try { await db.query('ALTER TABLE tourists ADD COLUMN otp_expiry TIMESTAMP'); } catch (e) { }

    // Create incident_reports table
    await db.query(`
        CREATE TABLE IF NOT EXISTS incident_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tourist_id INT,
            description TEXT,
            lat DECIMAL(10,8),
            lng DECIMAL(11,8),
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tourist_id) REFERENCES tourists(id) ON DELETE CASCADE
        )
    `);
    console.log('DB Updated successfully');
    db.end();
};
run();
