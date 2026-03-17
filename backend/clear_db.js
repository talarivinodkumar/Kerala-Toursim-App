const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const clearDb = async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('Connected to MySQL database. Clearing old data...');
        await db.query('DELETE FROM emergency_alerts');
        await db.query('DELETE FROM tourists');
        console.log('All tourists and alerts deleted successfully.');

        await db.end();
    } catch (error) {
        console.error('Error clearing data:', error);
    }
};

clearDb();
