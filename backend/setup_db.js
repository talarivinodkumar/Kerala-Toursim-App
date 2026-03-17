const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const setupDatabase = async () => {
    try {
        console.log('Connecting to MySQL host...');
        // Create connection without selecting database to ensure we can create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Connected! Reading SQL file...');

        // Read SQL file
        const sqlFilePath = path.join(__dirname, 'database.sql');
        const sqlParams = fs.readFileSync(sqlFilePath, 'utf8');

        // Execute SQL commands
        console.log('Running SQL setup...');

        // Split by semicolon to execute one by one if preferred, but multipleStatements works too
        await connection.query(sqlParams);

        console.log('✅ Database setup complete properly!');
        await connection.end();
        process.exit();
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('⚠️ Make sure your XAMPP/MySQL server is RUNNING.');
        }
        process.exit(1);
    }
};

setupDatabase();
