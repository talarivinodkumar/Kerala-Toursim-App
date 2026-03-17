/**
 * FULL DATABASE MIGRATION SCRIPT
 * Creates ALL tables and seeds ALL data into the Aiven cloud MySQL database.
 * Run: node migrate_all.js
 */
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
    let db;
    try {
        console.log('🔌 Connecting to Aiven MySQL...');
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true,
            ssl: { rejectUnauthorized: false }
        });
        console.log('✅ Connected!\n');

        // ==============================
        // 1. CORE TABLES
        // ==============================
        console.log('--- STEP 1: Core Tables ---');

        await db.query(`
            CREATE TABLE IF NOT EXISTS places (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT,
                images JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ places');

        await db.query(`
            CREATE TABLE IF NOT EXISTS hotels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                rating DECIMAL(2,1) DEFAULT 0,
                price_range VARCHAR(50),
                images JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ hotels');

        await db.query(`
            CREATE TABLE IF NOT EXISTS romantic_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) DEFAULT 'For You ❤️',
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ romantic_messages');

        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                reset_password_token VARCHAR(255),
                reset_password_expires DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ users');

        // ==============================
        // 2. V2 TABLES (hotel rooms, activities, packages, bookings)
        // ==============================
        console.log('\n--- STEP 2: V2 Tables ---');

        await db.query(`
            CREATE TABLE IF NOT EXISTS hotel_rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                hotel_id INT NOT NULL,
                room_type VARCHAR(255) NOT NULL,
                price_per_night DECIMAL(10, 2) NOT NULL,
                capacity INT DEFAULT 2,
                description TEXT,
                FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ hotel_rooms');

        await db.query(`
            CREATE TABLE IF NOT EXISTS activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                available_slots INT NOT NULL,
                description TEXT,
                image VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ activities');

        await db.query(`
            CREATE TABLE IF NOT EXISTS travel_packages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                includes TEXT,
                package_type VARCHAR(50),
                image VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ travel_packages');

        await db.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                booking_type ENUM('hotel', 'activity', 'package') NOT NULL,
                item_id INT NOT NULL,
                check_in DATE,
                check_out DATE,
                guests INT DEFAULT 1,
                total_price DECIMAL(10, 2) NOT NULL,
                status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') DEFAULT 'Pending',
                payment_status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ bookings');

        // ==============================
        // 3. SAFETY SYSTEM TABLES
        // ==============================
        console.log('\n--- STEP 3: Safety System Tables ---');

        await db.query(`
            CREATE TABLE IF NOT EXISTS safety_beaches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(255) DEFAULT 'Cherai',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ safety_beaches');

        await db.query(`
            CREATE TABLE IF NOT EXISTS safety_zones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                beach_id INT NOT NULL,
                name VARCHAR(255),
                lat DECIMAL(10, 8) NOT NULL,
                lng DECIMAL(11, 8) NOT NULL,
                radius INT NOT NULL COMMENT 'Radius in meters',
                type ENUM('safe', 'warning', 'danger') DEFAULT 'safe',
                FOREIGN KEY (beach_id) REFERENCES safety_beaches(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ safety_zones');

        await db.query(`
            CREATE TABLE IF NOT EXISTS tourists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                digital_id VARCHAR(64) UNIQUE NOT NULL COMMENT 'SHA256 Hashed ID',
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                emergency_contact VARCHAR(20),
                current_lat DECIMAL(10, 8),
                current_lng DECIMAL(11, 8),
                prev_lat DECIMAL(10, 8),
                prev_lng DECIMAL(11, 8),
                nearest_beach_id INT DEFAULT NULL,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                battery_level INT DEFAULT 100,
                risk_score INT DEFAULT 0,
                danger_zone_count INT DEFAULT 0,
                erratic_score INT DEFAULT 0,
                status VARCHAR(50) DEFAULT 'safe',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ tourists');

        await db.query(`
            CREATE TABLE IF NOT EXISTS emergency_alerts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tourist_id INT NOT NULL,
                lat DECIMAL(10, 8),
                lng DECIMAL(11, 8),
                status ENUM('active', 'resolved') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP NULL,
                FOREIGN KEY (tourist_id) REFERENCES tourists(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✅ emergency_alerts');

        // ==============================
        // 4. KERALA BEACHES TABLES
        // ==============================
        console.log('\n--- STEP 4: Kerala Beaches Tables ---');

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
                geo_fence_radius INT DEFAULT 300,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  ✅ kerala_beaches');

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
        console.log('  ✅ geo_fence_zones');

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
        console.log('  ✅ alert_logs');

        // ==============================
        // 5. SEED DATA
        // ==============================
        console.log('\n--- STEP 5: Seed Data ---');

        // Places
        const [existingPlaces] = await db.query('SELECT COUNT(*) as cnt FROM places');
        if (existingPlaces[0].cnt === 0) {
            await db.query(`
                INSERT INTO places (name, location, description, images) VALUES 
                ('Cherai Beach', 'Vypin Island, Kochi', 'Known as the Golden Beach of Kerala...', '["https://images.unsplash.com/photo-1590053912644-656df877299a?auto=format&fit=crop&w=800&q=80"]'),
                ('Aluva Manappuram', 'Aluva, Kochi', 'A famous temple and river bank on the Periyar River...', '["https://images.unsplash.com/photo-1629081703652-325514cb8311?auto=format&fit=crop&w=800&q=80"]')
            `);
            console.log('  ✅ places seeded');
        } else {
            console.log('  ℹ️  places already has data, skipping');
        }

        // Hotels
        const [existingHotels] = await db.query('SELECT COUNT(*) as cnt FROM hotels');
        if (existingHotels[0].cnt === 0) {
            await db.query(`
                INSERT INTO hotels (name, rating, price_range, images) VALUES
                ('Cherai Beach Resort', 4.5, '$$$', '["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"]')
            `);
            console.log('  ✅ hotels seeded');
        } else {
            console.log('  ℹ️  hotels already has data, skipping');
        }

        // Hotel Rooms
        const [existingRooms] = await db.query('SELECT COUNT(*) as cnt FROM hotel_rooms');
        if (existingRooms[0].cnt === 0) {
            await db.query(`
                INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, capacity, description) VALUES
                (1, 'Standard Room', 2500.00, 2, 'Comfortable room with essential amenities'),
                (1, 'Sea View Room', 4500.00, 2, 'Breathtaking view of the Cherai Beach waves'),
                (1, 'Premium Beach Villa', 7000.00, 3, 'Luxury villa with private beach access')
            `);
            console.log('  ✅ hotel_rooms seeded');
        } else {
            console.log('  ℹ️  hotel_rooms already has data, skipping');
        }

        // Activities
        const [existingActivities] = await db.query('SELECT COUNT(*) as cnt FROM activities');
        if (existingActivities[0].cnt === 0) {
            await db.query(`
                INSERT INTO activities (name, price, available_slots, description, image) VALUES
                ('Boat Ride', 800.00, 20, 'Explore the backwaters of Cherai in a traditional boat.', 'https://images.unsplash.com/photo-1544526226-d4568090ffb8?auto=format&fit=crop&w=800&q=80'),
                ('Water Sports', 1500.00, 10, 'Thrilling jet ski and banana boat rides.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'),
                ('Sunset Cruise', 1200.00, 15, 'Romantic sunset view from the middle of the sea.', 'https://images.unsplash.com/photo-1544473244-f689027d1f03?auto=format&fit=crop&w=800&q=80'),
                ('Beach Photoshoot', 2000.00, 5, 'Professional photography session at the shore.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
            `);
            console.log('  ✅ activities seeded');
        } else {
            console.log('  ℹ️  activities already has data, skipping');
        }

        // Travel Packages
        const [existingPackages] = await db.query('SELECT COUNT(*) as cnt FROM travel_packages');
        if (existingPackages[0].cnt === 0) {
            await db.query(`
                INSERT INTO travel_packages (name, description, price, includes, package_type, image) VALUES
                ('Basic Package', 'Perfect for a quick beach getaway.', 1500.00, 'Beach Visit, Lunch, Sunset View', 'Basic', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'),
                ('Romantic Surprise', 'The ultimate experience for couples.', 5000.00, 'Candlelight Dinner, Photography, Private Walk, Luxury Stay Discount', 'Romantic', 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80')
            `);
            console.log('  ✅ travel_packages seeded');
        } else {
            console.log('  ℹ️  travel_packages already has data, skipping');
        }

        // Safety Beaches
        const [existingSafetyBeaches] = await db.query('SELECT COUNT(*) as cnt FROM safety_beaches');
        if (existingSafetyBeaches[0].cnt === 0) {
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
            console.log('  ✅ safety_beaches seeded');
        } else {
            console.log('  ℹ️  safety_beaches already has data, skipping');
        }

        // Kerala Beaches
        const [existingKeralaBeaches] = await db.query('SELECT COUNT(*) as cnt FROM kerala_beaches');
        if (existingKeralaBeaches[0].cnt === 0) {
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
            console.log('  ✅ kerala_beaches seeded (12 beaches)');
        } else {
            console.log('  ℹ️  kerala_beaches already has data, skipping');
        }

        // Safety Zones
        const [existingZones] = await db.query('SELECT COUNT(*) as cnt FROM safety_zones');
        if (existingZones[0].cnt === 0) {
            await db.query(`
                INSERT INTO safety_zones (beach_id, name, lat, lng, radius, type) VALUES 
                (1, 'Safe Swim Zone 1', 10.1416, 76.1783, 200, 'safe'),
                (1, 'Strong Currents Area', 10.1430, 76.1770, 100, 'danger'),
                (1, 'Deep Water Warning', 10.1400, 76.1790, 150, 'warning'),
                (2, 'Lighthouse Beach Safe', 8.3988, 76.9780, 400, 'safe'),
                (2, 'Hawah Beach Surf Zone', 8.3965, 76.9765, 200, 'warning'),
                (2, 'Rocky Outcrop Danger', 8.4010, 76.9800, 150, 'danger'),
                (3, 'Papanasam Safe Zone', 8.7360, 76.7150, 350, 'safe'),
                (3, 'Cliff Edge Warning', 8.7330, 76.7120, 180, 'warning'),
                (3, 'North End Riptide', 8.7400, 76.7180, 130, 'danger'),
                (4, 'Alappuzha Main Shore', 9.4930, 76.3177, 500, 'safe'),
                (4, 'Old Pier Currents', 9.4950, 76.3150, 250, 'warning'),
                (4, 'Deep Channel Drop', 9.4910, 76.3190, 150, 'danger'),
                (5, 'Bekal Fort View Safe', 12.3958, 75.0342, 400, 'safe'),
                (5, 'Rocky Shore Warning', 12.3980, 75.0320, 200, 'warning'),
                (5, 'Deep Water Zone', 12.3930, 75.0360, 150, 'danger'),
                (6, 'Kappad Heritage Shore', 11.3800, 75.7100, 350, 'safe'),
                (6, 'Kappad North Reef', 11.3830, 75.7070, 180, 'warning'),
                (6, 'Kappad Deep Sea', 11.3770, 75.7130, 120, 'danger'),
                (7, 'Drive-in Safe Zone', 11.7690, 75.4470, 1200, 'safe'),
                (7, 'Tide Change Warning', 11.7720, 75.4440, 400, 'warning'),
                (7, 'Dharmadam Rip Current', 11.7660, 75.4500, 200, 'danger'),
                (8, 'Marari Fishing Shore', 9.5920, 76.2880, 300, 'safe'),
                (8, 'Marari Deep Zone', 9.5940, 76.2850, 150, 'warning'),
                (9, 'Payyambalam Main', 11.8750, 75.3570, 400, 'safe'),
                (9, 'Payyambalam North Current', 11.8780, 75.3540, 200, 'warning'),
                (10, 'Dharmadam Crossing', 11.7940, 75.4520, 250, 'warning'),
                (10, 'Dharmadam Deep', 11.7960, 75.4550, 150, 'danger'),
                (11, 'Fort Kochi Promenade', 9.9640, 76.2420, 500, 'safe'),
                (11, 'Kochi Harbor Current', 9.9660, 76.2450, 200, 'warning'),
                (12, 'Shanghumughom Main', 8.4930, 76.8840, 350, 'safe'),
                (12, 'Shanghumughom Rocks', 8.4950, 76.8820, 150, 'danger')
            `);
            console.log('  ✅ safety_zones seeded');
        } else {
            console.log('  ℹ️  safety_zones already has data, skipping');
        }

        // Geo Fence Zones
        const [existingGeoZones] = await db.query('SELECT COUNT(*) as cnt FROM geo_fence_zones');
        if (existingGeoZones[0].cnt === 0) {
            await db.query(`
                INSERT INTO geo_fence_zones (beach_id, zone_name, zone_lat, zone_lng, radius_meters, zone_type, description) VALUES
                (1, 'Cherai Safe Swim Zone', 10.14160000, 76.17830000, 250, 'safe', 'Lifeguard patrolled shallow waters'),
                (1, 'Cherai Strong Currents', 10.14300000, 76.17700000, 120, 'danger', 'Unpredictable undercurrents near rocks'),
                (1, 'Cherai Deep Water Warning', 10.14000000, 76.17900000, 180, 'warning', 'Waters deepen rapidly beyond this point'),
                (2, 'Lighthouse Beach Safe', 8.39880000, 76.97800000, 400, 'safe', 'Main tourist area with lifeguards'),
                (2, 'Hawah Beach Surf Zone', 8.39650000, 76.97650000, 200, 'warning', 'Strong waves suitable for experienced surfers only'),
                (2, 'Rocky Outcrop Danger', 8.40100000, 76.98000000, 150, 'danger', 'Sharp rocks and sudden depth drop'),
                (3, 'Papanasam Safe Zone', 8.73600000, 76.71500000, 350, 'safe', 'Main beach area below the cliff'),
                (3, 'Cliff Edge Warning', 8.73300000, 76.71200000, 180, 'warning', 'Unstable cliff edges, landslide risk'),
                (3, 'North End Riptide', 8.74000000, 76.71800000, 130, 'danger', 'Known riptide area, multiple incidents'),
                (4, 'Alappuzha Main Shore', 9.49300000, 76.31770000, 500, 'safe', 'Wide sandy shore near pier'),
                (4, 'Old Pier Currents', 9.49500000, 76.31500000, 250, 'warning', 'Currents around old pier structure'),
                (4, 'Deep Channel Drop', 9.49100000, 76.31900000, 150, 'danger', 'Sudden depth increase, shipping channel nearby'),
                (5, 'Bekal Fort View Safe', 12.39580000, 75.03420000, 400, 'safe', 'Main tourist area near fort'),
                (5, 'Rocky Shore Warning', 12.39800000, 75.03200000, 200, 'warning', 'Slippery rocks during high tide'),
                (5, 'Deep Water Zone', 12.39300000, 75.03600000, 150, 'danger', 'Sudden depth and strong offshore currents'),
                (6, 'Kappad Heritage Shore', 11.38000000, 75.71000000, 350, 'safe', 'Historical landing site, calm waters'),
                (6, 'Kappad North Reef', 11.38300000, 75.70700000, 180, 'warning', 'Submerged reef, snorkeling hazard'),
                (6, 'Kappad Deep Sea', 11.37700000, 75.71300000, 120, 'danger', 'Open sea currents beyond reef line'),
                (7, 'Drive-in Safe Zone', 11.76900000, 75.44700000, 1200, 'safe', 'Main drive-in beach stretch'),
                (7, 'Tide Change Warning', 11.77200000, 75.44400000, 400, 'warning', 'Rapid tide changes can trap vehicles'),
                (7, 'Dharmadam Rip Current', 11.76600000, 75.45000000, 200, 'danger', 'Strong rip currents near island'),
                (8, 'Marari Fishing Shore', 9.59200000, 76.28800000, 300, 'safe', 'Calm fishing village waters'),
                (8, 'Marari Deep Zone', 9.59400000, 76.28500000, 150, 'warning', 'Deeper waters away from shore'),
                (9, 'Payyambalam Main', 11.87500000, 75.35700000, 400, 'safe', 'Well-maintained beach promenade'),
                (9, 'Payyambalam North Current', 11.87800000, 75.35400000, 200, 'warning', 'Seasonal strong currents'),
                (10, 'Dharmadam Crossing', 11.79400000, 75.45200000, 250, 'warning', 'Only accessible during low tide'),
                (10, 'Dharmadam Deep', 11.79600000, 75.45500000, 150, 'danger', 'Deep waters around island'),
                (11, 'Fort Kochi Promenade', 9.96400000, 76.24200000, 500, 'safe', 'Tourist area with Chinese nets'),
                (11, 'Kochi Harbor Current', 9.96600000, 76.24500000, 200, 'warning', 'Ship channel currents'),
                (12, 'Shanghumughom Main', 8.49300000, 76.88400000, 350, 'safe', 'Main beach near airport'),
                (12, 'Shanghumughom Rocks', 8.49500000, 76.88200000, 150, 'danger', 'Rocky area with strong waves')
            `);
            console.log('  ✅ geo_fence_zones seeded');
        } else {
            console.log('  ℹ️  geo_fence_zones already has data, skipping');
        }

        // Simulated Tourists
        const [existingTourists] = await db.query('SELECT COUNT(*) as cnt FROM tourists');
        if (existingTourists[0].cnt === 0) {
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
            console.log('  ✅ 10 simulated tourists seeded');

            // Emergency alerts for high-risk tourists
            const [touristRows] = await db.query('SELECT id, current_lat, current_lng FROM tourists WHERE status IN ("emergency","high-risk")');
            for (const t of touristRows) {
                await db.query(
                    'INSERT INTO emergency_alerts (tourist_id, lat, lng, status) VALUES (?, ?, ?, "active")',
                    [t.id, t.current_lat, t.current_lng]
                );
            }
            console.log('  ✅ Emergency alerts seeded');
        } else {
            console.log('  ℹ️  tourists already has data, skipping');
        }

        // ==============================
        // 6. VERIFY
        // ==============================
        console.log('\n--- VERIFICATION ---');
        const [tables] = await db.query('SHOW TABLES');
        console.log('All tables in database:');
        tables.forEach(t => console.log(`  📋 ${Object.values(t)[0]}`));

        await db.end();
        console.log('\n🎉 FULL MIGRATION COMPLETE! All tables created and seeded.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration Error:', error.message);
        if (db) await db.end();
        process.exit(1);
    }
};

migrate();
