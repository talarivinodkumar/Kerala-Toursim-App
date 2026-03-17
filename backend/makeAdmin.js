require('dotenv').config();
const mysql = require('mysql2/promise');

const makeAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Please provide an email address.');
        console.error('Usage: node makeAdmin.js <user-email>');
        process.exit(1);
    }

    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            console.error(`❌ User with email ${email} not found in the database.`);
            process.exit(1);
        }

        // Update role
        await db.query('UPDATE users SET role = "admin" WHERE email = ?', [email]);
        console.log(`✅ Success! User ${email} is now an Admin.`);
        
        await db.end();
        process.exit(0);

    } catch (error) {
        console.error('database error:', error.message);
        process.exit(1);
    }
};

makeAdmin();
