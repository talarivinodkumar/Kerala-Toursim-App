const db = require('./config/db');

async function checkData() {
    try {
        const [packages] = await db.query('SELECT * FROM travel_packages');
        const [hotels] = await db.query('SELECT * FROM hotels');
        const [activities] = await db.query('SELECT * FROM activities');

        console.log('--- DB SUMMARY ---');
        console.log('Packages:', packages.length);
        console.log('Hotels:', hotels.length);
        console.log('Activities:', activities.length);

        if (packages.length > 0) {
            console.log('Sample Package:', packages[0].name);
        }

        process.exit();
    } catch (error) {
        console.error('DB Error:', error.message);
        process.exit(1);
    }
}

checkData();
