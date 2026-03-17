const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const createTables = async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('Connected to MySQL database.');

        // Create safety_beaches table
        await db.query(`
            CREATE TABLE IF NOT EXISTS safety_beaches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                city VARCHAR(255) DEFAULT 'Cherai',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('safety_beaches table created.');

        // Create safety_zones table
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
        console.log('safety_zones table created.');

        // Create tourists table
        await db.query(`DROP TABLE IF EXISTS emergency_alerts`);
        await db.query(`DROP TABLE IF EXISTS tourists`);
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
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                battery_level INT DEFAULT 100,
                risk_score INT DEFAULT 0,
                danger_zone_count INT DEFAULT 0,
                erratic_score INT DEFAULT 0,
                status VARCHAR(50) DEFAULT 'safe',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('tourists table created.');

        // Create emergency_alerts table
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
        console.log('emergency_alerts table created.');

        // Insert some dummy data
        await db.query(`INSERT IGNORE INTO safety_beaches (id, name, city) VALUES 
            (1, 'Cherai Main Beach', 'Cherai/Kochi'),
            (2, 'Varkala Cliff Beach', 'Varkala'),
            (3, 'Kovalam Beach', 'Thiruvananthapuram'),
            (4, 'Alappuzha Beach', 'Alappuzha'),
            (5, 'Kozhikode Beach', 'Kozhikode'),
            (6, 'Muzhappilangad Drive-in Beach', 'Kannur')
        `);

        // Delete old zones to avoid duplicates on re-run
        await db.query(`DELETE FROM safety_zones WHERE beach_id IN (1, 2, 3, 4, 5, 6)`);

        await db.query(`
            INSERT INTO safety_zones (beach_id, name, lat, lng, radius, type) VALUES 
            (1, 'Safe Swim Zone 1', 10.1416, 76.1783, 200, 'safe'),
            (1, 'Strong Currents Area', 10.1430, 76.1770, 100, 'danger'),
            (1, 'Deep Water Warning', 10.1400, 76.1790, 150, 'warning'),
            
            (2, 'Varkala Cliff View Safe', 8.7360, 76.7025, 300, 'safe'),
            (2, 'Rocky Edge Warning', 8.7330, 76.7040, 150, 'warning'),
            (2, 'High Tide Danger', 8.7310, 76.7060, 100, 'danger'),

            (3, 'Lighthouse Beach Safe Zone', 8.3988, 76.9780, 400, 'safe'),
            (3, 'Eves Beach Surf Zone', 8.3965, 76.9765, 200, 'warning'),
            (3, 'Black Sand Deep Drop', 8.4010, 76.9800, 150, 'danger'),

            (4, 'Venice Coast Safe Walk', 9.4930, 76.3177, 500, 'safe'),
            (4, 'Jetty Currents', 9.4950, 76.3150, 250, 'warning'),
            (4, 'Old Pier Ruin Dropoff', 9.4910, 76.3190, 150, 'danger'),

            (5, 'Sunset Pathway Safe', 11.2612, 75.7686, 600, 'safe'),
            (5, 'Kadalundi Estuary Current', 11.2640, 75.7660, 300, 'warning'),
            (5, 'Deep Sea Anchor Zone', 11.2580, 75.7710, 200, 'danger'),

            (6, 'Drive-in Beach Sand', 11.7937, 75.4526, 1200, 'safe'),
            (6, 'Tide Change Warning', 11.7970, 75.4500, 400, 'warning'),
            (6, 'Dharmadam Island Rip Current', 11.7900, 75.4550, 200, 'danger')
        `);
        console.log('Dummy beach and zones data inserted.');

        await db.end();
        console.log('Database operation completed successfully.');

    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

createTables();
