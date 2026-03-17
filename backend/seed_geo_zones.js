const db = require('./config/db');

// Seed 3 geo-fence zones per beach: safe (0-100m), warning (100-200m), danger (200-300m from shore)
// Zone center = beach center. Radii represent concentric circles.
async function seedGeoZones() {
    try {
        const [beaches] = await db.query('SELECT beach_id, beach_name, latitude, longitude FROM kerala_beaches ORDER BY beach_id');
        console.log(`Found ${beaches.length} beaches. Seeding geo-fence zones...`);

        // Clear existing zones
        await db.query('DELETE FROM geo_fence_zones');
        console.log('Cleared existing geo_fence_zones');

        for (const beach of beaches) {
            const lat = parseFloat(beach.latitude);
            const lng = parseFloat(beach.longitude);

            // Zone 1: Safe Zone — 150m radius (inner zone)
            await db.query(`
                INSERT INTO geo_fence_zones (beach_id, zone_name, zone_lat, zone_lng, radius_meters, zone_type, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                beach.beach_id,
                `${beach.beach_name} - Safe Zone`,
                lat, lng, 150,
                'safe',
                'Low tide area. Safe for swimming and water sports.'
            ]);

            // Zone 2: Warning Zone — 250m radius (medium zone)
            await db.query(`
                INSERT INTO geo_fence_zones (beach_id, zone_name, zone_lat, zone_lng, radius_meters, zone_type, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                beach.beach_id,
                `${beach.beach_name} - Warning Zone`,
                lat + 0.0005, lng + 0.0005, 250,
                'warning',
                'Moderate currents. Swim with extreme caution.'
            ]);

            // Zone 3: Danger Zone — 350m radius (outer zone - deep water)
            await db.query(`
                INSERT INTO geo_fence_zones (beach_id, zone_name, zone_lat, zone_lng, radius_meters, zone_type, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                beach.beach_id,
                `${beach.beach_name} - Danger Zone`,
                lat + 0.001, lng + 0.001, 350,
                'danger',
                'High risk area. Strong underwater currents. No swimming.'
            ]);

            console.log(`  ✅ Seeded 3 zones for ${beach.beach_name}`);
        }

        const [count] = await db.query('SELECT COUNT(*) as c FROM geo_fence_zones');
        console.log(`\n✅ Done! Total geo_fence_zones: ${count[0].c}`);

        // Also update kerala_beaches with 300m geo-fence trigger radius
        // Check if column exists first
        const [cols] = await db.query('SHOW COLUMNS FROM kerala_beaches LIKE "geo_fence_radius"');
        if (cols.length === 0) {
            await db.query('ALTER TABLE kerala_beaches ADD COLUMN geo_fence_radius INT DEFAULT 300');
            console.log('✅ Added geo_fence_radius column to kerala_beaches');
        }
        await db.query('UPDATE kerala_beaches SET geo_fence_radius = 300');
        console.log('✅ All beaches set to 300m geo-fence trigger radius\n');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

seedGeoZones();
