const db = require('./config/db');

const checkTables = async () => {
    try {
        const [usersColumns] = await db.query('SHOW COLUMNS FROM users');
        console.log('--- USERS TABLE ---');
        usersColumns.forEach(c => console.log(`${c.Field} (${c.Type})`));

        const [tables] = await db.query('SHOW TABLES');
        console.log('--- ALL TABLES ---');
        tables.forEach(t => console.log(Object.values(t)[0]));

        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkTables();
