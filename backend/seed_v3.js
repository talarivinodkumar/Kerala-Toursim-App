const db = require('./config/db');

const seedDB = async () => {
    try {
        console.log('--- SEEDING DATABASE V3 ---');

        // 1. Ensure a hotel exists
        const [hotels] = await db.query('SELECT id FROM hotels LIMIT 1');
        let hotelId;
        if (hotels.length === 0) {
            const [result] = await db.query('INSERT INTO hotels (name, rating, price_range, images) VALUES (?, ?, ?, ?)',
                ['Cherai Beach Resort', 4.5, '$$$', '["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"]']);
            hotelId = result.insertId;
            console.log('✅ Created Hotel');
        } else {
            hotelId = hotels[0].id;
        }

        // 2. Ensure hotel rooms exist for that hotel
        const [rooms] = await db.query('SELECT id FROM hotel_rooms WHERE hotel_id = ?', [hotelId]);
        if (rooms.length === 0) {
            await db.query(`INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, capacity, description) VALUES 
                (?, 'Standard Room', 2500.00, 2, 'Comfortable room with essential amenities'),
                (?, 'Sea View Room', 4500.00, 2, 'Breathtaking view of the Cherai Beach waves'),
                (?, 'Premium Beach Villa', 7000.00, 3, 'Luxury villa with private beach access')`,
                [hotelId, hotelId, hotelId]);
            console.log('✅ Created Hotel Rooms');
        }

        // 3. Ensure activities exist
        const [activities] = await db.query('SELECT id FROM activities LIMIT 1');
        if (activities.length === 0) {
            await db.query(`INSERT INTO activities (name, price, available_slots, description, image) VALUES 
                ('Boat Ride', 800.00, 20, 'Explore the backwaters of Cherai in a traditional boat.', 'https://images.unsplash.com/photo-1544526226-d4568090ffb8?auto=format&fit=crop&w=800&q=80'),
                ('Water Sports', 1500.00, 10, 'Thrilling jet ski and banana boat rides.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'),
                ('Sunset Cruise', 1200.00, 15, 'Romantic sunset view from the middle of the sea.', 'https://images.unsplash.com/photo-1544473244-f689027d1f03?auto=format&fit=crop&w=800&q=80'),
                ('Beach Photoshoot', 2000.00, 5, 'Professional photography session at the shore.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')`);
            console.log('✅ Created Activities');
        }

        // 4. Ensure packages exist
        const [packages] = await db.query('SELECT id FROM travel_packages LIMIT 1');
        if (packages.length === 0) {
            await db.query(`INSERT INTO travel_packages (name, description, price, includes, package_type, image) VALUES 
                ('Basic Package', 'Perfect for a quick beach getaway.', 1500.00, 'Beach Visit, Lunch, Sunset View', 'Basic', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'),
                ('Romantic Surprise', 'The ultimate experience for couples.', 5000.00, 'Candlelight Dinner, Photography, Private Walk, Luxury Stay Discount', 'Romantic', 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80')`);
            console.log('✅ Created Travel Packages');
        }

        console.log('--- SEEDING COMPLETE ---');
        process.exit();
    } catch (error) {
        console.error('❌ Error Seeding:', error.message);
        process.exit(1);
    }
};

seedDB();
