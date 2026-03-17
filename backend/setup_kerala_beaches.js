const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const setupKeralaBeaches = async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('✅ Connected to MySQL database.');

        // 1. Create kerala_beaches table (the main beach dataset)
        await db.query(`
            CREATE TABLE IF NOT EXISTS kerala_beaches (
                beach_id INT AUTO_INCREMENT PRIMARY KEY,
                beach_name VARCHAR(100) NOT NULL,
                district VARCHAR(100) NOT NULL,
                latitude DECIMAL(10,8) NOT NULL,
                longitude DECIMAL(11,8) NOT NULL,
                description TEXT,
                risk_level ENUM('low','medium','high') DEFAULT 'low',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ kerala_beaches table created.');

        // 2. Insert Major Kerala Beaches
        await db.query(`DELETE FROM kerala_beaches`);
        await db.query(`
            INSERT INTO kerala_beaches (beach_name, district, latitude, longitude, description, risk_level) VALUES
            ('Cherai Beach', 'Ernakulam', 10.14130000, 76.17890000, 'Golden beach on Vypeen Island, famous for shells and calm waters', 'low'),
            ('Kovalam Beach', 'Thiruvananthapuram', 8.39880000, 76.97840000, 'Iconic crescent-shaped beach with lighthouse, popular for surfing', 'medium'),
            ('Varkala Beach', 'Thiruvananthapuram', 8.73790000, 76.71630000, 'Dramatic cliff-side beach with mineral springs, known as Papanasam', 'medium'),
            ('Alappuzha Beach', 'Alappuzha', 9.49000000, 76.32000000, 'Historic beach with old pier and lighthouse, gateway to backwaters', 'low'),
            ('Bekal Beach', 'Kasaragod', 12.39580000, 75.03420000, 'Pristine beach near Bekal Fort, palm-fringed and secluded', 'low'),
            ('Kappad Beach', 'Kozhikode', 11.38000000, 75.71000000, 'Historic beach where Vasco da Gama landed in 1498', 'low'),
            ('Muzhappilangad Beach', 'Kannur', 11.76900000, 75.44700000, 'Asia longest Drive-in Beach, 4km motorable stretch', 'low'),
            ('Marari Beach', 'Alappuzha', 9.59200000, 76.28800000, 'Secluded fishing village beach with swaying palms', 'low'),
            ('Payyambalam Beach', 'Kannur', 11.87500000, 75.35700000, 'Well-maintained beach with Kannur cantonment backdrop', 'low'),
            ('Dharmadam Island Beach', 'Kannur', 11.79400000, 75.45200000, 'Small island beach accessible on foot during low tide', 'medium'),
            ('Fort Kochi Beach', 'Ernakulam', 9.96400000, 76.24200000, 'Historic beach with Chinese fishing nets and colonial architecture', 'low'),
            ('Shanghumughom Beach', 'Thiruvananthapuram', 8.49300000, 76.88400000, 'Beach near Trivandrum airport with Matsya Kanyaka statue', 'low')
        `);
        console.log('✅ 12 Kerala beaches inserted.');

        // 3. Create geo_fence_zones for each beach
        await db.query(`
            CREATE TABLE IF NOT EXISTS geo_fence_zones (
                zone_id INT AUTO_INCREMENT PRIMARY KEY,
                beach_id INT NOT NULL,
                zone_name VARCHAR(255) NOT NULL,
                zone_lat DECIMAL(10,8) NOT NULL,
                zone_lng DECIMAL(11,8) NOT NULL,
                radius_meters INT NOT NULL DEFAULT 200,
                zone_type ENUM('safe','warning','danger') DEFAULT 'safe',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (beach_id) REFERENCES kerala_beaches(beach_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ geo_fence_zones table created.');

        // 4. Insert comprehensive geo-fence zones for all beaches
        await db.query(`DELETE FROM geo_fence_zones`);
        await db.query(`
            INSERT INTO geo_fence_zones (beach_id, zone_name, zone_lat, zone_lng, radius_meters, zone_type, description) VALUES
            -- Cherai Beach zones
            (1, 'Cherai Safe Swim Zone', 10.14160000, 76.17830000, 250, 'safe', 'Lifeguard patrolled shallow waters'),
            (1, 'Cherai Strong Currents', 10.14300000, 76.17700000, 120, 'danger', 'Unpredictable undercurrents near rocks'),
            (1, 'Cherai Deep Water Warning', 10.14000000, 76.17900000, 180, 'warning', 'Waters deepen rapidly beyond this point'),
            
            -- Kovalam Beach zones
            (2, 'Lighthouse Beach Safe', 8.39880000, 76.97800000, 400, 'safe', 'Main tourist area with lifeguards'),
            (2, 'Hawah Beach Surf Zone', 8.39650000, 76.97650000, 200, 'warning', 'Strong waves suitable for experienced surfers only'),
            (2, 'Rocky Outcrop Danger', 8.40100000, 76.98000000, 150, 'danger', 'Sharp rocks and sudden depth drop'),
            
            -- Varkala Beach zones
            (3, 'Papanasam Safe Zone', 8.73600000, 76.71500000, 350, 'safe', 'Main beach area below the cliff'),
            (3, 'Cliff Edge Warning', 8.73300000, 76.71200000, 180, 'warning', 'Unstable cliff edges, landslide risk'),
            (3, 'North End Riptide', 8.74000000, 76.71800000, 130, 'danger', 'Known riptide area, multiple incidents'),
            
            -- Alappuzha Beach zones
            (4, 'Alappuzha Main Shore', 9.49300000, 76.31770000, 500, 'safe', 'Wide sandy shore near pier'),
            (4, 'Old Pier Currents', 9.49500000, 76.31500000, 250, 'warning', 'Currents around old pier structure'),
            (4, 'Deep Channel Drop', 9.49100000, 76.31900000, 150, 'danger', 'Sudden depth increase, shipping channel nearby'),
            
            -- Bekal Beach zones
            (5, 'Bekal Fort View Safe', 12.39580000, 75.03420000, 400, 'safe', 'Main tourist area near fort'),
            (5, 'Rocky Shore Warning', 12.39800000, 75.03200000, 200, 'warning', 'Slippery rocks during high tide'),
            (5, 'Deep Water Zone', 12.39300000, 75.03600000, 150, 'danger', 'Sudden depth and strong offshore currents'),
            
            -- Kappad Beach zones
            (6, 'Kappad Heritage Shore', 11.38000000, 75.71000000, 350, 'safe', 'Historical landing site, calm waters'),
            (6, 'Kappad North Reef', 11.38300000, 75.70700000, 180, 'warning', 'Submerged reef, snorkeling hazard'),
            (6, 'Kappad Deep Sea', 11.37700000, 75.71300000, 120, 'danger', 'Open sea currents beyond reef line'),
            
            -- Muzhappilangad Beach zones
            (7, 'Drive-in Safe Zone', 11.76900000, 75.44700000, 1200, 'safe', 'Main drive-in beach stretch'),
            (7, 'Tide Change Warning', 11.77200000, 75.44400000, 400, 'warning', 'Rapid tide changes can trap vehicles'),
            (7, 'Dharmadam Rip Current', 11.76600000, 75.45000000, 200, 'danger', 'Strong rip currents near island'),
            
            -- Marari Beach zones
            (8, 'Marari Fishing Shore', 9.59200000, 76.28800000, 300, 'safe', 'Calm fishing village waters'),
            (8, 'Marari Deep Zone', 9.59400000, 76.28500000, 150, 'warning', 'Deeper waters away from shore'),
            
            -- Payyambalam Beach zones
            (9, 'Payyambalam Main', 11.87500000, 75.35700000, 400, 'safe', 'Well-maintained beach promenade'),
            (9, 'Payyambalam North Current', 11.87800000, 75.35400000, 200, 'warning', 'Seasonal strong currents'),
            
            -- Dharmadam Island zones
            (10, 'Dharmadam Crossing', 11.79400000, 75.45200000, 250, 'warning', 'Only accessible during low tide'),
            (10, 'Dharmadam Deep', 11.79600000, 75.45500000, 150, 'danger', 'Deep waters around island'),
            
            -- Fort Kochi Beach zones
            (11, 'Fort Kochi Promenade', 9.96400000, 76.24200000, 500, 'safe', 'Tourist area with Chinese nets'),
            (11, 'Kochi Harbor Current', 9.96600000, 76.24500000, 200, 'warning', 'Ship channel currents'),
            
            -- Shanghumughom Beach zones
            (12, 'Shanghumughom Main', 8.49300000, 76.88400000, 350, 'safe', 'Main beach near airport'),
            (12, 'Shanghumughom Rocks', 8.49500000, 76.88200000, 150, 'danger', 'Rocky area with strong waves')
        `);
        console.log('✅ Geo-fence zones inserted for all 12 beaches.');

        // 5. Add nearest_beach_id column to tourists table if not exists
        try {
            await db.query(`ALTER TABLE tourists ADD COLUMN nearest_beach_id INT DEFAULT NULL`);
            console.log('✅ Added nearest_beach_id to tourists table.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ nearest_beach_id column already exists.');
            } else {
                console.error('Error adding column:', e.message);
            }
        }

        // 6. Create alert_logs table for tracking all alerts with beach association
        await db.query(`
            CREATE TABLE IF NOT EXISTS alert_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tourist_id INT,
                beach_id INT,
                alert_type ENUM('geo_fence', 'risk_score', 'sos', 'inactivity', 'sunset') NOT NULL,
                severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
                message TEXT,
                lat DECIMAL(10,8),
                lng DECIMAL(11,8),
                resolved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP NULL
            )
        `);
        console.log('✅ alert_logs table created.');

        // 7. Also update safety_beaches to match the new kerala_beaches data
        // (keeping backward compatibility)
        await db.query(`DELETE FROM safety_zones`);
        await db.query(`DELETE FROM safety_beaches`);
        await db.query(`
            INSERT INTO safety_beaches (id, name, city) VALUES
            (1, 'Cherai Beach', 'Ernakulam'),
            (2, 'Kovalam Beach', 'Thiruvananthapuram'),
            (3, 'Varkala Beach', 'Thiruvananthapuram'),
            (4, 'Alappuzha Beach', 'Alappuzha'),
            (5, 'Bekal Beach', 'Kasaragod'),
            (6, 'Kappad Beach', 'Kozhikode'),
            (7, 'Muzhappilangad Beach', 'Kannur'),
            (8, 'Marari Beach', 'Alappuzha'),
            (9, 'Payyambalam Beach', 'Kannur'),
            (10, 'Dharmadam Island Beach', 'Kannur'),
            (11, 'Fort Kochi Beach', 'Ernakulam'),
            (12, 'Shanghumughom Beach', 'Thiruvananthapuram')
        `);

        // Re-insert safety_zones from geo_fence_zones to keep backward compat
        await db.query(`
            INSERT INTO safety_zones (beach_id, name, lat, lng, radius, type)
            SELECT beach_id, zone_name, zone_lat, zone_lng, radius_meters, zone_type
            FROM geo_fence_zones
        `);
        console.log('✅ safety_beaches and safety_zones synced with new data.');

        // 8. Insert some simulated tourists with locations across different beaches
        const existingTourists = await db.query('SELECT COUNT(*) as cnt FROM tourists');
        if (existingTourists[0][0].cnt < 5) {
            const crypto = require('crypto');
            const tourists = [
                { name: 'Rahul Sharma', phone: '9876543210', lat: 10.1420, lng: 76.1795, beach_id: 1, status: 'safe', risk: 15 },
                { name: 'Priya Nair', phone: '9876543211', lat: 8.3990, lng: 76.9788, beach_id: 2, status: 'high-risk', risk: 72 },
                { name: 'Amit Kumar', phone: '9876543212', lat: 8.7375, lng: 76.7160, beach_id: 3, status: 'safe', risk: 8 },
                { name: 'Sneha Menon', phone: '9876543213', lat: 9.4905, lng: 76.3205, beach_id: 4, status: 'safe', risk: 22 },
                { name: 'Ravi Teja', phone: '9876543214', lat: 11.7692, lng: 75.4475, beach_id: 7, status: 'emergency', risk: 85 },
                { name: 'Deepika Raj', phone: '9876543215', lat: 12.3960, lng: 75.0345, beach_id: 5, status: 'safe', risk: 5 },
                { name: 'Arjun Das', phone: '9876543216', lat: 11.3805, lng: 75.7105, beach_id: 6, status: 'high-risk', risk: 68 },
                { name: 'Meera Iyer', phone: '9876543217', lat: 10.1410, lng: 76.1780, beach_id: 1, status: 'safe', risk: 12 },
                { name: 'Karthik Pillai', phone: '9876543218', lat: 8.4000, lng: 76.9790, beach_id: 2, status: 'safe', risk: 30 },
                { name: 'Ananya Nambiar', phone: '9876543219', lat: 9.5920, lng: 76.2880, beach_id: 8, status: 'safe', risk: 10 },
            ];

            for (const t of tourists) {
                const digital_id = crypto.createHash('sha256').update(`${Date.now()}-${t.name}-${t.phone}`).digest('hex');
                await db.query(
                    `INSERT INTO tourists (digital_id, name, phone, emergency_contact, current_lat, current_lng, nearest_beach_id, status, risk_score, battery_level)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [digital_id, t.name, t.phone, '9999999999', t.lat, t.lng, t.beach_id, t.status, t.risk, Math.floor(Math.random() * 60) + 40]
                );
            }
            console.log('✅ 10 simulated tourists inserted across Kerala beaches.');

            // Add some emergency alerts
            const [touristRows] = await db.query('SELECT id, current_lat, current_lng, status FROM tourists WHERE status IN ("emergency","high-risk")');
            for (const t of touristRows) {
                await db.query(
                    'INSERT INTO emergency_alerts (tourist_id, lat, lng, status) VALUES (?, ?, ?, "active")',
                    [t.id, t.current_lat, t.current_lng]
                );
            }
            console.log('✅ Emergency alerts created for high-risk tourists.');

            // Add some alert logs
            for (const t of touristRows) {
                await db.query(
                    `INSERT INTO alert_logs (tourist_id, beach_id, alert_type, severity, message, lat, lng) VALUES 
                     (?, ?, 'risk_score', 'high', ?, ?, ?)`,
                    [t.id, 1, `Tourist risk score elevated - ${t.status}`, t.current_lat, t.current_lng]
                );
            }
            console.log('✅ Alert logs created.');
        } else {
            console.log('ℹ️ Tourists already exist, skipping insert.');
        }

        await db.end();
        console.log('\n🎉 Kerala Beach Safety Database Setup Complete!');
        console.log('📍 12 Beaches | 🔶 32 Geo-Fence Zones | 👤 10 Tourists | 🚨 Emergency Alerts');

    } catch (error) {
        console.error('❌ Error setting up Kerala beaches:', error);
    }
};

setupKeralaBeaches();
