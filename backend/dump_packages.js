const db = require('./config/db');

async function dumpPackages() {
    try {
        const [rows] = await db.query('SELECT * FROM travel_packages');
        console.log('--- PACKAGES DUMP ---');
        console.log(JSON.stringify(rows, null, 2));
        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

dumpPackages();
