const db = require('./config/db');

async function checkImages() {
    try {
        const [rows] = await db.query('SELECT name, image FROM travel_packages');
        console.log('--- PACKAGE IMAGES ---');
        rows.forEach(r => console.log(`${r.name}: ${r.image ? 'YES' : 'MISSING'}`));

        const [activities] = await db.query('SELECT name, image FROM activities');
        console.log('--- ACTIVITY IMAGES ---');
        activities.forEach(r => console.log(`${r.name}: ${r.image ? 'YES' : 'MISSING'}`));

        process.exit();
    } catch (error) {
        process.exit(1);
    }
}

checkImages();
