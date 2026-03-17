const db = require('./config/db');

const checkHotels = async () => {
    try {
        const [columns] = await db.query('SHOW COLUMNS FROM hotels');
        console.log('--- HOTELS COLUMNS ---');
        columns.forEach(c => console.log(`${c.Field} (${c.Type})`));
        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkHotels();
