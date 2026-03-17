const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await db.query('DELETE FROM users WHERE email = ?', ['admin@gmail.com']);
        await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            ['Admin User', 'admin@gmail.com', hashedPassword]
        );

        console.log('Admin user created successfully!');
        await db.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

createAdmin();
