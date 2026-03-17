const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const updateDB = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'vinod',
            database: process.env.DB_NAME || 'cherai_tourism',
            multipleStatements: true
        });

        const sql = fs.readFileSync(path.join(__dirname, 'update_v2.sql'), 'utf8');
        await connection.query(sql);
        console.log('✅ Database updated to V2 successfully!');
        await connection.end();
    } catch (error) {
        console.error('❌ Error updating database:', error.message);
    }
};

updateDB();
