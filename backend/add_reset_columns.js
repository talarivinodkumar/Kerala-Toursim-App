const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const updateSchema = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        // Add reset_password_token column
        try {
            await connection.query(`
                ALTER TABLE users 
                ADD COLUMN reset_password_token VARCHAR(255),
                ADD COLUMN reset_password_expires DATETIME
            `);
            console.log('✅ Added reset_password_token and reset_password_expires columns.');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Columns already exist.');
            } else {
                console.error('❌ Error adding columns:', error.message);
            }
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error connecting to database:', error.message);
    }
};

updateSchema();
