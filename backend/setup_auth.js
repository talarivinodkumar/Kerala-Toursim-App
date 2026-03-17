const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const setupDatabase = async () => {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Connected! Setting up AuthSystemhello...');

        // Read SQL file
        const sqlFilePath = path.join(__dirname, 'database_auth.sql');
        const sqlParams = fs.readFileSync(sqlFilePath, 'utf8');

        // Execute SQL commands
        await connection.query(sqlParams);

        console.log('✅ AuthSystemhello Database Updated with all tables!');
        await connection.end();
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

setupDatabase();
